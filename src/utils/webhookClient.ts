export interface WebhookRequestParams {
  departureCity: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  budgetINR: number;
  nights?: number;
  travelStyle?: string;
  cabinClass?: string;
  authToken?: string;
}

export interface WebhookClientResponse {
  success: boolean;
  status: number;
  statusText?: string;
  rawText: string;
  isJson: boolean;
  data: any;
  error?: string;
}

export const PRODUCTION_N8N_WEBHOOK_URL = 'https://bhagya4478.app.n8n.cloud/webhook/tripgenie-travel';

/**
 * Robust dispatcher for n8n webhook:
 * 1. Tries calling the n8n webhook directly (works out of the box on Vercel and any host since n8n cloud returns proper CORS headers).
 * 2. If direct fetch fails (e.g. strict environment or local proxy preferred), falls back to `/api/webhook-proxy` without crashing.
 * 3. Safely reads response as text first, then parses JSON only when valid.
 * 4. Captures actual HTTP status and response text for clear debugging.
 */
export async function sendTripPlanToN8n(
  targetUrl: string = PRODUCTION_N8N_WEBHOOK_URL,
  params: WebhookRequestParams
): Promise<WebhookClientResponse> {
  const payload = {
    departure_city: params.departureCity,
    destination: params.destination,
    departure_date: params.departureDate,
    return_date: params.returnDate,
    travellers: params.travellers,
    budget: params.budgetINR,
    total_budget_inr: params.budgetINR,
    currency: 'INR',
    nights: params.nights,
    travel_style: params.travelStyle,
    cabin_class: params.cabinClass,
    timestamp: new Date().toISOString(),
    applet_id: '3bfdae99-afd8-477e-81e2-7a8d40e5f895',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };

  if (params.authToken) {
    headers['Authorization'] = `Bearer ${params.authToken}`;
  }

  // Strategy 1: Call the n8n production webhook directly
  try {
    const directResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const httpStatus = directResponse.status;
    const rawText = await directResponse.text();

    let parsedData: any = null;
    let isJson = false;

    if (rawText && rawText.trim().length > 0) {
      try {
        parsedData = JSON.parse(rawText);
        isJson = true;
      } catch {
        isJson = false;
      }
    }

    if (!directResponse.ok) {
      let errorMsg = `HTTP ${httpStatus}: ${directResponse.statusText || 'Webhook request failed'}`;
      if (isJson && parsedData) {
        if (parsedData.message) errorMsg = `HTTP ${httpStatus}: ${parsedData.message}`;
        else if (parsedData.error) errorMsg = `HTTP ${httpStatus}: ${typeof parsedData.error === 'string' ? parsedData.error : JSON.stringify(parsedData.error)}`;
      } else if (rawText && rawText.trim().length > 0) {
        errorMsg = `HTTP ${httpStatus}: ${rawText.substring(0, 300)}`;
      }

      return {
        success: false,
        status: httpStatus,
        statusText: directResponse.statusText,
        rawText,
        isJson,
        data: parsedData,
        error: errorMsg,
      };
    }

    if (!isJson) {
      return {
        success: false,
        status: httpStatus,
        statusText: directResponse.statusText,
        rawText,
        isJson: false,
        data: null,
        error: `HTTP ${httpStatus}: n8n webhook returned non-JSON response: "${rawText.substring(0, 300)}"`,
      };
    }

    return {
      success: true,
      status: httpStatus,
      statusText: directResponse.statusText,
      rawText,
      isJson: true,
      data: parsedData,
    };
  } catch (directErr: any) {
    // If direct fetch experienced a network error, attempt backend proxy as fallback
    console.warn('Direct n8n webhook fetch error, attempting proxy fallback:', directErr?.message || directErr);

    try {
      const proxyResponse = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: targetUrl,
          payload,
          headers: params.authToken ? { Authorization: `Bearer ${params.authToken}` } : {},
        }),
      });

      const proxyStatus = proxyResponse.status;
      const proxyText = await proxyResponse.text();

      let proxyJson: any = null;
      let isProxyJson = false;
      try {
        proxyJson = JSON.parse(proxyText);
        isProxyJson = true;
      } catch {
        isProxyJson = false;
      }

      if (!proxyResponse.ok) {
        // If the proxy itself returned 404 (e.g., static Vercel host without node server), report direct error
        return {
          success: false,
          status: proxyStatus,
          statusText: proxyResponse.statusText,
          rawText: proxyText,
          isJson: isProxyJson,
          data: proxyJson,
          error: `Network error connecting to n8n webhook: ${directErr?.message || 'Failed to fetch'}. (Proxy returned HTTP ${proxyStatus})`,
        };
      }

      if (isProxyJson && proxyJson) {
        return {
          success: proxyJson.success,
          status: proxyJson.status || 200,
          statusText: proxyJson.statusText,
          rawText: proxyJson.rawText || JSON.stringify(proxyJson.data || proxyJson),
          isJson: true,
          data: proxyJson.data,
          error: proxyJson.error,
        };
      }

      return {
        success: false,
        status: proxyStatus,
        rawText: proxyText,
        isJson: false,
        data: null,
        error: `Proxy returned invalid response: ${proxyText.substring(0, 200)}`,
      };
    } catch (proxyErr: any) {
      return {
        success: false,
        status: 0,
        rawText: '',
        isJson: false,
        data: null,
        error: `Network failure connecting to n8n webhook: ${directErr?.message || proxyErr?.message || 'Check internet connection and webhook URL'}`,
      };
    }
  }
}
