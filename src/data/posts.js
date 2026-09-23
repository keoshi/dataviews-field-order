/**
 * A posts table, because everybody has read one.
 *
 * This demo argues for a change to DataViews, so it shows nothing of the
 * product the argument came out of. A reporting table of ad channels asks a
 * reviewer to take on a domain before they can judge a column; the posts list
 * is the table every WordPress contributor already has in their head, and the
 * argument is the same one.
 *
 * Ten columns after the title, which is not an exaggeration for effect: a posts
 * list with an SEO plugin, an analytics plugin and a custom taxonomy or two
 * gets there on an ordinary site. Wide enough that the title leaves the screen
 * is the only condition the proposal needs.
 */

export const AUTHORS = ['Ana Ruiz', 'Ben Okoro', 'Clara Lindqvist', 'Dan Petrov', 'Emma Aoki'];

export const STATUSES = ['Published', 'Draft', 'Pending review', 'Scheduled', 'Private'];

export const CATEGORIES = [
  'Essays',
  'Guides',
  'Interviews',
  'Notes',
  'Photography',
  'Recipes',
  'Travel',
];

/**
 * Figures that read as a small site's, so nothing on the row invites a
 * question about the data instead of the column. A scheduled post has no views
 * and no comments, and says so with a dash rather than a zero — a zero is a
 * measurement, and nothing has been measured yet.
 */
export const POSTS = [
  {
    id: 'newsletter-rebuild',
    title: 'How we rebuilt the newsletter from scratch',
    author: 'Ana Ruiz',
    status: 'Published',
    category: 'Essays',
    tags: 'email, process, tools',
    comments: 42,
    views: 12480,
    words: 2310,
    published: '2026-08-14',
    modified: '2026-09-02',
  },
  {
    id: 'sourdough-guide',
    title: 'A field guide to sourdough starters',
    author: 'Emma Aoki',
    status: 'Published',
    category: 'Guides',
    tags: 'baking, bread, fermentation',
    comments: 118,
    views: 38210,
    words: 3480,
    published: '2026-07-29',
    modified: '2026-08-30',
  },
  {
    id: 'small-towns',
    title: 'Six small towns worth the detour',
    author: 'Ben Okoro',
    status: 'Published',
    category: 'Travel',
    tags: 'road trips, summer',
    comments: 27,
    views: 21095,
    words: 1890,
    published: '2026-07-11',
    modified: '2026-07-12',
  },
  {
    id: 'reader-surveys',
    title: 'What a year of reader surveys taught us',
    author: 'Clara Lindqvist',
    status: 'Published',
    category: 'Notes',
    tags: 'research, readers',
    comments: 9,
    views: 6740,
    words: 1420,
    published: '2026-06-30',
    modified: '2026-06-30',
  },
  {
    id: 'shorter-posts',
    title: 'The case for writing shorter posts',
    author: 'Dan Petrov',
    status: 'Draft',
    category: 'Essays',
    tags: 'craft, editing',
    comments: null,
    views: null,
    words: 760,
    published: null,
    modified: '2026-09-15',
  },
  {
    id: 'archive-1994',
    title: 'Notes from the archive: 1994',
    author: 'Clara Lindqvist',
    status: 'Published',
    category: 'Notes',
    tags: 'archive, history',
    comments: 14,
    views: 4310,
    words: 2040,
    published: '2026-06-02',
    modified: '2026-06-04',
  },
  {
    id: 'houseplants',
    title: 'Every houseplant we have killed',
    author: 'Emma Aoki',
    status: 'Published',
    category: 'Essays',
    tags: 'plants, humour',
    comments: 63,
    views: 18920,
    words: 1180,
    published: '2026-05-21',
    modified: '2026-05-22',
  },
  {
    id: 'typewriter-repair',
    title: 'Interview: the last typewriter repairer in town',
    author: 'Ben Okoro',
    status: 'Published',
    category: 'Interviews',
    tags: 'craft, interview, local',
    comments: 31,
    views: 9870,
    words: 4120,
    published: '2026-05-08',
    modified: '2026-05-19',
  },
  {
    id: 'small-kitchen',
    title: 'Ten recipes for a very small kitchen',
    author: 'Emma Aoki',
    status: 'Scheduled',
    category: 'Recipes',
    tags: 'cooking, small spaces',
    comments: null,
    views: null,
    words: 2650,
    published: '2026-09-24',
    modified: '2026-09-16',
  },
  {
    id: 'site-faster',
    title: 'Why the site got faster in March',
    author: 'Dan Petrov',
    status: 'Published',
    category: 'Notes',
    tags: 'performance, hosting',
    comments: 22,
    views: 7450,
    words: 1630,
    published: '2026-04-03',
    modified: '2026-04-06',
  },
  {
    id: 'mailbag-spring',
    title: 'Reader mailbag: spring edition',
    author: 'Ana Ruiz',
    status: 'Pending review',
    category: 'Notes',
    tags: 'mailbag, readers',
    comments: null,
    views: null,
    words: 980,
    published: null,
    modified: '2026-09-11',
  },
  {
    id: 'no-internet',
    title: 'A weekend with no internet',
    author: 'Ben Okoro',
    status: 'Published',
    category: 'Essays',
    tags: 'attention, travel',
    comments: 55,
    views: 16240,
    words: 2270,
    published: '2026-03-17',
    modified: '2026-03-18',
  },
  {
    id: 'camera-gear',
    title: 'The photography gear we actually use',
    author: 'Clara Lindqvist',
    status: 'Published',
    category: 'Photography',
    tags: 'cameras, gear, reviews',
    comments: 76,
    views: 28430,
    words: 3010,
    published: '2026-02-26',
    modified: '2026-08-01',
  },
  {
    id: 'membership',
    title: 'Behind the paywall: how membership works',
    author: 'Ana Ruiz',
    status: 'Private',
    category: 'Notes',
    tags: 'membership, money',
    comments: 4,
    views: 1120,
    words: 1750,
    published: '2026-02-02',
    modified: '2026-02-09',
  },
];

const NUMBER = new Intl.NumberFormat('en-US');

const DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A count, or a dash where there is nothing to count yet. */
const count = (value) =>
  value === null ? '—' : { value: NUMBER.format(value), sort: value };

/**
 * A date written short, sorting on the timestamp underneath it.
 *
 * Not DataViews' own `date` field type, for one reason: a draft has no
 * publication date, and a typed column has to render *something* for a row that
 * has nothing. A dash is the honest answer and a formatted epoch zero is not.
 */
const date = (value) =>
  value === null ? '—' : { value: DATE.format(new Date(`${value}T00:00:00Z`)), sort: Date.parse(value) };

/**
 * The rows as the table takes them: a display string and the number underneath
 * it, so a column of "12,480" still sorts as twelve thousand four hundred and
 * eighty rather than as a piece of text beginning with a one.
 */
export const rows = () =>
  POSTS.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author,
    status: post.status,
    category: post.category,
    tags: post.tags,
    comments: count(post.comments),
    views: count(post.views),
    words: count(post.words),
    // Derived rather than stored: a reading time that disagreed with the word
    // count beside it would be the one thing on this page anybody wrote in to
    // report.
    readTime: `${Math.max(1, Math.round(post.words / 200))} min`,
    published: date(post.published),
    modified: date(post.modified),
  }));
