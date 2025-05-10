import { SummaryType } from '@/types';

// OpenRouter models configuration
export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo (Free)' },
  { id: 'anthropic/claude-3-haiku', name: 'Anthropic Claude 3 Haiku (Free)' },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Meta Llama 3 8B Instruct (Free)' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash Exp (Free)' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Meta Llama 4 Maverick (Free)' },
];

export interface SummarizeParams {
  text: string;
  model: string;
  type: SummaryType;
  apiKey: string;
}

export interface AutoTagParams {
  text: string;
  title: string;
  model: string;
  apiKey: string;
}

// Generate a summary prompt based on the summary type
function getSummaryPrompt(text: string, type: SummaryType): string {
  switch (type) {
    case 'brief':
      return `Please provide a brief, concise summary (2-3 sentences) of the following text, capturing its main points:\n\n${text}`;
    case 'detailed':
      return `Please provide a detailed summary of the following text, explaining the main concepts and important details:\n\n${text}`;
    case 'bullets':
      return `Please summarize the following text as 3-5 bullet points, highlighting the key takeaways:\n\n${text}`;
    default:
      return `Please summarize the following text in 2-3 sentences:\n\n${text}`;
  }
}

// Function to generate an LLM summary using OpenRouter
export async function generateSummary({ text, model, type, apiKey }: SummarizeParams): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  // Truncate text if it's too long
  const maxTextLength = 10000;
  const truncatedText = text.length > maxTextLength 
    ? text.substring(0, maxTextLength) + "... (text truncated due to length)"
    : text;
  
  // Create the prompt based on summary type
  const prompt = getSummaryPrompt(truncatedText, type);
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "Smart Note Organizer"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText || "Unknown error occurred");
    }
    
    const data = await response.json();
    
    // Handle different response formats for different models
    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else if (data.choices[0].text) {
        // Some models might return text directly
        return data.choices[0].text;
      }
    }
    
    // If we couldn't extract content in the expected format
    throw new Error("The model returned a response in an unexpected format. Please try a different model.");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generating summary: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
}

// Function to generate tags using LLMs
export async function generateTags({ text, title, model, apiKey }: AutoTagParams): Promise<string[]> {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  // Truncate text if it's too long
  const maxTextLength = 10000;
  const truncatedText = text.length > maxTextLength 
    ? text.substring(0, maxTextLength) + "... (text truncated due to length)"
    : text;
  
  // Create the prompt for tag generation
  const prompt = `Please analyze the following note titled "${title}" and generate 3-7 relevant tags or keywords that best categorize this content. Tags should be single words or short phrases (max 2-3 words) that capture the main topics, concepts, and themes. Return only the tags separated by commas without any other text or explanation.\n\nNote content:\n${truncatedText}`;
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "Smart Note Organizer"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText || "Unknown error occurred");
    }
    
    const data = await response.json();
    
    // Extract response text
    let tagsText = '';
    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        tagsText = data.choices[0].message.content.trim();
      } else if (data.choices[0].text) {
        tagsText = data.choices[0].text.trim();
      }
    }
    
    if (!tagsText) {
      throw new Error("The model returned an empty response");
    }
    
    // Process the response to extract clean tags
    // Split by commas, remove empty entries, and trim whitespace
    const tags = tagsText.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    return tags;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generating tags: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
} 