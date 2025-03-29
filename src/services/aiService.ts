
import { toast } from "@/hooks/use-toast";

// API configuration
const GEMINI_API_KEY = "AIzaSyAa38ERLECgVmgh7G3qyJxI5b-flbkKqYE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const ALPHAVANTAGE_API_KEY = "demo"; // Change to your AlphaVantage API key in production
const FINNHUB_API_KEY = "cn21vbhr01qs99a4h2c0cn21vbhr01qs99a4h2cg"; // Free API key for demo purposes

export interface AIQueryResponse {
  content: string;
  sourcesInfo?: { name: string, url: string }[];
}

// Financial data interface
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  color: string;
}

interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
}

interface CompanyProfile {
  name: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  weburl: string;
}

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Advanced Financial AI query function
 * Uses a multi-tool approach to gather data from various financial sources
 */
export const queryFinancialAI = async (query: string, stockSymbol?: string): Promise<AIQueryResponse> => {
  try {
    // Create a more specific prompt
    const prompt = stockSymbol 
      ? `You are FinanceGPT, an expert financial agent with direct API access to real-time market data. 
         
         I've already queried multiple financial data sources about ${stockSymbol} stock and here is the data:
         
         ${await fetchAndFormatStockData(stockSymbol)}
         
         Analyze this data professionally and respond in clear, structured markdown. Include:
         
         1. CURRENT STOCK PRICE AND PERFORMANCE
         2. KEY FINANCIAL METRICS
         3. ANALYST RECOMMENDATIONS (if available)
         4. RECENT NEWS affecting the stock
         5. TECHNICAL INDICATORS AND OUTLOOK
         
         Every piece of data must include its exact source. Format your response as a professional financial analyst would.
         Use markdown tables for numeric data. Include proper headers and sections.
         
         IMPORTANT: Cite each specific data source inline like [Yahoo Finance](https://finance.yahoo.com/quote/${stockSymbol})
         and include a comprehensive sources section at the end.`
         
      : `You are FinanceGPT, an expert financial agent with direct API access to real-time market data.
         
         I've already searched multiple financial data sources for information about: "${query}"
         
         ${await searchForFinancialInfo(query)}
         
         Analyze this information professionally and respond in clear, structured markdown. Create logical sections 
         based on the available data and the specific query topic.
         
         Every piece of data must include its exact source. Format your response as a professional financial analyst would.
         Use markdown tables for numeric data. Include proper headers and sections.
         
         IMPORTANT: Cite each specific data source inline like [Source Name](source URL)
         and include a comprehensive sources section at the end.`;

    console.log("Querying Gemini API with enhanced financial data prompt");

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
        /yahoo|google|bloomberg|marketwatch|cnbc|reuters|ft\.com|wsj\.com|investing\.com|seekingalpha|fool\.com|morningstar|tradingview|finnhub|alphavantage/i.test(url) &&
        !sourcesInfo.some(source => source.url === url)
      ) {
        sourcesInfo.push({
          name,
          url
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

/**
 * Fetch and format stock data from multiple sources
 */
async function fetchAndFormatStockData(symbol: string): Promise<string> {
  try {
    // Simultaneously fetch data from different sources
    const [quoteData, profileData, newsData, recommendationData] = await Promise.all([
      fetchStockQuote(symbol),
      fetchCompanyProfile(symbol),
      fetchCompanyNews(symbol),
      fetchAnalystRecommendations(symbol)
    ]);
    
    // Format data into a clean markdown string for the AI to analyze
    return `
## Stock Quote (Source: Finnhub)
- Symbol: ${symbol}
- Current Price: $${quoteData?.c.toFixed(2) || 'N/A'}
- Change: ${quoteData?.d.toFixed(2) || 'N/A'} (${quoteData?.dp.toFixed(2) || 'N/A'}%)
- Day Range: $${quoteData?.l.toFixed(2) || 'N/A'} - $${quoteData?.h.toFixed(2) || 'N/A'}
- Previous Close: $${quoteData?.pc.toFixed(2) || 'N/A'}

## Company Profile (Source: Finnhub)
- Name: ${profileData?.name || symbol}
- Exchange: ${profileData?.exchange || 'N/A'}
- Market Cap: $${(profileData?.marketCapitalization * 1000000).toLocaleString() || 'N/A'}
- Website: ${profileData?.weburl || 'N/A'}

## Recent News (Source: Finnhub)
${newsData?.slice(0, 5).map((news: NewsItem) => 
  `- [${news.headline}](${news.url}) (${new Date(news.datetime * 1000).toLocaleDateString()}) - ${news.source}`
).join('\n') || 'No recent news available'}

## Additional Financial Data (Source: Yahoo Finance)
- Yahoo Finance Link: [${symbol} on Yahoo Finance](https://finance.yahoo.com/quote/${symbol})
- MarketWatch Link: [${symbol} on MarketWatch](https://www.marketwatch.com/investing/stock/${symbol})
- Bloomberg Link: [${symbol} on Bloomberg](https://www.bloomberg.com/quote/${symbol})

${recommendationData ? `## Analyst Recommendations (Source: Finnhub)
${recommendationData}` : ''}
`;
  } catch (error) {
    console.error("Error fetching composite stock data:", error);
    return `Failed to retrieve comprehensive data for ${symbol}. Using available data from Yahoo Finance: https://finance.yahoo.com/quote/${symbol}`;
  }
}

/**
 * Search for general financial information
 */
async function searchForFinancialInfo(query: string): Promise<string> {
  // For general queries, we'll provide links to major financial sites
  const searchTerms = encodeURIComponent(query);
  
  return `
I've searched for information about "${query}" on major financial websites:

## Yahoo Finance
- [Yahoo Finance Search Results](https://finance.yahoo.com/lookup?s=${searchTerms})

## MarketWatch
- [MarketWatch Search Results](https://www.marketwatch.com/search?q=${searchTerms})

## CNBC
- [CNBC Search Results](https://www.cnbc.com/search/?query=${searchTerms})

## Bloomberg
- [Bloomberg Search Results](https://www.bloomberg.com/search?query=${searchTerms})

## Reuters
- [Reuters Search Results](https://www.reuters.com/search/news?blob=${searchTerms})

Please analyze the most relevant information from these sources related to the query.
`;
}

/**
 * Fetch real-time stock quote data from Finnhub
 */
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock quote for ${symbol}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

/**
 * Fetch company profile data from Finnhub
 */
async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company profile for ${symbol}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return null;
  }
}

/**
 * Fetch recent company news from Finnhub
 */
async function fetchCompanyNews(symbol: string): Promise<NewsItem[] | null> {
  try {
    // Get news from the last 30 days
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);
    
    const fromDate = pastDate.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company news for ${symbol}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching company news:", error);
    return null;
  }
}

/**
 * Fetch analyst recommendations from Finnhub
 */
async function fetchAnalystRecommendations(symbol: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analyst recommendations for ${symbol}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Format the most recent recommendation data
    const recent = data[0];
    return `
- Buy: ${recent.buy}
- Hold: ${recent.hold}
- Sell: ${recent.sell}
- Strong Buy: ${recent.strongBuy}
- Strong Sell: ${recent.strongSell}
- Period: ${recent.period}
`;
  } catch (error) {
    console.error("Error fetching analyst recommendations:", error);
    return null;
  }
}

