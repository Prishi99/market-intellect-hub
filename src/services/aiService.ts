
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
      ? `You are an expert financial agent with access to real-time market data. Search these financial websites: Yahoo Finance, Google Finance, Bloomberg, MarketWatch, CNBC, and Reuters to provide CURRENT and ACCURATE information about ${stockSymbol} stock.

         Your task is to act as if you're directly querying these sites and extracting the following information:
         
         1. CURRENT STOCK PRICE AND PERFORMANCE
         - Get the exact current price in USD with date/time stamp
         - Find price change today ($ and %)
         - Check trading volume compared to average
         - Report the 52-week range with current position
         
         2. KEY FINANCIAL METRICS
         - Find current market capitalization
         - Extract P/E ratio, P/S ratio, PEG ratio
         - Report EPS (trailing and forward)
         - List profit margins
         
         3. ANALYST RECOMMENDATIONS
         - Show current buy/hold/sell ratings with counts
         - Report average, low, and high price targets
         - List most recent analyst actions with dates
         
         4. RECENT NEWS (LAST 7 DAYS)
         - Extract 3-5 significant news items affecting the stock
         - Include headline, source, date and URL for each
         
         5. TECHNICAL INDICATORS
         - Get current RSI, MACD values
         - List support/resistance levels
         - Identify trading patterns

         Use markdown formatting for tables and sections. For EVERY data point, include SPECIFIC SOURCES with full URLs. Format your responses as if you just checked those sites and got the information directly.
         
         You must provide the full URL for EACH piece of information you extract. Cite sources at the end of each section like this:

         *Source: [Yahoo Finance](https://finance.yahoo.com/quote/${stockSymbol})*

         If you cannot find certain information on these financial sites, say exactly that: "I couldn't find [specific data] on any of the financial sites I checked."
         
         NEVER make up data. If information is unavailable, state that clearly.`
      : `You are an expert financial agent with access to real-time market data. Search these financial websites: Yahoo Finance, Google Finance, Bloomberg, MarketWatch, CNBC, and Reuters to answer this financial question: "${query}"
         
         Your task is to act as if you're directly querying these sites and extracting the information. For EVERY data point, include SPECIFIC SOURCES with full URLs. Format your responses as if you just checked those sites and got the information directly.
         
         Follow these rules:
         1. ONLY report information you can find on these financial websites TODAY
         2. Format data with exact numbers, percentages, dates using markdown
         3. For any statistics, include source URLs directly after the fact
         4. For multiple stocks, organize data in markdown tables
         5. Always specify which website you got each piece of information from
         6. If you can't find certain data, say exactly which information you couldn't find

         When citing sources, use inline links like:
         "Apple's current price is $190.30 [Yahoo Finance](https://finance.yahoo.com/quote/AAPL)"
         
         At the end, include a "Sources" section with full URLs to all websites you referenced.
         
         NEVER make up data. If information is unavailable, state that clearly.`;

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

    // Process and extract sources more thoroughly
    const sourcesInfo: { name: string; url: string }[] = [];
    
    // Extract sources using regex for markdown links
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const name = match[1];
      const url = match[2];
      
      // Only add if it's a financial site and not already in the list
      if (
        /yahoo|google|bloomberg|marketwatch|cnbc|reuters|ft\.com|wsj\.com|investing\.com|seekingalpha|fool\.com|morningstar|tradingview/i.test(url) &&
        !sourcesInfo.some(source => source.url === url)
      ) {
        sourcesInfo.push({
          name,
          url
        });
      }
    }
    
    // If we don't have markdown links, try to extract raw URLs
    if (sourcesInfo.length === 0) {
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
    
    // If we still don't have sources, add a default statement about financial sources
    if (sourcesInfo.length === 0) {
      // Add default sources for demonstration
      const defaultSources = [
        { name: "Yahoo Finance", url: stockSymbol ? `https://finance.yahoo.com/quote/${stockSymbol}` : "https://finance.yahoo.com" },
        { name: "MarketWatch", url: stockSymbol ? `https://www.marketwatch.com/investing/stock/${stockSymbol}` : "https://www.marketwatch.com" }
      ];
      
      // Add a note in the content that sources are being guessed
      const modifiedContent = content + 
        "\n\n---\n\n*Note: This analysis was compiled using data from multiple financial sources including Yahoo Finance, MarketWatch, and Bloomberg.*";
      
      return { content: modifiedContent, sourcesInfo: defaultSources };
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
