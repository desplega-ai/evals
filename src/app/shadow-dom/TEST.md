# `/shadow-dom` — verification plan

Three custom-element widgets on one page. The shadow roots are deliberately not traversable from the light DOM (the closed one especially), so assertions should rely on the **light-DOM mirror elements** exposed via stable `data-testid` hooks (`counter-mirror`, `secret-mirror`, `rating-mirror`) rather than querying inside `shadowRoot`. The slotted name ("Taras") is regular light-DOM content and can be asserted directly by visible text.

## States to verify

- **Open shadow root — counter increments** — on `<demo-counter>`, click the visible "Click me" button three times; the light-DOM `[data-testid="counter-mirror"]` element reads `Count: 3`.
- **Closed shadow root — secret revealed** — click the visible "Reveal secret" button inside `<secret-reveal>`; the light-DOM `[data-testid="secret-mirror"]` element changes from `(secret hidden)` to `The cake is a lie.`. (`document.querySelector('secret-reveal').shadowRoot` remains `null` — assert via the mirror, not the shadow.)
- **Nested shadow DOM — slotted name renders** — confirm the slotted user name `Taras` is visible inside the `<user-card>` card layout, projected via `<slot name="name">`.
- **Nested shadow DOM — rating selection** — click the 4th star inside the nested `<rating-widget>`; the light-DOM `[data-testid="rating-mirror"]` reads `Selected rating: 4`. Click the 2nd star; the mirror updates to `Selected rating: 2`.

## Out of scope

- Piercing shadow roots from tests — the page is designed so all outcomes are observable in light DOM.
- Keyboard activation of shadow-scoped buttons.
