# Seven Little Sins

An original, responsive personality quiz for `https://sevendeadlysinstest.xyz` with seven illustrated SVG characters.

The site has a home page with the complete 21-question quiz embedded at `/#quiz`, a personal `/result/` page, and seven static character guides at `/sins/pride/`, `/sins/greed/`, `/sins/lust/`, `/sins/envy/`, `/sins/gluttony/`, `/sins/wrath/`, and `/sins/sloth/`. The quiz is placed between the purple ribbon and the character lineup. Homepage lineup cards, character dialogs, and result explanations link to the guides.

Quiz answers are scored locally and saved in the current tab's session storage for refresh recovery. Result links contain only seven scores in the URL fragment. Invalid result links show a recovery screen. Equal scores preserve ties, including seven-way ties. There are no external fonts, accounts, or quiz-server requests. GA4 pageview measurement is available on the production domain when a Measurement ID is configured.

No dependencies are required. Build with `node tools/build.mjs`, run `node --test tools/scoring.test.mjs tools/analytics.test.mjs tools/routes.test.mjs`, then run `node tools/serve.mjs` and open `http://127.0.0.1:4173/`.

Source: `src/`. Homepage generator: `tools/build.mjs`. Guide content and templates: `tools/sin-pages.mjs`. Guide styles: `src/sin-guide.css`. Browser-ready output: `dist/`.

The sitemap includes the home page and all seven character guides. Legacy `/quiz` and `/quiz/` URLs redirect permanently to `/#quiz`; the local server and `dist/_redirects` implement this for local preview and hosts that support `_redirects` (including Cloudflare Pages). Personal results are marked `noindex,follow` and are excluded from the sitemap. The root canonical is `https://sevendeadlysinstest.xyz` without a trailing slash.

Deploy `dist/` as the static output. The custom domain has not been configured or deployed by this project. The nested `sevendeadlysinstest/` directory, when present, is the user's separate GitHub Desktop checkout; its `.git` directory must be preserved.

## GA4 traffic measurement

Set `GA4_MEASUREMENT_ID` in `src/analytics.mjs` to the website data stream ID (`G-...`), then rebuild. The module is included once on every page, and loads Google’s tag only on `sevendeadlysinstest.xyz` or `www.sevendeadlysinstest.xyz`. Localhost and preview hosts are excluded. Quiz answers and scores are not included in analytics calls; result fragments and arbitrary query parameters are removed from the reported URL. Campaign attribution parameters are retained. Google signals and advertising personalization are disabled.

After publishing, visit the live domain and verify the visit in GA4 Realtime or Google Tag Assistant. An empty Measurement ID leaves measurement disabled. Automatic pageviews are used; there is no second manual pageview.
