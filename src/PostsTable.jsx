import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import PropertiesPanel from './PropertiesPanel.jsx';

/**
 * Stock DataViews, with one button swapped.
 *
 * Nothing here patches the table. The header menus still move columns, sorting
 * and filtering are untouched, and the order still lives in `view.fields`. The
 * only change is the cog: DataViews' own is hidden and ours is portalled into
 * the same slot, so the panel a reader opens is the one being proposed rather
 * than a second control sitting beside it.
 *
 * A portal rather than a prop because DataViews has no slot for this. That is
 * itself part of the argument — a consumer who wants this today cannot add it
 * to the panel, only beside it.
 */
export default function PostsTable({ rows, columns, view, onChangeView, arrangement, onChangeArrangement, reorderable }) {
  const frame = useRef(null);
  const [slot, setSlot] = useState(null);

  // DataViews renders its toolbar after mount, so the slot is found rather than
  // rendered into directly.
  useEffect(() => {
    const actions = frame.current?.querySelector('.dataviews__view-actions');
    setSlot(actions ?? null);
  }, []);

  const fields = useMemo(
    () => [
      {
        id: 'title',
        label: 'Title',
        enableHiding: false,
        enableSorting: true,
        getValue: ({ item }) => item.title,
        render: ({ item }) => <span className="posts-title">{item.title}</span>,
      },
      ...columns.map((column) => ({
        id: column.id,
        label: column.label,
        enableSorting: true,
        ...(column.elements ? { elements: column.elements, filterBy: { operators: ['isAny'] } } : {}),
        // The data module hands numbers and dates over as `{ value, sort }` — a
        // display string and the number underneath it, so a column reading
        // "12,480" still sorts as twelve thousand rather than as text starting
        // with a one.
        getValue: ({ item }) => item[column.id]?.sort ?? item[column.id],
        render: ({ item }) => (
          <span className="posts-cell">{item[column.id]?.value ?? item[column.id]}</span>
        ),
      })),
    ],
    [columns]
  );

  const { data, paginationInfo } = useMemo(
    () => filterSortAndPaginate(rows, view, fields),
    [rows, view, fields]
  );

  const panelFields = useMemo(
    () => [{ id: 'title', label: 'Title', locked: true }, ...columns.map(({ id, label }) => ({ id, label }))],
    [columns]
  );

  return (
    <div className="table" ref={frame}>
      <DataViews
        data={data}
        fields={fields}
        view={view}
        onChangeView={onChangeView}
        paginationInfo={paginationInfo}
        defaultLayouts={{ table: {} }}
        getItemId={(item) => item.id}
        isItemClickable={() => false}
      />

      {slot &&
        createPortal(
          <PropertiesPanel
            fields={panelFields}
            order={arrangement.order}
            hidden={arrangement.hidden}
            reorderable={reorderable}
            onChange={onChangeArrangement}
          />,
          slot
        )}
    </div>
  );
}
