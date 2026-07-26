import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/** Standalone FX route — no SDK dependency. Fetches open.er-api.com directly. */
export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 600 } });
    if (!res.ok) throw new Error("FX API " + res.status);
    const json = await res.json();
    const rates = json.rates;
    return NextResponse.json({
      base: "EUR",
      rates: { EUR: 1, USD: rates.USD, MAD: rates.MAD, GBP: rates.GBP },
      eurMad: rates.MAD,
      usdMad: rates.MAD / rates.USD,
      fetchedAt: json.time_last_update_utc || new Date().toISOString(),
      source: "open.er-api.com",
    });
  } catch (e) {
    // Fallback to cached/last-known rates so the dashboard always shows data.
    return NextResponse.json({
      base: "EUR",
      rates: { EUR: 1, USD: 1.14, MAD: 10.7, GBP: 0.85 },
      eurMad: 10.704,
      usdMad: 9.384,
      fetchedAt: new Date().toISOString(),
      source: "fallback (cached)",
      _error: (e as Error).message,
    });
  }
}
