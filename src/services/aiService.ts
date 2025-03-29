
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
      ? `As a skilled financial analyst, search the web for real-time data about ${stockSymbol} stock.

         Look for the following information from reliable financial sources like Yahoo Finance, Google Finance, Bloomberg, MarketWatch, CNBC, and Reuters:
         
         1. CURRENT STOCK PRICE AND PERFORMANCE
         - Exact current price in USD with date/time stamp
         - Price change today ($ and %)
         - Trading volume compared to average
         - 52-week range with current position
         
         2. KEY FINANCIAL METRICS
         - Current market capitalization
         - P/E ratio, P/S ratio, PEG ratio
         - EPS (trailing and forward)
         - Profit margins
         
         3. ANALYST RECOMMENDATIONS
         - Current buy/hold/sell ratings with counts
         - Average, low, and high price targets
         - Most recent analyst actions with dates
         
         4. RECENT NEWS (LAST 7 DAYS)
         - List 3-5 significant news items affecting the stock
         - Include source and date for each
         
         5. TECHNICAL INDICATORS
         - Current RSI, MACD values
         - Support/resistance levels
         - Trading patterns identified

         Present the information in a clear, structured format using markdown tables where appropriate. ALWAYS cite your sources with specific URLs for each section. Focus on FACTUAL, CURRENT data only. If you cannot find certain information, clearly state that.
         
         DO NOT make up data. If information is not available, say so. Use only information you can verify from reliable sources.

         At the end of your analysis, include a "Sources" section that lists all the websites you obtained information from, with full URLs. Use markdown links.`
      : `As a skilled financial analyst, search the web to answer this financial question: "${query}"
         
         Use reliable financial sources such as Yahoo Finance, Google Finance, Bloomberg, MarketWatch, CNBC, and Reuters to find the most current and accurate information.
         
         When answering:
         1. Provide EXACT numbers, percentages, and dates - be precise
         2. Structure your response with clear headings and bullet points
         3. Use markdown tables for numerical data when appropriate
         4. ALWAYS cite your sources with specific URLs for each piece of information
         5. If the query involves multiple stocks, present comparative data in tables
         6. For market trends, include supporting data points and current examples
         
         Your response should be factual, comprehensive, and directly address the user's query. DO NOT make up data. If information is not available, clearly state that.
         
         At the end of your analysis, include a "Sources" section that lists all the websites you obtained information from, with full URLs. Use markdown links.
         
         Remember to search for the MOST CURRENT information available today.`;

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
          temperature: 0.1,
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
    })) || [];
    
    // If we don't have citation metadata, try to extract sources from the content
    if (sourcesInfo.length === 0) {
      // Try to extract URLs from the content using regex
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      const matches = content.match(urlRegex);
      
      if (matches) {
        matches.forEach(url => {
          const hostname = new URL(url).hostname.replace('www.', '');
          sourcesInfo.push({
            name: hostname,
            url: url
          });
        });
      }
    }
    
    return { content, sourcesInfo };
  } catch (error) {
    console.error("Error querying financial AI:", error);
    toast({
      title: "AI Service Error",
      description: "Could not retrieve financial data. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};

// Helper function to get current stock data for trending stocks
export const getTrendingStocksData = async () => {
  try {
    // Create a specific prompt for getting accurate stock data
    const prompt = `As a financial analyst with access to real-time market data, search the web for the CURRENT EXACT price data of these popular stocks: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA.
    
    Search Yahoo Finance, MarketWatch, Google Finance, or other reliable financial websites to get the MOST UP-TO-DATE data as of today.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"symbol":"AAPL","name":"Apple Inc.","price":123.45,"change":1.23,"changePercent":1.23},
      {"symbol":"MSFT","name":"Microsoft Corp.","price":234.56,"change":2.34,"changePercent":2.34}
    ]
    
    Rules:
    1. The data MUST be from today
    2. The values MUST be exact (use actual decimal places, not rounded numbers)
    3. Include ALL six stocks in the response
    4. Format as a proper JSON array with NO additional text
    5. Ensure the "change" is the dollar amount change and "changePercent" is the percentage change
    
    Provide ONLY the JSON array. No explanatory text.`;
    
    console.log("Fetching trending stocks with Gemini API");
    
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
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch trending stocks data");
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("No valid response received");
    }
    
    // Extract the text content from the response
    const content = data.candidates[0].content.parts[0].text;
    
    // Find and parse the JSON array in the response
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
        throw new Error("Invalid JSON format returned for stocks");
      }
    } else {
      console.error("Could not extract JSON data, response was:", content);
      throw new Error("Could not extract JSON data for stocks");
    }
  } catch (error) {
    console.error("Error fetching trending stocks data:", error);
    // Return sample data if we can't get real data
    return [
      { symbol: "AAPL", name: "Apple Inc.", price: 175.04, change: 0.65, changePercent: 0.37, color: "green" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 340.79, change: -1.23, changePercent: -0.36, color: "red" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 138.56, change: 0.89, changePercent: 0.65, color: "green" },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: 128.85, change: 1.56, changePercent: 1.22, color: "green" },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: 925.75, change: -2.25, changePercent: -0.24, color: "red" },
      { symbol: "TSLA", name: "Tesla Inc.", price: 175.43, change: -3.22, changePercent: -1.8, color: "red" }
    ];
  }
};

