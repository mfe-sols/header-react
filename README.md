# @mfe-sols/header-react

Header microfrontend module — React + single-spa.

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- GitHub Personal Access Token with `read:packages` scope

## Setup

```bash
# 1. Configure GitHub Packages registry
# Create .npmrc with your token (already included, set GITHUB_TOKEN env var)
export GITHUB_TOKEN=your_github_token

# 2. Install dependencies
pnpm install

# 3. Start dev server (standalone mode)
pnpm start
# → http://localhost:9012
```

Standalone CSS is loaded from system shell (`root-config`) by default:
- local fallback origin: `http://localhost:9000`
- production fallback origin: `https://mfe-root-config.vercel.app`

You can override in URL:
`?system-origin=https://your-root-config-domain&cssv=123`

## Runtime UI Config (Optional)

You can override header branding/text without rebuilding by defining
`window.__MFE_HEADER_CONFIG__` before loading `org-header-react.js`.

Menu behavior:
- Default: uses built-in mock menu (safe fallback).
- Optional: set `menuSource.mode = "api"` to load menu from API.
- Desktop width:
  - Default max content width is `1440px`.
  - Override via `layout.desktopMaxWidth` (e.g. `1320`, `"1280px"`, `"80rem"`).

Example:

```html
<script>
  window.__MFE_HEADER_CONFIG__ = {
    palette: {
      accent: "#16a34a",
      brandA: "#0b3b2e",
      brandB: "#14532d"
    },
    layout: {
      desktopMaxWidth: 1320
    },
    menu: [
      {
        label: "Platform",
        columns: [
          {
            title: "Workspace",
            links: [
              { text: "Projects", desc: "Manage apps", href: "/projects" },
              { text: "Pipelines", desc: "CI/CD status", href: "/pipelines" }
            ]
          },
          {
            title: "Insights",
            links: [
              { text: "Analytics", desc: "Usage dashboards", href: "/analytics" }
            ]
          }
        ]
      }
    ],
    menuSource: {
      mode: "api",
      endpoint: "/api/header-menu",
      timeoutMs: 4000
    },
    locale: {
      vi: {
        navigation: "Điều hướng hệ thống"
      }
    }
  };
</script>
```

Supported API response:

```json
{
  "menu": [
    {
      "label": "Platform",
      "columns": [
        {
          "title": "Workspace",
          "links": [
            { "text": "Projects", "desc": "Manage apps", "href": "/projects" }
          ]
        }
      ]
    }
  ]
}
```

or direct array:

```json
[
  {
    "label": "Platform",
    "columns": [
      {
        "title": "Workspace",
        "links": [{ "text": "Projects", "desc": "Manage apps", "href": "/projects" }]
      }
    ]
  }
]
```

## Scripts

| Command | Description |
|---------|------------|
| `pnpm start` | Start dev server on port 9012 (standalone) |
| `pnpm build` | Build for production (webpack + types) |
| `pnpm typecheck` | Run TypeScript type checking |

## Shared Libraries

This module uses shared libraries from `@mfe-sols/*` (GitHub Packages):

| Package | Usage |
|---------|-------|
| `@mfe-sols/auth` | Authentication, session management |
| `@mfe-sols/i18n` | Internationalization (`t()`, locale switching) |
| `@mfe-sols/ui-kit` | Design system (Tailwind components, theme) |
| `@mfe-sols/contracts` | Cross-MFE shared state |

## Integration with root-config

This module is designed to be loaded by a single-spa root-config:

```js
// In root-config's import map
{
  "@org/header-react": "http://localhost:9012/org-header-react.js"
}
```
