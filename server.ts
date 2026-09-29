import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client if API key is provided
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// API endpoint for AI Travel Assistant Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, tripContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Provide intelligent simulated response if GEMINI_API_KEY is not configured
      const userMessage = messages?.[messages.length - 1]?.content || '';
      return res.json({
        success: true,
        source: 'simulated_ai',
        reply: generateSimulatedAssistantReply(userMessage, tripContext),
      });
    }

    const systemInstruction = `You are TripGenie AI, an elite, hyper-knowledgeable AI travel concierge and itinerary specialist.
Your goal is to provide warm, insightful, precise, and practical travel recommendations, budget optimizations, cultural etiquette tips, food recommendations, and local hacks.
The current trip context is:
- Departure: ${tripContext?.departureCity || 'Flexible'}
- Destination: ${tripContext?.destination || 'Flexible'}
- Dates: ${tripContext?.departureDate || 'TBD'} to ${tripContext?.returnDate || 'TBD'} (${tripContext?.durationDays || 5} days)
- Travellers: ${tripContext?.travellers || 2}
- Budget: ₹${tripContext?.budgetINR?.toLocaleString('en-IN') || '75,000'} INR

Guidelines:
- Keep responses engaging, structured, and easy to read with bullet points when applicable.
- Quote amounts in Indian Rupee (₹ INR) when discussing money.
- Always note that flight and hotel listings displayed are demo/indicative unless confirmed through a live travel API or connected n8n webhook.
- Provide practical local transport tips (metro lines, local ride hailing apps like Grab, Uber, Gojek, Tuk-Tuks, etc.).`;

    const chatHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try asking again.';
    res.json({ success: true, source: 'gemini', reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    // Graceful fallback so user is never stuck
    res.json({
      success: true,
      source: 'fallback',
      reply: `Here are some recommendations for your trip to ${req.body.tripContext?.destination || 'your destination'}: Ensure you pre-book major attractions 48 hours in advance, carry a mix of local currency and an international forex card, and install local transit navigation apps. Feel free to ask about specific restaurants, budget tips, or custom itineraries!`,
    });
  }
});

// API endpoint to test or proxy n8n webhook
app.post('/api/webhook-proxy', async (req, res) => {
  const { webhookUrl, payload, headers: customHeaders } = req.body;
  if (!webhookUrl) {
    return res.status(400).json({ success: false, error: 'Missing webhookUrl parameter' });
  }

  try {
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'TripGenie-AI/1.0',
    };

    if (customHeaders && typeof customHeaders === 'object') {
      Object.assign(fetchHeaders, customHeaders);
    }

    const fetchResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(payload),
    });

    // 1. Check HTTP response status before parsing
    const httpStatus = fetchResponse.status;
    const isHttpOk = fetchResponse.ok; // 200-299

    // 2. Read the response safely as text first
    const rawText = await fetchResponse.text();
    let isJson = false;
    let parsedData: any = null;

    if (rawText && rawText.trim().length > 0) {
      try {
        parsedData = JSON.parse(rawText);
        isJson = true;
      } catch {
        isJson = false;
      }
    }

    // 3. Handle non-OK HTTP status or non-JSON payloads
    if (!isHttpOk) {
      let errorMessage = `n8n webhook returned HTTP ${httpStatus}`;
      if (isJson && parsedData && typeof parsedData === 'object') {
        if (parsedData.message) {
          errorMessage = parsedData.message;
        } else if (parsedData.error) {
          errorMessage = typeof parsedData.error === 'string' ? parsedData.error : JSON.stringify(parsedData.error);
        }
      } else if (rawText && rawText.trim().length > 0) {
        // Truncate if raw HTML or long string
        errorMessage = rawText.length > 200 ? `${rawText.substring(0, 200)}...` : rawText;
      }

      return res.json({
        success: false,
        status: httpStatus,
        statusText: fetchResponse.statusText,
        isJson,
        data: parsedData,
        error: errorMessage,
      });
    }

    // 4. HTTP is OK (2xx), verify that response is valid JSON
    if (!isJson) {
      return res.json({
        success: false,
        status: httpStatus,
        statusText: fetchResponse.statusText,
        isJson: false,
        data: null,
        error: 'The webhook did not return a valid JSON response. Please ensure your n8n workflow returns a JSON object with status and travelPlan.',
      });
    }

    // Success response with parsed JSON
    res.json({
      success: true,
      status: httpStatus,
      statusText: fetchResponse.statusText,
      isJson: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Webhook proxy error:', err);
    res.status(500).json({
      success: false,
      status: 500,
      isJson: false,
      error: err.message || 'Failed to connect to the n8n webhook. Please check network connectivity or webhook URL.',
    });
  }
});

// Simulated assistant helper when running without active API keys
function generateSimulatedAssistantReply(prompt: string, context: any) {
  const lower = prompt.toLowerCase();
  const dest = context?.destination || 'your destination';
  const budget = context?.budgetINR ? `₹${Number(context.budgetINR).toLocaleString('en-IN')}` : 'your planned budget';

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('save') || lower.includes('cheap')) {
    return `💡 **Budget Optimization for ${dest}** (Target: ${budget}):\n\n1. **Flights:** Opt for early morning or late-night departures to save 15-22% on airfare.\n2. **Local Commute:** Use public transit passes or local rideshare rather than private taxi transfers.\n3. **Dining:** Enjoy authentic local street food and neighborhood bistros for lunch (typically ₹300-₹600 per person) and reserve dining out for special dinners.\n4. **Attractions:** Many museums and cultural centers offer discounted entry or combo tickets when booked online.`;
  }

  if (lower.includes('food') || lower.includes('vegetarian') || lower.includes('eat') || lower.includes('restaurant')) {
    return `🍴 **Dining & Culinary Guide for ${dest}**:\n\n- **Local Specialties:** Try signature regional dishes from highly-rated central markets.\n- **Dietary Preferences:** Use apps like HappyCow or Google Maps filter for vegetarian and vegan options.\n- **Local Etiquette:** Tipping customs vary; in many Asian and European cities, service charge is already included in the bill.\n- **Water Safety:** Stick to bottled or sealed mineral water during day tours.`;
  }

  if (lower.includes('packing') || lower.includes('pack') || lower.includes('carry')) {
    return `🧳 **Smart Packing Checklist for ${dest}**:\n\n- **Essentials:** Universal power adapter, portable power bank (10,000mAh+), lightweight rain poncho/umbrella.\n- **Clothing:** Breathable layers, comfortable walking shoes (10k+ steps/day), modest temple/religious site attire covering shoulders and knees.\n- **Documents:** Physical printouts of hotel vouchers, digital passport copies on cloud storage, and active international roaming/eSIM.`;
  }

  return `✈️ **TripGenie Travel Insight for ${dest}**:\n\nThank you for reaching out! For your upcoming journey with ${context?.travellers || 2} travellers:\n\n• **Pacing:** We recommend scheduling 2-3 major activities per day to avoid travel fatigue and allow spontaneous exploration.\n• **Connectivity:** Pre-order an eSIM via Airalo or pick up a local SIM at the arrival terminal.\n• **Currency:** While credit cards are widely accepted in urban hubs, carry ₹5,000 - ₹8,000 equivalent in local cash for markets and transit.\n\nWould you like me to customize your day-by-day plan or suggest top photo spots?`;
}

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`TripGenie AI Server running on port ${port}`);
  });
}

startServer();
