import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Plus, Minus, Search } from 'lucide-react';
import type { Widget, DisplayMode, WidgetField, APITestResult } from '@/types/widget';
import { useWidgetStore } from '@/store/widgetStore';
import { testApiConnection } from '@/lib/apiUtils';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWidget?: Widget | null;
}

export function AddWidgetModal({ isOpen, onClose, editingWidget }: AddWidgetModalProps) {
  const { addWidget, updateWidget } = useWidgetStore();
  
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [selectedFields, setSelectedFields] = useState<WidgetField[]>([]);
  
  const [testResult, setTestResult] = useState<APITestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingWidget) {
        setName(editingWidget.name);
        setApiUrl(editingWidget.apiUrl);
        setRefreshInterval(editingWidget.refreshInterval);
        setDisplayMode(editingWidget.displayMode);
        setSelectedFields(editingWidget.selectedFields);
        // Auto-test to get fields
        handleTestApi(editingWidget.apiUrl);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingWidget]);

  const resetForm = () => {
    setName('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedFields([]);
    setTestResult(null);
    setFieldSearch('');
    setShowArraysOnly(false);
  };

  const handleTestApi = async (url?: string) => {
    const testUrl = url || apiUrl;
    if (!testUrl) return;

    setIsTesting(true);
    const result = await testApiConnection(testUrl);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleToggleField = (field: WidgetField) => {
    const isSelected = selectedFields.some((f) => f.path === field.path);
    if (isSelected) {
      setSelectedFields(selectedFields.filter((f) => f.path !== field.path));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleSubmit = () => {
    if (!name || !apiUrl || selectedFields.length === 0) return;

    const widgetData = {
      name,
      apiUrl,
      refreshInterval,
      displayMode,
      selectedFields,
    };

    if (editingWidget) {
      updateWidget(editingWidget.id, widgetData);
    } else {
      addWidget(widgetData);
    }
  };

  const filteredFields = testResult?.fields?.filter((field) => {
    const matchesSearch = field.path.toLowerCase().includes(fieldSearch.toLowerCase());
    const matchesArrayFilter = !showArraysOnly || field.type === 'array';
    return matchesSearch && matchesArrayFilter;
  }) || [];

  const isValid = name && apiUrl && testResult?.success && selectedFields.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 modal-overlay"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {editingWidget ? 'Edit Widget' : 'Add New Widget'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Widget Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Widget Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bitcoin Price Tracker"
              className="w-full px-4 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              API URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                className="flex-1 px-4 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => handleTestApi()}
                disabled={!apiUrl || isTesting}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
            
            {/* Test Result */}
            {testResult && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${
                testResult.success ? 'text-success' : 'text-destructive'
              }`}>
                {testResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>API connection successful! {testResult.fieldCount} top-level fields found.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>{testResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              min={5}
              max={3600}
              className="w-full px-4 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Fields Section - Only show if API test successful */}
          {testResult?.success && (
            <>
              {/* Display Mode */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Display Mode
                </label>
                <div className="flex gap-2">
                  {(['card', 'table', 'chart'] as DisplayMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        displayMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent'
                      }`}
                    >
                      {mode === 'card' && '📄'} {mode === 'table' && '📊'} {mode === 'chart' && '📈'}{' '}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Select Fields to Display
                </label>
                
                {/* Search & Filter */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      placeholder="Search for fields..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArraysOnly}
                    onChange={(e) => setShowArraysOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-secondary accent-primary"
                  />
                  Show arrays only (for table view)
                </label>

                {/* Available Fields */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Available Fields</p>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5">
                    {filteredFields.slice(0, 50).map((field) => {
                      const isSelected = selectedFields.some((f) => f.path === field.path);
                      return (
                        <div
                          key={field.path}
                          onClick={() => handleToggleField(field)}
                          className={`field-item ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {field.path}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {field.type} {field.value !== undefined && `| ${String(field.value).slice(0, 30)}${String(field.value).length > 30 ? '...' : ''}`}
                            </p>
                          </div>
                          <button className="p-1 text-muted-foreground hover:text-foreground">
                            {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Fields */}
                {selectedFields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Selected Fields</p>
                    <div className="space-y-1.5">
                      {selectedFields.map((field) => (
                        <div
                          key={field.path}
                          className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/30 rounded-md"
                        >
                          <span className="text-sm text-foreground">{field.label}</span>
                          <button
                            onClick={() => handleToggleField(field)}
                            className="p-1 text-destructive hover:text-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed btn-primary-glow"
          >
            {editingWidget ? 'Update Widget' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
}
