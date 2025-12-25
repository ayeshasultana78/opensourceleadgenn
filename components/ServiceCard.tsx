import React from 'react';
import { ServiceOffer } from '../types';
import { Check } from 'lucide-react';

interface ServiceCardProps {
  service: ServiceOffer;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative flex flex-col p-6 rounded-2xl border transition-all duration-300 cursor-pointer h-full
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-1 ring-blue-500 bg-white dark:bg-slate-800 dark:border-blue-400 dark:ring-blue-400 scale-[1.02]' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md'
        }
      `}
    >
      <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${service.color.split(' ')[0]}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{service.title}</h3>
          <div className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${service.color}`}>
            {service.price}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow">{service.description}</p>
      
      <ul className="space-y-3 mb-6">
        {service.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className={`mt-auto text-center text-xs font-medium py-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
        {isSelected ? 'Selected for Pitch' : 'Select Service'}
      </div>
    </div>
  );
};