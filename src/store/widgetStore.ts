import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Widget, DisplayMode, WidgetField } from '@/types/widget';

interface WidgetStore {
  widgets: Widget[];
  isAddModalOpen: boolean;
  editingWidget: Widget | null;
  
  // Modal actions
  openAddModal: () => void;
  closeAddModal: () => void;
  setEditingWidget: (widget: Widget | null) => void;
  
  // Widget CRUD
  addWidget: (widget: Omit<Widget, 'id' | 'order'>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  
  // Widget ordering
  reorderWidgets: (activeId: string, overId: string) => void;
  
  // Data fetching
  setWidgetData: (id: string, data: Record<string, unknown>) => void;
  setWidgetLoading: (id: string, isLoading: boolean) => void;
  setWidgetError: (id: string, error: string | undefined) => void;
}

const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      isAddModalOpen: false,
      editingWidget: null,

      openAddModal: () => set({ isAddModalOpen: true }),
      closeAddModal: () => set({ isAddModalOpen: false, editingWidget: null }),
      setEditingWidget: (widget) => set({ editingWidget: widget, isAddModalOpen: true }),

      addWidget: (widgetData) => {
        const widgets = get().widgets;
        const newWidget: Widget = {
          ...widgetData,
          id: generateId(),
          order: widgets.length,
        };
        set({ widgets: [...widgets, newWidget], isAddModalOpen: false });
      },

      updateWidget: (id, updates) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
          isAddModalOpen: false,
          editingWidget: null,
        });
      },

      removeWidget: (id) => {
        const filtered = get().widgets.filter((w) => w.id !== id);
        // Re-index order
        const reordered = filtered.map((w, index) => ({ ...w, order: index }));
        set({ widgets: reordered });
      },

      reorderWidgets: (activeId, overId) => {
        const widgets = [...get().widgets];
        const activeIndex = widgets.findIndex((w) => w.id === activeId);
        const overIndex = widgets.findIndex((w) => w.id === overId);
        
        if (activeIndex === -1 || overIndex === -1) return;
        
        const [removed] = widgets.splice(activeIndex, 1);
        widgets.splice(overIndex, 0, removed);
        
        // Re-index order
        const reordered = widgets.map((w, index) => ({ ...w, order: index }));
        set({ widgets: reordered });
      },

      setWidgetData: (id, data) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id
              ? {
                  ...w,
                  data,
                  lastUpdated: new Date().toLocaleTimeString(),
                  isLoading: false,
                  error: undefined,
                }
              : w
          ),
        });
      },

      setWidgetLoading: (id, isLoading) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, isLoading } : w
          ),
        });
      },

      setWidgetError: (id, error) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, error, isLoading: false } : w
          ),
        });
      },
    }),
    {
      name: 'finboard-widgets',
      partialize: (state) => ({
        widgets: state.widgets.map((w) => ({
          ...w,
          data: undefined,
          isLoading: false,
          error: undefined,
          lastUpdated: undefined,
        })),
      }),
    }
  )
);
