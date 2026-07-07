'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, ShieldCheck, Landmark, Clock, FileText, ArrowRight,
  Play, ChevronDown, Check, HelpCircle, KanbanSquare, Network
} from 'lucide-react';

const FEATURES_LIST = [
  {
    icon: Landmark,
    title: 'Real-time Pricing',
    description: 'Dynamic cost aggregation matching selected features based on actual development rates and complexities.',
    color: 'from-[#009966] to-[#00b377]'
  },
  {
    icon: FileText,
    title: 'Professional Proposal',
    description: 'Generate high-fidelity proposal PDFs complete with project roadmaps, terms, payment milestones, and signatures.',
    color: 'from-[#009966] to-[#008055]'
  },
  {
    icon: Clock,
    title: 'Timeline Estimation',
    description: 'Calculates testing, deployment and core coding timelines using standard resource allocation matrices.',
    color: 'from-[#009966] to-[#00b377]'
  },
  {
    icon: KanbanSquare,
    title: 'Sales Lead CRM',
    description: 'A comprehensive admin dashboard tracking active client pipelines, proposal acceptance, and conversion rates.',
    color: 'from-[#009966] to-[#008055]'
  },
  {
    icon: Network,
    title: 'High-Performance Cloud',
    description: 'Deploys on secure enterprise cloud clusters featuring isolated document storage and high-speed delivery.',
    color: 'from-[#009966] to-[#00b377]'
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description: 'Safe document isolation, multi-factor admin login options, and automated database backups.',
    color: 'from-[#009966] to-[#008055]'
  }
];

const TESTIMONIALS = [
  {
    quote: "This requirement generator revolutionized our sales cycle. We went from preparing quotations in 2 days to generating professional proposals live in 10 minutes during client calls.",
    author: "Siddharth Mehta",
    role: "CEO, DevFlux Agency",
    avatar: "SM"
  },
  {
    quote: "Clients love the transparent pricing model. The interactive breakdown builds trust instantly, and the generated PDF proposal looks like it was custom-designed by a graphics team.",
    author: "Ananya Roy",
    role: "Head of Growth, PixelCraft",
    avatar: "AR"
  }
];