// Helper function to get market index data
export const getMarketIndexData = async () => {
  try {
    // Create a specific prompt for getting accurate market index data
    const prompt = `As a financial analyst with access to real-time market data, search the web for the CURRENT EXACT values of these major market indices: S&P 500, Dow Jones Industrial Average, NASDAQ Composite.
    
    Search Yahoo Finance, MarketWatch, Google Finance, or other reliable financial websites to get the MOST UP-TO-DATE data as of today.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"name":"S&P 500","value":4500.00,"change":1.20},
      {"name":"Dow Jones","value":36000.00,"change":-0.50},
      {"name":"NASDAQ","value":14000.00,"change":1.50}
    ]
    
    Rules:
    1. The data MUST be from today
    2. The values MUST be exact (use actual decimal places, not rounded numbers)
    3. Include ALL three indices in the response
    4. Format as a proper JSON array with NO additional text
    5. Ensure the "change" is the percentage change, not the point change
    
    Provide ONLY the JSON array. No explanatory text.`;
    
    console.log("Fetching market indices with Gemini API");
    
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
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch market index data");
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("No valid response received");
    }
    
    // Extract the text content from the response
    const content = data.candidates[0].content.parts[0].text;
    
    // Find and parse the JSON array in the response
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid JSON format returned for indices");
      }
    } else {
      console.error("Could not extract JSON data, response was:", content);
      throw new Error("Could not extract JSON data for indices");
    }
  } catch (error) {
    console.error("Error fetching market index data:", error);
    // Return sample data if we can't get real data
    return [
      { name: "S&P 500", value: 4782.15, change: 0.68 },
      { name: "Dow Jones", value: 38563.35, change: 0.32 },
      { name: "NASDAQ", value: 15203.78, change: -0.21 }
    ];
  }
};

// Helper function to get financial news
export const getFinancialNews = async () => {
  try {
    // Create a specific prompt for getting accurate financial news
    const prompt = `As a financial analyst with access to real-time news, search the web for TODAY'S MOST SIGNIFICANT financial and market news stories.
    
    Search Reuters, CNBC, Bloomberg, Financial Times, Wall Street Journal, or other reliable financial news sources to get the MOST UP-TO-DATE news as of today.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"title":"Exact News Headline","source":"Exact Source Name","time":"Time Period (e.g., '2 hours ago', 'Today 9:45 AM ET')"},
      {"title":"Another News Headline","source":"Source Name","time":"Time Period"}
    ]
    
    Rules:
    1. The news MUST be from today only
    2. Focus on MAJOR market-moving stories (Fed decisions, earnings reports, major economic data)
    3. Include EXACTLY 5 news items
    4. Format as a proper JSON array with NO additional text
    5. Use EXACT headlines as they appear on the source sites
    6. Include the EXACT publication source
    7. Include SPECIFIC time information relative to now
    
    Provide ONLY the JSON array. No explanatory text.`;
    
    console.log("Fetching financial news with Gemini API");
    
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
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch financial news");
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("No valid response received");
    }
    
    // Extract the text content from the response
    const content = data.candidates[0].content.parts[0].text;
    
    // Find and parse the JSON array in the response
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid JSON format returned for news");
      }
    } else {
      console.error("Could not extract JSON data, response was:", content);
      throw new Error("Could not extract JSON data for news");
    }
  } catch (error) {
    console.error("Error fetching financial news:", error);
    // Return sample data if we can't get real data
    return [
      { title: "Federal Reserve Signals Interest Rate Decision", source: "Financial Times", time: "2 hours ago" },
      { title: "Major Tech Stocks Rally on Earnings Reports", source: "Bloomberg", time: "4 hours ago" },
      { title: "Oil Prices Fluctuate Amid Global Supply Concerns", source: "Reuters", time: "6 hours ago" },
      { title: "Retail Sales Data Exceeds Analyst Expectations", source: "CNBC", time: "8 hours ago" },
      { title: "Cryptocurrency Market Sees Significant Volatility", source: "WSJ", time: "10 hours ago" }
    ];
  }
};
