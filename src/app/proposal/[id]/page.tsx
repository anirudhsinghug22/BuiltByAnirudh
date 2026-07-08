'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchQuotation, updateQuotation } from '@/lib/supabase';
import { FEATURES, CATEGORIES_LABELS } from '@/lib/pricing-data';
import { Navbar } from '@/components/Navbar';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Calendar, Layers, Clock, AlertTriangle, Printer, Mail, Send, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

interface ProposalPageProps {
  params: Promise<{ id: string }>;
}

export default function ProposalPage({ params }: ProposalPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingName, setSigningName] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [shareUrl, setShareUrl] = useState(`https://builtbyanirudh.vercel.app/proposal/${resolvedParams.id}`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/proposal/${resolvedParams.id}`);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchQuotation(resolvedParams.id);
        if (data) {
          setQuotation(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#D4683C] animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading proposal layout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md text-center p-8 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 bg-white dark:bg-[#191513]">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Proposal Not Found</h2>
            <p className="text-xs text-slate-500">The specification proposal UUID is invalid or has been archived from our CRM system.</p>
            <button
              onClick={() => router.push('/builder')}
              className="px-4 py-2 bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Start New Estimation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Map features selected to full objects (excluding base site in checklist display as base is default)
  const selectedFeatures = FEATURES.filter((f) => quotation.selected_features.includes(f.id) && f.id !== 'base_site');
  const customPagesList = quotation.custom_pages || [];

  // Group selected features by category for beautiful breakdown
  const groupedFeatures: Record<string, typeof selectedFeatures> = {};
  selectedFeatures.forEach((feat) => {
    if (!groupedFeatures[feat.category]) {
      groupedFeatures[feat.category] = [];
    }
    groupedFeatures[feat.category].push(feat);
  });

  // Action: Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Action: Accept / Sign
  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingName.trim()) return;
    setIsSigning(true);
    try {
      const updated = await updateQuotation(quotation.id, {
        status: 'accepted',
        notes: `Signed by client: ${signingName} on ${new Date().toLocaleDateString()}`
      });
      setQuotation(updated);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
      alert('Failed to sign proposal.');
    } finally {
      setIsSigning(false);
    }
  };

  // Action: Reject / Negotiate
  const handleReject = async () => {
    if (!confirm('Are you sure you want to mark this proposal for negotiation?')) return;
    try {
      const updated = await updateQuotation(quotation.id, { status: 'negotiation' });
      setQuotation(updated);
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-compiled message variables in Rs.
  const whatsappMsg = encodeURIComponent(
    `Hi, here is the website design & development proposal for ${quotation?.business_name || ''}.\nEstimated cost: Rs. ${quotation?.estimated_cost_min?.toLocaleString() || '0'} - Rs. ${quotation?.estimated_cost_max?.toLocaleString() || '0'}\nEstimated timeline: ~${((quotation?.estimated_days || 20) / 20).toFixed(1)} Months.\nView details here: ${shareUrl}`
  );
  const emailSubject = encodeURIComponent(`Website Scoping Proposal - ${quotation?.business_name || ''}`);
  const emailBody = encodeURIComponent(
    `Hi,\n\nI have generated the website requirement specification and development proposal for ${quotation?.business_name || ''}.\n\nEstimated Cost: Rs. ${quotation?.estimated_cost_min?.toLocaleString() || '0'} - Rs. ${quotation?.estimated_cost_max?.toLocaleString() || '0'}\nEstimated Timeline: ~${((quotation?.estimated_days || 20) / 20).toFixed(1)} Months (${quotation?.estimated_days || 20} working days).\nComplexity Tier: ${quotation?.complexity?.toUpperCase() || 'MEDIUM'}\n\nYou can review the complete roadmap, selected features checklist, terms and sign the proposal digitally at this private link:\n${shareUrl}\n\nBest regards,\nAnirudh Pratap\nbuiltbyanirudh@proton.me`
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Action panel bar - HIDDEN IN PRINTING */}
      <div className="bg-white dark:bg-[#191513] border-b border-slate-200 dark:border-slate-800 py-4 px-4 sticky top-16 z-30 transition-colors duration-300 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.push('/builder')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Requirement Builder
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Proposal Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              quotation.status === 'accepted' ? 'bg-[#4E7852]/10 border-[#4E7852]/20 text-[#4E7852] dark:text-[#6E9E73]' :
              quotation.status === 'negotiation' ? 'bg-[#D4683C]/10 border-[#D4683C]/20 text-[#D4683C]' :
              quotation.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
            }`}>
              {quotation.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 border border-slate-300 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-300 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D4683C]" />
              Print / Save PDF
            </button>

            <a
              href={`mailto:builtbyanirudh@proton.me?subject=${emailSubject}&body=${emailBody}`}
              className="p-2 border border-slate-300 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-855 dark:text-slate-300 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#D4683C]" />
              Email Proposal
            </a>

            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-[#009966] text-white hover:bg-[#008055] rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Send className="w-4 h-4" />
              WhatsApp Share
            </a>
          </div>
        </div>
      </div>

      {/* PROPOSAL DOCUMENT CONTAINER */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-[#191513] border border-[#E3D7C5] dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden p-6 sm:p-12 space-y-12 transition-colors duration-300 print:border-0 print:shadow-none print:rounded-none print:p-0">
          
          {/* 1. COVER PAGE / HEADER */}
          <div className="relative border-b border-slate-200 dark:border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#009966]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#009966]">Development Proposal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#151210] dark:text-white leading-none tracking-tight">
                {quotation.business_name}
              </h1>
              <p className="text-xs text-slate-800 dark:text-slate-400 max-w-xl font-bold">
                Industry Segment: {quotation.industry} &bull; Specifications layout.
              </p>
            </div>

            <div className="flex items-center gap-3 text-left md:text-right border-l md:border-l-0 md:border-r border-slate-300 dark:border-slate-850 pl-4 md:pl-0 md:pr-4 py-1 text-xs font-bold">
              <img 
                src="/logo.png" 
                alt="BuiltByAnirudh Logo" 
                className="w-10 h-10 object-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-white p-0.5 shadow-sm md:order-last"
              />
              <div className="space-y-0.5">
                <div className="font-extrabold text-[#009966] text-sm">BuiltByAnirudh</div>
                <div className="text-slate-750 dark:text-slate-400">builtbyanirudh@proton.me</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">Generated: {new Date(quotation.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#009966]/5 rounded-bl-full pointer-events-none" />
          </div>

          {/* 2. PROJECT OVERVIEW */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-4 rounded-full bg-[#009966]" />
              1. Project Overview & Context
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-[#E6DFD9] leading-relaxed grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F2EAE1]/30 dark:bg-slate-950/20 p-5 rounded-2xl border border-[#E3D7C5] dark:border-slate-800/50">
              
              <div className="md:col-span-8 space-y-3">
                <h3 className="font-bold text-[#151210] dark:text-white text-xs">Target Specifications</h3>
                <p className="italic font-medium">
                  "{quotation.business_description || 'No direct business overview details supplied.'}"
                </p>
              </div>

              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-300 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-2 text-xs">
                <h3 className="font-bold text-[#151210] dark:text-white text-xs">Environment Metadata</h3>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Palette Pref:</span>
                  <span className="text-[#151210] dark:text-white truncate max-w-32">{quotation.preferred_colors || 'Unspecified'}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Contact:</span>
                  <span className="text-[#151210] dark:text-white">Anirudh Pratap</span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. ESTIMATED ESTIMATES CARD IN RUPEES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="p-6 rounded-3xl bg-[#151210] text-white dark:bg-[#0E0C0B] border border-slate-800 shadow-lg text-center space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4683C] block">Total Budget Range</span>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                Rs. {quotation.estimated_cost_min.toLocaleString()} <br />
                <span className="text-xs text-slate-500 font-normal">to</span> <br />
                Rs. {quotation.estimated_cost_max.toLocaleString()}
              </div>
            </div>

            <div className="p-5 border border-slate-300 dark:border-slate-800 rounded-3xl text-center space-y-1 bg-white dark:bg-slate-950/10 shadow-sm">
              <Clock className="w-5 h-5 text-[#D4683C] mx-auto" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Development Duration</span>
              <div className="text-lg font-extrabold text-[#151210] dark:text-white leading-none mt-1">
                ~{(quotation.estimated_days / 20).toFixed(1)} Months
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block mt-1">({quotation.estimated_days} Working Days)</span>
            </div>

            <div className="p-5 border border-slate-300 dark:border-slate-800 rounded-3xl text-center space-y-1 bg-white dark:bg-slate-950/10 shadow-sm">
              <Layers className="w-5 h-5 text-[#D4683C] mx-auto" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Scoping Parameters</span>
              <div className="text-lg font-extrabold text-[#151210] dark:text-white leading-none mt-1">
                {selectedFeatures.length + customPagesList.length} Options Active
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block mt-1">Complexity: {quotation.complexity.replace('_', ' ').toUpperCase()}</span>
            </div>

          </div>

          {/* 4. GANTT ROADMAP VISUALIZER */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-4 rounded-full bg-[#009966]" />
              2. Timeline Milestone Breakdown
            </h2>

            <div className="border border-slate-300 dark:border-slate-850 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 grid grid-cols-12 font-bold text-slate-800 dark:text-slate-400">
                <span className="col-span-5 sm:col-span-6 uppercase text-[10px]">Milestone Stage</span>
                <span className="col-span-4 sm:col-span-3 uppercase text-[10px] text-center">Duration</span>
                <span className="col-span-3 uppercase text-[10px] text-right">Target Output</span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                {[
                  {
                    title: '1. UI Layout wireframes & Branding assets',
                    days: `Days 1 - ${Math.max(2, Math.round(quotation.estimated_days * 0.15))}`,
                    output: 'Visual Prototypes'
                  },
                  {
                    title: '2. Frontend compilation & Option integrations',
                    days: `Days ${Math.max(2, Math.round(quotation.estimated_days * 0.15)) + 1} - ${Math.round(quotation.estimated_days * 0.75)}`,
                    output: 'Staging Server sandbox'
                  },
                  {
                    title: '3. QA cycles & UI testing checks',
                    days: `Days ${Math.round(quotation.estimated_days * 0.75) + 1} - ${Math.round(quotation.estimated_days * 0.90)}`,
                    output: 'Scoping checklists report'
                  },
                  {
                    title: '4. Cloud setup, handover & support systems launch',
                    days: `Days ${Math.round(quotation.estimated_days * 0.90) + 1} - ${quotation.estimated_days}`,
                    output: 'Server launch & handover'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="px-4 py-3.5 grid grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors text-slate-800 dark:text-slate-300">
                    <span className="col-span-5 sm:col-span-6 font-extrabold text-[#151210] dark:text-slate-100">{item.title}</span>
                    <span className="col-span-4 sm:col-span-3 text-center text-[#009966] font-extrabold">{item.days}</span>
                    <span className="col-span-3 text-right text-slate-500 font-medium">{item.output}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. SELECTED FEATURES SCOPING BREAKDOWN */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-4 rounded-full bg-[#009966]" />
              3. Specifications Scoping Checklist
            </h2>

            <div className="space-y-6">
              {/* Force rendering base website as default checklist head */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#151210] dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border-l-2 border-[#009966]">
                  Core Foundation
                </h3>
                <div className="grid grid-cols-1 gap-3 pl-2">
                  <div className="p-3 border border-slate-200 dark:border-slate-800/60 rounded-xl flex items-start gap-2.5 text-xs bg-slate-50/30 dark:bg-slate-950/10">
                    <CheckCircle className="w-4 h-4 text-[#4E7852] dark:text-[#6E9E73] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-200">Base Website Architecture</h4>
                      <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-0.5 leading-snug font-medium">Fully responsive HTML/CSS layouts, standard structures, and cloud DNS setups.</p>
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(groupedFeatures).map((categoryKey) => (
                <div key={categoryKey} className="space-y-2">
                  <h3 className="text-xs font-bold text-[#151210] dark:text-slate-300 uppercase tracking-widest bg-slate-105 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border-l-2 border-[#009966]">
                    {CATEGORIES_LABELS[categoryKey] || categoryKey}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {groupedFeatures[categoryKey].map((feat) => (
                      <div
                        key={feat.id}
                        className="p-3 border border-slate-200 dark:border-slate-800/60 rounded-xl flex items-start gap-2.5 text-xs bg-slate-50/30 dark:bg-slate-950/10"
                      >
                        <CheckCircle className="w-4 h-4 text-[#4E7852] dark:text-[#6E9E73] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-200">{feat.name}</h4>
                          <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-0.5 leading-snug font-medium">{feat.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom pages category if added */}
              {customPagesList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#151210] dark:text-slate-300 uppercase tracking-widest bg-slate-105 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border-l-2 border-[#009966]">
                    Custom Pages Requirements
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {customPagesList.map((pageName: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 border border-slate-200 dark:border-slate-800/60 rounded-xl flex items-start gap-2.5 text-xs bg-slate-50/30 dark:bg-slate-950/10"
                      >
                        <CheckCircle className="w-4 h-4 text-[#4E7852] dark:text-[#6E9E73] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-200">{pageName}</h4>
                          <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-0.5 leading-snug font-medium">Client configured custom layouts.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. PAYMENT TERMS, SUPPORT & SIGNATURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            
            {/* Terms and conditions */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider">Payment Schedule & SLA</h3>
              <ul className="list-disc pl-4 space-y-1.5 font-medium">
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">50% Advance retainer:</strong> Dispatched post-signing to deploy development environment layouts.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">30% Development milestone:</strong> Dispatched once visual wireframes are locked and core coding modules are verified on testing servers.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">20% Deployment launch:</strong> Dispatched before cloud setup handover and live DNS mapping.
                </li>
                <li>
                  Includes <strong className="text-slate-900 dark:text-slate-100">90-Day Warranty support</strong> addressing core security patches and code updates post-launch.
                </li>
              </ul>
            </div>

            {/* Signature section */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider">Proposal Agreement Sign</h3>
              
              {quotation.status === 'accepted' ? (
                <div className="p-5 border border-[#4E7852]/20 bg-[#4E7852]/5 rounded-2xl text-center space-y-2 shadow-sm">
                  <CheckCircle className="w-8 h-8 text-[#4E7852] dark:text-[#6E9E73] mx-auto" />
                  <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs">Agreement Electronically Locked</h4>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Approved details have been converted into active sales contract metrics.
                  </p>
                  <p className="text-xs font-black text-[#009966] pt-1">
                    {quotation.notes}
                  </p>
                </div>
              ) : (
                <div className="p-5 border border-slate-300 dark:border-slate-800 rounded-2xl bg-[#F2EAE1]/20 dark:bg-slate-950/20 space-y-3 shadow-sm">
                  <form onSubmit={handleAccept} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 block uppercase">Signee Authorized Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. John Doe, Director"
                        required
                        value={signingName}
                        onChange={(e) => setSigningName(e.target.value)}
                        className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4683C]"
                      />
                      <button
                        type="submit"
                        disabled={isSigning}
                        className="px-4 py-2 bg-[#009966] hover:bg-[#008055] text-white rounded-xl text-xs font-bold hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                      >
                        Accept Proposal
                      </button>
                    </div>
                  </form>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-1">
                    <span>IP Address logged.</span>
                    <button
                      onClick={handleReject}
                      className="text-red-500 hover:text-red-600 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject / Negotiate
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
