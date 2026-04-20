# `/storage` — verification plan

Four storage-API sections: localStorage, sessionStorage, cookies, IndexedDB. Each has an add form (key/value, plus expiry for cookies), a list of current items, a per-item "Remove", and a "Clear All". IndexedDB uses an auto-increment integer id and is async. Stable selectors: `data-testid="{local,session}-storage-{key,value,add,clear,list,empty,item-<k>,remove-<k>}"`, `cookie-{key,value,expiry,add,clear,list,empty,item-<k>,remove-<k>}`, `indexeddb-{name,value,add,clear,list,empty,item-<id>,remove-<id>}`.

## States to verify

- **All four sections render** — page shows the four sections (Local Storage, Session Storage, Cookies, IndexedDB) plus a final "Storage Comparison" reference table. Initially each section's list area shows its empty-state testid (`…-empty`) with "No items/records/cookies stored".
- **Add + list + remove in localStorage** — type `theme` into `local-storage-key`, `dark` into `local-storage-value`, click `local-storage-add`; the empty state is replaced by `local-storage-list` containing one item `theme: dark`. Click `local-storage-remove-theme`; the list returns to the empty state.
- **Clear All localStorage** — add two items, click `local-storage-clear`; the list returns to the `local-storage-empty` state showing "No items stored".
- **Session storage independent of local** — add an item via `session-storage-*` controls; the `session-storage-list` renders it but the `local-storage-list` stays empty (the two sections do not share state).
- **Cookie add with expiry option** — type `lang`/`en`, select `7` (7 Days) in `cookie-expiry`, click `cookie-add`; the `cookie-list` shows `lang: en`.
- **IndexedDB add after DB ready** — once the DB is loaded (the "(Loading...)" label next to "Stored Records" disappears and the `indexeddb-add` button is enabled), type `note`/`hello`, click `indexeddb-add`; a record row `#<id> note: hello (HH:MM:SS AM/PM)` appears in `indexeddb-list`.
- **Storage Comparison table is informational** — the final table renders with a header row "Feature / Local Storage / Session Storage / Cookies / IndexedDB" and rows for Capacity, Persistence, Data Type, Sent to Server, API Complexity.

## Out of scope

- Verifying actual persistence across a page reload (the page re-reads on mount, but cross-navigation verification is not asserted here).
- Testing the httpOnly / Secure / SameSite cookie attributes (the form only configures expiry).
