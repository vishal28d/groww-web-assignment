import { useEffect, useRef, useCallback } from 'react';
import { useWidgetStore } from '@/store/widgetStore';
import { fetchWidgetData } from '@/lib/apiUtils';

export function useWidgetDataFetcher(widgetId: string, apiUrl: string, refreshInterval: number) {
  const { setWidgetData, setWidgetLoading, setWidgetError } = useWidgetStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setWidgetLoading(widgetId, true);
    
    try {
      const data = await fetchWidgetData(apiUrl);
      if (isMountedRef.current) {
        setWidgetData(widgetId, data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to fetch data';
        setWidgetError(widgetId, message);
      }
    }
  }, [widgetId, apiUrl, setWidgetData, setWidgetLoading, setWidgetError]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchData();

    // Set up interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval * 1000);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval]);

  return { refetch: fetchData };
}
