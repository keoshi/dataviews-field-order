# Column order in DataViews

A demo for a proposal: let the **Properties panel** set column order, and let a
hidden column come back where it was.

DataViews can already order columns. Every column header menu offers Move left
and Move right, and Insert left and Insert right will place a hidden column
exactly where you want it. The order lives in `view.fields`, and the table
renders it in that order.

What is missing is the place people go to do it. The cog opens Properties — a
list of every column with a tick beside it, which is the screen that looks like
*arrange your columns* — and that list cannot arrange anything:

- **It is not in the table's order.** It lists the fields in the order the
  consumer declared them, which stops being the table's order the moment
  anybody moves a column.
- **It cannot move anything.** Reordering lives in the header menus, one step
  per trip, so moving a column five places is five menu visits.
- **Ticking a hidden column back on appends it to the end.** Untick Status to
  look at something, tick it again, and it comes back last — the arrangement
  you had is gone. The header menu's Insert left and Insert right can place a
  hidden column precisely, so the capability is there; the panel's toggle just
  does not use it.

## The demo

**https://dataviews-field-order.view.fast/**

One table, two controls, both driving the same `view.fields`: the stock cog,
and a **Columns** panel that lists the columns in the table's order, reorders by
dragging, and keeps a hidden column's place.

Three things to try:

1. **Move a column a long way.** Take Comments to the front — several trips
   through the header menu, or one drag.
2. **Hide a column and bring it back.** In the cog it returns at the end. In the
   panel it returns where it was.
3. **Reorder from a header menu, then open the cog.** The Properties list reads
   the same as it always did.

## Run it

```bash
npm install
npm run dev
```

## What is in here

| File | What it is |
|---|---|
| `src/App.jsx` | The page, the argument, and the two controls over one view |
| `src/FieldOrderPanel.jsx` | The proposed control — one list, tick to show, drag to arrange |
| `src/PostsTable.jsx` | Stock DataViews. Nothing patched |
| `src/data/posts.js` | A generic posts table, ten columns after the title |

## What Core would have to hold

Everything the panel does is possible from outside DataViews today except one
thing: **the position of a column that is not currently shown.** `view.fields`
holds the visible columns in order, so hiding a column throws its place away,
and that is why the stock toggle can only append.

The demo keeps a separate list of every column and derives `view.fields` from
it. A Core version would need the equivalent — either an order that includes
hidden columns, or a remembered position per field. That is the substance of
the change; the drag handle is the easy part.

It is not the [row reordering
problem](https://sweepersp2.wordpress.com/2026/08/12/reordering-in-dataviews-i1/).
Column order is view state: it writes nothing to the records, has no hierarchy,
does not change what visitors see, and is unaffected by filtering or pagination.

## Built with

Plain Vite + React + `@wordpress/dataviews`, unpatched, at the version in
`package.json`. The posts data is invented.
