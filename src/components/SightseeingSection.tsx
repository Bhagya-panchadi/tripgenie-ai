import React, { useState } from 'react';
import { SightseeingSpot, TripSearchParams } from '../types/travel';
import { formatINR } from '../utils/formatters';
import { MapPin, Clock, Ticket, Sparkles, Bookmark, BookmarkCheck, Compass, Info } from 'lucide-react';

interface SightseeingSectionProps {
  spots: SightseeingSpot[];
  searchParams: TripSearchParams;
}

export const SightseeingSection: React.FC<SightseeingSectionProps> = ({
  spots,
  searchParams,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>([]);

  const categories = ['All', 'Landmark', 'Nature & Scenery', 'Culture & Heritage', 'Culinary & Markets', 'Hidden Gem'];

  const filteredSpots = spots.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  const toggleSaveSpot = (id: string) => {
    setSavedSpotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="sightseeing" className="py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Sightseeing & Cultural Experiences
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Must-see landmarks and handpicked secret spots in{' '}
              <span className="text-white font-semibold">{searchParams.destination}</span>.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Indicative ticket prices & opening hours</span>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sightseeing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => {
            const isSaved = savedSpotIds.includes(spot.id);

            return (
              <div
                key={spot.id}
                className="group flex flex-col bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Category & Must Visit tag */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800">
                      {spot.category}
                    </span>

                    {spot.isMustVisit && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-800/80 px-2 py-0.5 rounded flex items-center gap-1 shadow">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Must Visit
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleSaveSpot(spot.id)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:text-teal-400 border border-slate-800 transition-colors"
                    title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-teal-400 fill-teal-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors leading-snug">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                      {spot.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Ticket className="w-3.5 h-3.5 text-teal-400" /> Entry Fee:
                      </span>
                      <span className="font-bold text-white">
                        {spot.entryCostINR === 0 ? 'Free Entry' : `${formatINR(spot.entryCostINR)} / person`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-sky-400" /> Duration:
                      </span>
                      <span>{spot.recommendedDuration}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 space-y-0.5">
                      <div className="font-semibold text-teal-400/90">Best time to visit:</div>
                      <div>{spot.bestTime}</div>
                      <div className="text-slate-400 italic pt-1 border-t border-slate-800/40">
                        💡 {spot.insiderTip}
                      </div>
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
