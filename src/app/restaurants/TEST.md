# `/restaurants` — verification plan

Full-viewport Mapbox GL map of NYC with 10 restaurant markers and a collapsible right-hand sidebar listing the same 10 restaurants. Clicking either a marker or a list row selects the restaurant: the marker turns green and scales up, and a popup opens on the map with the restaurant's name / cuisine / address. Stable selectors: `data-testid="restaurant-marker-<id>"` (1–10), `restaurant-item-<id>`, `sidebar-toggle-button`, `sidebar-toggle-button-floating`. Because Mapbox canvas + marker positioning are not trivial for automation, the plan keeps drag/zoom out of scope.

## States to verify

- **Initial load renders map + sidebar** — page shows the header "NYC Restaurants Map" with a "Back to Home" link, the map area on the left, and the "Restaurants" sidebar on the right listing 10 cards (Balthazar, Shake Shack, Joe's Pizza, Llili, The Smith, Gramercy Tavern, Carbone, Eleven Madison Park, Per Se, Katz's Delicatessen). Once the map finishes loading, the "⏳ Loading map..." status message disappears.
- **Restaurant selected from sidebar** — click `restaurant-item-1` (Balthazar); the card gains the green-selected border + `bg-green-50`, the corresponding map marker turns green and scales up, and a map popup opens with "Balthazar / French Bistro / 80 Spring St, New York, NY 10012".
- **Deselect via popup close button** — with Balthazar selected, click the `×` close button on the popup; the popup disappears, the marker returns to red, and the sidebar card loses its green style. The map flies back to the default NYC centre.
- **Marker click selects the same way** — click `restaurant-marker-3` (Joe's Pizza) on the map; the marker turns green and a popup opens with "Joe's Pizza / Pizza / 7 Carmine St…". The corresponding sidebar card gains the green-selected style.
- **Sidebar collapses and reopens via toggle** — click `sidebar-toggle-button`; the sidebar width collapses to 0 (the list is no longer visible) and a blue floating `☰` button (`sidebar-toggle-button-floating`) appears at the right edge. Click the floating button; the sidebar reopens with all 10 cards visible.

## Out of scope

- Map pan/zoom interactions (requires drag/scroll on a canvas — unreliable from automation).
- Validating exact lat/lng positions of markers on-screen.
- Mapbox tile-loading failures.
