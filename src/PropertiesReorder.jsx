import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
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

// The same amount of movement the rows make during the drag, so the drop is
// the end of that motion rather than a second, different one.
const SETTLE_MS = 160;
const SETTLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

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
   *
   * Text included. Reordering the list does not move React's nodes around — it
   * leaves them where they are and writes different labels into them, which is
   * a change to a text node and nothing else. Miss it and a handle goes on
   * dragging the row it used to belong to.
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
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
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

  /** The drag, taken off the rows, leaving them where DataViews put them. */
  const settle = () => {
    for (const { element } of rows) {
      element.style.transform = '';
      element.style.transition = '';
      element.style.zIndex = '';
    }
  };

  /*
   * At the moment of the drop the panel already shows the answer: the row is
   * held over a gap exactly its size, in exactly its new place. So the drop
   * moves nothing. Clear the drag off the rows and commit the new order in the
   * same frame, and the row simply is where it was let go.
   *
   * Both halves have to land together. Commit first and the rows move in the
   * DOM still carrying the offsets that held them — every one a frame out of
   * place, and each then sailing in from wherever it had been.
   *
   * The one thing that does move is a row caught part-way through opening the
   * gap, a few pixels short when the drag ends. Those are carried the rest of
   * the way rather than snapped: measured before the commit, and animated from
   * where they were to where they now are. Through the animation API rather
   * than the style attribute, because the rows are DataViews' and it rewrites
   * their styles whenever it rerenders the list.
   */
  const reorder = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id);
    const to = order.indexOf(over.id);
    if (from < 0 || to < 0) return;

    const held = rows.map(({ element }) => [element, element.getBoundingClientRect().top]);

    settle();
    flushSync(() => onReorder(arrayMove(order, from, to)));

    for (const [element, top] of held) {
      const distance = top - element.getBoundingClientRect().top;
      if (Math.abs(distance) < 1) continue;
      element.animate(
        [{ transform: `translate3d(0, ${distance}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: SETTLE_MS, easing: SETTLE_EASING }
      );
    }

    scan();
  };

  if (!enabled || rows.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={reorder}
      onDragCancel={settle}
    >
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
    isSorting,
  } = useSortable({
    id,
    disabled: locked,
    /*
     * The rows move under their own steam during the drag and are in their
     * final places the moment it ends, so there is no layout change left for
     * dnd-kit to animate. Left on, it animates one anyway — from the position
     * each row held before the list changed, which is the row sailing in from
     * off the top of the panel.
     */
    animateLayoutChanges: () => false,
    // The gap opens at the same speed and on the same curve the drop settles
    // at, so the whole gesture is one movement.
    transition: { duration: SETTLE_MS, easing: SETTLE_EASING },
  });

  useLayoutEffect(() => {
    setNodeRef(element);
    return () => setNodeRef(null);
  }, [element, setNodeRef]);

  // The row is DataViews', so the drag is expressed on its node directly.
  useLayoutEffect(() => {
    const offset = transform?.x || transform?.y ? CSS.Translate.toString(transform) : '';
    element.style.position = 'relative';
    element.style.transform = offset;
    /*
     * The held row answers the pointer directly, so a transition on it is lag.
     * The others keep theirs for as long as a drag is going on — a row can be
     * sent back to where it started mid-gesture, and that is a movement too.
     * Once nothing is being dragged the rows are left bare.
     */
    element.style.transition = isDragging || (!isSorting && !offset) ? '' : transition ?? '';
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
