
import { toast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyAa38ERLECgVmgh7G3qyJxI5b-flbkKqYE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AIQueryResponse {
  content: string;
  sourcesInfo?: { name: string, url: string }[];
}

export const queryFinancialAI = async (query: string, stockSymbol?: string): Promise<AIQueryResponse> => {
  try {
    const prompt = stockSymbol 
      ? `Please provide comprehensive financial analysis for ${stockSymbol}. Include analyst recommendations, latest news, market trends, and financial metrics if available. Format the response with markdown tables for data visualization.`
      : `Please analyze the following financial query and provide detailed insights: ${query}. Include relevant market data, stock analysis, and news if applicable. Format the response with markdown tables for data visualization.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error("Failed to get response from Gemini API");
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("No valid response received from Gemini API");
    }
    
    // Extract the text content from the response
    const content = data.candidates[0].content.parts[0].text;
    
    return { content };
  } catch (error) {
    console.error("Error querying financial AI:", error);
    toast({
      title: "AI Query Failed",
      description: "Could not process your query. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};

// Fallback to OpenAI if Gemini fails
const OPENAI_API_KEY = "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";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const fallbackToOpenAI = async (query: string, stockSymbol?: string): Promise<AIQueryResponse> => {
  try {
    const systemPrompt = "You are a financial expert AI assistant. Provide comprehensive, detailed market analysis with accurate data. Format responses with markdown tables when presenting numerical data. Include current analyst recommendations, latest news, and market trends where applicable.";
    
    const userPrompt = stockSymbol 
      ? `Provide detailed financial analysis for ${stockSymbol}. Include current analyst recommendations, price targets, latest news, earnings data, and key metrics. Format numerical data in markdown tables for clarity.`
      : `Analyze the following financial query and provide detailed insights: ${query}. Include relevant market data, stock analysis, and news if applicable.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error("Failed to get response from OpenAI API");
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No valid response received from OpenAI API");
    }
    
    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error("Error querying OpenAI:", error);
    toast({
      title: "AI Query Failed",
      description: "Could not process your query with the backup service. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};
