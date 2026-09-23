# Column order in DataViews

A demo for a proposal: put drag handles in the **Properties panel**, and let a
hidden column come back where it was.

**https://dataviews-field-order.view.fast/**

DataViews can already order columns. Every column header menu offers Move left
and Move right, and Insert left and Insert right will place a hidden column
exactly where you want it. The order lives in `view.fields`, and the table
renders it in that order.

The Properties panel — the list behind the cog, which is the screen that looks
like *arrange your columns* — is the one place that cannot:

- **It cannot move anything.** Reordering lives in the header menus, one step
  per trip, so moving a column five places is five menu visits with the table
  shifting under the pointer each time.
- **It is not in the table's order.** It lists the fields in the order the
  consumer declared them, which stops describing the table the moment anybody
  moves a column.
- **Ticking a hidden column back on appends it to the end.** Untick Status to
  look at something, tick it again, and the arrangement you had is gone. The
  header menu's Insert left and Insert right can place a hidden column
  precisely, so the capability is there; the panel's toggle does not use it.

## The demo

The panel in the demo *is* the cog — DataViews' own button is hidden and this
one takes its place, so there is one control rather than two. The rows are
`Item` from `@wordpress/components`, which is what DataViews builds the list
from, so the padding, the hover and the tick slot are theirs.

The switch turns the proposal off: no handles, and a column ticked back on goes
to the end, which is the panel as it ships today.

## Run it

```bash
npm install
npm run dev
```

## What is in here

| File | What it is |
|---|---|
| `src/App.jsx` | The page, the switch, and the view both controls write to |
| `src/PropertiesPanel.jsx` | The Properties panel, with and without the change |
| `src/PostsTable.jsx` | Stock DataViews. Nothing patched but the cog |
| `src/data/posts.js` | A generic posts table, ten columns after the title |

## What Core would have to hold

Everything here is possible from outside DataViews today except one thing: **the
position of a column that is not currently shown.** `view.fields` holds the
visible columns in order, so hiding a column throws its place away, and that is
why the stock toggle can only append.

The demo keeps a separate list of every column and derives `view.fields` from
it. A Core version would need the equivalent — an order that includes hidden
columns, or a remembered position per field. That is the substance; the drag
handle is the easy part.

It is not the [row reordering
problem](https://sweepersp2.wordpress.com/2026/08/12/reordering-in-dataviews-i1/).
Column order is view state: it writes nothing to the records, has no hierarchy,
does not change what visitors see, and is unaffected by filtering or pagination.

## Built with

Plain Vite + React + `@wordpress/dataviews`, unpatched, at the version in
`package.json`. The posts data is invented.
