import React, { useState, useEffect } from 'react';
import { X, Save, Key, AlertTriangle, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Sync internal state when settings prop changes
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const toggleShowKey = (field: string) => {
    setShowKey(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <Key size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-200 flex gap-3">
            <AlertTriangle className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" size={16} />
            <div>
              <p className="font-semibold mb-1">Why do I need keys?</p>
              <p className="opacity-90">This is an open-source tool that runs locally in your browser. You use your own API keys, so you have full control over usage and costs.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Gemini API Key <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Required for Lead Extraction</span>
              </label>
              <div className="relative">
                <input
                  type={showKey['gemini'] ? "text" : "password"}
                  value={formData.geminiKey}
                  onChange={(e) => setFormData({...formData, geminiKey: e.target.value})}
                  placeholder="AIzaSy..."
                  className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
                <button 
                  type="button"
                  onClick={() => toggleShowKey('gemini')}
                  className="absolute right-3 top-2.5 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showKey['gemini'] ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Get free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a>.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Zap size={16} className="text-amber-500" /> Pitch Generation Model
                 </h4>
                 <select 
                    value={formData.pitchModel}
                    onChange={(e) => setFormData({...formData, pitchModel: e.target.value as any})}
                    className="text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                   <option value="gemini">Google Gemini (Default)</option>
                   <option value="openai">OpenAI (GPT-4o)</option>
                   <option value="grok">Grok (xAI)</option>
                   {/* Claude omitted due to CORS complexity in browser-only apps */}
                 </select>
              </div>
              
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {formData.pitchModel === 'openai' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">OpenAI API Key</label>
                    <div className="relative">
                      <input
                        type={showKey['openai'] ? "text" : "password"}
                        value={formData.openaiKey}
                        onChange={(e) => setFormData({...formData, openaiKey: e.target.value})}
                        placeholder="sk-..."
                        className="w-full pl-4 pr-12 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none font-mono text-sm text-slate-900 dark:text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => toggleShowKey('openai')}
                        className="absolute right-3 top-2 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showKey['openai'] ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Requires a funded OpenAI account.</p>
                  </div>
                )}

                {formData.pitchModel === 'grok' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Grok / xAI Key</label>
                    <div className="relative">
                      <input
                        type={showKey['grok'] ? "text" : "password"}
                        value={formData.grokKey}
                        onChange={(e) => setFormData({...formData, grokKey: e.target.value})}
                        placeholder="xai-..."
                        className="w-full pl-4 pr-12 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none font-mono text-sm text-slate-900 dark:text-white"
                      />
                       <button 
                        type="button"
                        onClick={() => toggleShowKey('grok')}
                        className="absolute right-3 top-2 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showKey['grok'] ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>
                )}

                {formData.pitchModel === 'gemini' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                     <CheckMark /> Uses the main Gemini key configured above.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-slate-500/25 active:scale-95"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckMark = () => (
  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
