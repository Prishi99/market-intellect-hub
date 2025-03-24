
import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import QueryForm from "./financial/QueryForm";
import FinancialDataTabs from "./financial/FinancialDataTabs";
import { queryFinancialAI, fallbackToOpenAI } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";

const QueryInterface = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const extractStockSymbol = (query: string): string | undefined => {
    // Simple regex to find stock symbols in the query (uppercase letters surrounded by space, punctuation, or string boundaries)
    const symbolMatches = query.match(/\b[A-Z]{1,5}\b/g);
    return symbolMatches && symbolMatches.length > 0 ? symbolMatches[0] : undefined;
  };

  const handleSubmit = async (query: string) => {
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
              <QueryForm onSubmit={handleSubmit} loading={loading} />
            </div>

            <div className="lg:col-span-3 p-6 bg-fin-50/30">
              <FinancialDataTabs loading={loading} error={error} results={results} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueryInterface;
