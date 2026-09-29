export interface TripSearchParams {
  departureCity: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  budgetINR: number;
  travelStyle: 'balanced' | 'budget' | 'luxury' | 'adventure' | 'romantic' | 'family';
  cabinClass: 'economy' | 'premium_economy' | 'business';
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  pricePerPersonINR: number;
  baggage: string;
  aircraft: string;
  isDemo: boolean;
  refundable: boolean;
  badge?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  neighborhood: string;
  distanceFromCenter: string;
  pricePerNightINR: number;
  imageUrl: string;
  amenities: string[];
  roomType: string;
  mealPlan: string;
  isDemo: boolean;
  highlightTag?: string;
}

export interface ItineraryActivity {
  title: string;
  description: string;
  timeSlot: string;
  estimatedCostINR: number;
  location: string;
  transportTip?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  morning: ItineraryActivity;
  afternoon: ItineraryActivity;
  evening: ItineraryActivity;
  dailyLocalTip: string;
  recommendedEatery: string;
  estimatedDayCostINR: number;
}

export interface SightseeingSpot {
  id: string;
  name: string;
  category: 'Landmark' | 'Nature & Scenery' | 'Culture & Heritage' | 'Culinary & Markets' | 'Hidden Gem';
  description: string;
  imageUrl: string;
  entryCostINR: number;
  recommendedDuration: string;
  bestTime: string;
  insiderTip: string;
  isMustVisit: boolean;
}

export interface TripBudgetBreakdown {
  flightsTotalINR: number;
  hotelsTotalINR: number;
  activitiesTotalINR: number;
  foodDiningTotalINR: number;
  localTransportTotalINR: number;
  contingencyTotalINR: number;
  grandTotalINR: number;
  targetBudgetINR: number;
  perPersonINR: number;
  remainingINR: number;
  status: 'under_budget' | 'on_track' | 'over_budget';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'simulated_ai' | 'fallback';
}

export interface N8nWebhookConfig {
  webhookUrl: string;
  authToken?: string;
  isActive: boolean;
  lastTestStatus?: 'idle' | 'success' | 'failed';
  lastResponse?: any;
}

export interface ParsedTravelPlanSections {
  overview?: string;
  flights?: string;
  accommodation?: string;
  itinerary?: string;
  food?: string;
  transportation?: string;
  budget?: string;
  general?: string;
}

export interface N8nTravelPlanResult {
  source: 'n8n_webhook' | 'demo_local';
  summary?: string;
  rawResponse?: any;
  destination?: string;
  receivedAt?: string;
  travelTips?: string[];
  recommendations?: string;
  rawText?: string;
  travelPlan: string;
  sections?: ParsedTravelPlanSections;
}
