# Bob Bowman Coaching Insights Atlas

A portable, independent reading notebook. Not official, affiliated with, or endorsed by Bob Bowman. All site code is plain HTML, CSS and JavaScript. Content lives in `threads.json`. There is no build step, API key, server account, database, graph library, CDN, paid service or automatic X watcher.

## What is included

- `index.html`: site entry point
- `styles.css`: responsive editorial layout
- `app.js`: views, SVG graph, filters, entry helper and local notes
- `threads.json`: ALL publishable thread content, dates, source links and coverage notes
- `thread-entry-template.json`: copyable blank entry
- `favicon.svg`: original illustrative swimming-lane icon
- `atlas-art.png`: original decorative swimming-lane illustration, not a photograph or evidence
- `.nojekyll`: tells GitHub Pages to serve these static files directly
- `TEXT-NEEDED.md`: checklist of supplied links with missing text
- `README.md`: this guide

The fictional sample entry is marked everywhere and excluded from sourced counts. You may delete it or hide it using the checkbox. It is not a Bob Bowman thread or quotation.

## Publish on GitHub Pages, step by step

These instructions use GitHub's branch-based static Pages deployment. GitHub's interface may change; use the official Pages documentation if labels differ.

1. Sign in to your existing GitHub account in your browser. This package contains no credentials.
2. Create a **new public repository**, for example `bowman-atlas`. Public means everyone can read the files, including any content you upload. Do not put private notes or full copyrighted source exports in it.
3. Open the repository. Choose **Add file → Upload files** (a new empty repository may show **uploading an existing file**).
4. Unzip this package on your computer. Upload the files **inside** the `bowman-atlas` folder, not the enclosing folder or the ZIP. `index.html` and `threads.json` must be at the repository root. Include `.nojekyll` if your file picker shows it. This site also works if that empty marker is omitted.
5. Choose **Commit changes** to save the upload to `main`.
6. Open the repository's **Settings → Pages**.
7. Under **Build and deployment**, select **Deploy from a branch**.
8. Select the **main** branch and **/(root)** folder. Choose **Save**.
9. Wait for the deployment to finish. The Pages settings screen will show your live site link; open that link. Use the actual link GitHub provides, not a guessed URL.
10. Check Network, Timeline, Threads, Themes, source links and Download thread data on your phone.

GitHub may take a few minutes to publish a commit. If an update is not visible, check the deployment status in the repository's Actions tab, then hard-refresh the live page. A file named `Threads.json` is not the same as `threads.json`; filenames are case-sensitive.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Open it locally

The app loads `threads.json` with `fetch`. Double-clicking `index.html` can fail because browsers restrict `file://` data access. This is not a missing dependency or a need for a paid server.

Use GitHub Pages as above, or, if Python 3 is already installed:

1. Open a terminal inside the unzipped `bowman-atlas` folder.
2. Run `python3 -m http.server 8000` (on some Windows installations, `py -m http.server 8000`).
3. Open `http://localhost:8000` in the browser.
4. Press Ctrl+C in the terminal when done.

This local preview tool is optional, not a deployed backend. No data leaves your machine through it. Do not expose the local server to the internet. For a no-terminal preview, publish a temporary GitHub Pages repository instead.

## Add the next thread: simplest route

1. Open **Sources & updates → Make an entry with the helper** on the site.
2. Enter the original thread link, a unique ID and the posting date if verified. If you cannot read the thread, select **Text needed**. Do not invent a date or summary.
3. If you have read the full text, select Ready and write a short summary in your own words. Add comma-separated themes and ideas. Use identical idea/theme wording when a new thread supports an existing label.
4. Download the entry JSON. This is just a local file, not an upload or a published update.
5. In GitHub, open `threads.json` and click the pencil/edit button. Find the `threads` array near the bottom. Copy the downloaded `{ ... }` object into that array. Put a comma between entries, never after the last entry.
6. Change the top-level `updated` date to today's date in `YYYY-MM-DD` format.
7. Update `collectionNote`, `sourceChecklist` and any coverage ledger to describe the collection honestly.
8. Commit the file. The cards, themes, timeline and graph will use the new entry automatically after GitHub Pages republishes. You do not edit `app.js`.
9. Check the live site. If a JSON error appears, return to the edit and check commas, straight double quotes, brackets and duplicate IDs. You can restore the last working version from GitHub history. Do not paste private data into an online JSON validator.

## Add a thread using the template

Copy the object from `thread-entry-template.json` into the `threads` array. Replace each field:

