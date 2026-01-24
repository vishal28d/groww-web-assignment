export type DisplayMode = 'card' | 'table' | 'chart';

export interface WidgetField {
  path: string;
  label: string;
  type: string;
  value?: unknown;
}

export interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number; // in seconds
  displayMode: DisplayMode;
  selectedFields: WidgetField[];
  data?: Record<string, unknown>;
  lastUpdated?: string;
  isLoading?: boolean;
  error?: string;
  order: number;
}

export interface APITestResult {
  success: boolean;
  data?: Record<string, unknown>;
  fields?: WidgetField[];
  error?: string;
  fieldCount?: number;
}

export interface DashboardState {
  widgets: Widget[];
  isAddModalOpen: boolean;
}
