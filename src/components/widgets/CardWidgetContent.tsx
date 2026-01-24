import type { Widget } from '@/types/widget';
import { getNestedValue, formatValue } from '@/lib/apiUtils';

interface CardWidgetContentProps {
  widget: Widget;
}

export function CardWidgetContent({ widget }: CardWidgetContentProps) {
  if (!widget.data || widget.selectedFields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No fields selected</p>
    );
  }

  return (
    <div className="space-y-3">
      {widget.selectedFields.map((field) => {
        const value = getNestedValue(widget.data!, field.path);
        const displayValue = formatValue(value);
        
        return (
          <div key={field.path} className="flex flex-col">
            <span className="text-xs text-muted-foreground">{field.label}</span>
            <span className="text-sm font-medium text-foreground break-all">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
