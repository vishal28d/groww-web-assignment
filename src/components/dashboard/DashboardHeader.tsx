import { BarChart3 } from 'lucide-react';

interface DashboardHeaderProps {
  widgetCount: number;
  onAddWidget: () => void;
}

export function DashboardHeader({ widgetCount, onAddWidget }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Finance Dashboard -Argo devvine</h1>
            <p className="text-xs text-muted-foreground">
              {widgetCount > 0 
                ? `${widgetCount} active widget${widgetCount > 1 ? 's' : ''} • Real-time data`
                : 'Connect to APIs and build your custom dashboard'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={onAddWidget}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 btn-primary-glow"
        >
          <span className="text-lg leading-none">+</span>
          Add Widget
        </button>
      </div>
    </header>
  );
}
