import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useWidgetStore } from '@/store/widgetStore';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { AddWidgetCard } from '@/components/widgets/AddWidgetCard';
import { AddWidgetModal } from '@/components/modals/AddWidgetModal';
import { EmptyState } from '@/components/dashboard/EmptyState';

export function Dashboard() {
  const { widgets, isAddModalOpen, editingWidget, openAddModal, closeAddModal, reorderWidgets } = useWidgetStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(String(active.id), String(over.id));
    }
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen dashboard-bg">
      <DashboardHeader widgetCount={widgets.length} onAddWidget={openAddModal} />

      <main className="container mx-auto px-4 py-6">
        {widgets.length === 0 ? (
          <EmptyState onAddWidget={openAddModal} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedWidgets.map((w) => w.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
                <AddWidgetCard onClick={openAddModal} />
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        editingWidget={editingWidget}
      />
    </div>
  );
}
