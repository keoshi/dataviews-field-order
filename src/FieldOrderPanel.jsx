import { useEffect, useRef, useState } from 'react';
import { BaseControl, Button, Icon, Popover } from '@wordpress/components';
import { check, dragHandle } from '@wordpress/icons';
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
 * The proposal, as a control: one list that both shows and arranges the
 * columns.
 *
 * DataViews can already do everything this does. Its column header menu moves a
 * column a step at a time and can insert a hidden one at a chosen position, so
 * `view.fields` is orderable and the table renders it in order. What is missing
 * is a place to *see* that order and a gesture to change it in one move.
 *
 * Three things this does that the Properties panel does not:
 *
 * **It lists the columns in the table's order.** The Properties panel lists
 * them in the order the consumer declared its fields, which is only the table's
 * order until somebody reorders something. After that, the one screen that
 * looks like "arrange your columns" is a picture of a table that no longer
 * exists.
 *
 * **It reorders by dragging.** Moving a column five places is five trips
 * through a menu, and each trip re-renders the table under the pointer. The
 * gesture people arrive expecting is the one every other list of this shape
 * uses.
 *
 * **A hidden column keeps its place.** In the Properties panel, ticking a
 * column back on appends it to the end — so unticking Status to look at
 * something, then putting it back, has quietly rearranged the table. Here a
 * column's position and its visibility are separate facts: hiding takes it off
 * the table and leaves the row where it is, and showing it puts it back where
 * it belongs.
 *
 * That last one is the part that needs DataViews to hold something it does not
 * hold today — the position of a column that is not currently shown. Everything
 * else is a rearrangement of what is already there.
 */
export default function FieldOrderPanel({ fields, order, hidden, onChange }) {
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);

  // A press anywhere else puts the panel away. `onFocusOutside` alone is not
  // this: most of a page is not focusable, so clicking the table left the panel
  // standing open over the columns it had just changed.
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
    const next = hidden.includes(id) ? hidden.filter((entry) => entry !== id) : [...hidden, id];
    // Never all of them: a table with no columns is not a state anybody chose.
    if (next.length === order.length) return;
    onChange({ order, hidden: next });
  };

  return (
    <>
      <Button
        ref={setAnchor}
        variant="tertiary"
        size="compact"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        Columns
      </Button>

      {open && (
        <Popover
          anchor={anchor}
          placement="bottom-end"
          offset={4}
          focusOnMount={false}
          resize={false}
          onClose={() => setOpen(false)}
        >
          <div className="field-order" ref={panel}>
            <BaseControl.VisualLabel id="field-order-label">Columns</BaseControl.VisualLabel>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
              <SortableContext items={order} strategy={verticalListSortingStrategy}>
                <ul className="field-order__list" aria-labelledby="field-order-label">
                  {rows.map((field) => (
                    <FieldRow
                      key={field.id}
                      field={field}
                      on={!hidden.includes(field.id)}
                      /*
                       * The primary column is in the list and cannot be
                       * touched. DataViews renders it first, always, and keeps
                       * it out of `view.fields` — so it is neither hideable nor
                       * movable, and a panel that let you try would be offering
                       * a move the table will not make.
                       *
                       * It is still listed, because a list of columns that
                       * silently omits the first one is not a picture of the
                       * table either.
                       */
                      locked={
                        field.locked ||
                        (hidden.length === order.length - 1 && !hidden.includes(field.id))
                      }
                      onToggle={() => toggle(field.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </Popover>
      )}
    </>
  );
}

/**
 * One column in the panel: where it sits, and whether it is on.
 *
 * The handle is a real button rather than a decorative grip, so a row can be
 * picked up and placed from the keyboard as well as the pointer — dnd-kit's
 * keyboard sensor needs something focusable to attach to.
 *
 * A row is draggable whether it is ticked or not, which is the whole point: a
 * column's place is a property of the column, not of the table's current
 * contents.
 */
function FieldRow({ field, on, locked, onToggle }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id, disabled: field.locked });

  return (
    <li
      ref={setNodeRef}
      className={`field-order__row${isDragging ? ' is-dragging' : ''}${on ? '' : ' is-off'}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      role="checkbox"
      aria-checked={on}
      aria-disabled={locked || undefined}
      tabIndex={0}
      onClick={locked ? undefined : onToggle}
      onKeyDown={(event) => {
        if (locked) return;
        if (event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="field-order__check" aria-hidden="true">
        {on && <Icon icon={check} />}
      </span>
      <span className="field-order__name">{field.label}</span>
      {field.locked ? (
        <span className="field-order__fixed">Always first</span>
      ) : (
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="field-order__handle"
          aria-label={`Reorder ${field.label}`}
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <Icon icon={dragHandle} size={20} />
        </button>
      )}
    </li>
  );
}