- `id`: unique, stable string. Notes are keyed by this ID, so do not rename it after writing notes.
- `sample`: `false` for an actual source; `true` ONLY for a fictional structural example.
- `status`: `ready`, `text-needed` or `sample`.
- `title`: concise, descriptive title in your own words.
- `date`: verified posting date as `YYYY-MM-DD`, or `null` if unknown. Never infer a missing date from the collection's Updated date.
- `url`: the original X thread link. Accepted external source links are HTTPS links on x.com or twitter.com. Do not use a mirror as though it were the original.
- `summary`: concise summary grounded in readable source text. Empty string for Text needed.
- `themes`: list of theme names, e.g. `["Practice", "Reflection"]`.
- `ideas`: list of concept labels. The graph links threads to ideas by exact label matching. Node size counts supporting entries in the current filtered view. Colors follow each thread's first theme.
- `quotes`: default `[]`. If you have a useful short line supplied verbatim, use `[{"text": "short exact quotation", "url": "original post URL"}]`. Verify against the source. Prefer paraphrase and keep quotations brief; do not use the sample as evidence.
- `posts`: optional ordered, concise post summaries, e.g. `[{"order":1,"url":"original first post URL","summary":"Your concise summary."},{"order":2,"url":"original second post URL","summary":"Your concise summary."}]`. Keep positive, increasing order numbers and preserve the supplied sequence. Do not insert a full verbatim thread.
- `provenance`: explain where readable text came from and any uncertainty, in plain language.

Keep ALL thread content in `threads.json`. The template is a blank structural aid, not a second live content source.

## Edit a summary

Open `threads.json` in GitHub, find the entry by ID or title, and edit only the `summary` text between its double quotes. Escape any literal double quote inside the text with a backslash, or avoid quotations. Update `updated`, commit and check the published site. A straight apostrophe needs no escaping in JSON. Keep the source URL and attribution attached to the summary.

## Notes, exports and privacy

- My notes are saved in browser localStorage on this origin/device, not in GitHub or `threads.json`. They do not sync between devices, domains or browser profiles. Browser clearing/private mode/storage limits can remove them.
- **Download thread data** exports the public collection JSON only. It excludes your notes.
- **Export my notes** exports local notes separately. Treat this file as private.
- **Import notes** merges a supported notes export after confirmation, replacing same-ID notes locally. It never publishes them.
- The site collects no analytics and makes no external runtime requests except when a reader explicitly opens an original source link. Your hosting provider still operates its normal access logs; the site does not control those.

## Graph and accessibility

The network is dependency-free SVG. It shows a bounded overview of up to 12 threads and 12 ideas to stay readable on phones; search and filters narrow the graph. The complete matching thread and idea lists remain available below it, so larger collections are not silently omitted. Thread nodes are solid and idea nodes outlined. All connections and theme labels are AI-suggested interpretations, never claims about the author's intent. Click, tap, or use Tab then Enter/Space. Every graph destination has a text button alternative. Native dialog details support Escape and focus return.

Timeline dates are verified source dates, with undated entries separated. The interface handles empty arrays and empty filters. Text-needed entries have no inferred summary and are not used in the idea graph.

## Copyright and attribution

This is a curated attributed learning resource, not a mirror or full-text archive. Link every actual summary and brief quotation to the original X source. Keep threads together. Do not reproduce full threads, invent posts, assume endorsement, or publish private source exports. A broad research effort still does not establish a complete account archive: record known gaps.

Branch/folder publishing reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Coverage and source ledger

`threads.json` can also contain `coverage` (a research-scope note with `title`, `note`, `facts`, `sources` and `gaps`) and `archiveLedger` (account-item metadata with `url`, `date`, `title`, `kind`, `note`). These remain in the same content file. The Sources view shows this ledger with its own search; up to 100 matching records are displayed at once and all records are in the data download. A recovered repost or unreadable link is not silently promoted into a fully sourced coaching thread. The research coverage date is not an individual post date.

## This edition's research status

This package has not been uploaded to a GitHub repository or deployed on GitHub Pages on your behalf. It is ready for you to publish using the instructions above. The separate hosted preview demonstrates the interface; its restricted browser-storage environment may show session-only notes. The standalone Pages version uses browser localStorage as described.

The exact current research count and ID-derived UTC range are recorded in the `coverage` object in `threads.json` and in the live Source desk. This is not a complete account export. Recovered chronology is derived from X IDs, not a guarantee of independently displayed posting dates. Some recent ancestor posts also have mirror-displayed UTC timestamps. Full source text was used for research but is not distributed in this site package. Search errors are recorded as gaps, not evidence of absent posts.
