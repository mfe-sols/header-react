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
