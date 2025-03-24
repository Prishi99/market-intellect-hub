
import { Separator } from "@/components/ui/separator";

interface NewsItem {
  title: string;
  source: string;
  time: string;
}

// Sample news for demonstration
const sampleNews: NewsItem[] = [
  { title: "NVIDIA Reports Record Q2 Earnings", source: "Financial Times", time: "2 hours ago" },
  { title: "Fed Signals Potential Rate Cut in September", source: "Bloomberg", time: "5 hours ago" },
  { title: "Tesla Announces New Battery Technology", source: "Reuters", time: "1 day ago" }
];

const NewsSection = () => {
  return (
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
  );
};

export default NewsSection;