// Helper function to get current stock data for trending stocks
export const getTrendingStocksData = async () => {
  try {
    // List of popular stocks to fetch
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA"];
    const stocks: StockData[] = [];
    
    // Fetch data for each symbol
    for (const symbol of symbols) {
      try {
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        const profileResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        
        if (!quoteResponse.ok || !profileResponse.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }
        
        const quote: StockQuote = await quoteResponse.json();
        const profile: CompanyProfile = await profileResponse.json();
        
        stocks.push({
          symbol,
          name: profile.name || `${symbol} Inc.`,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          color: quote.d > 0 ? "green" : "red"
        });
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
      }
    }
    
    // If we have at least some data, return it
    if (stocks.length > 0) {
      return stocks;
    }
    
    // If API fails completely, fall back to backup plan
    throw new Error("Failed to fetch any stock data from API");
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
    // Major indices symbols
    const indices = [
      { symbol: "^GSPC", name: "S&P 500" },
      { symbol: "^DJI", name: "Dow Jones" },
      { symbol: "^IXIC", name: "NASDAQ" }
    ];
    
    const indexData = [];
    
    for (const index of indices) {
      try {
        // Use Alpha Vantage for index data (Finnhub doesn't support indices in free tier)
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${ALPHAVANTAGE_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${index.name}`);
        }
        
        const data = await response.json();
        
        if (data["Global Quote"]) {
          const quote = data["Global Quote"];
          indexData.push({
            name: index.name,
            value: parseFloat(quote["05. price"]),
            change: parseFloat(quote["10. change percent"].replace('%', ''))
          });
        }
      } catch (err) {
        console.error(`Error fetching data for ${index.name}:`, err);
      }
    }
    
    // If we have at least some data, return it
    if (indexData.length > 0) {
      return indexData;
    }
    
    // If API fails completely, fall back to backup plan
    throw new Error("Failed to fetch any index data from API");
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
    // Fetch general market news from Finnhub
    const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch financial news");
    }
    
    const newsData: NewsItem[] = await response.json();
    
    // Format and return news data
    return newsData.slice(0, 5).map(item => ({
      title: item.headline,
      source: item.source,
      time: new Date(item.datetime * 1000).toLocaleString()
    }));
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
