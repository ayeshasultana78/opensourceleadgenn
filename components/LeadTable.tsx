import React, { useState } from 'react';
import { Lead } from '../types';
import { Star, Mail, Phone, Globe, MessageSquare, Flame, TrendingUp, Shield, Crown, Sparkles, Gauge, Square, CheckSquare, UserSearch, Filter, Zap, Instagram, Linkedin } from 'lucide-react';
import { SERVICE_OFFERS } from '../constants';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (filteredLeads: Lead[]) => void;
  onGeneratePitch: (lead: Lead) => void;
  onRunAudit: (lead: Lead) => void;
}

type RatingFilter = 'all' | 'critical' | 'improvement' | 'target' | 'good';
type ReviewFilter = 'all' | 'new' | 'best' | 'stable' | 'big';

export const LeadTable: React.FC<LeadTableProps> = ({ 
  leads, 
  selectedIds, 
  onToggleSelect, 
  onSelectAll, 
  onGeneratePitch, 
  onRunAudit 
}) => {
  const [filter, setFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');

  const getOpportunityLevel = (lead: Lead) => {
    const r = lead.rating;
    const rev = lead.reviewCount;
    const hasWebsite = lead.website && lead.website !== 'N/A' && lead.website !== '';

    // 1. URGENT: No Website (Highest Sell Potential)
    if (!hasWebsite) {
      return { label: 'Urgent (No Site)', color: 'bg-red-100 text-red-700 border-red-200', icon: <Flame size={12} /> };
    }

    // 2. NEW BUSINESS: Low reviews but has a site (The "Exception" rule)
    if (rev < 15 && hasWebsite) {
      return { label: 'New Business', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Zap size={12} /> };
    }

    // 3. PRIME TARGET: The SMB "Sweet Spot" (Established but room to grow)
    if (r >= 3.8 && r <= 4.4 && rev >= 30 && rev <= 300) {
      return { label: 'Prime Target', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Sparkles size={12} /> };
    }
    
    // 4. IMPROVE: Low Ratings
    if (r > 0 && r < 3.8) {
      return { label: 'Reputation Fix', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <TrendingUp size={12} /> };
    }

    // 5. BIG BRAND / SKIP: High Reviews (>600)
    if (rev > 600) {
      return { label: 'Established/Big', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <Crown size={12} /> };
    }

    return { label: 'Stable SMB', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Shield size={12} /> };
  };

  const getSpeedBadge = (lead: Lead) => {
    if (!lead.mobile_speed_issue) return null;
    const conf = lead.mobile_speed_confidence || 'Medium';
    let styles = 'bg-amber-100 text-amber-700 border-amber-200';
    if (conf === 'High') styles = 'bg-red-100 text-red-700 border-red-200';

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${styles}`}>
        <Gauge size={10} className="mr-1" /> Slow ({conf})
      </span>
    );
  };

  const filteredLeads = leads.filter(lead => {
    const matchesText = lead.name.toLowerCase().includes(filter.toLowerCase()) ||
                        lead.address.toLowerCase().includes(filter.toLowerCase());
    
    let matchesRating = true;
    if (ratingFilter === 'critical') matchesRating = lead.rating < 3.8;
    else if (ratingFilter === 'target') matchesRating = lead.rating >= 3.8 && lead.rating <= 4.4;
    else if (ratingFilter === 'good') matchesRating = lead.rating > 4.4;

    let matchesReviews = true;
    if (reviewFilter === 'new') matchesReviews = lead.reviewCount < 50;
    else if (reviewFilter === 'best') matchesReviews = lead.reviewCount >= 50 && lead.reviewCount <= 300;
    else if (reviewFilter === 'big') matchesReviews = lead.reviewCount > 300;

    return matchesText && matchesRating && matchesReviews;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">Lead Pipeline</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-medium">
              {filteredLeads.length} leads
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter current batch..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none w-48 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 animate-in slide-in-from-top-2 duration-200">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating Class</label>
               <div className="flex gap-1">
                 {(['all', 'critical', 'target', 'good'] as const).map(f => (
                   <button 
                     key={f}
                     onClick={() => setRatingFilter(f)}
                     className={`px-2 py-1 text-xs rounded-md border transition-all ${ratingFilter === f ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}
                   >
                     {f.charAt(0).toUpperCase() + f.slice(1)}
                   </button>
                 ))}
               </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Volume</label>
               <div className="flex gap-1">
                 {(['all', 'new', 'best', 'big'] as const).map(f => (
                   <button 
                     key={f}
                     onClick={() => setReviewFilter(f)}
                     className={`px-2 py-1 text-xs rounded-md border transition-all ${reviewFilter === f ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}
                   >
                     {f.charAt(0).toUpperCase() + f.slice(1)}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4 w-10">Select</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">SMB Status</th>
              <th className="px-6 py-4">Business</th>
              <th className="px-6 py-4">Reputation</th>
              <th className="px-6 py-4">Digital Presence</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeads.map((lead, index) => {
               const opp = getOpportunityLevel(lead);
               const leadId = `${lead.name}-${lead.address}`;
               const isSelected = selectedIds.has(leadId);

               return (
              <tr key={index} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} transition-colors`}>
                <td className="px-6 py-4">
                  <button onClick={() => onToggleSelect(leadId)} className={isSelected ? 'text-blue-600' : 'text-slate-300'}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${lead.leadScore && lead.leadScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    {lead.leadScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${opp.color} shadow-sm`}>
                    {opp.icon} {opp.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold dark:text-white leading-tight">{lead.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[180px]">{lead.address}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lead.rating}</span>
                    <Star size={14} fill="currentColor" />
                    <span className="text-[10px] text-slate-400 font-medium">({lead.reviewCount})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      {lead.website ? (
                        <div className="flex items-center gap-2">
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title={lead.website}>
                            <Globe size={14} />
                          </a>
                          {getSpeedBadge(lead)}
                        </div>
                      ) : (
                        <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-300 rounded-full cursor-not-allowed" title="No Website">
                          <Globe size={14} />
                        </span>
                      )}

                      {lead.instagram && (
                        <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors" title="Instagram">
                          <Instagram size={14} />
                        </a>
                      )}
                      
                      {lead.linkedin && (
                        <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-sky-50 text-sky-700 rounded-full hover:bg-sky-100 transition-colors" title="LinkedIn">
                          <Linkedin size={14} />
                        </a>
                      )}
                      
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                      <a href={`https://www.google.com/search?q=owner+of+${encodeURIComponent(lead.name + ' ' + lead.address)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Research Owner">
                        <UserSearch size={14} />
                      </a>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onRunAudit(lead)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95">Audit</button>
                    <button onClick={() => onGeneratePitch(lead)} className="px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 shadow-sm transition-all active:scale-95">Pitch</button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
};