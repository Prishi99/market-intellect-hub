import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, Search, BarChart2, TrendingUp, FileText, Loader2 } from "lucide-react";
import StockCard from "./StockCard";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const sampleResponses = {
  "NVDA": `
## Analyst Recommendations for NVIDIA Corp (NVDA)

| Recommendation | Count | Percentage |
|---------------|-------|------------|
| Strong Buy    | 35    | 76.1%      |
| Buy           | 8     | 17.4%      |
| Hold          | 3     | 6.5%       |
| Sell          | 0     | 0%         |
| Strong Sell   | 0     | 0%         |

**Latest News:**
1. NVIDIA reports record quarterly revenue of $26.0 billion, up 122% from a year ago
2. Jensen Huang announces next-generation Blackwell architecture at GTC 2024
3. NVIDIA partners with ServiceNow to accelerate enterprise AI adoption
4. Company announces 10-for-1 stock split effective June 2024
`,
  "AAPL": `
## Analyst Recommendations for Apple Inc (AAPL)

| Recommendation | Count | Percentage |
|---------------|-------|------------|
| Strong Buy    | 24    | 54.5%      |
| Buy           | 12    | 27.3%      |
| Hold          | 7     | 15.9%      |
| Sell          | 1     | 2.3%       |
| Strong Sell   | 0     | 0%         |

**Latest News:**
1. Apple unveils new iPad Pro with M4 chip and OLED display
2. Company reports Q2 revenue of $90.8 billion, slightly below analyst expectations
3. Apple announces expansion of retail presence in emerging markets
4. New Mac models expected to be announced at WWDC in June
`,
  "MSFT": `
## Analyst Recommendations for Microsoft Corp (MSFT)

| Recommendation | Count | Percentage |
|---------------|-------|------------|
| Strong Buy    | 29    | 65.9%      |
| Buy           | 10    | 22.7%      |
| Hold          | 5     | 11.4%      |
| Sell          | 0     | 0%         |
| Strong Sell   | 0     | 0%         |

**Latest News:**
1. Microsoft Fabric AI-powered data analytics platform now generally available
2. Company reports 17% year-over-year revenue growth in latest quarter
3. Microsoft expands Azure AI capabilities with new enterprise solutions
4. Surface Laptop 7 and Surface Pro 11 announced with Qualcomm Snapdragon X processors
`
};

const QueryInterface = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API call with a delay
    setTimeout(() => {
      // Check if query contains any stock symbols we have sample data for
      const queryUpper = query.toUpperCase();
      
      if (queryUpper.includes("NVDA")) {
        setResults(sampleResponses.NVDA);
      } else if (queryUpper.includes("AAPL")) {
        setResults(sampleResponses.AAPL);
      } else if (queryUpper.includes("MSFT")) {
        setResults(sampleResponses.MSFT);
      } else {
        // Generic response for other queries
        setResults(`
# Market Analysis

I've analyzed your query: "${query}"

This appears to be about general market conditions or a symbol we don't have specific sample data for.

For specific stock analysis, try queries like:
- "Analyze NVDA stock performance"
- "What are analyst recommendations for AAPL?"
- "Latest news about MSFT"

For real-time market data and comprehensive analysis, our full version connects to live financial APIs and web search capabilities.
        `);
      }
      
      setLoading(false);
    }, 2000);
  };

  // Helper function to render tables from markdown
  const renderTable = (markdown) => {
    if (!markdown.includes('|')) return null;
    
    const tableLines = markdown.split('\n').filter(line => line.includes('|'));
    if (tableLines.length < 2) return null;
    
    const headers = tableLines[0].split('|').filter(col => col.trim()).map(col => col.trim());
    const rows = tableLines.slice(2).map(line => 
      line.split('|').filter(col => col.trim()).map(col => col.trim())
    );
    
    return (
      <div className="overflow-x-auto w-full rounded-lg border border-fin-100 mb-4">
        <table className="w-full min-w-full divide-y divide-fin-100">
          <thead className="bg-fin-50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-fin-800 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-fin-100">
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-fin-50/30'}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-fin-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper function to extract sections from results
  const renderFinancialInsights = () => {
    if (!results) return null;
    
    // Extract sections like "Analyst Recommendations" and "Latest News"
    const sections = results.split('##').filter(Boolean);
    
    if (sections.length <= 1) {
      // If there are no clear sections, render everything as a single card
      return (
        <Card className="mb-6 border-fin-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-fin-800">Financial Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown components={{
              p: ({node, ...props}) => <p className="text-foreground/80 mb-3" {...props} />,
              strong: ({node, ...props}) => <span className="font-semibold text-fin-800" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-fin-800" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-fin-700" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 text-fin-700" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-foreground/80" {...props} />,
              a: ({node, ...props}) => <a className="text-fin-600 hover:underline" {...props} />,
              table: ({node, ...props}) => renderTable(results) || <div>No table data available</div>
            }}>
              {results}
            </ReactMarkdown>
          </CardContent>
        </Card>
      );
    }
    
    // Process multiple sections
    return sections.map((section, index) => {
      const sectionLines = section.trim().split('\n');
      const title = sectionLines[0].trim();
      const content = sectionLines.slice(1).join('\n').trim();
      
      // Special rendering for tables
      const hasTable = content.includes('|');
      
      return (
        <Card key={index} className="mb-6 border-fin-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-fin-800">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTable && renderTable(content)}
            
            {!hasTable && (
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p className="text-foreground/80 mb-3" {...props} />,
                strong: ({node, ...props}) => <span className="font-semibold text-fin-800" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-foreground/80" {...props} />,
                a: ({node, ...props}) => <a className="text-fin-600 hover:underline" {...props} />
              }}>
                {content}
              </ReactMarkdown>
            )}
            
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
