import React, { useState } from 'react';
import { FlightOption, TripSearchParams } from '../types/travel';
import { formatINR } from '../utils/formatters';
import { Plane, Clock, Luggage, Check, ShieldCheck, ArrowRight, Filter, AlertTriangle, ExternalLink } from 'lucide-react';

interface FlightSectionProps {
  flights: FlightOption[];
  selectedFlightId: string | null;
  onSelectFlight: (flight: FlightOption) => void;
  searchParams: TripSearchParams;
  onOpenWebhookModal: () => void;
}

export const FlightSection: React.FC<FlightSectionProps> = ({
  flights,
  selectedFlightId,
  onSelectFlight,
  searchParams,
  onOpenWebhookModal,
}) => {
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

  const filteredFlights = flights
    .filter((f) => !nonStopOnly || f.stops === 0)
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerPersonINR - b.pricePerPersonINR;
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
      return a.departureTime.localeCompare(b.departureTime);
    });

  return (
    <section id="flights" className="py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Plane className="w-4 h-4" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Flight Search & Route Options
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Showing recommended routes from <span className="text-white font-semibold">{searchParams.departureCity}</span> to{' '}
              <span className="text-white font-semibold">{searchParams.destination}</span> for{' '}
              <span className="text-teal-400 font-semibold">{searchParams.travellers} {searchParams.travellers === 1 ? 'traveller' : 'travellers'}</span>.
            </p>
          </div>

          {/* Disclaimer badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Demo Data · Indicative fares for simulation</span>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-400" /> Filters:
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={nonStopOnly}
                onChange={(e) => setNonStopOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Non-stop flights only</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setSortBy('price')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'price' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lowest Price
              </button>
              <button
                type="button"
                onClick={() => setSortBy('duration')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'duration' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fastest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('departure')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'departure' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Departure Time
              </button>
            </div>
          </div>
        </div>

        {/* Flight Cards List */}
        <div className="space-y-4">
          {filteredFlights.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
              No flights found matching the "Non-stop only" filter. Uncheck the filter to view 1-stop options.
            </div>
          ) : (
            filteredFlights.map((flight) => {
              const isSelected = selectedFlightId === flight.id;
              const totalCostForGroup = flight.pricePerPersonINR * searchParams.travellers;

              return (
                <div
                  key={flight.id}
                  className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Left: Airline & Flight Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-teal-400 text-base shrink-0 shadow-inner">
                          {flight.airlineCode}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-white">{flight.airline}</h3>
                            <span className="text-xs text-slate-400 font-mono">({flight.flightNumber})</span>
                            {flight.badge && (
                              <span className="text-[11px] font-medium text-teal-300 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded">
                                {flight.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span>{flight.aircraft}</span>
                            <span aria-hidden="true">·</span>
                            <span>{flight.stops === 0 ? 'Direct Non-stop' : `${flight.stops} Stop (${flight.stopDetails})`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Flight Timeline */}
                      <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 flex-1 max-w-lg">
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-bold text-white">{flight.departureTime}</div>
                          <div className="text-xs font-semibold text-slate-400">{flight.fromCode}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[100px]">{flight.fromCity}</div>
                        </div>

                        <div className="flex flex-col items-center px-2 flex-1 max-w-[160px]">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {flight.duration}
                          </span>
                          <div className="w-full flex items-center gap-1">
                            <div className="h-0.5 flex-1 bg-slate-700" />
                            <Plane className="w-3.5 h-3.5 text-teal-400 rotate-90" />
                            <div className="h-0.5 flex-1 bg-slate-700" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 truncate text-center">
                            {flight.stops === 0 ? 'Non-stop' : flight.stopDetails?.split('(')[0] || '1 Stop'}
                          </span>
                        </div>

                        <div className="text-right sm:text-left">
                          <div className="text-lg font-bold text-white">{flight.arrivalTime}</div>
                          <div className="text-xs font-semibold text-slate-400">{flight.toCode}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[100px]">{flight.toCity}</div>
                        </div>
                      </div>

                      {/* Right: Baggage, Price & Actions */}
                      <div className="flex sm:flex-row lg:flex-col items-center sm:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400 flex items-center gap-1 sm:justify-end">
                            <Luggage className="w-3 h-3 text-slate-400" />
                            <span>{flight.baggage}</span>
                          </div>
                          <div className="text-xl font-extrabold text-white mt-0.5">
                            {formatINR(flight.pricePerPersonINR)}
                            <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                          </div>
                          <div className="text-xs text-teal-400/90 font-medium">
                            Total: {formatINR(totalCostForGroup)} ({searchParams.travellers} pax)
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectFlight(flight)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select for Trip</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Flight Footer Notice */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {flight.refundable ? 'Partially Refundable (Demo policy)' : 'Non-Refundable Fare'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Terminal 3 Departures</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 italic">
                          *Indicative sample fare. Not bookable directly without live GDS API.
                        </span>
                        <button
                          type="button"
                          onClick={onOpenWebhookModal}
                          className="text-teal-400 hover:underline flex items-center gap-1"
                        >
                          Connect live booking API <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
