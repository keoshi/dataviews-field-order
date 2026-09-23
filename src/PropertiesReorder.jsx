import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@wordpress/components';
import { dragHandle } from '@wordpress/icons';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * The proposed change, and nothing else.
 *
 * DataViews' own Appearance panel is the one that opens — Sort by, Order,
 * Density, Items per page, Properties, all of it stock. This adds one thing to
 * it: a drag handle on each row of the Properties list.
 *
 * Which is why it works on the panel's DOM rather than rendering a panel. The
 * rows belong to DataViews; what happens here is that each one is handed to
 * dnd-kit as a sortable node and given a handle through a portal. A reader
 * comparing the two modes sees the same panel either way, with handles or
 * without.
 *
 * That it has to be done this way is part of the argument: there is no slot in
 * the Properties list for a consumer to put anything in.
 */

const GROUP = '.dataviews-view-config__properties .components-item-group';
const LABEL = '.dataviews-view-config__label';

export default function PropertiesReorder({ enabled, fields, lockedId, onReorder }) {
  const [rows, setRows] = useState([]);

  // The panel lists fields by label, so that is what identifies a row.
  const ids = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.label, field.id])),
    [fields]
  );

  const scan = useCallback(() => {
    const group = document.querySelector(GROUP);
    const found = group
      ? [...group.children]
          .map((element) => {
            const label = element.querySelector(LABEL)?.textContent ?? '';
            return { id: ids[label], label, element };
          })
          .filter((row) => row.id)
      : [];

    // Same rows, same order, same elements: leave the state alone, or every
    // mutation this component causes would start another render.
    setRows((current) =>
      current.length === found.length &&
      current.every((row, index) => row.id === found[index].id && row.element === found[index].element)
        ? current
        : found
    );
  }, [ids]);

  /*
   * The panel is a popover: it does not exist until the cog is pressed, and
   * DataViews rebuilds the list whenever a property is ticked. So the rows are
   * watched for rather than found once.
   */
  useEffect(() => {
    if (!enabled) {
      setRows([]);
      return undefined;
    }
    scan();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled, scan]);

  // A short distance before a drag starts, so the handle can still be clicked
  // and focused without the press being read as the beginning of a gesture.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const order = rows.map((row) => row.id);

  const reorder = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id);
    const to = order.indexOf(over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(order, from, to));
  };

  if (!enabled || rows.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {rows.map((row) => (
          <SortableRow key={row.id} {...row} locked={row.id === lockedId} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

/**
 * One of DataViews' rows, made draggable where it stands.
 *
 * The handle goes in the row's wrapper rather than inside the row, because the
 * row is a `<button>` that toggles the column and a button cannot hold another
 * one. It is a real button itself, so a row can be picked up and placed from
 * the keyboard as well as the pointer.
 *
 * A row is draggable whether its column is shown or not. Its place is a
 * property of the column rather than of the table's current contents, which is
 * the whole of what lets a hidden column come back where it was.
 *
 * The primary column is listed and fixed: DataViews renders it first whatever
 * the view says, so a handle on it would offer a move the table will not make.
 */
function SortableRow({ id, label, element, locked }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: locked });

  useLayoutEffect(() => {
    setNodeRef(element);
    return () => setNodeRef(null);
  }, [element, setNodeRef]);

  // The row is DataViews', so the drag is expressed on its node directly.
  useLayoutEffect(() => {
    element.style.position = 'relative';
    element.style.transform = CSS.Translate.toString(transform) ?? '';
    element.style.transition = transition ?? '';
    element.style.zIndex = isDragging ? '1' : '';
    element.classList.toggle('is-dragging', isDragging);
  });

  // Whatever happens to this component, the row is left as DataViews drew it.
  useLayoutEffect(
    () => () => {
      element.style.position = '';
      element.style.transform = '';
      element.style.transition = '';
      element.style.zIndex = '';
      element.classList.remove('is-dragging');
    },
    [element]
  );

  if (locked) return null;

  return createPortal(
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="properties-reorder__handle"
      aria-label={`Reorder ${label}`}
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <Icon icon={dragHandle} size={20} />
    </button>,
    element
  );
}
