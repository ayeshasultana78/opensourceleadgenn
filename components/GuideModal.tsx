import React, { useState } from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, Zap, Globe, Github, Terminal, Info, Target, MousePointer2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'deploy' | 'about'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('guide')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'guide' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                User Guide
              </button>
              <button 
                onClick={() => setActiveTab('deploy')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'deploy' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Deploy Free
              </button>
               <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'about' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                About Project
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'guide' && (
            <div className="space-y-8">
              {/* Quick Start */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="text-amber-500" size={20} /> Quick Start
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">1</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Get a Gemini API Key</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a> and click "Create API Key". It is free of charge.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">2</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Configure Settings</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Click the Settings gear icon in this app and paste your Gemini Key. You can also add OpenAI/Grok keys if you prefer their pitch generation.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">3</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Search & Extract</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Enter a niche (e.g., "Plumber") and a location (e.g., "Austin, TX"). Select how many leads you want and click "Find Leads".
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Workflow Guide */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="text-blue-500" size={20} /> How to Select & Pitch Clients
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Follow this 4-step workflow to maximize your success rate:</p>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                     <div className="p-4 flex gap-4">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">01</div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Check the "Recommended" Badge</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            The AI automatically tags leads. <span className="text-purple-600 font-medium">New Website Build</span> means they have no site (High Value). <span className="text-emerald-600 font-medium">Monthly Care</span> means they have bad ratings.
                          </p>
                        </div>
                     </div>
                     <div className="p-4 flex gap-4">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">02</div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Verify the Website</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Click the Globe icon <Globe size={12} className="inline" /> in the table. Does the site look old? Is it slow? Does it work on mobile? If it's bad, that is your angle.
                          </p>
                        </div>
                     </div>
                     <div className="p-4 flex gap-4">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">03</div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Select the Service</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Click on the Service Cards at the top (e.g., "Website Check" or "New Website Build") that matches what the client needs.
                          </p>
                        </div>
                     </div>
                     <div className="p-4 flex gap-4">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">04</div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Generate & Send</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Click the <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px]"><MousePointer2 size={8} className="mr-1"/> Pitch</span> button. The AI will write a custom email based on the service you selected + the client's actual data.
                          </p>
                        </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* Limits FAQ */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-blue-500" size={20} /> Can I generate 100+ leads daily?
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-blue-900 dark:text-blue-200 text-sm">YES, absolutely.</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mt-2 leading-relaxed">
                        This tool uses the <strong>Gemini 2.5 Flash</strong> model. The free tier limits are typically 1,500 Requests Per Day (RPD).
                        Since finding 50 leads counts as 1 request, you can theoretically find 50,000+ leads a day for free.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'deploy' && (
            <div className="space-y-8">
              <div className="bg-slate-900 dark:bg-black text-white p-6 rounded-xl border border-slate-800">
                <h4 className="text-xl font-bold mb-2">Host it for FREE</h4>
                <p className="text-slate-300 text-sm">
                  You can deploy this app so your friends can use it on their phones or computers. 
                  You don't need a server or a credit card.
                </p>
              </div>

              <section>
                <h5 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Github size={20} /> Method 1: GitHub + Vercel (Recommended)
                </h5>
                <ol className="list-decimal list-inside space-y-4 text-sm text-slate-600 dark:text-slate-400 ml-2">
                  <li className="pl-2">
                    <span className="font-medium text-slate-900 dark:text-white">Download the Code:</span>
                    <br />Save all the files from this project into a folder on your computer.
                  </li>
                  <li className="pl-2">
                    <span className="font-medium text-slate-900 dark:text-white">Upload to GitHub:</span>
                    <br />Create a new repository on <a href="https://github.com" target="_blank" className="text-blue-600 dark:text-blue-400 underline">GitHub</a> and upload your files.
                  </li>
                  <li className="pl-2">
                    <span className="font-medium text-slate-900 dark:text-white">Deploy on Vercel:</span>
                    <br />Go to <a href="https://vercel.com" target="_blank" className="text-blue-600 dark:text-blue-400 underline">Vercel.com</a> (sign up with GitHub).
                    <br />Click <strong>Add New Project</strong>  Import your GitHub repository.
                    <br />Click <strong>Deploy</strong>. Vercel detects the build settings automatically.
                  </li>
                  <li className="pl-2">
                    <span className="font-medium text-slate-900 dark:text-white">Share the Link:</span>
                    <br />Vercel will give you a URL (e.g., <code>my-lead-gen.vercel.app</code>). Send this to your friends!
                  </li>
                </ol>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section>
                <h5 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Terminal size={20} /> Method 2: Run on College PC (Local)
                </h5>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 font-mono text-sm space-y-2">
                  <p className="text-slate-500 dark:text-slate-400"># 1. Install Node.js (if not installed)</p>
                  <p className="text-slate-500 dark:text-slate-400"># 2. Open terminal in the project folder</p>
                  <p className="text-slate-900 dark:text-white">npm install</p>
                  <p className="text-slate-900 dark:text-white">npm run dev</p>
                  <p className="text-slate-500 dark:text-slate-400"># 3. Open http://localhost:5173 in browser</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'about' && (
             <div className="space-y-6">
               <div className="prose dark:prose-invert max-w-none">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">OpenSource LeadGen</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400">
                   A powerful, free, and open-source lead generation tool designed for freelancers, agencies, and students.
                 </p>
                 
                 <div className="my-4 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                     <h5 className="font-bold text-slate-900 dark:text-white mb-1">Privacy First</h5>
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       Everything runs locally in your browser. Your API keys and lead data never leave your device.
                     </p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                     <h5 className="font-bold text-slate-900 dark:text-white mb-1">AI Powered</h5>
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       Uses Google Gemini 2.5 Flash for rapid, accurate data extraction from Google Maps with zero hallucination.
                     </p>
                   </div>
                 </div>

                 <h4 className="text-md font-bold text-slate-900 dark:text-white mt-6">Features</h4>
                 <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                   <li><strong>Real-time Scraping:</strong> Extracts live data from Google Maps (Name, Phone, Address, Rating).</li>
                   <li><strong>Social Media Discovery:</strong> Attempts to find Instagram and LinkedIn profiles.</li>
                   <li><strong>Smart Recommendations:</strong> AI analyzes the lead to suggest the best service (e.g., "New Website" for businesses without one).</li>
                   <li><strong>Auto-Pitch Generator:</strong> Writes highly personalized emails using Gemini, OpenAI, or Grok.</li>
                   <li><strong>CSV Export:</strong> One-click download to use in Excel or CRMs.</li>
                   <li><strong>Dark Mode:</strong> Fully responsive interface with light/dark themes.</li>
                 </ul>

                 <h4 className="text-md font-bold text-slate-900 dark:text-white mt-6">Tech Stack</h4>
                 <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                   <li>React 19 & TypeScript</li>
                   <li>Vite</li>
                   <li>Tailwind CSS</li>
                   <li>Google GenAI SDK</li>
                   <li>Lucide Icons</li>
                 </ul>
                 
                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">MIT License - Free for personal and commercial use.</p>
                 </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
