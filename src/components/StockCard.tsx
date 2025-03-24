
import { BarChart, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    color: string;
  };
}

const StockCard = ({ stock }: StockCardProps) => {
  const isPositive = stock.change > 0;
  
  return (
    <div className="card-gradient rounded-lg p-4 border border-fin-100/80 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{stock.symbol}</div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-fin-50 border border-fin-100">
          <BarChart className="h-4 w-4 text-fin-600" />
        </div>
      </div>
      
      <div className="text-xs text-foreground/60 mb-3">
        {stock.name}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-lg font-medium">
          ${stock.price.toFixed(2)}
        </div>
        
        <div className={cn(
          "flex items-center text-xs px-2 py-1 rounded",
          isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        )}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
};

export default StockCard;
