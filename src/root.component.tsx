import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getStoredLocale, setLocale, setStoredLocale } from "@mfe-sols/i18n";
import {
  isAuthenticated,
  getCurrentUser,
  subscribeAuthChange,
  writeAuthState,
} from "@mfe-sols/auth";
import type { AuthUser } from "@mfe-sols/auth";
import { createModel } from "./mvp/model";
import { createPresenter } from "./mvp/presenter";
import { createQueryClient } from "./mvp/service";
import { AppView } from "./mvp/view";

const getThemeFromElement = (target: Element | null): "light" | "dark" =>
  target?.getAttribute("data-theme") === "dark" ? "dark" : "light";

export default function Root() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = getStoredLocale();
    setLocale(stored);
    return stored;
  });
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [queryClient] = useState(() => createQueryClient());

  /* defineDesignSystem + ensureTokens are now called at module scope in
     org-header-react.tsx (before React renders), eliminating FOUC. */

     /* ── Auth state ──────────────────────────────────────────────── */
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    isAuthenticated() ? getCurrentUser() : null,
  );

  useEffect(() => {
    const syncAuth = () => {
      setAuthUser(isAuthenticated() ? getCurrentUser() : null);
    };
    syncAuth();
    const unsubscribe = subscribeAuthChange(() => syncAuth());
    return unsubscribe;
  }, []);

  const handleSignOut = useCallback(() => {
    writeAuthState(null);
    const url = new URL("/auth/login", window.location.origin);
    url.searchParams.set("returnTo", "/");
    window.location.assign(`${url.pathname}${url.search}`);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const applyLocale = (next: string) => {
      const normalized = next === "vi" ? "vi" : "en";
      setLocale(normalized);
      setLocaleState(normalized);
      document.documentElement.setAttribute("lang", normalized);
    };
    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ locale?: string }>).detail;
      if (detail?.locale) applyLocale(detail.locale);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "app-locale") {
        applyLocale(getStoredLocale());
      }
    };
    window.addEventListener("app-locale-change", onLocaleChange);
    window.addEventListener("storage", onStorage);
    applyLocale(getStoredLocale());
    return () => {
      window.removeEventListener("app-locale-change", onLocaleChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const rootEl = rootRef.current;
    if (!rootEl) return undefined;
    const shellRoot = document.documentElement;
    const sharedKey = "ds-theme";
    const legacyKey = "ds-theme:header-react";

    const readStoredTheme = (): "light" | "dark" | null => {
      try {
        const shared = window.localStorage.getItem(sharedKey);
        if (shared === "dark" || shared === "light") return shared;
        const legacy = window.localStorage.getItem(legacyKey);
        if (legacy === "dark" || legacy === "light") return legacy;
      } catch {
        return null;
      }
      return null;
    };

    const applyThemeToHeaderRoot = (mode: "light" | "dark") => {
      if (mode === "dark") {
        rootEl.setAttribute("data-theme", "dark");
      } else {
        rootEl.removeAttribute("data-theme");
      }
      setThemeMode(mode);
    };

    const syncFromShell = () => {
      const shellMode = getThemeFromElement(shellRoot);
      if (shellRoot.hasAttribute("data-theme")) {
        applyThemeToHeaderRoot(shellMode);
        return;
      }
      const storedMode = readStoredTheme();
      const mode = storedMode ?? shellMode;
      if (storedMode) {
        if (storedMode === "dark") {
          shellRoot.setAttribute("data-theme", "dark");
        } else {
          shellRoot.removeAttribute("data-theme");
        }
      }
      applyThemeToHeaderRoot(mode);
    };

    syncFromShell();

    const shellThemeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          applyThemeToHeaderRoot(getThemeFromElement(shellRoot));
          return;
        }
      }
    });
    shellThemeObserver.observe(shellRoot, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== sharedKey && event.key !== legacyKey) return;
      const storedMode = readStoredTheme() ?? "light";
      if (storedMode === "dark") {
        shellRoot.setAttribute("data-theme", "dark");
      } else {
        shellRoot.removeAttribute("data-theme");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      shellThemeObserver.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleToggleTheme = useCallback(() => {
    if (typeof window === "undefined") return;
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const shellRoot = document.documentElement;
    const sharedKey = "ds-theme";
    const legacyKey = "ds-theme:header-react";
    const next = getThemeFromElement(shellRoot) === "dark" ? "light" : "dark";
    if (next === "dark") {
      shellRoot.setAttribute("data-theme", "dark");
      rootEl.setAttribute("data-theme", "dark");
    } else {
      shellRoot.removeAttribute("data-theme");
      rootEl.removeAttribute("data-theme");
    }
    setThemeMode(next);
    try {
      window.localStorage.setItem(sharedKey, next);
      window.localStorage.setItem(legacyKey, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleLocaleChange = useCallback((next: "en" | "vi") => {
    setStoredLocale(next);
  }, []);

  const viewModel = useMemo(() => createPresenter(createModel()), [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <main ref={rootRef}>
        <AppView
          {...viewModel}
          locale={locale === "vi" ? "vi" : "en"}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onLocaleChange={handleLocaleChange}
          authUser={authUser}
          onSignOut={handleSignOut}
        />
      </main>
    </QueryClientProvider>
  );
}
