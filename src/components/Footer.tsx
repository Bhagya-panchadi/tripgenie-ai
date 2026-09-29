import React from 'react';
import { Compass, ShieldCheck, Heart, ExternalLink, Zap } from 'lucide-react';

interface FooterProps {
  onOpenWebhookModal: () => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenWebhookModal,
  onOpenChat,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-white font-display">
                TripGenie<span className="text-teal-400">.ai</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Autonomous AI travel architect engineering comprehensive itineraries, realistic flight options, verified stays, and dynamic INR budgeting.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Trip Components</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="#flights" className="hover:text-teal-400 transition-colors">Flight Search & Routes</a>
              </li>
              <li>
                <a href="#hotels" className="hover:text-teal-400 transition-colors">Hotel Recommendations</a>
              </li>
              <li>
                <a href="#itinerary" className="hover:text-teal-400 transition-colors">AI Day-by-Day Itineraries</a>
              </li>
              <li>
                <a href="#sightseeing" className="hover:text-teal-400 transition-colors">Sightseeing & Culture</a>
              </li>
              <li>
                <a href="#budget" className="hover:text-teal-400 transition-colors">Budget Breakdown (INR)</a>
              </li>
            </ul>
          </div>

          {/* Automation & APIs */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Automation & APIs</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={onOpenWebhookModal} className="hover:text-teal-400 transition-colors flex items-center gap-1 text-left">
                  <Zap className="w-3 h-3 text-amber-400" />
                  n8n Automation Settings
                </button>
              </li>
              <li>
                <span className="text-slate-500">Amadeus GDS Integration (Ready)</span>
              </li>
              <li>
                <span className="text-slate-500">Hotelbeds / Sabre Connectors</span>
              </li>
              <li>
                <button onClick={onOpenChat} className="hover:text-teal-400 transition-colors text-left">
                  Ask AI Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Demo Disclaimer */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Demo Data & Booking Notice
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All flight schedules, hotel rates, and sightseeing fees are indicative sample data for planning simulation. Bookings are non-committal and not confirmed until connected to authorized airline ticketing systems or live n8n workflows.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} TripGenie AI. Designed for travelers, travel agents, and automation builders.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Prices displayed in Indian Rupee (₹ INR)</span>
            <span aria-hidden="true">·</span>
            <span>n8n Webhook Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
