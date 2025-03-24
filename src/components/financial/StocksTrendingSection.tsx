
import { useState, useEffect } from "react";
import { Loader2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StockCard from "../StockCard";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  color: string;
}

const StocksTrendingSection = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const { toast } = useToast();

  // Fetch trending stocks data
  useEffect(() => {
    const fetchTrendingStocks = async () => {
      setStocksLoading(true);
      try {
        // For demonstration, we'll use a mix of popular tech stocks
        // In a production app, you would fetch this data from a financial API
        const trending = [
          { symbol: "AAPL", name: "Apple Inc." },
          { symbol: "MSFT", name: "Microsoft Corp." },
          { symbol: "GOOGL", name: "Alphabet Inc." },
          { symbol: "AMZN", name: "Amazon.com Inc." },
          { symbol: "NVDA", name: "NVIDIA Corp." },
          { symbol: "TSLA", name: "Tesla Inc." }
        ];
        
        // Generate semi-realistic stock data
        const stocksWithData = trending.map(stock => {
          // Generate random but realistic price, change values
          const basePrice = stock.symbol === "AAPL" ? 175.04 : 
                           stock.symbol === "MSFT" ? 340.79 : 
                           stock.symbol === "GOOGL" ? 138.56 :
                           stock.symbol === "AMZN" ? 128.85 :
                           stock.symbol === "NVDA" ? 925.75 :
                           stock.symbol === "TSLA" ? 175.43 : 100;
          
          const change = (Math.random() * 6) - 3; // Random between -3 and +3
          const changePercent = (change / basePrice) * 100;
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: basePrice,
            change,
            changePercent,
            color: change > 0 ? "green" : "red"
          };
        });
        
        setStocks(stocksWithData);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        toast({
          title: "Error loading stock data",
          description: "Could not load trending stocks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setStocksLoading(false);
      }
    };
    
    fetchTrendingStocks();
  }, [toast]);

  return (
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
    </div>
  );
};

export default StocksTrendingSection;
