# `/pagination` — verification plan

Four independent sections demonstrating data-loading patterns over deterministic fixtures: (1) classic pagination with search + category filters + page-size selector over 100 products, (2) infinite scroll over 200 comments, (3) "Load More" button over 50 logs, (4) cursor-based Prev/Next over the same 50 logs. Target items to find: product `#47`, comment `#137`, log `log-033`. Stable selectors include `data-testid="search-input"`, `category-filter`, `page-size`, `page-first/prev/next/last`, `page-<n>`, `product-row-<id>`, `comment-scroll-container`, `comment-<id>`, `load-more-btn`, `log-log-<id>`, `cursor-prev`, `cursor-next`, `cursor-log-<id>`.

## States to verify

- **Section 1 default page renders 10 products** — page 1 of the products table shows IDs #1–#10, the "Showing 1-10 of 100 products" counter is visible, and the pagination control shows `First / Prev / 1 2 3 4 5 / Next / Last` with `1` highlighted blue.
- **Search filter narrows + resets to page 1** — type `deluxe` in `search-input`; the table is filtered to product rows whose name contains "Deluxe" and the counter updates accordingly (e.g. `Showing 1-10 of 12 products`). The page indicator is back on `1`.
- **Page-size change adjusts rows and total pages** — change `page-size` to `50`; the table now shows IDs #1–#50 and the counter reads `Showing 1-50 of 100 products`.
- **Navigate to the target product** — clear filters, set page-size to 10, click `page-5`; the table now shows IDs #41–#50, and the row for product `#47` is highlighted with a yellow background (`bg-yellow-50`).
- **Infinite scroll loads more** — in Section 2 the scroll container starts at "20/200" loaded; scroll the container to the bottom; the spinner "Loading more comments…" appears briefly, then the loaded count increases (e.g. to 40/200). Repeat until comment `#137` is in view — that row is highlighted yellow with a left border.
- **Load More button appends logs** — in Section 3 the terminal-style log panel starts with `log-001`…`log-005` and shows `Load More (5/50 loaded)`; click `load-more-btn` several times until `log-033` is visible (highlighted with `bg-yellow-900/30`).
- **Cursor pagination Next/Prev** — in Section 4 click `cursor-next` three times; the header reads `Page 4 of 5` and `log-033` is visible (yellow-highlighted row). Click `cursor-prev` once; the header reverts to `Page 3 of 5` and the previous 10 logs are shown.

## Out of scope

- Combining search + category filter permutations beyond one bullet.
- Verifying that `cursor-prev` is disabled on the first page and `cursor-next` on the last (standard disabled-button UX).
