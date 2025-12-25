import React, { useState, useEffect } from 'react';
import { Search, MapPin, Download, Loader2, Sparkles, AlertCircle, Settings as SettingsIcon, HelpCircle, History, Trash2, ChevronRight, Moon, Sun, RotateCcw, MailCheck } from 'lucide-react';
import { SearchState, SearchParams, Lead, ServiceOffer, AppSettings, HistoryItem } from './types';
import { fetchLeads, generateBatchPitches } from './services/geminiService';
import { downloadCSV, downloadBatchPitchCSV } from './utils/csvHelper';
import { SERVICE_OFFERS, LEAD_COUNTS } from './constants';
import { ServiceCard } from './components/ServiceCard';
import { LeadTable } from './components/LeadTable';
import { PitchModal } from './components/PitchModal';
import { AuditModal } from './components/AuditModal';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';

const DEFAULT_SETTINGS: AppSettings = {
  geminiKey: '', // User must provide
  openaiKey: '',
  claudeKey: '',
  grokKey: '',
  pitchModel: 'gemini'
};

const App: React.FC = () => {
  const [params, setParams] = useState<SearchParams>({ niche: '', location: '', count: 10 });
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    error: null,
    data: [],
    hasSearched: false
  });
  const [progressMsg, setProgressMsg] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceOffer>(SERVICE_OFFERS[0]);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [auditLead, setAuditLead] = useState<Lead | null>(null);
  
  // Batch Export State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  // Settings & Guide State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load settings, history, and theme from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('leadgen_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    } else {
      setTimeout(() => setIsSettingsOpen(true), 1000);
    }

    const savedHistory = localStorage.getItem('leadgen_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    const savedTheme = localStorage.getItem('leadgen_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('leadgen_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('leadgen_settings', JSON.stringify(newSettings));
  };

  const saveToHistory = (newLeads: Lead[], searchParams: SearchParams) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      params: searchParams,
      leads: newLeads
    };
    
    // Keep max 20 items
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('leadgen_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your search history?')) {
      setHistory([]);
      localStorage.removeItem('leadgen_history');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setParams(item.params);
    setState({
      isLoading: false,
      error: null,
      data: item.leads,
      hasSearched: true
    });
    setSelectedLeadIds(new Set()); // Clear selection on new load
    setShowHistory(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.niche || !params.location) return;

    if (!settings.geminiKey) {
      setIsSettingsOpen(true);
      setState(prev => ({ ...prev, error: "Please enter your Gemini API Key in Settings to continue." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, hasSearched: true, data: [] }));
    setProgressMsg('Waking up Agentic Search Engine...');
    setSelectedLeadIds(new Set()); // Reset selection

    try {
      const leads = await fetchLeads(
        settings.geminiKey,
        params.niche, 
        params.location, 
        params.count, 
        (msg) => setProgressMsg(msg)
      );
      setState(prev => ({ ...prev, isLoading: false, data: leads }));
      saveToHistory(leads, params);
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      if (error.message.includes("API Key")) {
        setIsSettingsOpen(true);
      }
    }
  };

  const handleClearSearch = () => {
    setParams({ niche: '', location: '', count: 10 });
    setState({
      isLoading: false,
      error: null,
      data: [],
      hasSearched: false
    });
    setSelectedLeadIds(new Set());
  };

  const handleExport = () => {
    downloadCSV(state.data, `leads-${params.niche}-${params.location}`.replace(/\s+/g, '-').toLowerCase());
  };

  const handleBatchExport = async () => {
    if (selectedLeadIds.size === 0) return;
    if (selectedLeadIds.size > 10) {
      if (!confirm("Generating individual pitches for >10 leads may take a while. Continue?")) return;
    }

    if (!settings.geminiKey) {
       setIsSettingsOpen(true);
       return;
    }

    setIsBatchGenerating(true);
    
    // Filter selected leads
    const selectedLeads = state.data.filter(l => selectedLeadIds.has(`${l.name}-${l.address}`));
    
    try {
      const batchData = await generateBatchPitches(
        settings.geminiKey,
        selectedLeads,
        (curr, total) => setProgressMsg(`Generating pitch ${curr}/${total}...`)
      );
      downloadBatchPitchCSV(batchData, `batch-pitch-${params.niche}`);
      setSelectedLeadIds(new Set()); // Clear selection after export
    } catch (err: any) {
      alert("Error generating batch: " + err.message);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedLeadIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLeadIds(newSet);
  };

  const handleSelectAll = (filteredLeads: Lead[]) => {
    const allFilteredIds = filteredLeads.map(l => `${l.name}-${l.address}`);
    // Check if all currently selected
    const allSelected = allFilteredIds.every(id => selectedLeadIds.has(id));
    
    const newSet = new Set(selectedLeadIds);
    if (allSelected) {
      // Deselect all visible
      allFilteredIds.forEach(id => newSet.delete(id));
    } else {
      // Select all visible
      allFilteredIds.forEach(id => newSet.add(id));
    }
    setSelectedLeadIds(newSet);
  };

  const handlePitchRequest = (lead: Lead) => {
    // Automatically switch the selected service to the recommended one for better UX
    if (lead.recommendedServiceId) {
      const recommended = SERVICE_OFFERS.find(s => s.id === lead.recommendedServiceId);
      if (recommended) {
        setSelectedService(recommended);
      }
    }
    setModalLead(lead);
  };

  const handleRunAudit = (lead: Lead) => {
    if (!settings.geminiKey) {
      setIsSettingsOpen(true);
      alert("Please enter your Gemini API Key in Settings to run audits.");
      return;
    }
    setAuditLead(lead);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 relative transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
              OpenSource LeadGen
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block mr-2">
              Powered by Google Gemini & Maps
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors relative ${showHistory ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              title="History"
            >
              <History size={20} />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <button 
              onClick={() => setIsGuideOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="How to use"
            >
              <HelpCircle size={20} />
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-lg transition-all ${!settings.geminiKey ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse ring-1 ring-red-200 dark:ring-red-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              title="API Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Search Section */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Find Real Clients. <span className="text-blue-600 dark:text-blue-400">Close More Deals.</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Free, unlimited lead extraction from Google Maps. 
              Configure your own API keys for full control.
            </p>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              <HelpCircle size={14} /> New here? Read the guide.
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto transition-colors duration-200">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 relative group">
                <label className="absolute -top-2 left-3 z-30 bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none">Business Type</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dentist, Plumber, Cafe"
                    value={params.niche}
                    onChange={e => setParams({...params, niche: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="md:col-span-4 relative group">
                 <label className="absolute -top-2 left-3 z-30 bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none">Location</label>
                 <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York, NY"
                    value={params.location}
                    onChange={e => setParams({...params, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 relative group">
                <label className="absolute -top-2 left-3 z-30 bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none">Count</label>
                <select
                  value={params.count}
                  onChange={e => setParams({...params, count: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none dark:text-white"
                >
                  {LEAD_COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-600 dark:to-indigo-600 hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {state.isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Launch Search'}
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 p-2.5 rounded-xl transition-all"
                  title="Clear Search"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </form>
            
            {(state.isLoading || isBatchGenerating) && (
              <div className="mt-4 text-center">
                 <p className="text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">{progressMsg}</p>
                 <div className="h-1 w-64 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-2 overflow-hidden">
                   <div className="h-full bg-blue-500 animate-loading-bar w-1/3 rounded-full"></div>
                 </div>
              </div>
            )}

            {state.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div className="text-sm">{state.error}</div>
              </div>
            )}
          </div>
        </section>

        {/* Services Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select a Service to Pitch</h3>
             <span className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                Active: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedService.title}</span>
             </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_OFFERS.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedService.id === service.id}
                onSelect={() => setSelectedService(service)}
              />
            ))}
          </div>
        </section>

        {/* Results Section */}
        {state.hasSearched && !state.isLoading && !state.error && (
          <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Found Leads</h3>
               <div className="flex items-center gap-2">
                 {selectedLeadIds.size > 0 && (
                   <button
                    onClick={handleBatchExport}
                    disabled={isBatchGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-sm"
                   >
                     {isBatchGenerating ? <Loader2 className="animate-spin" size={18} /> : <MailCheck size={18} />}
                     <span>Generate Pitch Export ({selectedLeadIds.size})</span>
                   </button>
                 )}
                 <button
                   onClick={handleExport}
                   disabled={state.data.length === 0}
                   className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                 >
                   <Download size={18} />
                   <span>Export CSV</span>
                 </button>
               </div>
            </div>
            
            <LeadTable 
              leads={state.data} 
              selectedIds={selectedLeadIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onGeneratePitch={handlePitchRequest}
              onRunAudit={handleRunAudit}
            />
          </section>
        )}
      </main>

      {/* History Sidebar */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
               <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                 <History size={18} />
                 <span>Recent Searches</span>
               </div>
               <div className="flex items-center gap-1">
                 {history.length > 0 && (
                   <button 
                    onClick={clearHistory}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Clear History"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
                 <button onClick={() => setShowHistory(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded">
                   <ChevronRight size={20} />
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                  No history yet.<br/>Perform a search to save it here.
                </div>
              ) : (
                history.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{item.params.niche}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{item.leads.length}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                      <MapPin size={10} /> {item.params.location}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                      <span>{item.date}</span>
                      <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Load &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <PitchModal 
        lead={modalLead} 
        selectedService={selectedService} 
        onClose={() => setModalLead(null)} 
        apiKey={settings.geminiKey}
        settings={settings}
      />

      <AuditModal
        lead={auditLead}
        isOpen={!!auditLead}
        onClose={() => setAuditLead(null)}
        apiKey={settings.geminiKey}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default App;