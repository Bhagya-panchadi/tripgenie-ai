import React, { useState } from 'react';
import { HotelOption, TripSearchParams } from '../types/travel';
import { formatINR, calculateNights } from '../utils/formatters';
import { Hotel, Star, MapPin, Check, Wifi, Coffee, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';

interface HotelSectionProps {
  hotels: HotelOption[];
  selectedHotelId: string | null;
  onSelectHotel: (hotel: HotelOption) => void;
  searchParams: TripSearchParams;
  onOpenWebhookModal: () => void;
}

export const HotelSection: React.FC<HotelSectionProps> = ({
  hotels,
  selectedHotelId,
  onSelectHotel,
  searchParams,
  onOpenWebhookModal,
}) => {
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const nights = calculateNights(searchParams.departureDate, searchParams.returnDate);

  const filteredHotels = hotels.filter((h) => {
    if (starFilter === 'all') return true;
    return h.starRating === starFilter;
  });

  return (
    <section id="hotels" className="py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Hotel className="w-4 h-4" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Hand-Picked Hotel Recommendations
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Curated verified stays in <span className="text-white font-semibold">{searchParams.destination}</span> for{' '}
              <span className="text-teal-400 font-semibold">{nights} Nights</span> ({searchParams.travellers} travellers).
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Sample Hotel Inventory · Non-bookable demo data</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Filter by Stars:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setStarFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  starFilter === 'all'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Ratings
              </button>
              {[5, 4].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setStarFilter(stars)}
                  className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    starFilter === stars
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Calculated for <strong className="text-white">{nights} Nights</strong> stay
          </div>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredHotels.map((hotel) => {
            const isSelected = selectedHotelId === hotel.id;
            const totalStayCost = hotel.pricePerNightINR * nights;

            return (
              <div
                key={hotel.id}
                className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 group ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-500/10 ring-1 ring-teal-500/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Hotel Image with Overlay Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Top Tags */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 font-bold border border-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{hotel.guestRating}</span>
                      <span className="text-[10px] text-slate-400">({hotel.reviewCount})</span>
                    </div>

                    <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-slate-300 font-semibold border border-slate-800 text-[11px]">
                      {hotel.starRating}★ Hotel
                    </div>
                  </div>

                  {hotel.highlightTag && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[10px] font-semibold text-teal-300 bg-teal-950/90 border border-teal-800/80 px-2 py-0.5 rounded truncate block">
                        {hotel.highlightTag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hotel Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-white leading-snug line-clamp-1 group-hover:text-teal-300 transition-colors">
                      {hotel.name}
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{hotel.neighborhood} · {hotel.distanceFromCenter}</span>
                    </p>

                    <div className="mt-2 text-xs text-slate-300">
                      <span className="font-medium text-slate-200">{hotel.roomType}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                      <Coffee className="w-3 h-3" />
                      <span>{hotel.mealPlan}</span>
                    </div>

                    {/* Amenities list */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <div className="text-lg font-extrabold text-white">
                          {formatINR(hotel.pricePerNightINR)}
                          <span className="text-xs font-normal text-slate-400 ml-1">/ night</span>
                        </div>
                        <div className="text-[11px] text-teal-400">
                          {formatINR(totalStayCost)} for {nights} nights
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectHotel(hotel)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected Stay</span>
                        </>
                      ) : (
                        <span>Select Stay</span>
                      )}
                    </button>

                    <div className="mt-2 text-center">
                      <span className="text-[10px] text-slate-500 italic block">
                        Sample rate · Connect API for live bookings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
