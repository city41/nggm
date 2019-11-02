const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/home/matt/dev/gngbg/.cache/dev-404-page.js"))),
  "component---src-pages-index-tsx": hot(preferDefault(require("/home/matt/dev/gngbg/src/pages/index.tsx")))
}

