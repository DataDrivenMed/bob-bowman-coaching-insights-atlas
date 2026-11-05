# Verification, coach-first redesign (2026-11-05)

Tested in headless Chrome over local HTTP at 320, 390 and 1280 px wide.

- Passed: every route renders (find help, situation, thread, all threads, search, what's new, connections, idea pair, about, unknown thread)
- Passed: no horizontal overflow at 320, 390 and 1280 px on any route
- Passed: no console errors or page errors on any route
- Passed: old links redirect (#network to Connections, #timeline and #threads to All threads, #themes to Find help, #sources to About)
- Passed: keyboard Enter on a lane opens the situation and moves focus to its heading
- Passed: home search suggests the right lane (taper to Before a big meet, parents to Developing young swimmers)
- Passed: audience choice persists across reload; lanes with no threads for that audience are dimmed
- Passed: weekly-updates.json returning 404 shows the archive with a visible warning and no "no new posts" claim
- Passed: guide.json returning 404 still renders All threads and Connections
- Passed: connections map switches to a top-down layout under 560 px with no overlapping labels

Not tested: real iOS Safari and Android devices, screen readers beyond focus order, and the live GitHub Pages deployment.
