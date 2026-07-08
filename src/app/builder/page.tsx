'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { useCalculator } from '@/lib/useCalculator';
import { FEATURES, CATEGORIES_LABELS } from '@/lib/pricing-data';
import { calculateEstimate, getMissingDependencies } from '@/lib/pricing';
import { saveQuotation } from '@/lib/supabase';
import { 
  ArrowLeft, ArrowRight, RotateCcw, RotateCw, RefreshCw, Check,
  Plus, Trash2, Calendar, FileText, CheckCircle, Info, AlertCircle
} from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Business Details', description: 'Introduce your project scope and targets.' },
  { number: 2, title: 'Feature Scoping Checklist', description: 'Configure custom options for your website layout.' }
];

export default function BuilderPage() {
  const router = useRouter();
  const {
    isLoaded, step, setStep, selectedIds, customPages, addCustomPage,
    removeCustomPage, businessInfo, setBusinessInfo, toggleFeature,
    selectFeatureDirectly, undo, redo, resetAll, canUndo, canRedo
  } = useCalculator();

  const [customPageInput, setCustomPageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#D4683C] animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading requirement builder...</span>
          </div>
        </div>
      </div>
    );
  }

  // Cost and Timeline Mathematics in Rs.
  const estimate = calculateEstimate(selectedIds, customPages.length);
  const missingDeps = getMissingDependencies(selectedIds);

  // Validate step transitions (specifically Step 1)
  const handleNext = () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      if (!businessInfo.businessName.trim()) errors.businessName = 'Business Name is required.';
      if (!businessInfo.industry.trim()) errors.industry = 'Industry segment is required.';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setFormErrors({});
    }
    setStep(Math.min(2, step + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and Generate final proposal in Rs.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const quotationRecord = {
        client_name: businessInfo.businessName, // map business name as client context initially
        client_email: businessInfo.currentWebsite || 'client@builtbyanirudh.me', // placeholder if empty
        client_phone: '',
        business_name: businessInfo.businessName,
        industry: businessInfo.industry,
        business_description: businessInfo.businessDescription,
        current_website: businessInfo.currentWebsite,
        competitor_websites: businessInfo.competitorWebsites,
        target_audience: businessInfo.targetAudience,
        monthly_visitors: businessInfo.expectedMonthlyVisitors || 'under_10k',
        monthly_orders: businessInfo.expectedMonthlyOrders || 'none',
        logo_available: businessInfo.logoAvailable,
        brand_guidelines_available: businessInfo.brandGuidelinesAvailable,
        preferred_colors: businessInfo.preferredColors,
        selected_features: selectedIds,
        custom_pages: customPages,
        estimated_cost_min: estimate.minCost,
        estimated_cost_max: estimate.maxCost,
        estimated_hours: estimate.totalHours,
        estimated_days: estimate.totalDays,
        complexity: estimate.complexity,
        status: 'draft',
        lead_source: 'website'
      };

      const saved = await saveQuotation(quotationRecord);

      // Trigger Confetti Effect
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Wait a second for visual satisfaction
      setTimeout(() => {
        router.push(`/proposal/${saved.id}`);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert('Failed to generate proposal. Please verify fields and try again.');
      setIsSubmitting(false);
    }
  };

  const handleAddCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPageInput.trim()) return;
    addCustomPage(customPageInput);
    setCustomPageInput('');
  };

  const completionPercentage = Math.round((step / 2) * 100);

  // Group the 17 options by categories for premium layout organization in Step 2
  const groupedFeatures: Record<string, typeof FEATURES> = {};
  FEATURES.forEach((f) => {
    if (f.id === 'base_site') return; // Hide mandatory base setup from selections list
    if (!groupedFeatures[f.category]) {
      groupedFeatures[f.category] = [];
    }
    groupedFeatures[f.category].push(f);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Progress Bar Header */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-[#0E0C0B]/95 border-b border-slate-250 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-[#D4683C] uppercase tracking-widest">
              Step {step} of 2
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">|</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
              {completionPercentage}% Complete
            </span>
          </div>

          {/* Progress Tracker Slider */}
          <div className="flex-grow max-w-xs sm:max-w-md h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div 
              className="h-full bg-[#009966] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Undo/Redo controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo Action"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo Action"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <span className="text-slate-300 dark:text-slate-800 mx-1">|</span>
            <button
              onClick={resetAll}
              title="Reset System State"
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT BUILDER WORKSPACE PANE (65% width) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step Card Title */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#191513] border border-[#E3D7C5] dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
              
              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#151210] dark:text-white leading-none">
                    {STEPS[step - 1].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    {STEPS[step - 1].description}
                  </p>
                </div>

                <hr className="border-slate-200 dark:border-slate-850" />

                {/* STEP 1: BUSINESS DETAILS */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Business Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Corp"
                          value={businessInfo.businessName}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C] ${
                            formErrors.businessName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-350 dark:border-slate-800'
                          }`}
                        />
                        {formErrors.businessName && <p className="text-[10px] text-red-500 font-bold">{formErrors.businessName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Industry Segment *</label>
                        <input
                          type="text"
                          placeholder="e.g. E-Commerce, Retail, Portfolio"
                          value={businessInfo.industry}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C] ${
                            formErrors.industry ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-350 dark:border-slate-800'
                          }`}
                        />
                        {formErrors.industry && <p className="text-[10px] text-red-500 font-bold">{formErrors.industry}</p>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Project Overview</label>
                      <textarea
                        rows={4}
                        placeholder="Briefly explain what your website does and who it serves..."
                        value={businessInfo.businessDescription}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessDescription: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Current Site URL (optional)</label>
                        <input
                          type="url"
                          placeholder="https://mysite.com"
                          value={businessInfo.currentWebsite}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, currentWebsite: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Preferred Color Palette (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Terracotta & Cream, Clean Dark Mode"
                          value={businessInfo.preferredColors}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, preferredColors: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Reference Websites</label>
                      <input
                        type="text"
                        placeholder="Add links to any websites you like or would like us to use as inspiration for your project"
                        value={businessInfo.competitorWebsites}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, competitorWebsites: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: SIMPLIFIED CHECKBOX GRID */}
                {step === 2 && (
                  <div className="space-y-8">
                    
                    {/* Render grouped features */}
                    {Object.keys(groupedFeatures).map((categoryKey) => (
                      <div key={categoryKey} className="space-y-3">
                        <h3 className="text-xs font-extrabold text-[#151210] dark:text-[#F5F0EA] uppercase tracking-widest bg-[#F2EAE1] dark:bg-slate-900/50 px-3 py-2 rounded-xl border-l-3 border-[#D4683C]">
                          {CATEGORIES_LABELS[categoryKey] || categoryKey}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-1">
                          {groupedFeatures[categoryKey].map((feat) => {
                            const isSelected = selectedIds.includes(feat.id);
                            return (
                              <button
                                key={feat.id}
                                onClick={() => toggleFeature(feat.id)}
                                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#009966] bg-[#009966]/5 glow-pulse'
                                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10'
                                }`}
                              >
                                <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'bg-[#009966] border-transparent text-white' : 'border-slate-350 dark:border-slate-750'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-extrabold text-[#151210] dark:text-white leading-tight">{feat.name}</h4>
                                  <p className="text-[10px] text-slate-700 dark:text-[#E6DFD9] leading-tight mt-1 font-medium">{feat.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Custom Pages segment */}
                    <div className="p-5 rounded-2xl bg-[#F2EAE1]/30 dark:bg-slate-950 border border-slate-300 dark:border-slate-900 space-y-4">
                      <div>
                        <h3 className="font-extrabold text-xs text-slate-950 dark:text-white leading-none">Additional Custom Pages</h3>
                        <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-1 font-medium">Do you need custom subpages outside the core checklist? Each page adds Rs. 5,000 - Rs. 10,000 (6 hrs dev time).</p>
                      </div>

                      <form onSubmit={handleAddCustomPage} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Gallery Portfolio, Custom Landing Subpage"
                          value={customPageInput}
                          onChange={(e) => setCustomPageInput(e.target.value)}
                          className="flex-grow px-3.5 py-2 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4683C]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#009966] hover:bg-[#008055] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </form>

                      {customPages.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-900">
                          {customPages.map((page, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1.5 rounded-lg bg-[#009966]/10 text-[#009966] dark:text-[#00b377] text-[10px] font-bold flex items-center gap-2"
                            >
                              <span>{page}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomPage(idx)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

              {/* Decorative side badge */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#D4683C]/5 to-transparent rounded-bl-full pointer-events-none" />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {step === 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  Configure Options
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#009966] to-[#008055] hover:opacity-95 flex items-center gap-2 shadow-lg shadow-[#009966]/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Proposal...
                    </>
                  ) : (
                    <>
                      Generate Proposal
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* RIGHT HUD CALCULATOR PANEL (35% width) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-6">
            
            {/* Live Pricing Summary Panel */}
            <div className="glass-panel rounded-3xl p-6 border border-[#E3D7C5] dark:border-slate-800 shadow-md space-y-6 transition-colors duration-300">
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scoping Estimate</span>
                <h3 className="font-extrabold text-lg text-slate-950 dark:text-white mt-0.5 leading-none">Project Calculator</h3>
              </div>

              {/* Estimate Cost ticker in Rupees */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/40 border border-[#E3D7C5] dark:border-slate-800/50 text-center space-y-1.5 shadow-sm">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Estimated Cost Range</span>
                <div className="text-2xl sm:text-3xl font-black text-[#151210] dark:text-white tracking-tight leading-none">
                  Rs. {estimate.minCost.toLocaleString()} <br className="sm:hidden" />
                  <span className="text-slate-500 text-sm font-normal">to</span> <br className="sm:hidden" />
                  Rs. {estimate.maxCost.toLocaleString()}
                </div>
                <div className="pt-2 flex justify-center items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Complexity:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                    estimate.complexity === 'very_high' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                    estimate.complexity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400' :
                    estimate.complexity === 'medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                    'bg-[#4E7852]/10 border-[#4E7852]/20 text-[#4E7852] dark:text-[#6E9E73]'
                  }`}>
                    {estimate.complexity.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 border border-[#E3D7C5]/60 dark:border-slate-800/60 rounded-xl space-y-0.5 bg-white/40 dark:bg-slate-950/10">
                  <span className="text-[9px] font-bold text-slate-550 dark:text-slate-450 block uppercase">Coding Hours</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#151210] dark:text-white">{estimate.devHours} Hours</span>
                </div>
                <div className="p-3 border border-[#E3D7C5]/60 dark:border-slate-800/60 rounded-xl space-y-0.5 bg-white/40 dark:bg-slate-950/10">
                  <span className="text-[9px] font-bold text-slate-550 dark:text-slate-450 block uppercase">Timeline</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#151210] dark:text-white">~{(estimate.totalDays / 20).toFixed(1)} Months</span>
                </div>
                <div className="p-3 border border-[#E3D7C5]/60 dark:border-slate-800/60 rounded-xl space-y-0.5 bg-white/40 dark:bg-slate-950/10">
                  <span className="text-[9px] font-bold text-slate-550 dark:text-slate-450 block uppercase">Options Count</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#151210] dark:text-white">{estimate.featureCount} Selected</span>
                </div>
                <div className="p-3 border border-[#E3D7C5]/60 dark:border-slate-800/60 rounded-xl space-y-0.5 bg-white/40 dark:bg-slate-950/10">
                  <span className="text-[9px] font-bold text-slate-550 dark:text-slate-450 block uppercase">Integrations</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#151210] dark:text-white">{estimate.integrationCount} API Syncs</span>
                </div>
              </div>

              {/* Gantt Visual Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#009966]" />
                  <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Milestone Roadmap</h4>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {/* Mile 1: UI Design */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">1. UI Layout Design</span>
                      <span className="text-slate-700 dark:text-slate-300">Days 1 - {Math.max(2, Math.round(estimate.totalDays * 0.15))}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#009966]/70" style={{ width: '15%' }} />
                    </div>
                  </div>

                  {/* Mile 2: Core Development */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">2. Development Cycle</span>
                      <span className="text-slate-700 dark:text-slate-300">Days {Math.max(2, Math.round(estimate.totalDays * 0.15)) + 1} - {Math.round(estimate.totalDays * 0.75)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#009966]" style={{ width: '60%' }} />
                    </div>
                  </div>

                  {/* Mile 3: QA & Testing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">3. QA & Bug Resolving</span>
                      <span className="text-slate-700 dark:text-slate-300">Days {Math.round(estimate.totalDays * 0.75) + 1} - {Math.round(estimate.totalDays * 0.90)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#009966]/75" style={{ width: '15%' }} />
                    </div>
                  </div>

                  {/* Mile 4: Deployment & Launch */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">4. Handover & DNS Setup</span>
                      <span className="text-slate-700 dark:text-slate-300">Days {Math.round(estimate.totalDays * 0.90) + 1} - {estimate.totalDays}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#4E7852]" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Smart Suggestions & Dependency Panel */}
            {missingDeps.length > 0 && (
              <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-3">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Smart Recommendations</span>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {missingDeps.map((rec) => (
                    <div key={rec.recommendedId} className="text-xs border-b border-amber-500/10 pb-2.5 last:border-0 last:pb-0">
                      <p className="font-extrabold text-slate-900 dark:text-slate-200 leading-tight">
                        Suggesting: {rec.recommendedName}
                      </p>
                      <p className="text-[10px] text-slate-650 dark:text-slate-450 leading-snug mt-1 font-medium">
                        {rec.reason}
                      </p>
                      <button
                        onClick={() => selectFeatureDirectly(rec.recommendedId)}
                        className="mt-2 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" /> Apply Solution
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
