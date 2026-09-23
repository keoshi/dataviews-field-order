import { useMemo } from 'react';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';

/**
 * A posts table on DataViews, with nothing patched.
 *
 * This is the stock component. The proposal is a second control beside its own
 * cog, so everything DataViews does here — the header menus with Move left and
 * Move right, the Properties panel, sorting, filtering — behaves exactly as it
 * ships. That is the point: the two controls drive the same `view.fields`, and
 * the difference a reader is being asked about is how each one feels to use.
 */
export default function PostsTable({ rows, columns, view, onChangeView }) {
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
        // The data module hands numbers and dates over as `{ value, sort }` —
        // a display string and the number underneath it, so a column reading
        // "12,480" still sorts as twelve thousand rather than as text starting
        // with a one. Plain strings come through as themselves.
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

  return (
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
  );
}
