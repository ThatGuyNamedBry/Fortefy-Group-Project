The Fortefy frontend: React, built with [Vite](https://vite.dev/).

Use Node.js 24, the version pinned in `.node-version` at the repository root.
Render builds with that version too.

| command | what it does |
|---|---|
| `npm install` | installs the dependencies |
| `npm start` | starts the dev server on http://localhost:3000, sending `/api` requests to Flask on port 5000 |
| `npm run build` | builds the app into `build/`, which Flask serves in production |
| `npm test` | runs the tests once (`npm run test:watch` keeps them running) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

For the dev server, run Flask alongside it (`flask run` from the repository
root). To send `/api` somewhere other than port 5000, set `API_PROXY_TARGET`,
for example `API_PROXY_TARGET=http://localhost:5003 npm start`.

`index.html` lives here at the root of `react-app`, not in `public/`. Files in
`public/` are copied into the build as they are, at the root of the site.
