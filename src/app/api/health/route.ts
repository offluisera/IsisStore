import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatency = 0;

  try {
    const supabase = await createClient();
    const dbStart = Date.now();
    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);
    
    dbLatency = Date.now() - dbStart;

    if (error) {
      dbStatus = "error";
    } else {
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "disconnected";
  }

  const isHealthy = dbStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "production",
    checks: {
      database: {
        status: dbStatus,
        latency_ms: dbLatency,
      },
    },
    total_response_ms: Date.now() - startTime,
  };

  return NextResponse.json(payload, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
