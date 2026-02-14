export type HeaderLocaleText = {
  live: string;
  operational: string;
  navigation: string;
  profile: string;
  signOut: string;
  openNavigation: string;
  closeNavigation: string;
  openUserMenu: string;
};

export type HeaderPalette = {
  accent: string;
  brandA: string;
  brandB: string;
};

export type HeaderLayout = {
  desktopMaxWidth: string;
};

export type HeaderMenuLinkInput = {
  text: string;
  desc?: string;
  href?: string;
};

export type HeaderMenuColumnInput = {
  title: string;
  links: HeaderMenuLinkInput[];
};

export type HeaderMenuGroupInput = {
  label: string;
  columns: HeaderMenuColumnInput[];
};

export type HeaderMenuLink = {
  id: string;
  text: string;
  desc: string;
  href: string;
};

export type HeaderMenuColumn = {
  id: string;
  title: string;
  links: HeaderMenuLink[];
};

export type HeaderMenuGroup = {
  id: string;
  label: string;
  columns: HeaderMenuColumn[];
};

export type HeaderConfig = {
  logoFallback: string;
  marqueeFallback: string;
  marqueeMaxItems: number;
  layout: HeaderLayout;
  palette: HeaderPalette;
  locale: {
    en: HeaderLocaleText;
    vi: HeaderLocaleText;
  };
  menu: HeaderMenuGroup[];
};

export type HeaderMenuSourceConfig = {
  mode: "mock" | "api";
  endpoint: string;
  timeoutMs: number;
};

type HeaderRuntimeConfig = {
  logoFallback?: string;
  marqueeFallback?: string;
  marqueeMaxItems?: number;
  palette?: Partial<HeaderPalette>;
  layout?: {
    desktopMaxWidth?: string | number;
  };
  locale?: {
    en?: Partial<HeaderLocaleText>;
    vi?: Partial<HeaderLocaleText>;
  };
  menu?: HeaderMenuGroupInput[];
  menuSource?: Partial<HeaderMenuSourceConfig>;
};

const DEFAULT_CONFIG = {
  logoFallback: "HD",
  marqueeFallback: "Realtime orchestration  ·  Secure deployment  ·  Unified observability",
  marqueeMaxItems: 6,
  layout: {
    desktopMaxWidth: "1440px",
  },
  palette: {
    accent: "#3b82f6",
    brandA: "#0f172a",
    brandB: "#334155",
  },
  locale: {
    en: {
      live: "Live",
      operational: "Operational",
      navigation: "Navigation",
      profile: "My Profile",
      signOut: "Sign out",
      openNavigation: "Open navigation",
      closeNavigation: "Close navigation",
      openUserMenu: "Open user menu",
    },
    vi: {
      live: "Live",
      operational: "Đang hoạt động",
      navigation: "Điều hướng",
      profile: "Hồ sơ cá nhân",
      signOut: "Đăng xuất",
      openNavigation: "Mở điều hướng",
      closeNavigation: "Đóng điều hướng",
      openUserMenu: "Mở menu người dùng",
    },
  },
} satisfies Omit<HeaderConfig, "menu">;

const DEFAULT_MENU_SOURCE: HeaderMenuSourceConfig = {
  mode: "mock",
  endpoint: "",
  timeoutMs: 3500,
};

const pickString = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  return next ? next : fallback;
};

const pickNumber = (value: unknown, fallback: number, min = 1, max = 12) => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value);
};

const pickDesktopMaxWidth = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const clamped = Math.min(Math.max(Math.round(value), 960), 3840);
    return `${clamped}px`;
  }

  if (typeof value !== "string") return fallback;
  const next = value.trim();
  if (!next) return fallback;

  const simpleLength = /^\d+(\.\d+)?(px|rem|em|vw|%)$/i;
  const functionLength = /^(clamp|min|max)\(.+\)$/i;
  if (simpleLength.test(next)) return next;
  if (next.length <= 96 && functionLength.test(next)) return next;

  return fallback;
};

const pickSafeHref = (value: unknown, fallback = "#") => {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  if (!next) return fallback;

  // Disallow dangerous schemes and protocol-relative URLs.
  if (/^(javascript|data|vbscript|file):/i.test(next)) return fallback;
  if (next.startsWith("//")) return fallback;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(next);
  if (!hasScheme) return next;

  try {
    const parsed = new URL(next);
    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:" ||
      parsed.protocol === "tel:"
    ) {
      return next;
    }
  } catch {
    return fallback;
  }

  return fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const makeId = (value: string, index: number) => {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned ? cleaned : `group-${index + 1}`;
};

