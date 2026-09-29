import React, { useState } from 'react';
import { TripSearchParams } from '../types/travel';
import { POPULAR_DEPARTURES, POPULAR_DESTINATIONS } from '../data/sampleTravelData';
import { formatINR, calculateNights } from '../utils/formatters';
import { Compass, Calendar, Users, IndianRupee, Sparkles, MapPin, ArrowRight, ShieldAlert, Sliders, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SearchHeroProps {
  searchParams: TripSearchParams;
  onSearchChange: (params: TripSearchParams) => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  webhookStatus?: 'idle' | 'calling' | 'success' | 'error';
  webhookError?: string | null;
  onOpenWebhookModal?: () => void;
}

const BUDGET_PRESETS = [40000, 75000, 120000, 200000, 350000, 500000];

export const SearchHero: React.FC<SearchHeroProps> = ({
  searchParams,
  onSearchChange,
  onGeneratePlan,
  isGenerating,
  webhookStatus = 'idle',
  webhookError = null,
  onOpenWebhookModal,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const nights = calculateNights(searchParams.departureDate, searchParams.returnDate);

  const handleDestinationSelect = (destName: string) => {
    onSearchChange({ ...searchParams, destination: destName });
  };

  const handleBudgetPreset = (preset: number) => {
    onSearchChange({ ...searchParams, budgetINR: preset });
  };

  return (
    <div id="search" className="relative pt-6 pb-12 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-teal-500/10 via-sky-600/5 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-teal-300 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Next-Gen Travel AI with n8n Automation Readiness</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-display mb-4">
            Curate Your Dream Getaway with{' '}
            <span className="bg-gradient-to-r from-teal-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              TripGenie AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Personalized flights, verified stays, day-by-day itineraries, and comprehensive INR budget breakdowns tailored specifically for your travel group.
          </p>
        </div>

        {/* Demo Data Disclaimer Banner */}
        <div className="mb-6 max-w-4xl mx-auto bg-amber-950/40 border border-amber-600/30 rounded-xl p-3.5 flex items-start gap-3 backdrop-blur-sm text-xs sm:text-sm text-amber-200/90 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-300">
              Demo Mode Active · Realistic Sample Inventory
            </p>
            <p className="text-amber-200/80 leading-normal">
              Flights and hotel selections are realistic indicative sample data for trip simulation. Direct booking requires connecting live partner APIs (Amadeus, Sabre, Hotelbeds) or your custom n8n automation webhook.
            </p>
          </div>
        </div>

        {/* Main Travel Search Box */}
        <div className="max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Departure City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Departure City
              </label>
              <div className="relative">
                <select
                  value={searchParams.departureCity}
                  onChange={(e) => onSearchChange({ ...searchParams, departureCity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none transition-colors"
                >
                  {POPULAR_DEPARTURES.map((item) => (
                    <option key={item.code} value={item.city}>
                      {item.city}
                    </option>
                  ))}
                  <option value="Custom Origin Airport">Other / Custom Origin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => onSearchChange({ ...searchParams, destination: e.target.value })}
                  placeholder="e.g. Bali, Tokyo, Paris, Goa, Dubai..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Number of Travellers */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Travellers
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSearchChange({
                      ...searchParams,
                      travellers: Math.max(1, searchParams.travellers - 1),
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-sm font-semibold text-white">
                  {searchParams.travellers} {searchParams.travellers === 1 ? 'Adult' : 'Adults'}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSearchChange({
                      ...searchParams,
                      travellers: Math.min(10, searchParams.travellers + 1),
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Departure Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Departure Date
              </label>
              <input
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => onSearchChange({ ...searchParams, departureDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Return Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Return Date
                </span>
                <span className="text-[11px] text-teal-400 font-medium">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} ({nights + 1} Days)
                </span>
              </label>
              <input
                type="date"
                value={searchParams.returnDate}
                onChange={(e) => onSearchChange({ ...searchParams, returnDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Total Budget in INR */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  Total Budget (INR)
                </span>
                <span className="text-[11px] text-amber-300 font-semibold">
                  {formatINR(searchParams.budgetINR)}
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                  ₹
                </div>
                <input
                  type="number"
                  step="5000"
                  min="20000"
                  max="2000000"
                  value={searchParams.budgetINR}
                  onChange={(e) =>
                    onSearchChange({ ...searchParams, budgetINR: Number(e.target.value) || 50000 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-semibold transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Budget Presets & Travel Style */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">Quick Budget:</span>
              {BUDGET_PRESETS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleBudgetPreset(amount)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    searchParams.budgetINR === amount
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {formatINR(amount)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Preferences' : 'Preferences & Cabin Class'}</span>
            </button>
          </div>

          {/* Advanced Preferences Panel */}
          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
              <div>
                <span className="text-slate-400 font-medium block mb-1.5">Travel Style:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['balanced', 'budget', 'luxury', 'adventure', 'romantic', 'family'] as const).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => onSearchChange({ ...searchParams, travelStyle: style })}
                        className={`capitalize px-2.5 py-1 rounded-md border transition-colors ${
                          searchParams.travelStyle === style
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-semibold'
                            : 'border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1.5">Flight Cabin Class:</span>
                <div className="flex gap-1.5">
                  {(['economy', 'premium_economy', 'business'] as const).map((cabin) => (
                    <button
                      key={cabin}
                      type="button"
                      onClick={() => onSearchChange({ ...searchParams, cabinClass: cabin })}
                      className={`capitalize px-2.5 py-1 rounded-md border transition-colors ${
                        searchParams.cabinClass === cabin
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-semibold'
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cabin.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span>Estimated duration: </span>
              <strong className="text-white">{nights + 1} Days / {nights} Nights</strong>
              <span className="mx-1.5 text-slate-600">·</span>
              <span>Per person budget: </span>
              <strong className="text-amber-400">
                {formatINR(Math.round(searchParams.budgetINR / Math.max(1, searchParams.travellers)))}
              </strong>
              <div className="text-[11px] text-teal-400/90 mt-0.5 flex items-center gap-1 sm:justify-start justify-center">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Connected to n8n Travel Agent Webhook</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGeneratePlan}
              disabled={isGenerating}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-98 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to n8n Travel Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate Trip Plan</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>

          {/* Loading Indicator State */}
          {isGenerating && (
            <div className="mt-4 p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-200 flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="space-y-0.5">
                <p className="font-semibold text-teal-300">
                  Transmitting travel parameters to n8n Production Webhook...
                </p>
                <p className="text-teal-400/80 text-[11px]">
                  Dispatching departure: {searchParams.departureCity}, destination: {searchParams.destination}, dates: {searchParams.departureDate} to {searchParams.returnDate}, travellers: {searchParams.travellers}, budget: {formatINR(searchParams.budgetINR)}.
                </p>
              </div>
            </div>
          )}

          {/* Clear Error Message if request fails */}
          {webhookError && !isGenerating && (
            <div className="mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-rose-200 flex items-center justify-between">
                  <span>Webhook Request Failed: {webhookError}</span>
                  {onOpenWebhookModal && (
                    <button
                      type="button"
                      onClick={onOpenWebhookModal}
                      className="text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      Check Webhook
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  No simulated plan is displayed because the webhook request failed. Please check that your n8n workflow at <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-200 font-mono text-[10px]">https://bhagya4478.app.n8n.cloud/webhook/tripgenie-travel</code> is toggled <strong>Active</strong> in n8n and returns a JSON object with <code className="bg-slate-950 px-1 py-0.5 rounded text-teal-300 font-mono text-[10px]">status</code> and <code className="bg-slate-950 px-1 py-0.5 rounded text-teal-300 font-mono text-[10px]">travelPlan</code>.
                </p>
              </div>
            </div>
          )}

          {/* Webhook Success confirmation notice */}
          {webhookStatus === 'success' && !isGenerating && (
            <div className="mt-4 p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/50 text-xs text-teal-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                Plan successfully generated and synchronized with your n8n workflow! Scroll down to inspect the itinerary.
              </span>
            </div>
          )}
        </div>

        {/* Popular Destination Quick Cards */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
              Trending Destinations from India
            </h3>
            <span className="text-xs text-slate-500">Tap to load preset</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = searchParams.destination.toLowerCase().includes(dest.city.toLowerCase().split(',')[0]);
              return (
                <button
                  key={dest.code}
                  type="button"
                  onClick={() => handleDestinationSelect(dest.city)}
                  className={`group relative rounded-xl overflow-hidden text-left border p-2 flex flex-col justify-end h-28 transition-all ${
                    isSelected
                      ? 'border-teal-400 ring-2 ring-teal-500/40 shadow-md shadow-teal-500/20'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 -z-10 brightness-[0.6]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent -z-10" />
                  <span className="text-[10px] text-teal-300 font-medium leading-none mb-1 truncate">
                    {dest.tag}
                  </span>
                  <span className="text-xs font-bold text-white leading-tight truncate">
                    {dest.city.split(',')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
