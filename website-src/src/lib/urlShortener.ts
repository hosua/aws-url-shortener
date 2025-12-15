import { API_BASE_URL } from "@lib/env";

interface ShortenUrlRequest {
  originalUrl: string;
  ttl: number;
}

interface ShortenUrlResponse {
  statusCode: number;
  short_url: string;
}

interface GetUrlResponse {
  original_url: string;
  short_url: string;
  current_time: number;
  expire_at: number;
}

export const shortenUrl = async ({ originalUrl, ttl }: ShortenUrlRequest) => {
  const url = `${API_BASE_URL}/url`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ original_url: originalUrl, ttl }),
  });

  if (!response.ok) {
    throw new Error("Failed to shorten URL");
  }

  const data: ShortenUrlResponse = await response.json();
  return data;
};

export const getOriginalUrl = async ({ shortUrl }: { shortUrl: string }) => {
  const response = await fetch(
    `${API_BASE_URL}/url?short_url=${encodeURIComponent(shortUrl)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data: GetUrlResponse = await response.json();

  if (!data || !data.original_url) {
    return null;
  }

  return data;
};
