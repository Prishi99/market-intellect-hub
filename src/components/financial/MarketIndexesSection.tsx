
import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Market indexes data structure
interface MarketIndex {
  name: string;
  value: number;
  change: number;
}

const MarketIndexesSection = () => {
  const [marketIndexes, setMarketIndexes] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMarketIndexes = async () => {
      setLoading(true);
      try {
        // In a production app, you would fetch this data from a financial API
        // For demonstration, we'll use sample data
        setMarketIndexes([
          { name: "S&P 500", value: 4782.15, change: 0.68 },
          { name: "Dow Jones", value: 38563.35, change: 0.32 },
          { name: "NASDAQ", value: 15203.78, change: -0.21 }
        ]);
      } catch (err) {
        console.error("Error fetching market index data:", err);
        toast({
          title: "Error loading market data",
          description: "Could not load market indexes. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketIndexes();
  }, [toast]);

  return (
    <div className="bg-white rounded-lg p-4 border border-fin-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-fin-600" />
          Market Indexes
        </h3>
      </div>
      
      {loading ? (
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
  );
};

export default MarketIndexesSection;
