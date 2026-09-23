import { useMemo, useState } from 'react';
import FieldOrderPanel from './FieldOrderPanel.jsx';
import PostsTable from './PostsTable.jsx';
import { AUTHORS, CATEGORIES, STATUSES, rows } from './data/posts.js';

/**
 * Column order in DataViews — the proposal, on a table anybody can read.
 *
 * DataViews can already order columns. Each header menu offers Move left and
 * Move right, and Insert left and Insert right will place a hidden column
 * exactly where you want it. The order lives in `view.fields`, and the table
 * renders it in that order.
 *
 * What is missing is the place people go to do it. The cog opens Properties —
 * a list of every column with a tick beside it, which is the screen that looks
 * like "arrange your columns" — and that list cannot arrange anything. It shows
 * the columns in the order the consumer declared its fields rather than the
 * order the table is in, it offers no way to move one, and ticking a hidden
 * column back on appends it to the end rather than returning it to its place.
 *
 * So this page puts a second control beside the first, driving the same view,
 * and asks which one you would rather use.
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

// Built once: the data module generates the set, and regenerating it on every
// render would reshuffle the table under whoever is dragging a column.
const DATA = rows();

export default function App() {
  /*
   * The order of every column, and which of them are hidden — two facts, held
   * apart.
   *
   * `view.fields` is derived from them rather than being the source, which is
   * the whole of the proposed change: it is what lets a hidden column keep its
   * place, because the place is remembered somewhere that hiding does not
   * touch. DataViews holds only the visible list today, so a column that is
   * hidden has nowhere to record where it was.
   */
  const [arrangement, setArrangement] = useState({ order: ALL, hidden: ['words', 'readTime'] });

  const [view, setView] = useState({
    type: 'table',
    perPage: 10,
    page: 1,
    search: '',
    filters: [],
    titleField: 'title',
    fields: ALL.filter((id) => id !== 'title' && !['words', 'readTime'].includes(id)),
  });

  /*
   * Either control can change the order, and both write to the same place.
   *
   * Move left in a header menu writes `view.fields` directly; the panel writes
   * the arrangement and derives `view.fields` from it. Keeping the arrangement
   * in step with what DataViews did is what makes the comparison fair — move a
   * column from the header menu and the panel shows it where you moved it.
   */
  const onChangeView = (next) => {
    const moved = next.fields ?? [];
    const hidden = ALL.filter((id) => id !== 'title' && !moved.includes(id));
    setArrangement((current) => ({
      order: ['title', ...moved, ...current.order.filter((id) => id !== 'title' && !moved.includes(id))],
      hidden,
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

  const fieldsForPanel = useMemo(
    () => [
      { id: 'title', label: 'Title', locked: true },
      ...COLUMNS.map(({ id, label }) => ({ id, label })),
    ],
    []
  );

  return (
    <div className="page">
      <header className="page__head">
        <h1>Column order in DataViews</h1>
        <p className="page__lede">
          DataViews can order columns: every header menu has Move left and Move right, and
          Insert left and Insert right will place a hidden column where you want it. The
          Properties panel — the screen that looks like it arranges columns — cannot do any
          of it.
        </p>
      </header>

      <section className="page__section">
        <h2>The same table, two controls</h2>
        <p>
          The cog is DataViews as it ships. <strong>Columns</strong> is the proposal: one
          list in the table&rsquo;s own order, drag to arrange, tick to show. Both write to
          the same view, so you can use either and watch the other keep up.
        </p>

        <div className="page__demo">
          <div className="page__demo-actions">
            <span className="page__demo-label">Proposed</span>
            <FieldOrderPanel
              fields={fieldsForPanel}
              order={arrangement.order}
              hidden={arrangement.hidden}
              onChange={onChangeArrangement}
            />
          </div>

          <PostsTable rows={DATA} columns={COLUMNS} view={view} onChangeView={onChangeView} />
        </div>
      </section>

      <section className="page__section">
        <h2>Three things to try</h2>
        <ol className="page__list">
          <li>
            <strong>Move a column a long way.</strong> Take Comments to the front. In the
            header menu that is Move left, once per column, with the table re-rendering
            under the pointer each time. In the panel it is one drag.
          </li>
          <li>
            <strong>Hide a column and bring it back.</strong> Untick Status in the cog,
            then tick it again: it returns at the end, and the arrangement you had is
            gone. In the panel it comes back where it was.
          </li>
          <li>
            <strong>Reorder from the header menu, then open the cog.</strong> The
            Properties list is in the same order it always was — it lists what the
            consumer declared, not what the table is showing.
          </li>
        </ol>
      </section>

      <footer className="page__foot">
        <p>
          Built with <code>@wordpress/dataviews</code>, unpatched. The panel is an ordinary
          consumer component driving <code>view.fields</code>, so everything it does is
          already possible — the question is whether DataViews should do it itself.
        </p>
      </footer>
    </div>
  );
}
