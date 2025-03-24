import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, Search, BarChart2, TrendingUp, FileText, Loader2, AlertCircle } from "lucide-react";
import StockCard from "./StockCard";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryFinancialAI, fallbackToOpenAI } from "@/services/aiService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import remarkGfm from "remark-gfm";

const dummyStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 175.04, change: 2.31, changePercent: 1.33, color: "green" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 340.79, change: -1.25, changePercent: -0.37, color: "red" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 138.56, change: 0.78, changePercent: 0.57, color: "green" },
];

const sampleNews = [
  { title: "NVIDIA Reports Record Q2 Earnings", source: "Financial Times", time: "2 hours ago" },
  { title: "Fed Signals Potential Rate Cut in September", source: "Bloomberg", time: "5 hours ago" },
  { title: "Tesla Announces New Battery Technology", source: "Reuters", time: "1 day ago" }
];

const QueryInterface = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const extractStockSymbol = (query: string): string | undefined => {
    // Simple regex to find stock symbols in the query (uppercase letters surrounded by space, punctuation, or string boundaries)
    const symbolMatches = query.match(/\b[A-Z]{1,5}\b/g);
    return symbolMatches && symbolMatches.length > 0 ? symbolMatches[0] : undefined;
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
      
      // First try with Gemini API
      try {
        const geminiResponse = await queryFinancialAI(query, stockSymbol);
        setResults(geminiResponse.content);
      } catch (geminiError) {
        console.error("Gemini API failed, falling back to OpenAI:", geminiError);
        toast({
          title: "Switching to backup service",
          description: "Primary service unavailable, using alternative AI service",
          variant: "default",
        });
        
        // Fallback to OpenAI
        const openaiResponse = await fallbackToOpenAI(query, stockSymbol);
        setResults(openaiResponse.content);
      }
    } catch (err) {
      console.error("All AI services failed:", err);
      setError("Unable to process your query at this time. Please try again later.");
      toast({
        title: "Service Unavailable",
        description: "All AI services are currently unavailable. Please try again later.",
        variant: "destructive",
      });
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
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
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
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
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
            <span className="text-xs font-medium text-fin-800">Financial AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ask Anything About Stocks</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Get real-time market insights, analyst recommendations, and financial news with our AI-powered assistant.
          </p>
        </div>

        <div className="glass rounded-xl border border-fin-100/50 overflow-hidden">
          <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-fin-100/50">
            <div className="lg:col-span-2 p-6">
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col gap-4">
                  <label htmlFor="query" className="text-sm font-medium">
                    Your Question
                  </label>
                  <div className="relative">
                    <Input
                      id="query"
                      placeholder="e.g., Summarize analyst recommendations for NVDA"
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
                          Processing...
                        </>
                      ) : (
                        "Get Insights"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Sample Queries</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setQuery("Summarize analyst recommendations and share the latest news for NVDA.")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      Summarize analyst recommendations and share the latest news for NVDA.
                    </button>
                    <button
                      onClick={() => setQuery("What are the latest analyst ratings for AAPL and how have they changed?")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      What are the latest analyst ratings for AAPL and how have they changed?
                    </button>
                    <button
                      onClick={() => setQuery("Compare the fundamentals of MSFT and GOOGL.")}
                      className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
                    >
                      Compare the fundamentals of MSFT and GOOGL.
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-6 bg-fin-50/30">
              <Tabs defaultValue="results" className="w-full">
                <TabsList className="mb-6 bg-fin-100/50">
                  <TabsTrigger value="results" className="data-[state=active]:bg-white">
                    Results
                  </TabsTrigger>
                  <TabsTrigger value="stocks" className="data-[state=active]:bg-white">
                    Stocks
                  </TabsTrigger>
                  <TabsTrigger value="market" className="data-[state=active]:bg-white">
                    Market News
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="results" className="mt-0">
                  {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-fin-600" />
                      <p>Analyzing financial data...</p>
                      <p className="text-sm text-foreground/50 mt-2">This may take a moment</p>
                    </div>
                  ) : error ? (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <AlertCircle className="h-8 w-8 mb-4 text-red-500" />
                      <p>{error}</p>
                      <p className="text-sm text-foreground/50 mt-2">Please try again later</p>
                    </div>
                  ) : results ? (
                    <div className="prose prose-sm md:prose-base max-w-none">
                      {renderFinancialInsights()}
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
                      <FileText className="h-8 w-8 mb-4 text-fin-300" />
                      <p>Your query results will appear here</p>
                      <p className="text-sm text-foreground/50 mt-2">Try one of the sample queries</p>
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
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {dummyStocks.map((stock) => (
                        <StockCard key={stock.symbol} stock={stock} />
                      ))}
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-fin-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-fin-600" />
                          Market Indexes
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-fin-50">
                          <div className="font-medium text-sm">S&P 500</div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">4,782.15</div>
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">+0.68%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-fin-50">
                          <div className="font-medium text-sm">Dow Jones</div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">38,563.35</div>
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">+0.32%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="font-medium text-sm">NASDAQ</div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">15,203.78</div>
                            <div className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">-0.21%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="market" className="mt-0">
                  <div className="bg-white rounded-lg p-6 border border-fin-100">
                    <h3 className="text-sm font-medium mb-4">Latest Market News</h3>
                    <div className="space-y-4">
                      {sampleNews.map((item, index) => (
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
