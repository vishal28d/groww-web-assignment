import { Plus } from 'lucide-react';

interface AddWidgetCardProps {
  onClick: () => void;
}

export function AddWidgetCard({ onClick }: AddWidgetCardProps) {
  return (
    <button
      onClick={onClick}
      className="add-widget-card min-h-[200px] w-full"
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-foreground font-medium mb-1">Add Widget</h3>
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Connect to a finance API and create a custom widget
      </p>
    </button>
  );
}
