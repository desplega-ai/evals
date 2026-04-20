# `/iframe` — verification plan

Single page embedding `https://desplega-ai-evals.vercel.app/visible` inside a sandboxed 600px-tall `<iframe>`. A "Refresh Iframe" button forces a remount. A spinner overlay hides the iframe until its `onLoad` fires. No `data-testid` attributes; drive by visible labels ("Refresh Iframe") and by inspecting the iframe element by its `title="Embedded content"` attribute.

## States to verify

- **Initial load shows spinner then content** — navigate to the page; the spinner overlay "Loading iframe..." is visible briefly, then disappears; the iframe renders the embedded Visibility Demo page (heading "Visibility Demo" visible inside the frame).
- **URL readout matches the embedded src** — the grey info box at the top shows `Showing: https://desplega-ai-evals.vercel.app/visible` in monospace.
- **Refresh button re-triggers spinner** — click "Refresh Iframe"; the spinner overlay reappears momentarily (URL is briefly cleared and restored), then the iframe reloads with the same Visibility Demo content.
- **Iframe info panel renders** — the blue "Iframe Information" panel below the frame lists the 4 bullets: "This iframe displays content from another webpage", "The embedded page can be interacted with directly", "Some features may be restricted due to security policies", "The iframe has a fixed height of 600px".
- **Iframe sandbox is configured** — the rendered `<iframe>` element has `sandbox="allow-scripts allow-same-origin allow-forms"` (verify via DOM/devtools or by asserting the attribute string is present on the element).

## Out of scope

- Interacting with elements inside the embedded `/visible` page through the iframe (covered in the `/visible` plan directly).
- Network-failure / CSP-block of the embedded origin.
