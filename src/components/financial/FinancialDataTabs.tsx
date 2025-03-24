
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StocksTrendingSection from "./StocksTrendingSection";
import MarketIndexesSection from "./MarketIndexesSection";
import NewsSection from "./NewsSection";
import ResultsDisplay from "./ResultsDisplay";

interface FinancialDataTabsProps {
  loading: boolean;
  error: string | null;
  results: string;
}

const FinancialDataTabs = ({ loading, error, results }: FinancialDataTabsProps) => {
  return (
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
        <ResultsDisplay loading={loading} error={error} results={results} />
      </TabsContent>
      
      <TabsContent value="stocks" className="mt-0">
        <div className="space-y-4">
          <StocksTrendingSection />
          <MarketIndexesSection />
        </div>
      </TabsContent>
      
      <TabsContent value="market" className="mt-0">
        <NewsSection />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialDataTabs;
