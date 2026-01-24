import { RefreshCw, Settings, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Widget } from '@/types/widget';
import { useWidgetStore } from '@/store/widgetStore';
import { useWidgetDataFetcher } from '@/hooks/useWidgetDataFetcher';
import { CardWidgetContent } from './CardWidgetContent';
import { TableWidgetContent } from './TableWidgetContent';
import { ChartWidgetContent } from './ChartWidgetContent';

interface WidgetCardProps {
  widget: Widget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const { removeWidget, setEditingWidget } = useWidgetStore();
  const { refetch } = useWidgetDataFetcher(widget.id, widget.apiUrl, widget.refreshInterval);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderContent = () => {
    if (widget.isLoading && !widget.data) {
      return (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="py-4 px-2 text-center">
          <p className="text-destructive text-sm">{widget.error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!widget.data) return null;

    switch (widget.displayMode) {
      case 'table':
        return <TableWidgetContent widget={widget} />;
      case 'chart':
        return <ChartWidgetContent widget={widget} />;
      case 'card':
      default:
        return <CardWidgetContent widget={widget} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="widget-card widget-card-hover animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h3 className="font-medium text-foreground">{widget.name}</h3>
          <span className="px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground capitalize">
            {widget.displayMode}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={refetch}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${widget.isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setEditingWidget(widget)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            title="Remove widget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Footer */}
      {widget.lastUpdated && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last updated: {widget.lastUpdated}
          </p>
        </div>
      )}
    </div>
  );
}
