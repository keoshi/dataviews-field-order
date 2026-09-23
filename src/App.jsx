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
 * column's place. Everything else is DataViews as it ships.
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
   * Either control can change the order, and both write to the same place. Move
   * left in a header menu writes `view.fields`; the panel writes the
   * arrangement and derives `view.fields` from it. Keeping the two in step is
   * what lets a reader move a column from the header and find the panel
   * agreeing with them.
   */
  const onChangeView = (next) => {
    const moved = next.fields ?? [];
    setArrangement((current) => ({
      order: ['title', ...moved, ...current.order.filter((id) => id !== 'title' && !moved.includes(id))],
      hidden: ALL.filter((id) => id !== 'title' && !moved.includes(id)),
    }));
    setView(next);
  };

  const onChangeArrangement = ({ order, hidden }) => {
    setArrangement({ order, hidden });
    setView((current) => ({
      ...current,
      fields: order.filter((id) => id !== 'title' && !hidden.includes(id)),
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
        arrangement={arrangement}
        onChangeArrangement={onChangeArrangement}
        reorderable={reorderable}
      />
    </main>
  );
}
