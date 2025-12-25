import { GoogleGenAI } from "@google/genai";
import { Lead, AppSettings, AuditReport } from '../types';

/**
 * Lead Generation Service
 * Refined for Gemini 2.5 Flash (Maps Grounding)
 */

const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

const determineRecommendation = (lead: Partial<Lead>): string => {
  if (!lead.website || lead.website === '' || lead.website === 'N/A') {
    return 'build'; 
  }
  if (lead.mobile_speed_issue) {
    return 'fix'; 
  }
  if ((lead.rating || 0) < 4.0) {
    return 'care'; 
  }
  return 'check'; 
};

const calculateLeadScore = (lead: Partial<Lead>): number => {
  let score = 0;
  
  // 1. Website Priority
  if (!lead.website || lead.website === 'N/A' || lead.website === '') {
    score += 45; 
  } else if (lead.mobile_speed_issue) {
    score += 25; 
  }

  // 2. Reviews Logic
  const reviews = lead.reviewCount || 0;
  // High Priority: New business (0-9 reviews) WITH a website presence
  if (reviews < 10 && (lead.website && !lead.website.includes('google.com'))) {
    score += 40; 
  } else if (reviews >= 10 && reviews <= 300) {
    score += 30; 
  }

  // 3. Rating Logic
  const rating = lead.rating || 0;
  if (rating > 0 && rating <= 4.2) {
    score += 15; 
  }

  return Math.min(score, 100);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchLeads = async (
  apiKey: string,
  niche: string, 
  location: string, 
  totalCount: number,
  onProgress?: (msg: string) => void
): Promise<Lead[]> => {
  try {
    const ai = getAiClient(apiKey);
    // CRITICAL: ONLY Gemini 2.5 models support the Google Maps tool.
    const MAPS_MODEL = "gemini-2.5-flash"; 
    
    const BATCH_SIZE = 15; 
    const batches = Math.ceil(totalCount / BATCH_SIZE);
    let allLeads: Lead[] = [];
    const uniqueIds = new Set<string>();

    if (onProgress) onProgress(`Grounding search for "${niche}" in "${location}"...`);

    for (let i = 0; i < batches; i++) {
      if (onProgress) onProgress(`Batch ${i + 1}/${batches}: Analyzing independent business signals...`);

      const prompt = `
        TASK: Find ${BATCH_SIZE} distinct INDEPENDENT business leads for "${niche}" at/near "${location}".
        
        LOCATION HANDLING:
        - Accurately process location strings like "${location}".
        - If the location includes "near" or state names (e.g., "Hyderabad Telangana"), prioritize local pins in those specific areas.
        
        STRICT SMB QUALITY RULES:
        1. INDEPENDENT ONLY: No global chains, no Michelin-starred elite venues, no franchises.
        2. PHYSICAL STOREFRONT: Must have a real street address and visible business presence.
        3. ACTIVE: Must be currently open and active.
        4. TRUST SIGNALS (ANY 2):
           - 10+ Reviews.
           - Owner-uploaded photos.
           - Recently updated hours.
           - Owner responses to reviews.
        5. EXCEPTION: Allow 0-9 review businesses IF they have a website (early bird targets).

        DATA ENRICHMENT (MANDATORY):
        - Use 'googleSearch' to find valid Instagram and LinkedIn URLs for these businesses.
        - Check for official profiles matching the business name and city.

        TOOLS: Use 'googleMaps' for location pins and 'googleSearch' for chain/site/social verification.
        OUTPUT: Return ONLY a raw JSON array.
        SCHEMA: [{ "name": "...", "phone": "...", "website": "...", "rating": 4.1, "reviewCount": 120, "address": "...", "email": "...", "instagram": "...", "linkedin": "...", "mobile_speed_issue": true }]
      `;

      const response = await ai.models.generateContent({
        model: MAPS_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          temperature: 0.1,
        }
      });

      let jsonText = response.text || "[]";
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const start = jsonText.indexOf('[');
      const end = jsonText.lastIndexOf(']');
      
      if (start !== -1 && end !== -1) {
        const batchJson = jsonText.substring(start, end + 1);
        try {
          const batchLeads = JSON.parse(batchJson) as Lead[];
          for (const lead of batchLeads) {
            const key = `${lead.name}-${lead.address}`.toLowerCase();
            if (!uniqueIds.has(key)) {
              uniqueIds.add(key);
              allLeads.push({
                ...lead,
                type: lead.type || niche,
                phone: lead.phone || 'N/A',
                website: lead.website || '',
                email: lead.email || '',
                instagram: lead.instagram || '',
                linkedin: lead.linkedin || '',
                rating: lead.rating || 0,
                reviewCount: lead.reviewCount || 0,
                mobile_speed_issue: !!lead.mobile_speed_issue,
                googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`,
                recommendedServiceId: determineRecommendation(lead),
                leadScore: calculateLeadScore(lead)
              });
            }
          }
        } catch (e) {
          console.error("Batch parse failed", e);
        }
      }
      
      if (allLeads.length >= totalCount) break;
      if (i < batches - 1) await delay(2000);
    }
    
    if (allLeads.length === 0) {
      throw new Error(`No high-quality leads found. Try a different niche or verify the location.`);
    }

    return allLeads.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to search for leads.");
  }
};

export const generateBatchPitches = async (
  apiKey: string,
  leads: Lead[],
  onProgress: (current: number, total: number) => void
): Promise<any[]> => {
  const ai = getAiClient(apiKey);
  const results = [];
  let count = 0;
  for (const lead of leads) {
    count++;
    onProgress(count, leads.length);
    const serviceToPitch = lead.recommendedServiceId === 'build' ? 'New Website' : 
                          lead.recommendedServiceId === 'fix' ? 'Mobile Optimization' : 
                          lead.recommendedServiceId === 'care' ? 'Reputation Management' : 'Website Audit';
    
    const prompt = `Write a personalized cold email for "${lead.name}". Service: ${serviceToPitch}. Format JSON: { "subject": "...", "body": "..." }`;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Text tasks are fine on Gemini 3
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      let jsonText = (response.text || "{}").replace(/```json/g, '').replace(/```/g, '').trim();
      let emailData = JSON.parse(jsonText);
      results.push({ 
        ...lead, 
        lead_score: lead.leadScore,
        confidence_level: 'High',
        primary_issue: serviceToPitch,
        service_to_pitch: serviceToPitch,
        email_subject: emailData.subject, 
        email_body: emailData.body 
      });
    } catch (err) {
      results.push({ ...lead, email_subject: "Error", email_body: "Error" });
    }
    await delay(300);
  }
  return results;
};

export const generateAudit = async (apiKey: string, lead: Lead): Promise<AuditReport> => {
  const ai = getAiClient(apiKey);
  const prompt = `Conduct a technical audit for "${lead.name}". Website: ${lead.website || 'N/A'}. Return JSON AuditReport.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Required for tools
    contents: prompt,
    config: { 
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });
  let text = (response.text || "{}").replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text) as AuditReport;
};

export const generatePitch = async (settings: AppSettings, serviceName: string, lead: Lead): Promise<string> => {
  const ai = getAiClient(settings.geminiKey);
  const prompt = `Pitch ${serviceName} to ${lead.name} in ${lead.address}. Focus on their ${lead.rating} rating.`;
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: prompt 
  });
  return response.text || "Pitch generation failed.";
};