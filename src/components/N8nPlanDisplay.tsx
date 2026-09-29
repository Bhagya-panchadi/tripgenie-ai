import React, { useState } from 'react';
import { N8nTravelPlanResult } from '../types/travel';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Compass,
  Plane,
  Hotel,
  Calendar,
  Utensils,
  Navigation,
  Calculator,
  Copy,
  Check,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface N8nPlanDisplayProps {
  planResult: N8nTravelPlanResult;
  onOpenWebhookModal: () => void;
  onClearPlan?: () => void;
}

export const N8nPlanDisplay: React.FC<N8nPlanDisplayProps> = ({
  planResult,
  onOpenWebhookModal,
  onClearPlan,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'flights' | 'accommodation' | 'itinerary' | 'food' | 'transportation' | 'budget'>('all');

  const { travelPlan, sections } = planResult;

  const handleCopy = () => {
    navigator.clipboard.writeText(travelPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Section configurations with icons and titles
  const sectionTabs = [
    { id: 'all' as const, label: 'Full Plan', icon: Layers, count: null },
    { id: 'overview' as const, label: 'Overview', icon: Compass, hasContent: !!sections?.overview },
    { id: 'flights' as const, label: 'Flights', icon: Plane, hasContent: !!sections?.flights },
    { id: 'accommodation' as const, label: 'Accommodation', icon: Hotel, hasContent: !!sections?.accommodation },
    { id: 'itinerary' as const, label: 'Daily Itinerary', icon: Calendar, hasContent: !!sections?.itinerary },
    { id: 'food' as const, label: 'Food & Dining', icon: Utensils, hasContent: !!sections?.food },
    { id: 'transportation' as const, label: 'Transportation', icon: Navigation, hasContent: !!sections?.transportation },
    { id: 'budget' as const, label: 'Budget Breakdown', icon: Calculator, hasContent: !!sections?.budget },
  ];

  return (
    <section id="n8n-live-plan" className="py-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border-2 border-teal-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-500/10 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/25 shrink-0">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950 border border-teal-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Live n8n Travel Plan Generated
                  </span>
                  {planResult.receivedAt && (
                    <span className="text-xs text-slate-400 font-mono">
                      Received at {planResult.receivedAt}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                  {planResult.destination
                    ? `Curated Travel Plan: ${planResult.destination}`
                    : 'Personalized AI Travel Plan'}
                </h3>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied Travel Plan!' : 'Copy Travel Plan'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenWebhookModal}
                className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-xs font-bold text-teal-300 flex items-center gap-1.5 transition-colors border border-teal-500/40"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Webhook Settings</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/90 scrollbar-none">
            {sectionTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              // If not "all", only show if section has parsed content or fallback
              if (tab.id !== 'all' && !tab.hasContent) return null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Render Specific Tab or Master Multi-Section Layout */}
          <div className="mt-6">
            {activeTab === 'all' ? (
              // Multi-Section Structured Layout
              <div className="space-y-6">
                {/* 1. Trip Overview Section */}
                {sections?.overview && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-teal-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Compass className="w-5 h-5 text-teal-400" />
                      <span>Trip Overview</span>
                    </div>
                    <MarkdownRenderer content={sections.overview} />
                  </div>
                )}

                {/* 2. Flights Section */}
                {sections?.flights && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-sky-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Plane className="w-5 h-5 text-sky-400" />
                      <span>Flight & Route Options</span>
                    </div>
                    <MarkdownRenderer content={sections.flights} />
                  </div>
                )}

                {/* 3. Accommodation Section */}
                {sections?.accommodation && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-teal-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Hotel className="w-5 h-5 text-teal-400" />
                      <span>Accommodation Recommendations</span>
                    </div>
                    <MarkdownRenderer content={sections.accommodation} />
                  </div>
                )}

                {/* 4. Daily Itinerary Section */}
                {sections?.itinerary && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <span>Daily Itinerary & Sightseeing</span>
                    </div>
                    <MarkdownRenderer content={sections.itinerary} />
                  </div>
                )}

                {/* 5. Food & Dining Section */}
                {sections?.food && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Utensils className="w-5 h-5 text-amber-400" />
                      <span>Food, Dining & Culinary Highlights</span>
                    </div>
                    <MarkdownRenderer content={sections.food} />
                  </div>
                )}

                {/* 6. Transportation Section */}
                {sections?.transportation && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-indigo-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Navigation className="w-5 h-5 text-indigo-400" />
                      <span>Local Transportation & Commute</span>
                    </div>
                    <MarkdownRenderer content={sections.transportation} />
                  </div>
                )}

                {/* 7. Budget Breakdown Section */}
                {sections?.budget && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-display font-bold text-base border-b border-slate-800 pb-2">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <span>Budget Breakdown & Cost Estimates</span>
                    </div>
                    <MarkdownRenderer content={sections.budget} />
                  </div>
                )}

                {/* Fallback if sections were not cleanly split: Render full plan */}
                {!sections?.flights && !sections?.itinerary && !sections?.budget && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
                    <MarkdownRenderer content={travelPlan} />
                  </div>
                )}
              </div>
            ) : (
              // Single Section View
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4 text-teal-400 font-display font-bold text-lg border-b border-slate-800 pb-2.5 capitalize">
                  <span>{activeTab.replace('_', ' ')}</span>
                </div>
                <MarkdownRenderer content={sections?.[activeTab as keyof typeof sections] || travelPlan} />
              </div>
            )}
          </div>

          {/* Footer Quality Verification Note */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Real n8n Travel Agent Plan active · Formatted with full Markdown rendering</span>
            </div>
            <div className="text-teal-400/90 font-medium">
              Source: n8n Production Webhook
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
