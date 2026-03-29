const HIBP_API_BASE = "https://haveibeenpwned.com/api/v3";

interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  Description: string;
  DataClasses: string[];
}

export async function getBreachesForEmail(email: string): Promise<HibpBreach[]> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    throw new Error("HIBP_API_KEY is not configured");
  }

  const response = await fetch(
    `${HIBP_API_BASE}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
    {
      headers: {
        "hibp-api-key": apiKey,
        "user-agent": "deindex.me",
      },
    }
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status}`);
  }

  return response.json();
}
