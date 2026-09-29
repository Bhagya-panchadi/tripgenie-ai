import React, { useState } from 'react';
import { Compass, Plane, Hotel, Calendar, MapPin, Calculator, Bot, Zap, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWebhookModal: () => void;
  isWebhookConnected: boolean;
  onOpenChat: () => void;
  hasLivePlan?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWebhookModal,
  isWebhookConnected,
  onOpenChat,
  hasLivePlan = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'search', label: 'Plan Trip', icon: Compass },
    ...(hasLivePlan ? [{ id: 'n8n-live-plan', label: 'n8n Travel Plan', icon: Zap }] : []),
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'itinerary', label: 'AI Itinerary', icon: Calendar },
    { id: 'sightseeing', label: 'Sightseeing', icon: MapPin },
    { id: 'budget', label: 'Budget Breakdown', icon: Calculator },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('search')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  TripGenie<span className="text-teal-400">.ai</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                  Demo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent AI Travel Architect</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-800 text-teal-400 shadow-sm border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-amber-400 font-semibold">₹</span>
              <span>INR</span>
            </div>

            {/* n8n Webhook Status Button */}
            <button
              onClick={onOpenWebhookModal}
              title="Configure n8n Webhook & Travel APIs"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isWebhookConnected
                  ? 'bg-teal-950/80 border-teal-600/70 text-teal-300 hover:bg-teal-900'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500 hover:text-teal-300'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isWebhookConnected ? 'text-teal-400 fill-teal-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">n8n Automation</span>
              {isWebhookConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* AI Assistant Drawer Trigger */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 transition-all shadow-md shadow-teal-500/20 active:scale-95"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span className="font-bold">Ask AI</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-teal-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Currency: INR (₹)</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWebhookModal();
              }}
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Webhook Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
