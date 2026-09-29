import React, { useState, useMemo } from 'react';
import { TripSearchParams, FlightOption, HotelOption, N8nWebhookConfig, N8nTravelPlanResult } from './types/travel';
import {
  getSampleFlights,
  getSampleHotels,
  getSampleItinerary,
  getSampleSightseeing,
} from './data/sampleTravelData';
import { calculateNights } from './utils/formatters';
import { extractPlanSections } from './utils/planParser';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { N8nPlanDisplay } from './components/N8nPlanDisplay';
import { FlightSection } from './components/FlightSection';
import { HotelSection } from './components/HotelSection';
import { ItinerarySection } from './components/ItinerarySection';
import { SightseeingSection } from './components/SightseeingSection';
import { BudgetBreakdownSection } from './components/BudgetBreakdownSection';
import { ChatAssistant } from './components/ChatAssistant';
import { N8nWebhookModal } from './components/N8nWebhookModal';
import { Footer } from './components/Footer';
import { Bot, CheckCircle } from 'lucide-react';

const PRODUCTION_N8N_WEBHOOK_URL = 'https://bhagya4478.app.n8n.cloud/webhook/tripgenie-travel';

export default function App() {
  // Initial trip search parameters
  const [searchParams, setSearchParams] = useState<TripSearchParams>({
    departureCity: 'New Delhi (DEL)',
    destination: 'Bali, Indonesia',
    departureDate: '2026-10-15',
    returnDate: '2026-10-20',
    travellers: 2,
    budgetINR: 120000,
    travelStyle: 'balanced',
    cabinClass: 'economy',
  });

  const nights = useMemo(
    () => calculateNights(searchParams.departureDate, searchParams.returnDate),
    [searchParams.departureDate, searchParams.returnDate]
  );

  // Active navigation section
  const [activeTab, setActiveTab] = useState<string>('search');

  // Generation status and webhook messaging
  const [isGenerating, setIsGenerating] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [n8nPlanResult, setN8nPlanResult] = useState<N8nTravelPlanResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Loaded travel datasets based on destination & inputs
  const [flights, setFlights] = useState<FlightOption[]>(() =>
    getSampleFlights(searchParams.departureCity, searchParams.destination, searchParams.travellers)
  );
  const [selectedFlightId, setSelectedFlightId] = useState<string>('fl-2');

  const [hotels, setHotels] = useState<HotelOption[]>(() =>
    getSampleHotels(searchParams.destination, searchParams.travelStyle)
  );
  const [selectedHotelId, setSelectedHotelId] = useState<string>('ht-2');

  const [itinerary, setItinerary] = useState(() =>
    getSampleItinerary(searchParams.destination, nights)
  );

  const [sightseeing, setSightseeing] = useState(() =>
    getSampleSightseeing(searchParams.destination)
  );

  // n8n Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<N8nWebhookConfig>({
    webhookUrl: PRODUCTION_N8N_WEBHOOK_URL,
    authToken: '',
    isActive: true,
  });

  // AI Assistant Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);

  // Current selected objects
  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selectedFlightId) || flights[0] || null,
    [flights, selectedFlightId]
  );

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === selectedHotelId) || hotels[0] || null,
    [hotels, selectedHotelId]
  );

  // Computed live Budget Breakdown
  const budget = useMemo(() => {
    const travellers = Math.max(1, searchParams.travellers);
    const flightCostPerPerson = selectedFlight ? selectedFlight.pricePerPersonINR : 22000;
    const flightsTotalINR = flightCostPerPerson * travellers;

    const hotelNightly = selectedHotel ? selectedHotel.pricePerNightINR : 5500;
    // Assume 1 room per 2 travellers
    const roomsCount = Math.ceil(travellers / 2);
    const hotelsTotalINR = hotelNightly * nights * roomsCount;

    // Sightseeing & activities estimated from itinerary days
    const activitiesTotalINR = Math.round(
      itinerary.reduce((acc, day) => acc + (day.morning.estimatedCostINR + day.afternoon.estimatedCostINR + day.evening.estimatedCostINR), 0) * (travellers * 0.7)
    );

    // Food & dining estimate: approx ₹1,500/day/traveler
    const foodDiningTotalINR = nights * 1500 * travellers;

    // Local transit: approx ₹600/day/traveler
    const localTransportTotalINR = nights * 600 * travellers;

    const subTotal = flightsTotalINR + hotelsTotalINR + activitiesTotalINR + foodDiningTotalINR + localTransportTotalINR;
    const contingencyTotalINR = Math.round(subTotal * 0.1);
    const grandTotalINR = subTotal + contingencyTotalINR;
    const targetBudgetINR = searchParams.budgetINR;
    const remainingINR = targetBudgetINR - grandTotalINR;

    return {
      flightsTotalINR,
      hotelsTotalINR,
      activitiesTotalINR,
      foodDiningTotalINR,
      localTransportTotalINR,
      contingencyTotalINR,
      grandTotalINR,
      targetBudgetINR,
      perPersonINR: Math.round(grandTotalINR / travellers),
      remainingINR,
      status: grandTotalINR <= targetBudgetINR ? ('under_budget' as const) : ('over_budget' as const),
    };
  }, [selectedFlight, selectedHotel, nights, searchParams.travellers, searchParams.budgetINR, itinerary]);

  const showNotificationToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectFlight = (flight: FlightOption) => {
    setSelectedFlightId(flight.id);
    showNotificationToast(`Selected ${flight.airline} (${flight.flightNumber}) for your budget`);
  };

  const handleSelectHotel = (hotel: HotelOption) => {
    setSelectedHotelId(hotel.id);
    showNotificationToast(`Selected ${hotel.name} for your stay`);
  };

  // Main Submit Handler: sends departure city, destination, departure date, return date, travellers and total budget to n8n webhook
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setWebhookStatus('calling');
    setWebhookError(null);

    // Compute updated sample datasets for destination
    const newFlights = getSampleFlights(searchParams.departureCity, searchParams.destination, searchParams.travellers);
    const newHotels = getSampleHotels(searchParams.destination, searchParams.travelStyle);
    const newItinerary = getSampleItinerary(searchParams.destination, nights);
    const newSightseeing = getSampleSightseeing(searchParams.destination);

    setFlights(newFlights);
    setSelectedFlightId(newFlights[0]?.id || 'fl-1');
    setHotels(newHotels);
    setSelectedHotelId(newHotels[0]?.id || 'ht-1');
    setItinerary(newItinerary);
    setSightseeing(newSightseeing);

    // Prepare JSON payload with the exact requested parameters
    const webhookPayload = {
      departure_city: searchParams.departureCity,
      destination: searchParams.destination,
      departure_date: searchParams.departureDate,
      return_date: searchParams.returnDate,
      travellers: searchParams.travellers,
      budget: searchParams.budgetINR,
      // Additional helpful metadata for n8n AI agent nodes
      total_budget_inr: searchParams.budgetINR,
      currency: 'INR',
      nights,
      travel_style: searchParams.travelStyle,
      cabin_class: searchParams.cabinClass,
      timestamp: new Date().toISOString(),
      applet_id: '3bfdae99-afd8-477e-81e2-7a8d40e5f895',
    };

    const targetWebhookUrl = webhookConfig.webhookUrl || PRODUCTION_N8N_WEBHOOK_URL;

    try {
      // Send POST request to n8n webhook via proxy to prevent browser CORS block
      const response = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: targetWebhookUrl,
          payload: webhookPayload,
          headers: webhookConfig.authToken ? { Authorization: `Bearer ${webhookConfig.authToken}` } : {},
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setWebhookStatus('success');
        setWebhookError(null);

        // Parse response content from n8n webhook
        // The n8n webhook returns a JSON response containing status and travelPlan
        const raw = result.data;
        let planContent = '';

        if (typeof raw === 'string') {
          try {
            // In case n8n returned JSON serialized as string
            const parsed = JSON.parse(raw);
            planContent = parsed.travelPlan || parsed.travel_plan || parsed.plan || raw;
          } catch {
            planContent = raw;
          }
        } else if (raw && typeof raw === 'object') {
          // Explicitly prioritize travelPlan as requested
          if (raw.travelPlan && typeof raw.travelPlan === 'string') {
            planContent = raw.travelPlan;
          } else if (raw.travel_plan && typeof raw.travel_plan === 'string') {
            planContent = raw.travel_plan;
          } else if (raw.travelPlan && typeof raw.travelPlan === 'object') {
            planContent = JSON.stringify(raw.travelPlan, null, 2);
          } else if (raw.plan && typeof raw.plan === 'string') {
            planContent = raw.plan;
          } else if (raw.output && typeof raw.output === 'string') {
            planContent = raw.output;
          } else if (raw.text && typeof raw.text === 'string') {
            planContent = raw.text;
          } else if (raw.message && typeof raw.message === 'string') {
            planContent = raw.message;
          } else {
            planContent = JSON.stringify(raw, null, 2);
          }
        }

        // Intelligently parse Markdown sections: overview, flights, accommodation, itinerary, food, transportation, budget
        const parsedSections = extractPlanSections(planContent);

        setN8nPlanResult({
          source: 'n8n_webhook',
          summary: `Curated AI Travel Plan for ${searchParams.destination}`,
          rawResponse: raw,
          destination: searchParams.destination,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          travelPlan: planContent,
          sections: parsedSections,
        });

        showNotificationToast(`Received AI travel plan from n8n webhook!`);

        // Smooth scroll to display the returned plan
        setTimeout(() => {
          const planSection = document.getElementById('n8n-live-plan');
          if (planSection) {
            planSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Request failed: show clear error message and preserve UI with local AI plan
        const errorMsg = result.error || (result.data && typeof result.data === 'object' && result.data.message) || `Webhook error (HTTP ${result.status || 500})`;
        setWebhookStatus('error');
        setWebhookError(errorMsg);
        showNotificationToast(`n8n Webhook Notice: ${errorMsg}`);

        // Smooth scroll down to the generated itinerary so user experience is uninterrupted
        setTimeout(() => {
          const flightsSec = document.getElementById('flights');
          if (flightsSec) {
            flightsSec.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    } catch (err: any) {
      console.error('Failed to dispatch to n8n webhook:', err);
      const errorMsg = err.message || 'Network failure connecting to n8n webhook';
      setWebhookStatus('error');
      setWebhookError(errorMsg);
      showNotificationToast(`Webhook error: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-teal-950 border border-teal-500/70 text-teal-200 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWebhookModal={() => setWebhookModalOpen(true)}
        isWebhookConnected={webhookConfig.isActive}
        onOpenChat={() => setChatOpen(true)}
        hasLivePlan={!!n8nPlanResult}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Home & Search Form */}
        <SearchHero
          searchParams={searchParams}
          onSearchChange={setSearchParams}
          onGeneratePlan={handleGeneratePlan}
          isGenerating={isGenerating}
          webhookStatus={webhookStatus}
          webhookError={webhookError}
          onOpenWebhookModal={() => setWebhookModalOpen(true)}
        />

        {/* Live n8n Travel Plan Section (Displayed when webhook returns an AI travel plan) */}
        {n8nPlanResult && (
          <N8nPlanDisplay
            planResult={n8nPlanResult}
            onOpenWebhookModal={() => setWebhookModalOpen(true)}
            onClearPlan={() => setN8nPlanResult(null)}
          />
        )}

        {/* Flight Search Section */}
        <FlightSection
          flights={flights}
          selectedFlightId={selectedFlightId}
          onSelectFlight={handleSelectFlight}
          searchParams={searchParams}
          onOpenWebhookModal={() => setWebhookModalOpen(true)}
        />

        {/* Hotel Recommendations Section */}
        <HotelSection
          hotels={hotels}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          searchParams={searchParams}
          onOpenWebhookModal={() => setWebhookModalOpen(true)}
        />

        {/* AI-Generated Itineraries Section */}
        <ItinerarySection
          itinerary={itinerary}
          searchParams={searchParams}
          onRegenerate={handleGeneratePlan}
          isGenerating={isGenerating}
        />

        {/* Sightseeing & Experiences Section */}
        <SightseeingSection
          spots={sightseeing}
          searchParams={searchParams}
        />

        {/* Trip Budget Breakdown Section */}
        <BudgetBreakdownSection
          budget={budget}
          searchParams={searchParams}
          onOpenWebhookModal={() => setWebhookModalOpen(true)}
        />
      </main>

      {/* Floating Ask AI Button for Easy Mobile / Desktop Access */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-2xl shadow-teal-500/40 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border border-teal-300/40"
      >
        <Bot className="w-5 h-5 text-slate-950" />
        <span className="hidden sm:inline">TripGenie AI Concierge</span>
        <span className="sm:hidden">Ask AI</span>
      </button>

      {/* AI Assistant Chat Drawer */}
      <ChatAssistant
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        tripContext={searchParams}
      />

      {/* n8n Webhook & Travel APIs Configuration Modal */}
      <N8nWebhookModal
        isOpen={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        config={webhookConfig}
        onSaveConfig={setWebhookConfig}
        currentTripData={{
          searchParams,
          selectedFlight,
          selectedHotel,
          itinerary,
          budget,
        }}
      />

      {/* Footer */}
      <Footer
        onOpenWebhookModal={() => setWebhookModalOpen(true)}
        onOpenChat={() => setChatOpen(true)}
      />
    </div>
  );
}