const mergeLocaleText = (
  fallback: HeaderLocaleText,
  override?: Partial<HeaderLocaleText>
): HeaderLocaleText => ({
  live: pickString(override?.live, fallback.live),
  operational: pickString(override?.operational, fallback.operational),
  navigation: pickString(override?.navigation, fallback.navigation),
  profile: pickString(override?.profile, fallback.profile),
  signOut: pickString(override?.signOut, fallback.signOut),
  openNavigation: pickString(override?.openNavigation, fallback.openNavigation),
  closeNavigation: pickString(override?.closeNavigation, fallback.closeNavigation),
  openUserMenu: pickString(override?.openUserMenu, fallback.openUserMenu),
});

const fallbackMenuFromHeadings = (headings: string[]): HeaderMenuGroupInput[] => {
  const items = headings.filter(Boolean);
  const safe = (index: number, fallback: string) => items[index] || fallback;

  return [
    {
      label: safe(0, "Platform"),
      columns: [
        {
          title: "Workspace",
          links: [
            { text: safe(1, "Projects"), desc: "Manage repos & applications" },
            { text: safe(2, "Pipelines"), desc: "CI/CD and release workflows" },
            { text: safe(3, "Deployments"), desc: "Preview and production rollout" },
          ],
        },
        {
          title: "Insights",
          links: [
            { text: safe(4, "Analytics"), desc: "Usage and performance metrics" },
            { text: safe(5, "Audit log"), desc: "Track user/system activity" },
            { text: "Reports", desc: "Scheduled executive summaries" },
          ],
        },
      ],
    },
    {
      label: safe(2, "Solutions"),
      columns: [
        {
          title: "Growth",
          links: [
            { text: "Acquisition", desc: "Onboarding and conversion" },
            { text: "Activation", desc: "Feature adoption journeys" },
            { text: "Retention", desc: "Engagement and lifecycle" },
          ],
        },
        {
          title: "Operations",
          links: [
            { text: "Incidents", desc: "Alerting and response" },
            { text: "Playbooks", desc: "Runbooks and SOPs" },
            { text: "Automation", desc: "Workflow orchestration" },
          ],
        },
      ],
    },
    {
      label: safe(4, "Resources"),
      columns: [
        {
          title: "Developer",
          links: [
            { text: "API Docs", desc: "REST and GraphQL references" },
            { text: "CLI", desc: "Command-line productivity" },
            { text: "SDK", desc: "Client integration packages" },
          ],
        },
        {
          title: "Support",
          links: [
            { text: "Help center", desc: "Guides and FAQs" },
            { text: "Release notes", desc: "Latest product updates" },
            { text: "Community", desc: "Developer forum and feedback" },
          ],
        },
      ],
    },
    {
      label: safe(6, "Integrations"),
      columns: [
        {
          title: "Channels",
          links: [
            { text: "Email", desc: "Campaign and notification delivery" },
            { text: "SMS", desc: "Transactional and OTP workflows" },
            { text: "Social", desc: "Publishing and engagement sync" },
          ],
        },
        {
          title: "Data Sync",
          links: [
            { text: "Webhooks", desc: "Real-time event forwarding" },
            { text: "Connectors", desc: "CRM and ERP adapters" },
            { text: "Warehouse", desc: "Batch export and analytics feed" },
          ],
        },
      ],
    },
  ];
};

const normalizeMenu = (groups: HeaderMenuGroupInput[]): HeaderMenuGroup[] => {
  return groups
    .map((group, groupIndex) => {
      const label = pickString(group?.label, `Group ${groupIndex + 1}`);
      const groupId = makeId(label, groupIndex);
      const columns = Array.isArray(group?.columns) ? group.columns : [];

      const normalizedColumns: HeaderMenuColumn[] = columns
        .map((column, columnIndex) => {
          const title = pickString(column?.title, `Section ${columnIndex + 1}`);
          const links = Array.isArray(column?.links) ? column.links : [];

          const normalizedLinks: HeaderMenuLink[] = links
            .map((link, linkIndex) => {
              const text = pickString(link?.text, "");
              if (!text) return null;
              const desc = pickString(link?.desc, "");
              const href = pickSafeHref(link?.href, "#");
              return {
                id: `${groupId}-link-${columnIndex + 1}-${linkIndex + 1}`,
                text,
                desc,
                href,
              };
            })
            .filter((value): value is HeaderMenuLink => Boolean(value));

          if (!normalizedLinks.length) return null;

          return {
            id: `${groupId}-col-${columnIndex + 1}`,
            title,
            links: normalizedLinks,
          };
        })
        .filter((value): value is HeaderMenuColumn => Boolean(value));

      if (!normalizedColumns.length) return null;

      return {
        id: groupId,
        label,
        columns: normalizedColumns,
      };
    })
    .filter((value): value is HeaderMenuGroup => Boolean(value));
};

