import React, { useEffect, useState } from 'react';
import { Lead, ServiceOffer, AppSettings } from '../types';
import { generatePitch } from '../services/geminiService';
import { X, Copy, Wand2, Loader2, Sparkles } from 'lucide-react';

interface PitchModalProps {
  lead: Lead | null;
  selectedService: ServiceOffer | null;
  onClose: () => void;
  apiKey: string; // Kept for backward compat but unused if settings passed
  settings: AppSettings;
}

export const PitchModal: React.FC<PitchModalProps> = ({ lead, selectedService, onClose, settings }) => {
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine which model name to display
  const getModelName = () => {
    if (settings.pitchModel === 'openai') return 'OpenAI GPT-4o';
    if (settings.pitchModel === 'grok') return 'Grok xAI';
    return 'Gemini 2.5 Flash';
  };

  useEffect(() => {
    if (lead && selectedService) {
      // Validate keys based on selected model
      if (settings.pitchModel === 'openai' && !settings.openaiKey) {
        setPitch("Please enter your OpenAI API Key in Settings to use GPT-4o.");
        return;
      }
      if (settings.pitchModel === 'grok' && !settings.grokKey) {
        setPitch("Please enter your Grok API Key in Settings to use Grok.");
        return;
      }
      if (settings.pitchModel === 'gemini' && !settings.geminiKey) {
        setPitch("Please enter your Gemini API Key in Settings.");
        return;
      }

      setLoading(true);
      generatePitch(settings, selectedService.title, lead)
        .then(setPitch)
        .catch((err) => setPitch(`Error: ${err.message}`))
        .finally(() => setLoading(false));
    }
  }, [lead, selectedService, settings]);

  if (!lead || !selectedService) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Email Pitch Generator <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{getModelName()}</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pitching <span className="font-medium text-slate-900 dark:text-slate-200">{selectedService.title}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{lead.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
              <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Drafting the perfect email...</p>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono select-text">
                {pitch}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-sm transition-colors"
            >
              Close
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  generatePitch(settings, selectedService.title, lead)
                    .then(setPitch)
                    .catch((err) => setPitch(`Error: ${err.message}`))
                    .finally(() => setLoading(false));
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Wand2 size={16} /> Regenerate
              </button>
              <button 
                disabled={loading}
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm shadow-blue-200 dark:shadow-none min-w-[160px]"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
                {!copied && <Copy size={16} />}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};