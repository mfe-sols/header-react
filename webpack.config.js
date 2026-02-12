const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "org",
    projectName: "header-react",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
    disableHtmlGeneration: true,
  });

  defaultConfig.resolve = defaultConfig.resolve || {};

  /* ── Prioritise .ts/.tsx so Webpack picks ESM sources in libs/ ─────
     The pre-compiled .js files use CJS (exports.__esModule) which
     causes "exports is not defined" when bundled into an ESM output. */
  defaultConfig.resolve.extensions = [
    ".ts", ".tsx", ".mjs", ".js", ".jsx", ".wasm", ".json",
  ];

  defaultConfig.resolve.alias = {
    ...(defaultConfig.resolve.alias || {}),
    /* @mfe-sols/* packages are resolved from node_modules (GitHub Packages) */
  };

  const baseExternals = defaultConfig.externals;
  const allowBundle = new Set([
    "@mfe-sols/auth",
    "@mfe-sols/contracts",
    "@mfe-sols/ui-kit",
    "@mfe-sols/i18n",
    "react",
    "react-dom",
    "react-dom/client",
  ]);
  const customExternals = (context, request, callback) => {
    if (allowBundle.has(request)) {
      return callback();
    }
    if (typeof baseExternals === "function") {
      return baseExternals(context, request, callback);
    }
    if (Array.isArray(baseExternals)) {
      for (const ext of baseExternals) {
        if (typeof ext === "function") {
          let handled = false;
          ext(context, request, (err, result) => {
            if (err) return callback(err);
            if (result !== undefined) {
              handled = true;
              return callback(null, result);
            }
          });
          if (handled) return;
        } else if (typeof ext === "object" && ext[request]) {
          return callback(null, ext[request]);
        }
      }
      return callback();
    }
    return callback();
  };

  /* ── Remove auto-generated standalone HTML (has no CSS) ────────────
     We provide our own public/index.html that loads ui-kit.css +
     root-config.css, matching the shell at :9000 exactly. ──────── */
  defaultConfig.plugins = (defaultConfig.plugins || []).filter(
    (p) => p && p.constructor && p.constructor.name !== "StandaloneSingleSpaPlugin"
  );

  return merge(defaultConfig, {
    cache: { type: "filesystem" },
    performance: { hints: false },
    externals: customExternals,
    devServer: {
      ...(defaultConfig.devServer || {}),
      allowedHosts: "all",
      /* Serve only local public/. Standalone HTML loads CSS from system
         root-config host (e.g. http://localhost:9000), avoiding stale copies. */
      static: [
        { directory: path.resolve(__dirname, "public"), publicPath: "/" },
      ],
      headers: {
        ...((defaultConfig.devServer && defaultConfig.devServer.headers) || {}),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    },
  });
};
