import { ServiceOffer } from './types';

export const SERVICE_OFFERS: ServiceOffer[] = [
  {
    id: 'check',
    title: 'Website Audit',
    price: '£47',
    description: 'A professional mini-audit of the client’s website.',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    features: [
      'Design & UX analysis',
      'Speed & Mobile check',
      'SEO basics review',
      'Broken element detection',
      'PDF Report included'
    ]
  },
  {
    id: 'fix',
    title: 'Implementation Pkg',
    price: '£150',
    description: 'Fix major issues found during the website audit.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    features: [
      'Fix Priority 1 issues',
      'Improve mobile speed',
      'Optimize booking/contact',
      'Before/after screenshots',
      '5–7 day delivery'
    ]
  },
  {
    id: 'build',
    title: 'New Website Build',
    price: '£399',
    description: 'Fully modern, fast, mobile-friendly website.',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    features: [
      'Built from scratch',
      'Mobile-responsive',
      'Essential pages',
      'Clean design',
      'Quick delivery'
    ]
  },
  {
    id: 'care',
    title: 'Monthly Website Care',
    price: '£79/mo',
    description: 'Ongoing support to keep the site running smoothly.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    features: [
      'Monthly edits',
      'Speed checks',
      'Security monitoring',
      'Content updates',
      'Priority support'
    ]
  }
];

export const LEAD_COUNTS = [10, 20, 50, 100];