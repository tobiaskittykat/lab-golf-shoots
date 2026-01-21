import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_HOSTS = new Set([
  "cdn.shopify.com",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const raw = requestUrl.searchParams.get("url");
    if (!raw) {
      return new Response("Missing url", { status: 400, headers: corsHeaders });
    }

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return new Response("Invalid url", { status: 400, headers: corsHeaders });
    }

    if (target.protocol !== "https:") {
      return new Response("Only https allowed", { status: 400, headers: corsHeaders });
    }

    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return new Response("Host not allowed", { status: 403, headers: corsHeaders });
    }

    const upstream = await fetch(target.toString(), {
      headers: {
        // A simple UA helps with some CDNs that behave differently for unknown clients.
        "User-Agent": "LovableImageProxy/1.0",
        "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error (${upstream.status})`, {
        status: 502,
        headers: corsHeaders,
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const cacheControl = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

    // Pass through the bytes; browser will treat it as same-origin resource.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("image-proxy error", e);
    return new Response("Proxy error", { status: 500, headers: corsHeaders });
  }
});
