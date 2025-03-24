
import { Loader2, FileText, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import remarkGfm from "remark-gfm";

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: string;
}

const ResultsDisplay = ({ loading, error, results }: ResultsDisplayProps) => {
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

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-fin-600" />
        <p>Analyzing financial data...</p>
        <p className="text-sm text-foreground/50 mt-2">This may take a moment</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
        <AlertCircle className="h-8 w-8 mb-4 text-red-500" />
        <p>{error}</p>
        <p className="text-sm text-foreground/50 mt-2">Please try again later</p>
      </div>
    );
  }
  
  if (results) {
    return (
      <div className="prose prose-sm md:prose-base max-w-none">
        {renderFinancialInsights()}
      </div>
    );
  }
  
  return (
    <div className="h-96 flex flex-col items-center justify-center text-foreground/60">
      <FileText className="h-8 w-8 mb-4 text-fin-300" />
      <p>Your query results will appear here</p>
      <p className="text-sm text-foreground/50 mt-2">Try one of the sample queries</p>
    </div>
  );
};

export default ResultsDisplay;
