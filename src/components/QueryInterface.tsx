
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, Search, BarChart2, TrendingUp, FileText, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import StockCard from "./StockCard";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  queryFinancialAI, 
  getTrendingStocksData, 
  getMarketIndexData,
  getFinancialNews
} from "@/services/aiService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import remarkGfm from "remark-gfm";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  color: string;
}

interface NewsItem {
  title: string;
  source: string;
  time: string;
}

// Market indexes data structure
interface MarketIndex {
  name: string;
  value: number;
  change: number;
}

const QueryInterface = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [marketIndexes, setMarketIndexes] = useState<MarketIndex[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [indexesLoading, setIndexesLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch real-time market data
  const fetchMarketData = async (showToast = false) => {
    if (showToast) {
      setDataRefreshing(true);
      toast({
        title: "Refreshing Market Data",
        description: "Fetching the latest financial information...",
      });
    } else {
      setStocksLoading(true);
      setIndexesLoading(true);
      setNewsLoading(true);
    }
    
    try {
      // Fetch trending stocks
      const stocksData = await getTrendingStocksData();
      setStocks(stocksData);
      if (showToast) {
        toast({
          title: "Stocks Data Updated",
          description: "Latest stock information has been loaded.",
        });
      }
    } catch (err) {
      console.error("Error fetching stock data:", err);
      if (showToast) {
        toast({
          title: "Error loading stock data",
          description: "Could not refresh stock data. Using cached data instead.",
          variant: "destructive",
        });
      }
    } finally {
      setStocksLoading(false);
    }
    
    try {
      // Fetch market indexes
      const indexData = await getMarketIndexData();
      setMarketIndexes(indexData);
    } catch (err) {
      console.error("Error fetching market index data:", err);
    } finally {
      setIndexesLoading(false);
    }
    
    try {
      // Fetch financial news
      const newsData = await getFinancialNews();
      setNews(newsData);
    } catch (err) {
      console.error("Error fetching news data:", err);
    } finally {
      setNewsLoading(false);
      setDataRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchMarketData();
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(() => fetchMarketData(), 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const extractStockSymbol = (query: string): string | undefined => {
    // Enhanced regex to find stock symbols in the query
    // Look for ticker patterns like $AAPL or (AAPL) or just AAPL
    const symbolMatches = query.match(/\$([A-Z]{1,5})\b|\(([A-Z]{1,5})\)|\b([A-Z]{1,5})\b/g);
    
    if (!symbolMatches) return undefined;
    
    // Clean up the matches to get just the symbol
    const cleanSymbol = symbolMatches[0].replace(/[\$\(\)]/g, '');
    return cleanSymbol;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if query is empty
    if (!query.trim()) {
      toast({
        title: "Please enter a query",
        description: "Try asking about a specific stock symbol or market trend",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Extract potential stock symbol from query
      const stockSymbol = extractStockSymbol(query);
      
      // Use Gemini API for financial analysis
      try {
        toast({
          title: "Searching Financial Data",
          description: stockSymbol 
            ? `Finding real-time data for ${stockSymbol}...` 
            : "Analyzing your financial query...",
        });
        
        const response = await queryFinancialAI(query, stockSymbol);
        setResults(response.content);
        
        toast({
          title: "Financial Analysis Complete",
          description: stockSymbol 
            ? `Latest data for ${stockSymbol} retrieved` 
            : "Your financial insights are ready",
        });
      } catch (err) {
        console.error("AI service failed:", err);
        setError("Unable to retrieve current financial data. Please try again later.");
        toast({
          title: "Data Service Unavailable",
          description: "Financial data service is currently unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Query failed:", err);
      setError("Unable to process your query at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render markdown content professionally
  const renderFinancialInsights = () => {
    if (!results) return null;
    
    // Extract sections with ## headers if they exist
    const sections = results.split(/^##\s+/m).filter(Boolean);
    
    if (sections.length <= 1) {
      // If there are no clear sections, render everything as a single card
      return (
        <Card className="mb-6 border-fin-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-fin-800">Financial Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="text-foreground/80 mb-3" {...props} />,
                strong: ({node, ...props}) => <span className="font-semibold text-fin-800" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-fin-800" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-fin-700" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 text-fin-700" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-foreground/80" {...props} />,
                a: ({node, ...props}) => <a className="text-fin-600 hover:underline" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto w-full rounded-lg border border-fin-100 mb-4">
                    <Table>
                      {props.children}
                    </Table>
                  </div>
                ),
                thead: ({node, ...props}) => <TableHeader>{props.children}</TableHeader>,
                tbody: ({node, ...props}) => <TableBody>{props.children}</TableBody>,
                tr: ({node, ...props}) => <TableRow>{props.children}</TableRow>,
                th: ({node, ...props}) => <TableHead className="bg-fin-50 font-medium text-fin-800">{props.children}</TableHead>,
                td: ({node, ...props}) => <TableCell className="py-3 text-sm text-fin-800">{props.children}</TableCell>,
                code: ({node, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && (props as any).inline;
                  
                  if (isInline) {
                    return <code className="px-1 py-0.5 bg-fin-50 rounded text-fin-700 text-sm" {...props}>{children}</code>;
                  }
                  return (
                    <pre className="p-4 bg-fin-50/50 rounded-lg overflow-x-auto border border-fin-100 mb-4">
                      <code className="text-fin-800 text-sm" {...props}>{children}</code>
                    </pre>
                  );
                }
              }}
            >
              {results}
            </ReactMarkdown>
          </CardContent>
        </Card>
      );
    }
    
    // Process multiple sections
    return sections.map((section, index) => {
      let title = "Financial Analysis";
      let content = section;
      
      // If this is not the first section (which doesn't have a ## prefix since we split on it)
      if (index > 0 || sections[0].includes("\n")) {
        const sectionLines = section.split("\n");
        title = sectionLines[0].trim();
        content = sectionLines.slice(1).join("\n").trim();
      }
      
      return (
        <Card key={index} className="mb-6 border-fin-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-fin-800">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="text-foreground/80 mb-3" {...props} />,
                strong: ({node, ...props}) => <span className="font-semibold text-fin-800" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-fin-800" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-fin-700" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 text-fin-700" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-foreground/80" {...props} />,
                a: ({node, ...props}) => <a className="text-fin-600 hover:underline" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto w-full rounded-lg border border-fin-100 mb-4">
                    <Table>
                      {props.children}
                    </Table>
                  </div>
                ),
                thead: ({node, ...props}) => <TableHeader>{props.children}</TableHeader>,
                tbody: ({node, ...props}) => <TableBody>{props.children}</TableBody>,
                tr: ({node, ...props}) => <TableRow>{props.children}</TableRow>,
                th: ({node, ...props}) => <TableHead className="bg-fin-50 font-medium text-fin-800">{props.children}</TableHead>,
                td: ({node, ...props}) => <TableCell className="py-3 text-sm text-fin-800">{props.children}</TableCell>,
                code: ({node, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && (props as any).inline;
                  
                  if (isInline) {
                    return <code className="px-1 py-0.5 bg-fin-50 rounded text-fin-700 text-sm" {...props}>{children}</code>;
                  }
                  return (
                    <pre className="p-4 bg-fin-50/50 rounded-lg overflow-x-auto border border-fin-100 mb-4">
                      <code className="text-fin-800 text-sm" {...props}>{children}</code>
                    </pre>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
            
            {title.toLowerCase().includes('news') && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-fin-50 text-fin-700">Latest Updates</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <section id="demo" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1.5 border border-fin-200 rounded-full bg-fin-50/50 mb-4">
            <CircleDollarSign className="h-4 w-4 text-fin-600 mr-2" />
            <span className="text-xs font-medium text-fin-800">Expert Financial AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Financial Expert at Your Service</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Get accurate, real-time market insights, analyst recommendations, and financial news with our AI-powered analysis tool.
          </p>
        </div>

        <div className="glass rounded-xl border border-fin-100/50 overflow-hidden">
          <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-fin-100/50">
            <div className="lg:col-span-2 p-6">
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col gap-4">
                  <label htmlFor="query" className="text-sm font-medium">
                    Your Financial Question
                  </label>
                  <div className="relative">
                    <Input
                      id="query"
                      placeholder="e.g., What is the current price of NVDA stock?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-white/40 border-fin-200 pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fin-400" />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="bg-fin-600 hover:bg-fin-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Data...
                        </>
                      ) : (
                        "Get Financial Analysis"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Sample Financial Queries</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setQuery("What is the current price and analyst recommendations for NVDA?")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      What is the current price and analyst recommendations for NVDA?
                    </button>
                    <button
                      onClick={() => setQuery("Compare the current financial metrics of AAPL and MSFT")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      Compare the current financial metrics of AAPL and MSFT
                    </button>
                    <button
                      onClick={() => setQuery("What are the key technical indicators for TSLA stock today?")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      What are the key technical indicators for TSLA stock today?
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-6 bg-fin-50/30">
              <Tabs defaultValue="results" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-fin-100/50">
                    <TabsTrigger value="results" className="data-[state=active]:bg-white">
                      Analysis
                    </TabsTrigger>
                    <TabsTrigger value="stocks" className="data-[state=active]:bg-white">
                      Market Data
                    </TabsTrigger>
                    <TabsTrigger value="market" className="data-[state=active]:bg-white">
                      Financial News
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchMarketData(true)}
                    disabled={dataRefreshing}
                    className="text-xs text-fin-600"
                  >
                    {dataRefreshing ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Update Market Data
                  </Button>
                </div>
                
                <TabsContent value="results" className="mt-0">
                  {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-fin-600" />
                      <p>Retrieving real-time financial data...</p>
                      <p className="text-sm text-foreground/50 mt-2">This may take a moment</p>
                    </div>
                  ) : error ? (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <AlertCircle className="h-8 w-8 mb-4 text-red-500" />
                      <p>{error}</p>
                      <p className="text-sm text-foreground/50 mt-2">Please try a different query or try again later</p>
                    </div>
                  ) : results ? (
                    <div className="prose prose-sm md:prose-base max-w-none">
                      {renderFinancialInsights()}
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <FileText className="h-8 w-8 mb-4 text-fin-300" />
                      <p>Ask a financial question to get started</p>
                      <p className="text-sm text-foreground/50 mt-2">Get real-time stock data, market analysis, and financial insights</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="stocks" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2 text-fin-600" />
                        Trending Stocks
                      </h3>
                      <Button variant="ghost" size="sm" className="text-xs text-fin-600 hover:text-fin-800 hover:bg-fin-50">
                        View All
                      </Button>
                    </div>
                    
                    {stocksLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-fin-600" />
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {stocks.map((stock) => (
                          <StockCard key={stock.symbol} stock={stock} />
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-white rounded-lg p-4 border border-fin-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-fin-600" />
                          Market Indexes
                        </h3>
                      </div>
                      
                      {indexesLoading ? (
                        <div className="h-20 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-fin-600" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {marketIndexes.map((index, i) => (
                            <div key={index.name} className={`flex items-center justify-between py-2 ${i < marketIndexes.length - 1 ? 'border-b border-fin-50' : ''}`}>
                              <div className="font-medium text-sm">{index.name}</div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{index.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                <div className={`text-xs ${index.change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded`}>
                                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="market" className="mt-0">
                  <div className="bg-white rounded-lg p-6 border border-fin-100">
                    <h3 className="text-sm font-medium mb-4">Latest Market News</h3>
                    
                    {newsLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-fin-600" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {news.map((item, index) => (
                          <div key={index} className="border-b border-fin-50 pb-4 last:border-0 last:pb-0">
                            <h4 className="font-medium mb-1">{item.title}</h4>
                            <div className="flex items-center text-xs text-foreground/60">
                              <span>{item.source}</span>
                              <Separator orientation="vertical" className="mx-2 h-3" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueryInterface;
