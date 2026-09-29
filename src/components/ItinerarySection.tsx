import React, { useState } from 'react';
import { ItineraryDay, TripSearchParams } from '../types/travel';
import { formatINR } from '../utils/formatters';
import { Calendar, Sun, Sunset, Moon, Sparkles, Navigation, Utensils, Download, Copy, Check, RefreshCw } from 'lucide-react';

interface ItinerarySectionProps {
  itinerary: ItineraryDay[];
  searchParams: TripSearchParams;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  itinerary,
  searchParams,
  onRegenerate,
  isGenerating,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeDay = itinerary[activeDayIndex] || itinerary[0];

  const handleCopyItinerary = () => {
    if (!itinerary.length) return;
    const text = itinerary
      .map(
        (day) =>
          `Day ${day.dayNumber}: ${day.title} (${day.theme})\n` +
          `• Morning (${day.morning.timeSlot}): ${day.morning.title} - ${day.morning.description} [Est: ₹${day.morning.estimatedCostINR}]\n` +
          `• Afternoon (${day.afternoon.timeSlot}): ${day.afternoon.title} - ${day.afternoon.description} [Est: ₹${day.afternoon.estimatedCostINR}]\n` +
          `• Evening (${day.evening.timeSlot}): ${day.evening.title} - ${day.evening.description} [Est: ₹${day.evening.estimatedCostINR}]\n` +
          `• Foodie Recommendation: ${day.recommendedEatery}\n` +
          `• Local Transit Tip: ${day.dailyLocalTip}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(
      `TripGenie AI Itinerary for ${searchParams.destination}\nDuration: ${searchParams.departureDate} to ${searchParams.returnDate}\nBudget: ₹${searchParams.budgetINR.toLocaleString('en-IN')}\n\n` +
        text
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(itinerary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tripgenie-itinerary-${searchParams.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!activeDay) return null;

  return (
    <section id="itinerary" className="py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                AI-Generated Day-by-Day Itinerary
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Balanced pacing tailored to your <span className="text-teal-400 font-semibold">{searchParams.travelStyle}</span> travel style in{' '}
              <span className="text-white font-semibold">{searchParams.destination}</span>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
              <span>Regenerate Plan</span>
            </button>

            <button
              type="button"
              onClick={handleCopyItinerary}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON Export</span>
            </button>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {itinerary.map((day, idx) => {
            const isActive = idx === activeDayIndex;
            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-slate-800 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400">
                  Day {day.dayNumber}
                </div>
                <div className="text-xs font-bold truncate max-w-[140px] text-white">
                  {day.theme}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Day Detail Display */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
          {/* Day Title & Theme Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-6">
            <div>
              <div className="text-xs font-semibold text-teal-400 tracking-wide uppercase">
                Day {activeDay.dayNumber} Schedule · {activeDay.theme}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                {activeDay.title}
              </h3>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Est. Daily Budget</div>
              <div className="text-lg font-bold text-amber-400">
                {formatINR(activeDay.estimatedDayCostINR)}
              </div>
            </div>
          </div>

          {/* Activities Timeline: Morning, Afternoon, Evening */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Morning Card */}
            <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Sun className="w-4 h-4" />
                    Morning Slot
                  </span>
                  <span className="font-mono text-slate-400">{activeDay.morning.timeSlot}</span>
                </div>

                <h4 className="font-bold text-base text-white mb-1.5 leading-snug">
                  {activeDay.morning.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDay.morning.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-white font-medium truncate max-w-[160px]">{activeDay.morning.location}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Cost:</span>
                  <span className="text-amber-400 font-semibold">{formatINR(activeDay.morning.estimatedCostINR)}</span>
                </div>
                {activeDay.morning.transportTip && (
                  <p className="text-teal-400/90 italic pt-1 border-t border-slate-800/40">
                    💡 {activeDay.morning.transportTip}
                  </p>
                )}
              </div>
            </div>

            {/* Afternoon Card */}
            <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-sky-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-sky-400">
                    <Sunset className="w-4 h-4" />
                    Afternoon Slot
                  </span>
                  <span className="font-mono text-slate-400">{activeDay.afternoon.timeSlot}</span>
                </div>

                <h4 className="font-bold text-base text-white mb-1.5 leading-snug">
                  {activeDay.afternoon.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDay.afternoon.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-white font-medium truncate max-w-[160px]">{activeDay.afternoon.location}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Cost:</span>
                  <span className="text-amber-400 font-semibold">{formatINR(activeDay.afternoon.estimatedCostINR)}</span>
                </div>
                {activeDay.afternoon.transportTip && (
                  <p className="text-teal-400/90 italic pt-1 border-t border-slate-800/40">
                    💡 {activeDay.afternoon.transportTip}
                  </p>
                )}
              </div>
            </div>

            {/* Evening Card */}
            <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-teal-400">
                    <Moon className="w-4 h-4" />
                    Evening & Night
                  </span>
                  <span className="font-mono text-slate-400">{activeDay.evening.timeSlot}</span>
                </div>

                <h4 className="font-bold text-base text-white mb-1.5 leading-snug">
                  {activeDay.evening.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDay.evening.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-white font-medium truncate max-w-[160px]">{activeDay.evening.location}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Cost:</span>
                  <span className="text-amber-400 font-semibold">{formatINR(activeDay.evening.estimatedCostINR)}</span>
                </div>
                {activeDay.evening.transportTip && (
                  <p className="text-teal-400/90 italic pt-1 border-t border-slate-800/40">
                    💡 {activeDay.evening.transportTip}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Insider Tips & Eatery Highlight */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <Navigation className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Day Transit & Logistics Tip:</span>
                <span className="text-slate-400 leading-relaxed">{activeDay.dailyLocalTip}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Recommended Dining Spot:</span>
                <span className="text-slate-400 leading-relaxed">{activeDay.recommendedEatery}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
