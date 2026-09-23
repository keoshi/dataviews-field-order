import { useEffect, useRef, useState } from 'react';
import {
  BaseControl,
  Button,
  Icon,
  Popover,
  __experimentalItem as Item,
} from '@wordpress/components';
import { check, cog, dragHandle } from '@wordpress/icons';
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
 * DataViews' Properties panel, with the proposed change in it.
 *
 * This is not a second control beside the cog — it *is* the cog. The stock
 * button is hidden and this one takes its place in the same toolbar, so what a
 * reader compares is one panel with the change on and the same panel with it
 * off.
 *
 * The rows are `Item` from `@wordpress/components`, which is what DataViews
 * builds this list from, so the padding, the hover and the 24px tick slot are
 * theirs rather than an approximation. What is ours is the frame around them:
 * `ItemGroup` wraps each child in a second div, and a sortable transform on the
 * inner one tears the row away from the frame mid-drag.
 *
 * With `reorderable` off this behaves exactly as DataViews does today: no
 * handles, and a column ticked back on goes to the end of the table.
 */
export default function PropertiesPanel({ fields, order, hidden, reorderable, onChange }) {
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);

  // A press anywhere else puts the panel away. Listening for the press rather
  // than the click, and skipping the cog, which is already a toggle.
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event) => {
      if (panel.current?.contains(event.target)) return;
      if (anchor?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, [open, anchor]);

  const byId = Object.fromEntries(fields.map((field) => [field.id, field]));
  const rows = order.map((id) => byId[id]).filter(Boolean);

  // A short distance before a drag starts, so the handle can still be clicked
  // and focused without the press being read as the beginning of a gesture.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorder = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id);
    const to = order.indexOf(over.id);
    if (from < 0 || to < 0) return;
    onChange({ order: arrayMove(order, from, to), hidden });
  };

  const toggle = (id) => {
    const isHidden = hidden.includes(id);
    if (!isHidden && hidden.length === order.length - 1) return;

    if (reorderable) {
      // The place is kept: hiding takes the column off the table and leaves the
      // row where it is.
      onChange({
        order,
        hidden: isHidden ? hidden.filter((entry) => entry !== id) : [...hidden, id],
      });
      return;
    }

    // Today: a column ticked back on is appended, because `view.fields` holds
    // only what is visible and the place it had is not written down anywhere.
    onChange({
      order: isHidden ? [...order.filter((entry) => entry !== id), id] : order,
      hidden: isHidden ? hidden.filter((entry) => entry !== id) : [...hidden, id],
    });
  };

  const list = (
    <div className="properties__list">
      {rows.map((field) => (
        <PropertyRow
          key={field.id}
          field={field}
          on={!hidden.includes(field.id)}
          locked={field.locked || (hidden.length === order.length - 1 && !hidden.includes(field.id))}
          reorderable={reorderable}
          onToggle={() => toggle(field.id)}
        />
      ))}
    </div>
  );

  return (
    <>
      <Button
        ref={setAnchor}
        className="properties__cog"
        size="compact"
        icon={cog}
        label="View options"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      />

      {open && (
        <Popover
          anchor={anchor}
          placement="bottom-end"
          offset={8}
          focusOnMount={false}
          resize={false}
          onClose={() => setOpen(false)}
        >
          <div className="properties" ref={panel}>
            <BaseControl.VisualLabel>Properties</BaseControl.VisualLabel>
            {reorderable ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  {list}
                </SortableContext>
              </DndContext>
            ) : (
              list
            )}
          </div>
        </Popover>
      )}
    </>
  );
}

/**
 * One property: the tick, the name, and — when the change is on — the handle
 * that moves it.
 *
 * The handle is a real button rather than a decorative grip, so a row can be
 * picked up and placed from the keyboard as well as the pointer; dnd-kit's
 * keyboard sensor needs something focusable to attach to.
 *
 * A row is draggable whether it is ticked or not. Its place is a property of
 * the column rather than of the table's current contents, which is the whole of
 * what makes a hidden column able to come back where it was.
 *
 * The primary column is listed and fixed. DataViews renders it first whatever
 * the view says, so a handle on it would offer a move the table will not make.
 */
function PropertyRow({ field, on, locked, reorderable, onToggle }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id, disabled: !reorderable || field.locked });

  return (
    <div
      ref={setNodeRef}
      className={`properties__row${isDragging ? ' is-dragging' : ''}`}
      style={reorderable ? { transform: CSS.Translate.toString(transform), transition } : undefined}
    >
      <Item size="medium" onClick={locked ? undefined : onToggle}>
        <div className="properties__cell">
          <div className="properties__check">{on && <Icon icon={check} size={24} />}</div>
          <span className="dataviews-view-config__label">{field.label}</span>
        </div>
      </Item>

      {reorderable && !field.locked && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="properties__handle"
          aria-label={`Reorder ${field.label}`}
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <Icon icon={dragHandle} size={20} />
        </button>
      )}
    </div>
  );
}
