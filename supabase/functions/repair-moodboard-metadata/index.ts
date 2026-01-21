import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisualAnalysis {
  dominant_colors?: string[];
  color_mood?: string;
  key_elements?: string[];
  composition_style?: string;
  lighting_quality?: string;
  textures?: string[];
  emotional_tone?: string;
  suggested_props?: string[];
  best_for?: string[];
}

interface MoodboardMetadata {
  title: string;
  description: string;
  consistency_notes: string;
  visual_analysis: VisualAnalysis;
}

interface MoodboardRecord {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string;
  metadata_locked: boolean;
  visual_analysis: VisualAnalysis | null;
}

async function analyzeAndGenerateMetadata(imageUrl: string, apiKey: string): Promise<MoodboardMetadata> {
  const systemPrompt = `You are an expert visual analyst and creative director. You analyze moodboard images to generate accurate, image-based metadata.

CRITICAL RULES:
- ONLY describe what you can actually SEE in the image
- Do NOT guess locations if you cannot confirm them from visual evidence
- Use aesthetic/mood descriptors when location is uncertain
- Be specific about visible elements: colors, objects, textures, lighting, setting type
- Title should be 2-4 words capturing the dominant vibe/setting
- Description should be 10-18 words describing the visible mood and elements`;

  const userPrompt = `Analyze this moodboard image and generate accurate metadata.

Return a JSON object with:
1. "title": 2-4 word title that accurately describes the dominant visual theme/setting you see
2. "description": 10-18 word description of the visible mood, setting, and key elements
3. "consistency_notes": Brief explanation of what in the image justifies your title choice
4. "visual_analysis": Object containing:
   - "dominant_colors": Array of 3-5 main colors visible (e.g., "warm terracotta", "ocean blue")
   - "color_mood": Overall color feeling (e.g., "warm and earthy", "cool and serene")
   - "key_elements": Array of 5-8 main visible elements/objects
   - "composition_style": Description of layout style
   - "lighting_quality": Description of lighting
   - "textures": Array of visible textures
   - "emotional_tone": 2-3 word mood description
   - "suggested_props": Array of props that would complement this aesthetic
   - "best_for": Array of 3-5 use cases this moodboard is ideal for

IMPORTANT: Be honest about what you see. If you see a European street, don't assume it's Paris unless you see the Eiffel Tower or clear signage. Use descriptive terms like "Mediterranean Coastal" or "Old World Street" instead of guessing specific cities.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }

  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || 'Untitled Moodboard',
      description: parsed.description || 'Visual moodboard reference',
      consistency_notes: parsed.consistency_notes || '',
      visual_analysis: {
        dominant_colors: parsed.visual_analysis?.dominant_colors || [],
        color_mood: parsed.visual_analysis?.color_mood || '',
        key_elements: parsed.visual_analysis?.key_elements || [],
        composition_style: parsed.visual_analysis?.composition_style || '',
        lighting_quality: parsed.visual_analysis?.lighting_quality || '',
        textures: parsed.visual_analysis?.textures || [],
        emotional_tone: parsed.visual_analysis?.emotional_tone || '',
        suggested_props: parsed.visual_analysis?.suggested_props || [],
        best_for: parsed.visual_analysis?.best_for || [],
      }
    };
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse metadata from AI');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json();
    const { moodboardId, batch, limit = 5, cursor, force = false } = body;

    // Single moodboard mode
    if (moodboardId && !batch) {
      const { data: moodboard, error: fetchError } = await supabase
        .from('custom_moodboards')
        .select('*')
        .eq('id', moodboardId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !moodboard) {
        return new Response(JSON.stringify({ error: 'Moodboard not found' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (moodboard.metadata_locked && !force) {
        return new Response(JSON.stringify({ 
          success: true, 
          skipped: true, 
          reason: 'metadata_locked' 
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      console.log(`Analyzing moodboard: ${moodboard.id} - ${moodboard.name}`);
      const metadata = await analyzeAndGenerateMetadata(moodboard.thumbnail_url, apiKey);

      const { error: updateError } = await supabase
        .from('custom_moodboards')
        .update({
          name: metadata.title,
          description: metadata.description,
          visual_analysis: metadata.visual_analysis,
        })
        .eq('id', moodboardId);

      if (updateError) {
        throw updateError;
      }

      return new Response(JSON.stringify({
        success: true,
        moodboardId,
        oldName: moodboard.name,
        newName: metadata.title,
        oldDescription: moodboard.description,
        newDescription: metadata.description,
        consistencyNotes: metadata.consistency_notes,
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Batch mode
    if (batch) {
      // Build query
      let query = supabase
        .from('custom_moodboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(limit);

      // Only process unlocked unless force
      if (!force) {
        query = query.eq('metadata_locked', false);
      }

      // Pagination via cursor (created_at)
      if (cursor) {
        query = query.gt('created_at', cursor);
      }

      const { data: moodboards, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (!moodboards || moodboards.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          processed: 0,
          updated: 0,
          done: true,
          nextCursor: null,
          changes: [],
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const changes: Array<{
        id: string;
        oldName: string;
        newName: string;
        oldDescription: string | null;
        newDescription: string;
        consistencyNotes: string;
      }> = [];

      for (const moodboard of moodboards) {
        try {
          console.log(`[Batch] Analyzing: ${moodboard.id} - ${moodboard.name}`);
          const metadata = await analyzeAndGenerateMetadata(moodboard.thumbnail_url, apiKey);

          await supabase
            .from('custom_moodboards')
            .update({
              name: metadata.title,
              description: metadata.description,
              visual_analysis: metadata.visual_analysis,
            })
            .eq('id', moodboard.id);

          changes.push({
            id: moodboard.id,
            oldName: moodboard.name,
            newName: metadata.title,
            oldDescription: moodboard.description,
            newDescription: metadata.description,
            consistencyNotes: metadata.consistency_notes,
          });
        } catch (err) {
          console.error(`Failed to process moodboard ${moodboard.id}:`, err);
          // Continue with next moodboard
        }
      }

      // Get total count for progress
      const { count: totalCount } = await supabase
        .from('custom_moodboards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const lastMoodboard = moodboards[moodboards.length - 1];
      const nextCursor = moodboards.length === limit ? lastMoodboard.created_at : null;

      return new Response(JSON.stringify({
        success: true,
        processed: moodboards.length,
        updated: changes.length,
        done: !nextCursor,
        nextCursor,
        totalCount,
        changes,
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request - provide moodboardId or batch=true' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error in repair-moodboard-metadata:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
