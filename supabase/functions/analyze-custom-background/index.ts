const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "imageUrls array is required (1-3 URLs)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageContent = imageUrls.map((url: string) => ({
      type: "image_url" as const,
      image_url: { url },
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a product photography background expert. Analyze the provided reference image(s) and extract a detailed background/setting description that can be used to recreate a similar environment in AI-generated product photography.

Focus on: surface materials and textures, colors and tones, lighting quality and direction, mood/atmosphere, depth and spatial elements, any props or environmental details.

You MUST call the extract_background_analysis function with your findings.`,
          },
          {
            role: "user",
            content: [
              ...imageContent,
              {
                type: "text" as const,
                text: "Analyze these reference images and extract a background/setting description for product photography. Generate a ready-to-use prompt that describes the background environment in detail.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_background_analysis",
              description: "Extract structured background analysis from reference images",
              parameters: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "A detailed, ready-to-use background prompt for product photography (2-4 sentences describing the surface, lighting, mood, and environment)",
                  },
                  colors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key colors in the background (e.g., 'warm terracotta', 'cool grey')",
                  },
                  textures: {
                    type: "array",
                    items: { type: "string" },
                    description: "Surface textures and materials (e.g., 'rough concrete', 'polished marble')",
                  },
                  mood: {
                    type: "string",
                    description: "Overall mood/atmosphere (e.g., 'warm and rustic', 'clean and minimal')",
                  },
                  lighting: {
                    type: "string",
                    description: "Lighting characteristics (e.g., 'soft diffused natural light from left', 'warm golden hour')",
                  },
                },
                required: ["prompt", "colors", "textures", "mood", "lighting"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_background_analysis" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        prompt: analysis.prompt,
        analysis: {
          colors: analysis.colors,
          textures: analysis.textures,
          mood: analysis.mood,
          lighting: analysis.lighting,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-custom-background:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
