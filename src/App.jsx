import { useState } from 'react';
import { ToggleControl } from '@wordpress/components';
import PostsTable from './PostsTable.jsx';
import { AUTHORS, CATEGORIES, STATUSES, rows } from './data/posts.js';

/**
 * Column order in DataViews — the proposal, on a table anybody can read.
 *
 * DataViews can already order columns: every header menu carries Move left and
 * Move right, and Insert left and Insert right will place a hidden column
 * exactly where you want it. The order lives in `view.fields` and the table
 * renders it.
 *
 * The Properties panel — the screen that looks like it arranges columns — is
 * the one place that cannot. It lists the fields in the order the consumer
 * declared them rather than the order the table is in, it offers no way to move
 * one, and ticking a hidden column back on appends it to the end.
 *
 * So the switch puts a handle on each row of that panel and keeps a hidden
 * column's place. Everything else is DataViews as it ships, including the panel
 * itself.
 */

const asElements = (values) => values.map((value) => ({ value, label: value }));

/**
 * Ten columns after the title. Not an exaggeration for effect — a posts list
 * with an SEO plugin, an analytics plugin and a custom taxonomy or two gets
 * there on an ordinary site, and arranging them is the job this is about.
 */
const COLUMNS = [
  { id: 'author', label: 'Author', elements: asElements(AUTHORS) },
  { id: 'status', label: 'Status', elements: asElements(STATUSES) },
  { id: 'category', label: 'Categories', elements: asElements(CATEGORIES) },
  { id: 'tags', label: 'Tags' },
  { id: 'published', label: 'Published' },
  { id: 'modified', label: 'Last modified' },
  { id: 'words', label: 'Words' },
  { id: 'views', label: 'Views' },
  { id: 'comments', label: 'Comments' },
  { id: 'readTime', label: 'Read time' },
];

const ALL = ['title', ...COLUMNS.map((column) => column.id)];
const HIDDEN = ['words', 'readTime'];

const DATA = rows();

export default function App() {
  /*
   * The order of every column and which of them are hidden, held apart.
   *
   * `view.fields` is derived from the two rather than being the source, and
   * that is the substance of the proposal: it is what lets a hidden column keep
   * its place. DataViews holds only the visible list, so a column that is
   * hidden has nowhere to record where it was — which is why its own toggle can
   * only append.
   */
  const [arrangement, setArrangement] = useState({ order: ALL, hidden: HIDDEN });
  const [reorderable, setReorderable] = useState(true);

  const [view, setView] = useState({
    type: 'table',
    perPage: 10,
    page: 1,
    search: '',
    filters: [],
    titleField: 'title',
    fields: ALL.filter((id) => id !== 'title' && !HIDDEN.includes(id)),
  });

  /*
   * Everything DataViews does to the view comes through here, and a tick in the
   * Properties panel is one of those things — which is where the change is.
   *
   * With it on, hiding a column takes it off the table and leaves its place
   * alone, so ticking it back on returns it. With it off, the order is rebuilt
   * from the visible list the way DataViews keeps it, and a column that comes
   * back arrives at the end.
   */
  const onChangeView = (next) => {
    const fields = next.fields ?? [];
    const hidden = ALL.filter((id) => id !== 'title' && !fields.includes(id));

    if (!reorderable) {
      setArrangement({ order: ['title', ...fields, ...hidden], hidden });
      setView(next);
      return;
    }

    const visible = arrangement.order.filter((id) => id !== 'title' && !arrangement.hidden.includes(id));
    let order;

    if (visible.length !== fields.length) {
      // A tick. The place is left alone, which is the whole of the change: a
      // column that comes back finds its own slot rather than the end.
      order = arrangement.order;
    } else {
      // A move, from a column header menu: the visible columns take their new
      // order and the hidden ones keep the slots they are in.
      const moved = [...fields];
      order = arrangement.order.map((id) => (id === 'title' || hidden.includes(id) ? id : moved.shift()));
    }

    setArrangement({ order, hidden });
    setView({ ...next, fields: order.filter((id) => id !== 'title' && !hidden.includes(id)) });
  };

  /** A drag in the Properties panel, which moves shown and hidden alike. */
  const onReorder = (order) => {
    setArrangement((current) => ({ order, hidden: current.hidden }));
    setView((current) => ({
      ...current,
      fields: order.filter((id) => id !== 'title' && !arrangement.hidden.includes(id)),
    }));
  };

  return (
    <main className="page">
      <header className="page-header">
        <h1>Column order in DataViews</h1>
      </header>

      <div className="panel controls">
        <ToggleControl
          __nextHasNoMarginBottom
          label="Drag to reorder"
          checked={reorderable}
          onChange={setReorderable}
        />
      </div>

      <PostsTable
        rows={DATA}
        columns={COLUMNS}
        view={view}
        onChangeView={onChangeView}
        order={arrangement.order}
        reorderable={reorderable}
        onReorder={onReorder}
      />
    </main>
  );
}