const FAQS = [
  {
    q: "How accurate is the timeline and cost calculation?",
    a: "The calculations are driven by standard developer matrices configured in your database. The database defines the min/max rates and dev hours for each individual feature, giving you a precise data-driven estimate instead of wild guesses."
  },
  {
    q: "Can we customize the feature pricing?",
    a: "Absolutely! The database is seeded with initial industry-average costs, but you can authenticate as an administrator and edit prices, complexity parameters, and dev hour configurations inside your admin panel."
  },
  {
    q: "How are the proposal PDFs generated?",
    a: "Proposals are compiled client-side using premium print CSS stylesheets. They feature formatted cover pages, payment milestone breakdowns, terms of service, and visual signature panels ready to print or save."
  }
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Mini-calculator State
  const [pagesCount, setPagesCount] = useState(5);
  const [hasEcommerce, setHasEcommerce] = useState(false);
  const [hasPayments, setHasPayments] = useState(false);

  // Quick live math for the interactive hero widget in Rupees
  const baseCost = 40000; 
  const pageCost = Math.max(0, pagesCount - 3) * 5000;
  const ecommerceCost = hasEcommerce ? 12000 : 0;
  const paymentsCost = hasPayments ? 15000 : 0;
  const totalMin = baseCost + pageCost + ecommerceCost + paymentsCost;
  const totalMax = Math.round(totalMin * 1.35);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#009966]/5 dark:bg-[#009966]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E3D7C5] dark:border-slate-800 bg-[#FFFFFF]/60 dark:bg-slate-900/40 text-xs font-bold text-[#009966]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse-slow" />
                SaaS proposal sales dashboard
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-[#151210] dark:text-[#F5F0EA]">
                Know the Cost of <br />Your Website{' '}
                <span className="text-gradient">Before You Build It</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#3C3633] dark:text-[#E6DFD9] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold">
                Build your complete website requirement, estimate development cost, calculate delivery timeline and generate a professional proposal instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/builder"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-[#009966] hover:bg-[#008055] flex items-center justify-center gap-2 shadow-lg shadow-[#009966]/20 active:scale-95 transition-all"
                >
                  Start Estimation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Hero Right Widget - Interactive Mini Estimator */}
            <div className="lg:col-span-5 w-full">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 relative border border-[#E3D7C5]/85 dark:border-slate-800/80 shadow-2xl bg-white/70 dark:bg-slate-900/60">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Preview
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-950 dark:text-white leading-none">Interactive Sandbox</h3>
                    <p className="text-xs text-[#3C3633] dark:text-slate-400 mt-1 font-medium">Toggle parameters to see estimations update in real-time</p>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Website Pages</span>
                      <span className="text-[#009966] dark:text-[#00b377]">{pagesCount} Pages</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={pagesCount}
                      onChange={(e) => setPagesCount(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-[#009966]"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setHasEcommerce(!hasEcommerce)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        hasEcommerce
                          ? 'border-[#009966] bg-[#009966]/5 text-slate-900 dark:text-white'
                          : 'border-slate-350 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 font-bold'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Add to Cart?</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${hasEcommerce ? 'bg-[#009966] border-transparent text-white' : 'border-slate-350'}`}>
                          {hasEcommerce && <Check className="w-2 h-2 stroke-[4]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight font-medium">Interactive cart drawer</span>
                    </button>

                    <button
                      onClick={() => setHasPayments(!hasPayments)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        hasPayments
                          ? 'border-[#009966] bg-[#009966]/5 text-slate-900 dark:text-white'
                          : 'border-slate-355 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 font-bold'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Online Payments?</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${hasPayments ? 'bg-[#009966] border-transparent text-white' : 'border-slate-350'}`}>
                          {hasPayments && <Check className="w-2 h-2 stroke-[4]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight font-medium">Razorpay/Stripe portals</span>
                    </button>
                  </div>

                  {/* Estimates Display Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/50 border border-[#E3D7C5] dark:border-slate-800/50 text-center space-y-1 shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated Cost Range</span>
                    <div className="text-2xl font-black text-[#151210] dark:text-white tracking-tight">
                      Rs. {totalMin.toLocaleString()} - Rs. {totalMax.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#3C3633] dark:text-[#E6DFD9] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4683C]" />
                        ~{((22 + Math.min(1, (hasEcommerce ? 0.45 : 0) + (hasPayments ? 0.45 : 0) + Math.max(0, pagesCount - 5) / 25 * 0.1) * 18) / 20).toFixed(1)} Months
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Complexity: {hasEcommerce ? 'Medium' : 'Low'}</span>
                    </div>
                  </div>

                  <Link
                    href="/builder"
                    className="w-full py-3.5 rounded-xl font-bold text-center text-xs text-white bg-[#009966] hover:bg-[#008055] flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    Customize Requirements in Full
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-20 bg-white/40 dark:bg-[#070b12]/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered Like a <span className="text-gradient">Premium Product</span>
            </h2>
            <p className="text-slate-700 dark:text-[#E6DFD9] text-sm sm:text-base font-medium">
              A comprehensive system built to convert requirements estimation into a delightful, zero-friction client onboarding experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_LIST.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-6 flex flex-col space-y-4 bg-white dark:bg-[#191513]"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-950 dark:text-white leading-none">{feat.title}</h3>
                  <p className="text-xs text-slate-700 dark:text-[#E6DFD9] leading-relaxed flex-grow font-medium">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-[#D4683C]/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <span className="text-xs font-black text-[#D4683C] uppercase tracking-widest">Feedback</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">Loved by Agency Founders</h2>
              <p className="text-slate-700 dark:text-[#E6DFD9] text-sm leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                Founders are shifting their pipeline operations to automated quotation engines to drive confidence, speed, and accuracy in their closing steps.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((test, index) => (
                <div key={index} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/30 flex flex-col justify-between space-y-6 shadow-sm">
                  <p className="text-xs text-slate-750 dark:text-slate-300 italic leading-relaxed font-medium">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D4683C] flex items-center justify-center text-white text-xs font-bold">
                      {test.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-950 dark:text-white leading-none">{test.author}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white/40 dark:bg-[#070b12]/40 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <HelpCircle className="w-10 h-10 text-[#D4683C] mx-auto" />
            <h2 className="text-3xl font-extrabold tracking-tight">Common Inquiries</h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              Answers to structural queries about the project estimation logic and CRM system integrations.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-extrabold text-slate-950 dark:text-white hover:text-[#D4683C] dark:hover:text-[#D4683C] transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-250 ${
                        isOpen ? 'rotate-180 text-[#D4683C]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-900 text-xs sm:text-sm text-slate-750 dark:text-slate-400 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <section className="py-20 text-center relative overflow-hidden bg-gradient-to-b from-[#F2EAE1] to-[#E3D7C5]/40 dark:from-[#0E0C0B] dark:to-[#05080e] border-t border-slate-200/50 dark:border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4683C]/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">Ready to Close More Deals?</h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Prepare comprehensive feature scoping checklists and dynamic quotes instantly. Empower your sales pipelines.
          </p>
          <div>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-[#D4683C] hover:bg-[#BD562B] shadow-xl shadow-[#D4683C]/20 active:scale-95 transition-all"
            >
              Start Estimation System
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-[#05080e] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} BuiltByAnirudh. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/builder" className="hover:text-[#D4683C] transition-colors">Estimator</Link>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <Link href="/dashboard" className="hover:text-[#D4683C] transition-colors">Admin CRM</Link>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <span className="text-slate-500 dark:text-slate-400">builtbyanirudh@proton.me</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