const resolveRuntimeMenu = (value: unknown): HeaderMenuGroupInput[] | null => {
  if (!Array.isArray(value)) return null;
  const groups = value.filter((item): item is HeaderMenuGroupInput => isRecord(item));
  if (!groups.length) return null;
  return groups;
};

const readRuntimeConfig = (): HeaderRuntimeConfig => {
  const runtimeRaw =
    typeof window !== "undefined" ? (window as any).__MFE_HEADER_CONFIG__ : undefined;
  if (!isRecord(runtimeRaw)) return {};
  return runtimeRaw as HeaderRuntimeConfig;
};

const resolveMenuSource = (runtime: HeaderRuntimeConfig): HeaderMenuSourceConfig => {
  const override = isRecord(runtime.menuSource) ? runtime.menuSource : undefined;
  const modeRaw = pickString(override?.mode, DEFAULT_MENU_SOURCE.mode);
  const mode = modeRaw === "api" ? "api" : "mock";
  return {
    mode,
    endpoint: pickString(override?.endpoint, DEFAULT_MENU_SOURCE.endpoint),
    timeoutMs: pickNumber(override?.timeoutMs, DEFAULT_MENU_SOURCE.timeoutMs, 500, 15000),
  };
};

export const resolveHeaderRuntimeOptions = () => {
  const runtime = readRuntimeConfig();
  return {
    menuSource: resolveMenuSource(runtime),
  };
};

export const resolveHeaderConfig = (
  title: string,
  headings: string[],
  menuOverride?: HeaderMenuGroupInput[] | null
): HeaderConfig => {
  const runtime = readRuntimeConfig();

  const paletteOverride = isRecord(runtime.palette) ? runtime.palette : undefined;
  const layoutOverride = isRecord(runtime.layout) ? runtime.layout : undefined;
  const localeOverride = isRecord(runtime.locale) ? runtime.locale : undefined;
  const enOverride = localeOverride && isRecord(localeOverride.en) ? localeOverride.en : undefined;
  const viOverride = localeOverride && isRecord(localeOverride.vi) ? localeOverride.vi : undefined;

  const externalMenu =
    Array.isArray(menuOverride) && menuOverride.length > 0 ? menuOverride : null;
  const menuFromRuntime = resolveRuntimeMenu(runtime.menu);
  const menuFallback = fallbackMenuFromHeadings(headings);
  const menu = normalizeMenu(
    externalMenu || menuFromRuntime || menuFallback
  );

  return {
    logoFallback: pickString(runtime.logoFallback, title.slice(0, 2).toUpperCase() || DEFAULT_CONFIG.logoFallback),
    marqueeFallback: pickString(runtime.marqueeFallback, DEFAULT_CONFIG.marqueeFallback),
    marqueeMaxItems: pickNumber(runtime.marqueeMaxItems, DEFAULT_CONFIG.marqueeMaxItems),
    layout: {
      desktopMaxWidth: pickDesktopMaxWidth(
        layoutOverride?.desktopMaxWidth,
        DEFAULT_CONFIG.layout.desktopMaxWidth
      ),
    },
    palette: {
      accent: pickString(paletteOverride?.accent, DEFAULT_CONFIG.palette.accent),
      brandA: pickString(paletteOverride?.brandA, DEFAULT_CONFIG.palette.brandA),
      brandB: pickString(paletteOverride?.brandB, DEFAULT_CONFIG.palette.brandB),
    },
    locale: {
      en: mergeLocaleText(DEFAULT_CONFIG.locale.en, enOverride),
      vi: mergeLocaleText(DEFAULT_CONFIG.locale.vi, viOverride),
    },
    menu,
  };
};
