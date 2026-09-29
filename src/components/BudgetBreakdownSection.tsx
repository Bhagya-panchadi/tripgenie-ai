import React from 'react';
import { TripBudgetBreakdown, TripSearchParams } from '../types/travel';
import { formatINR } from '../utils/formatters';
import { Calculator, Plane, Hotel, MapPin, Utensils, Navigation, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface BudgetBreakdownSectionProps {
  budget: TripBudgetBreakdown;
  searchParams: TripSearchParams;
  onOpenWebhookModal: () => void;
}

export const BudgetBreakdownSection: React.FC<BudgetBreakdownSectionProps> = ({
  budget,
  searchParams,
  onOpenWebhookModal,
}) => {
  const percentUsed = Math.min(100, Math.round((budget.grandTotalINR / Math.max(1, budget.targetBudgetINR)) * 100));
  const isOverBudget = budget.grandTotalINR > budget.targetBudgetINR;
  const differenceINR = Math.abs(budget.targetBudgetINR - budget.grandTotalINR);

  const categories = [
    {
      name: 'Flights (Round Trip)',
      amount: budget.flightsTotalINR,
      icon: Plane,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      note: `For all ${searchParams.travellers} travellers`,
    },
    {
      name: 'Accommodations',
      amount: budget.hotelsTotalINR,
      icon: Hotel,
      color: 'bg-teal-500',
      textColor: 'text-teal-400',
      note: 'Total room stay nights',
    },
    {
      name: 'Sightseeing & Entry Passes',
      amount: budget.activitiesTotalINR,
      icon: MapPin,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      note: 'Key monuments & attractions',
    },
    {
      name: 'Food & Dining',
      amount: budget.foodDiningTotalINR,
      icon: Utensils,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      note: 'Daily cafes, lunches & dinners',
    },
    {
      name: 'Local Transport & Metro',
      amount: budget.localTransportTotalINR,
      icon: Navigation,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      note: 'Airport transfers, metro & cabs',
    },
    {
      name: 'Contingency & Buffer (10%)',
      amount: budget.contingencyTotalINR,
      icon: ShieldCheck,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      note: 'Emergency & unexpected expenses',
    },
  ];

  return (
    <section id="budget" className="py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Trip Budget & Expense Breakdown
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Interactive financial estimate in Indian Rupee (INR) based on your selected flights, hotels, and daily plans.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenWebhookModal}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-teal-500 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sync Budget via n8n Webhook</span>
          </button>
        </div>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Target Budget Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Your Target Budget (INR)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatINR(budget.targetBudgetINR)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Set during initial trip search
            </span>
          </div>

          {/* Estimated Total Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Total Estimated Trip Cost
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              {formatINR(budget.grandTotalINR)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {formatINR(budget.perPersonINR)} per traveller ({searchParams.travellers} pax)
            </span>
          </div>

          {/* Variance / Status Card */}
          <div
            className={`border rounded-2xl p-5 ${
              isOverBudget
                ? 'bg-rose-950/20 border-rose-800/50'
                : 'bg-emerald-950/20 border-emerald-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">Budget Health</span>
              {isOverBudget ? (
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Over Target
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Within Budget
                </span>
              )}
            </div>

            <div className={`text-2xl sm:text-3xl font-extrabold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget ? `+${formatINR(differenceINR)}` : `-${formatINR(differenceINR)}`}
            </div>

            <span className="text-xs text-slate-400 mt-1 block">
              {isOverBudget
                ? 'Exceeds target budget; consider adjusting flights or stay'
                : `Surplus of ${formatINR(differenceINR)} remaining for shopping!`}
            </span>
          </div>
        </div>

        {/* Progress bar showing utilization */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
            <span>Budget Utilization: {percentUsed}% of planned limit</span>
            <span>
              {formatINR(budget.grandTotalINR)} / {formatINR(budget.targetBudgetINR)}
            </span>
          </div>

          {/* Multi-segmented Progress Bar */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
            {categories.map((cat, idx) => {
              const segmentPercent = budget.grandTotalINR > 0 ? (cat.amount / budget.grandTotalINR) * 100 : 0;
              return (
                <div
                  key={idx}
                  style={{ width: `${segmentPercent}%` }}
                  className={`h-full ${cat.color} transition-all duration-500`}
                  title={`${cat.name}: ${formatINR(cat.amount)} (${Math.round(segmentPercent)}%)`}
                />
              );
            })}
          </div>

          {/* Color legend pills */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span>{cat.name.split('(')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Category Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const pctOfTotal = Math.round((cat.amount / Math.max(1, budget.grandTotalINR)) * 100);

            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-start gap-4 hover:border-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 ${cat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                    <span className="text-xs font-mono text-slate-400">{pctOfTotal}%</span>
                  </div>

                  <div className="text-base font-extrabold text-white">
                    {formatINR(cat.amount)}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">
                    {cat.note}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Financial Travel Concierge Tip */}
        <div className="mt-8 bg-gradient-to-r from-teal-950/40 via-slate-900 to-sky-950/40 border border-teal-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-white">TripGenie Smart Budget Recommendation</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {isOverBudget
                  ? `Your selected choices exceed your budget by ${formatINR(differenceINR)}. You can easily re-balance by choosing a 4-star boutique stay instead of a 5-star resort, saving approx ₹16,000 across your trip duration.`
                  : `Great news! You have a surplus of ${formatINR(differenceINR)}. Consider allocating ₹5,000 for a private cooking masterclass or an upgrade to premium express airport transit.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
