import { useMemo } from 'react';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import PropertiesReorder from './PropertiesReorder.jsx';

/**
 * Stock DataViews.
 *
 * Nothing here is patched or replaced: the cog is DataViews' own, so is the
 * Appearance panel behind it, and so are the column header menus. The order
 * still lives in `view.fields` and the table still renders it.
 *
 * Two things are arranged from outside. The `fields` list is handed over in the
 * table's order, which is what puts the Properties list in that order too —
 * the panel lists fields as the consumer declares them. And `PropertiesReorder`
 * puts a handle on each of its rows.
 */
export default function PostsTable({ rows, columns, view, onChangeView, order, reorderable, onReorder }) {
  const fields = useMemo(() => {
    const byId = Object.fromEntries(columns.map((column) => [column.id, column]));

    /*
     * With the change on, the panel is in the table's order — including the
     * hidden columns, each sitting where it will come back to. With it off,
     * the fields are declared in the order the consumer wrote them, which is
     * DataViews today: the list stops describing the table as soon as anybody
     * moves a column.
     */
    const ordered = reorderable
      ? order.filter((id) => id !== 'title').map((id) => byId[id]).filter(Boolean)
      : columns;

    return [
      {
        id: 'title',
        label: 'Title',
        enableHiding: false,
        enableSorting: true,
        getValue: ({ item }) => item.title,
        render: ({ item }) => <span className="posts-title">{item.title}</span>,
      },
      ...ordered.map((column) => ({
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
    ];
  }, [columns, order, reorderable]);

  const { data, paginationInfo } = useMemo(
    () => filterSortAndPaginate(rows, view, fields),
    [rows, view, fields]
  );

  return (
    <div className="table">
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

      <PropertiesReorder
        enabled={reorderable}
        fields={fields}
        lockedId="title"
        onReorder={onReorder}
      />
    </div>
  );
}
