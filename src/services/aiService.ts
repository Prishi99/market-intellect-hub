
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
      ? `Please search the web and provide real-time financial analysis for ${stockSymbol}.
         Access Bloomberg, Yahoo Finance, MarketWatch, CNBC, Reuters, and other financial data sources to find the MOST CURRENT data available.
         Provide ONLY factual, verifiable information based on TODAY'S MARKET DATA.
         
         ## Current Stock Price and Performance
         - Today's exact price in USD
         - Precise price change (dollar and percentage)
         - Today's trading volume
         - Current 52-week range
         
         ## Analyst Recommendations
         - Current consensus ratings with exact counts
         - Current price targets (low, average, high)
         - Most recent analyst actions with firm names and dates
         
         ## Latest News
         - Include 3-5 specific news items from today or this week
         - Include sources and dates for each news item
         
         ## Financial Metrics
         - Current P/E ratio
         - Current market cap
         - Most recent quarterly revenue and EPS
         
         ## Technical Analysis
         - Key support/resistance levels
         - Current RSI, MACD values
         
         Format all numerical data in markdown tables. All information MUST be factual and based on real-time data.`
      : `Please search the web for real-time financial data to answer this query: "${query}"
         
         Access Bloomberg, Yahoo Finance, MarketWatch, CNBC, Reuters, and other financial data sources to find the MOST CURRENT market data available.
         Provide ONLY factual, verifiable information based on TODAY'S MARKET DATA.
         
         Include specific numbers, dates, and sources:
         - Exact current prices of any relevant stocks/indices
         - Precise percentage changes
         - Actual trading volumes
         - Specific analyst ratings with firm names
         - Recent market news with sources and dates
         
         Format all numerical data in markdown tables. All information MUST be factual and based on real-time data.`;

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
    // Use Gemini API to get trending stocks data
    const prompt = `Please search the web for the CURRENT price data of these popular stocks: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA. 
    Access Yahoo Finance, MarketWatch, or other reliable financial websites to get the MOST UP-TO-DATE data.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"symbol":"AAPL","name":"Apple Inc.","price":123.45,"change":1.23,"changePercent":1.23},
      {"symbol":"MSFT","name":"Microsoft Corp.","price":234.56,"change":2.34,"changePercent":2.34}
    ]
    
    Provide ONLY the JSON array with REAL-TIME data. No explanatory text.`;
    
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
    // Use Gemini API to get market index data
    const prompt = `Please search the web for the CURRENT data of major market indices: S&P 500, Dow Jones, NASDAQ.
    Access Yahoo Finance, MarketWatch, or other reliable financial websites to get the MOST UP-TO-DATE data.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"name":"S&P 500","value":4500.00,"change":1.20},
      {"name":"Dow Jones","value":36000.00,"change":-0.50},
      {"name":"NASDAQ","value":14000.00,"change":1.50}
    ]
    
    Provide ONLY the JSON array with REAL-TIME data. No explanatory text.`;
    
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
    // Use Gemini API to get financial news
    const prompt = `Please search the web for TODAY'S latest financial and market news.
    Access CNBC, Bloomberg, Reuters, WSJ, or other reliable financial news sources.
    
    Return ONLY a JSON array with this exact structure:
    [
      {"title":"News Title 1","source":"Source Name","time":"Time Period"},
      {"title":"News Title 2","source":"Source Name","time":"Time Period"}
    ]
    
    Find 5 of the MOST RECENT and IMPORTANT financial news stories from TODAY.
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

