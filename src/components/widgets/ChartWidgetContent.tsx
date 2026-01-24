import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Widget } from '@/types/widget';
import { getNestedValue, getArrayDataFromFields } from '@/lib/apiUtils';

interface ChartWidgetContentProps {
  widget: Widget;
}

export function ChartWidgetContent({ widget }: ChartWidgetContentProps) {
  const chartData = useMemo(() => {
    if (!widget.data) return null;
    
    // Try to get array data
    const tableData = getArrayDataFromFields(widget.data, widget.selectedFields);
    
    if (tableData && tableData.rows.length > 0) {
      // Find numeric columns
      const numericColumns = tableData.headers.filter((header) => {
        const firstValue = tableData.rows[0][header];
        return typeof firstValue === 'number' || !isNaN(Number(firstValue));
      });
      
      if (numericColumns.length > 0) {
        // Use first non-numeric as label, first numeric as value
        const labelColumn = tableData.headers.find((h) => !numericColumns.includes(h)) || 'index';
        const valueColumn = numericColumns[0];
        
        return {
          data: tableData.rows.slice(0, 20).map((row, idx) => ({
            name: labelColumn === 'index' ? `Item ${idx + 1}` : String(row[labelColumn]),
            value: Number(row[valueColumn]) || 0,
          })),
          valueColumn,
        };
      }
    }

    // Fallback: use selected fields as data points
    if (widget.selectedFields.length > 0) {
      const numericFields = widget.selectedFields.filter((f) => {
        const value = getNestedValue(widget.data!, f.path);
        return typeof value === 'number' || !isNaN(Number(value));
      });
      
      if (numericFields.length > 0) {
        return {
          data: numericFields.map((f) => ({
            name: f.label,
            value: Number(getNestedValue(widget.data!, f.path)) || 0,
          })),
          valueColumn: 'Selected Fields',
        };
      }
    }

    return null;
  }, [widget.data, widget.selectedFields]);

  if (!chartData) {
    return (
      <p className="text-muted-foreground text-sm">
        No numeric data available for chart. Select fields with numeric values.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            interval="preserveStartEnd"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
