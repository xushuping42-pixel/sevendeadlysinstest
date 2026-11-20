# Seven Little Sins

An original, responsive personality quiz for `https://sevendeadlysinstest.xyz` with seven illustrated SVG characters.

The site has exactly three pages: `/` (home), `/quiz/` (21 questions), and `/result/` (seven independent scores, leading character explanations, and a downloadable 1080 × 1350 PNG card). There are no separate character-detail pages.

Quiz answers are scored locally and saved in the current tab's session storage for refresh recovery. Result links contain only seven scores in the URL fragment. Invalid result links show a recovery screen. Equal scores preserve ties, including seven-way ties. There are no external fonts, analytics, trackers, accounts, or quiz-server requests.

No dependencies are required. Build with `node tools/build.mjs`, run `node --test tools/scoring.test.mjs`, then run `node tools/serve.mjs` and open `http://127.0.0.1:4173/`.

Source: `src/`. Homepage generator: `tools/build.mjs`. Browser-ready output: `dist/`.

The sitemap includes the home and quiz pages. Personal results are marked `noindex,follow` and are excluded from the sitemap. The root canonical is `https://sevendeadlysinstest.xyz` without a trailing slash.

Deploy `dist/` as the static output. The custom domain has not been configured or deployed by this project. The nested `sevendeadlysinstest/` directory, when present, is the user's separate GitHub Desktop checkout; its `.git` directory must be preserved.
