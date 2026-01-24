import type { WidgetField, APITestResult } from '@/types/widget';

// Flatten nested object to get all field paths
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  maxDepth = 5,
  currentDepth = 0
): WidgetField[] {
  const fields: WidgetField[] = [];

  if (currentDepth >= maxDepth) return fields;

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const type = Array.isArray(value)
      ? 'array'
      : typeof value === 'object' && value !== null
      ? 'object'
      : typeof value;

    if (type === 'array') {
      fields.push({
        path,
        label: key,
        type: 'array',
        value: value,
      });
      // If array has objects, flatten first item
      const arr = value as unknown[];
      if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
        const nestedFields = flattenObject(
          arr[0] as Record<string, unknown>,
          `${path}[0]`,
          maxDepth,
          currentDepth + 1
        );
        fields.push(...nestedFields);
      }
    } else if (type === 'object') {
      fields.push({
        path,
        label: key,
        type: 'object',
        value: value,
      });
      const nestedFields = flattenObject(
        value as Record<string, unknown>,
        path,
        maxDepth,
        currentDepth + 1
      );
      fields.push(...nestedFields);
    } else {
      fields.push({
        path,
        label: key,
        type,
        value: String(value),
      });
    }
  }

  return fields;
}

// Get nested value from object using dot notation path
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

// Test API connection and return fields
export async function testApiConnection(url: string): Promise<APITestResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const fields = flattenObject(data);
    const topLevelCount = Object.keys(data).length;

    return {
      success: true,
      data,
      fields,
      fieldCount: topLevelCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for CORS errors
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return {
        success: false,
        error: 'CORS error or network issue. Try using a proxy or check if the API allows cross-origin requests.',
      };
    }

    return {
      success: false,
      error: message,
    };
  }
}

// Fetch widget data
export async function fetchWidgetData(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Format value for display
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    // Check if it looks like a currency value
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Get array data from fields for table display
export function getArrayDataFromFields(
  data: Record<string, unknown>,
  fields: WidgetField[]
): { headers: string[]; rows: Record<string, unknown>[] } | null {
  // Find array fields
  for (const field of fields) {
    if (field.type === 'array') {
      const arrayData = getNestedValue(data, field.path);
      if (Array.isArray(arrayData) && arrayData.length > 0) {
        const firstItem = arrayData[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          const headers = Object.keys(firstItem as Record<string, unknown>);
          return {
            headers,
            rows: arrayData as Record<string, unknown>[],
          };
        }
      }
    }
  }
  return null;
}
