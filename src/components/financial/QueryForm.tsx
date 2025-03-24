
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryFormProps {
  onSubmit: (query: string) => Promise<void>;
  loading: boolean;
}

const QueryForm = ({ onSubmit, loading }: QueryFormProps) => {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
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
    
    await onSubmit(query);
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="mb-8">
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
              onClick={() => handleSampleQuery("Summarize analyst recommendations and share the latest news for NVDA.")}
              className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
            >
              Summarize analyst recommendations and share the latest news for NVDA.
            </button>
            <button
              onClick={() => handleSampleQuery("What are the latest analyst ratings for AAPL and how have they changed?")}
              className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
            >
              What are the latest analyst ratings for AAPL and how have they changed?
            </button>
            <button
              onClick={() => handleSampleQuery("Compare the fundamentals of MSFT and GOOGL.")}
              className="w-full text-left p-3 rounded-lg border border-fin-200 bg-white/40 hover:bg-fin-50 transition-colors text-sm"
            >
              Compare the fundamentals of MSFT and GOOGL.
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryForm;
