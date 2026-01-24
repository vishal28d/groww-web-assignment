import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import type { Widget } from '@/types/widget';
import { getNestedValue, formatValue, getArrayDataFromFields } from '@/lib/apiUtils';

interface TableWidgetContentProps {
  widget: Widget;
}

export function TableWidgetContent({ widget }: TableWidgetContentProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const tableData = useMemo(() => {
    if (!widget.data) return null;
    return getArrayDataFromFields(widget.data, widget.selectedFields);
  }, [widget.data, widget.selectedFields]);

  const filteredRows = useMemo(() => {
    if (!tableData) return [];
    
    let rows = [...tableData.rows];
    
    // Search filter
    if (search) {
      rows = rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    
    // Sort
    if (sortKey) {
      rows.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    
    return rows;
  }, [tableData, search, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (!tableData) {
    return (
      <p className="text-muted-foreground text-sm">
        No array data found. Select an array field for table display.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar rounded-md border border-border">
        <table className="finance-table">
          <thead>
            <tr className="bg-secondary/50">
              {tableData.headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortKey === header && (
                      sortDir === 'asc' 
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.slice(0, 10).map((row, idx) => (
              <tr key={idx}>
                {tableData.headers.map((header) => (
                  <td key={header} className="text-foreground">
                    {formatValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <p className="text-xs text-muted-foreground text-right">
        {filteredRows.length} of {tableData.rows.length} items
      </p>
    </div>
  );
}
