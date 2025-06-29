
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user settings if userId is provided
    let userSettings = null;
    if (userId) {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('clerk_user_id', userId)
        .maybeSingle();
      
      userSettings = data;
    }

    // Default settings
    const rewriteLevel = userSettings?.rewrite_level || 'medium';
    const writingStyle = userSettings?.writing_style || 'professional';
    const outputLanguage = userSettings?.output_language || 'en';
    const specialWords = userSettings?.special_words || [];

    // Build language instruction
    const languageMap: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ru': 'Russian'
    };

    const outputLangInstruction = languageMap[outputLanguage] 
      ? `Write the rewritten content in ${languageMap[outputLanguage]}.`
      : 'Write the rewritten content in English.';

    // Build rewrite level instructions
    const levelInstructions = {
      low: 'Make minimal changes, focusing mainly on grammar and clarity while keeping the original structure and tone.',
      medium: 'Improve clarity, flow, and structure while maintaining the core message and a professional tone.',
      high: 'Completely restructure and enhance the content for maximum clarity, engagement, and professional presentation.'
    };

    // Build style instruction
    const styleInstruction = writingStyle 
      ? `Follow this writing style: ${writingStyle}`
      : 'Use a professional and clear writing style';

    // Build special words instruction
    const specialWordsInstruction = specialWords.length > 0
      ? `Pay special attention to spelling these words correctly: ${specialWords.join(', ')}.`
      : '';

    const prompt = `You are Talkflo, an AI assistant that helps users rewrite their voice transcripts into well-structured written content.

Rewrite Level: ${rewriteLevel.toUpperCase()}
${levelInstructions[rewriteLevel as keyof typeof levelInstructions]}

Writing Style: ${styleInstruction}

${outputLangInstruction}

${specialWordsInstruction}

Please rewrite the following transcript:

${text}

Rewritten content:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Talkflo, a helpful AI assistant that specializes in rewriting voice transcripts into well-structured written content according to user preferences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Rewrite failed');
    }

    const result = await response.json();
    const rewrittenText = result.choices[0].message.content;

    return new Response(JSON.stringify({ rewrittenText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in rewrite-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
