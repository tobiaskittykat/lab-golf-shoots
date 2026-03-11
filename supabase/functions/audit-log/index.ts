import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, resourceType, resourceId, resourceName, metadata } = await req.json();

    // Log to console for now - could be extended to write to a dedicated audit table
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      resourceType,
      resourceId,
      resourceName,
      metadata,
    }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // Audit logging should never fail loudly
    console.warn("audit-log error:", e);
    return new Response(JSON.stringify({ success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
