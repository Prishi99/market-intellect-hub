
import { toast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyAa38ERLECgVmgh7G3qyJxI5b-flbkKqYE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AIQueryResponse {
  content: string;
  sourcesInfo?: { name: string, url: string }[];
}

export const queryFinancialAI = async (query: string, stockSymbol?: string): Promise<AIQueryResponse> => {
  try {
    // Create a more specific prompt based on whether we have a stock symbol
    const prompt = stockSymbol 
      ? `As a financial analyst with access to the most current stock market data, please provide a comprehensive analysis for ${stockSymbol}. 
         This should be based on TODAY'S REAL-TIME DATA. Include:
         
         ## Current Stock Price and Performance
         - Today's price: [current price with precise dollar amount]
         - Price change: [specific dollar and percentage change]
         - Trading volume: [actual volume today]
         - 52-week range: [specific high/low values]
         
         ## Analyst Recommendations
         - Current consensus: [Buy/Hold/Sell with exact counts]
         - Price targets: [specific low, average, high targets]
         - Recent analyst actions: [specific analyst firms, ratings changes, dates]
         
         ## Latest News
         - Include 3-5 specific news items from today or very recent that are affecting the stock
         - Include sources and dates for each news item
         
         ## Financial Metrics
         - P/E ratio: [current actual value]
         - Market cap: [precise value in billions]
         - Revenue: [most recent quarter with exact figure]
         - EPS: [most recent with exact figure]
         
         ## Technical Analysis
         - Key support/resistance levels
         - RSI, MACD, and other relevant indicators with SPECIFIC VALUES
         
         Format data in markdown tables. Be extremely specific with numerical values - no approximations or outdated information.`
      : `As a professional financial analyst with access to real-time market data, please analyze the following query thoroughly: "${query}"
         
         Provide SPECIFIC, CURRENT data from today's market session including:
         - Exact dollar amounts for any mentioned stocks or indices
         - Precise percentage changes
         - Actual trading volumes
         - Specific analyst ratings with firm names
         - Recent market-moving news with sources and timestamps
         
         Format numerical data in clean markdown tables. Focus on delivering precise, actionable insights based on the MOST CURRENT market data available.
         
         If any specific stocks are mentioned, include their current price, change amount, volume, and key metrics. Be extremely specific with all numerical values - no approximations.`;

    console.log("Querying Gemini API with prompt:", prompt);

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
          temperature: 0.1, // Lower temperature for more focused, factual responses
          topP: 0.95,
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

    // Extract any citation sources if they exist
    const sourcesInfo = data.candidates[0].citationMetadata?.citationSources?.map(source => ({
      name: source.uri.split('/').pop() || 'Source',
      url: source.uri
    }));
    
    return { content, sourcesInfo };
  } catch (error) {
    console.error("Error querying financial AI:", error);
    toast({
      title: "Gemini API Failed",
      description: "Switching to OpenAI with search capabilities...",
      variant: "destructive",
    });
    throw error;
  }
};

// OpenAI with web search capabilities
const OPENAI_API_KEY = "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";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const fallbackToOpenAI = async (query: string, stockSymbol?: string): Promise<AIQueryResponse> => {
  try {
    // Create a system prompt that specifically requests real-time data
    const systemPrompt = `You are a professional financial analyst with the ability to search the web for real-time stock market data. 
    You MUST use your web search capabilities to find the MOST CURRENT financial information available. 
    Your responses should be extremely precise and data-driven, with specific dollar amounts, percentages, and timestamps.
    Format all numerical data in clean markdown tables for readability.
    IMPORTANT: For any data you provide, you must search the web to find the most up-to-date information available.
    Do not rely on your training data, which may be outdated. Always search for current information.`;
    
    // Create a specific user prompt based on whether we have a stock symbol
    const userPrompt = stockSymbol 
      ? `Please search the web and provide the most current financial analysis for ${stockSymbol} with today's data.
         Include these well-structured sections:
         ## Current Stock Price and Performance
         Include exact current price, dollar and percentage change, today's volume, and 52-week range with specific numbers.
         
         ## Analyst Recommendations
         Include current analyst ratings with counts of buy/hold/sell recommendations, specific price targets with exact dollar amounts, and recent analyst actions with firm names and dates.
         
         ## Latest News
         Include 3-5 specific, current news items affecting the stock with sources and publication times.
         
         ## Financial Metrics
         Include current P/E ratio, market cap, revenue, EPS, and other key metrics with specific values.
         
         ## Technical Analysis
         Include specific support/resistance levels and technical indicator values.
         
         Format all numerical data in markdown tables. Be extremely specific with all numbers - provide exact values, not approximations.`
      : `Please search the web for the most current data to answer this financial query: "${query}"
         
         I need extremely specific, data-driven insights based on TODAY'S market activity, including:
         - Exact current prices of any relevant stocks or indices
         - Precise percentage changes
         - Actual trading volumes
         - Specific analyst ratings with firm names
         - Recent market news with sources and timestamps
         
         Format all numerical data in clean markdown tables. Focus on providing accurate, actionable insights based on the MOST CURRENT market data available.
         If specific stocks are mentioned, include their current price, change amount, volume, and key metrics with exact values.`;

    console.log("Querying OpenAI with prompt:", userPrompt);

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
        temperature: 0.1, // Lower temperature for more factual responses
        max_tokens: 2048,
        tools: [
          {
            type: "function",
            function: {
              name: "search_web",
              description: "Search the web for real-time financial data and news",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query for financial information"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto"
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
      description: "Could not process your query with any AI service. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};

// Helper function to get current stock data for trending stocks
export const getTrendingStocksData = async () => {
  try {
    // First try with OpenAI's search capabilities
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a financial data assistant with web search capabilities. Return ONLY JSON data, no explanations."
          },
          { 
            role: "user", 
            content: "Search the web for the current price data of these popular stocks: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA. Return the data in this exact JSON format only, no other text: [{\"symbol\":\"TICKER\",\"name\":\"Company Name\",\"price\":123.45,\"change\":1.23,\"changePercent\":1.23}]" 
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        tools: [
          {
            type: "function",
            function: {
              name: "search_web",
              description: "Search the web for real-time stock price data",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query for stock prices"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch trending stocks data");
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No valid response received");
    }
    
    // Parse the JSON response
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    
    if (jsonMatch) {
      try {
        const stocksData = JSON.parse(jsonMatch[0]);
        return stocksData.map((stock: any) => ({
          ...stock,
          color: stock.change > 0 ? "green" : "red"
        }));
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid JSON format returned");
      }
    } else {
      throw new Error("Could not extract JSON data");
    }
  } catch (error) {
    console.error("Error fetching trending stocks data:", error);
    throw error;
  }
};

// Helper function to get market index data
export const getMarketIndexData = async () => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a financial data assistant with web search capabilities. Return ONLY JSON data, no explanations."
          },
          { 
            role: "user", 
            content: "Search the web for the current data of major market indices: S&P 500, Dow Jones, NASDAQ. Return the data in this exact JSON format only, no other text: [{\"name\":\"Index Name\",\"value\":1234.56,\"change\":1.23}]" 
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        tools: [
          {
            type: "function",
            function: {
              name: "search_web",
              description: "Search the web for real-time market index data",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query for market indices"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch market index data");
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No valid response received");
    }
    
    // Parse the JSON response
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid JSON format returned");
      }
    } else {
      throw new Error("Could not extract JSON data");
    }
  } catch (error) {
    console.error("Error fetching market index data:", error);
    throw error;
  }
};

// Helper function to get financial news
export const getFinancialNews = async () => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a financial news assistant with web search capabilities. Return ONLY JSON data, no explanations."
          },
          { 
            role: "user", 
            content: "Search the web for the latest financial and market news from today. Return 5 latest news items in this exact JSON format only, no other text: [{\"title\":\"News Title\",\"source\":\"Source Name\",\"time\":\"Time Period\"}]" 
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        tools: [
          {
            type: "function",
            function: {
              name: "search_web",
              description: "Search the web for latest financial news",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query for financial news"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch financial news");
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No valid response received");
    }
    
    // Parse the JSON response
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid JSON format returned");
      }
    } else {
      throw new Error("Could not extract JSON data");
    }
  } catch (error) {
    console.error("Error fetching financial news:", error);
    throw error;
  }
};
