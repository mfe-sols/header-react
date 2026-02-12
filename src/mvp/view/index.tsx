import { useState, useRef, useCallback, useEffect } from "react";

type AuthUserInfo = {
  id: string;
  email?: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
};

type Props = {
  title: string;
  headings: string[];
  locale: "en" | "vi";
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  onLocaleChange: (next: "en" | "vi") => void;
  authUser?: AuthUserInfo | null;
  onSignOut?: () => void;
};

type MegaMenuItem = {
  label: string;
  columns: { title: string; links: { text: string; desc: string }[] }[];
};

const createMegaMenu = (headings: string[]): MegaMenuItem[] => {
  const items = headings.filter(Boolean);
  const safe = (i: number, fb: string) => items[i] || fb;
  return [
    {
      label: safe(0, "Platform"),
      columns: [
        {
          title: "Workspace",
          links: [
            { text: safe(1, "Projects"), desc: "Manage repos & apps" },
            { text: safe(2, "Pipelines"), desc: "CI/CD workflows" },
            { text: safe(3, "Deployments"), desc: "Ship to production" },
          ],
        },
        {
          title: "Insights",
          links: [
            { text: safe(4, "Analytics"), desc: "Metrics & dashboards" },
            { text: safe(5, "Audit log"), desc: "Activity tracking" },
            { text: "Reports", desc: "Scheduled summaries" },
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
            { text: "Acquisition", desc: "User onboarding flows" },
            { text: "Activation", desc: "Feature adoption" },
            { text: "Retention", desc: "Engagement analytics" },
          ],
        },
        {
          title: "Operations",
          links: [
            { text: "Incidents", desc: "Real-time alerting" },
            { text: "Playbooks", desc: "Runbook automation" },
            { text: "Automation", desc: "Workflow triggers" },
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
            { text: "API Docs", desc: "REST & GraphQL refs" },
            { text: "CLI", desc: "Command-line tools" },
            { text: "SDK", desc: "Client libraries" },
          ],
        },
        {
          title: "Support",
          links: [
            { text: "Help center", desc: "Guides & FAQs" },
            { text: "Release notes", desc: "What's new" },
            { text: "Community", desc: "Forums & Discord" },
          ],
        },
      ],
    },
  ];
};

/* ── Icon components ──────────────────────────────────────────────── */
const IconSearch = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="m13 13 4.5 4.5" strokeLinecap="round" />
  </svg>
);

const IconChevron = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

const IconSun = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="10" cy="10" r="3.5" />
    <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
  </svg>
);

const IconMoon = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.3 11.1A7.5 7.5 0 0 1 8.9 2.7a7.5 7.5 0 1 0 8.4 8.4Z" />
  </svg>
);

const IconArrowRight = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const IconBroadcast = ({ style }: { style?: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="8" cy="8" r="2" />
    <path d="M4.35 4.35a5.16 5.16 0 0 0 0 7.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M11.65 4.35a5.16 5.16 0 0 1 0 7.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M2.22 2.22a8.27 8.27 0 0 0 0 11.56" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M13.78 2.22a8.27 8.27 0 0 1 0 11.56" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/* ── NavItem with React-controlled hover ─────────────────────────── */
type NavItemProps = {
  menu: MegaMenuItem;
  isDark: boolean;
  key?: React.Key;
};

const NavItem: React.FC<NavItemProps> = ({
  menu,
  isDark,
}) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 14,
          fontWeight: 500,
          color: isDark ? "#94a3b8" : "#64748b",
          background: open ? (isDark ? "#1e293b" : "#f8fafc") : "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background .15s, color .15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "#1e293b" : "#f8fafc";
          e.currentTarget.style.color = isDark ? "#f1f5f9" : "#0f172a";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b";
          }
        }}
      >
        {menu.label}
        <IconChevron style={{ width: 14, height: 14 }} />
      </button>

      {/* Dropdown panel */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "100%",
          zIndex: 9999,
          width: 480,
          borderRadius: 12,
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          padding: 20,
          background: isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          boxShadow: isDark
            ? "0 20px 40px rgba(0,0,0,0.5)"
            : "0 20px 40px rgba(15,23,42,0.12)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(4px)" : "translateY(12px)",
          transition: "opacity .2s cubic-bezier(.4,0,.2,1), transform .2s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {menu.columns.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  marginBottom: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: isDark ? "#64748b" : "#94a3b8",
                }}
              >
                {col.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {col.links.map((link) => {
                  const linkKey = `${col.title}-${link.text}`;
                  const isHovered = hoveredLink === linkKey;
                  return (
                    <button
                      key={linkKey}
                      type="button"
                      onMouseEnter={() => setHoveredLink(linkKey)}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 8,
                        padding: "8px 10px",
                        textAlign: "left",
                        background: isHovered ? (isDark ? "#1e293b" : "#f8fafc") : "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background .12s",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: isDark ? "#e2e8f0" : "#1e293b",
                          }}
                        >
                          {link.text}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: isDark ? "#64748b" : "#94a3b8",
                            marginTop: 1,
                          }}
                        >
                          {link.desc}
                        </div>
                      </div>
                      <IconArrowRight
                        style={{
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                          opacity: isHovered ? 0.5 : 0,
                          transform: isHovered ? "translateX(0)" : "translateX(-4px)",
                          transition: "opacity .15s, transform .15s",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Icons (additional) ───────────────────────────────────────────── */
const IconUser = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx={12} cy={8} r={4} />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);

const IconLogout = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1={21} y1={12} x2={9} y2={12} />
  </svg>
);

/* ── User avatar with dropdown ────────────────────────────────────── */
const UserAvatar = ({
  user,
  isDark,
  locale,
  onSignOut,
}: {
  user: AuthUserInfo;
  isDark: boolean;
  locale: "en" | "vi";
  onSignOut?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const displayName = user.displayName || user.name || user.email || "User";
  const email = user.email || "";
  const initials = (() => {
    const src = displayName.trim();
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    return (parts[0]?.slice(0, 2) ?? "U").toUpperCase();
  })();

  const borderColor = isDark ? "#1e293b" : "#e2e8f0";
  const surfaceMuted = isDark ? "#1e293b" : "#f8fafc";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";

  const [imgError, setImgError] = useState(false);
  const hasPhoto = Boolean(user.photoURL) && !imgError;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${open ? (isDark ? "#3b82f6" : "#3b82f6") : borderColor}`,
          background: hasPhoto
            ? "transparent"
            : isDark
              ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
              : "linear-gradient(135deg,#3b82f6,#6366f1)",
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: open
            ? `0 0 0 3px ${isDark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.15)"}`
            : "none",
        }}
      >
        {hasPhoto ? (
          <img
            src={user.photoURL}
            alt={displayName}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            {initials}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          zIndex: 9999,
          width: 280,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          background: isDark ? "rgba(15,23,42,0.98)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(16px)",
          boxShadow: isDark
            ? "0 20px 40px rgba(0,0,0,0.5)"
            : "0 20px 40px rgba(15,23,42,0.12)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity .2s cubic-bezier(.4,0,.2,1), transform .2s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
        }}
      >
        {/* User info header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 12px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: hasPhoto
                ? "transparent"
                : isDark
                  ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                  : "linear-gradient(135deg,#3b82f6,#6366f1)",
            }}
          >
            {hasPhoto ? (
              <img
                src={user.photoURL}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{initials}</span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: textPrimary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </div>
            {email && (
              <div
                style={{
                  fontSize: 12,
                  color: textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                {email}
              </div>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div style={{ padding: "6px 8px" }}>
          {/* Profile link */}
          <a
            href="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: textPrimary,
              textDecoration: "none",
              transition: "background .12s",
              cursor: "pointer",
              border: "none",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = surfaceMuted;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconUser style={{ width: 16, height: 16, flexShrink: 0, color: textMuted }} />
            {locale === "vi" ? "Hồ sơ cá nhân" : "My Profile"}
          </a>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: borderColor,
              margin: "4px 12px",
            }}
          />

          {/* Sign out */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: isDark ? "#f87171" : "#dc2626",
              textDecoration: "none",
              transition: "background .12s",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconLogout
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                color: isDark ? "#f87171" : "#dc2626",
              }}
            />
            {locale === "vi" ? "Đăng xuất" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
};
/* ── Main view ────────────────────────────────────────────────────── */
export const AppView = ({
  title,
  headings,
  locale,
  themeMode,
  onToggleTheme,
  onLocaleChange,
  authUser,
  onSignOut,
}: Props): React.JSX.Element => {
  const megaMenu = createMegaMenu(headings);
  const marqueeItems = headings.filter(Boolean).slice(0, 6);
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const isDark = themeMode === "dark";
  const marqueeLabel = marqueeItems.length
    ? marqueeItems.join("  ·  ")
    : "Realtime orchestration  ·  Secure deployment  ·  Unified observability";
  const searchPlaceholder = locale === "vi" ? "Tìm kiếm..." : "Search...";

  const [searchFocused, setSearchFocused] = useState(false);

  /* ── colour tokens (only safe static Tailwind classes) ─────────── */
  const surface = isDark ? "#0f172a" : "#ffffff";
  const surfaceMuted = isDark ? "#1e293b" : "#f8fafc";
  const borderColor = isDark ? "#1e293b" : "#e2e8f0";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textSubtle = isDark ? "#64748b" : "#94a3b8";

  return (
    <header
      style={{
        width: "100%",
        background: surface,
        color: textPrimary,
        fontFamily: "ui-sans-serif,system-ui,sans-serif,'Apple Color Emoji','Segoe UI Emoji'",
      }}
    >
      <style>{`
        @keyframes __hdr_marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .__hdr_marquee_track{animation:__hdr_marquee 32s linear infinite;will-change:transform}
        .__hdr_marquee_track:hover{animation-play-state:paused}
      `}</style>

      {/* ── Broadcast strip ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${borderColor}`,
          padding: "6px 16px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            border: `1px solid ${isDark ? "rgba(52,211,153,0.25)" : "#a7f3d0"}`,
            background: isDark ? "rgba(52,211,153,0.08)" : "#ecfdf5",
            padding: "2px 10px",
            fontSize: 12,
            fontWeight: 500,
            color: isDark ? "#6ee7b7" : "#065f46",
            whiteSpace: "nowrap",
          }}
        >
          <IconBroadcast style={{ width: 12, height: 12 }} />
          <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {locale === "vi" ? "Live" : "Live"}
          </span>
        </div>
        <div style={{ position: "relative", minWidth: 0, flex: 1, overflow: "hidden" }}>
          <div
            className="__hdr_marquee_track"
            style={{
              display: "flex",
              width: "max-content",
              alignItems: "center",
              gap: 24,
              whiteSpace: "nowrap",
              fontSize: 12,
              color: textMuted,
            }}
          >
            <span>{marqueeLabel}</span>
            <span aria-hidden="true">{marqueeLabel}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: surfaceMuted,
              color: textMuted,
              cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "#334155" : "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = surfaceMuted; }}
          >
            {isDark ? <IconSun style={{ width: 16, height: 16 }} /> : <IconMoon style={{ width: 16, height: 16 }} />}
          </button>
          <div
            style={{
              display: "inline-flex",
              height: 32,
              alignItems: "center",
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: surfaceMuted,
              fontSize: 12,
              fontWeight: 500,
              color: textMuted,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              style={{
                height: "100%",
                padding: "0 10px",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: locale === "en" ? 600 : 500,
                background: locale === "en" ? (isDark ? "#334155" : "#e2e8f0") : "transparent",
                color: locale === "en" ? textPrimary : textMuted,
                transition: "background .15s, color .15s",
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("vi")}
              style={{
                height: "100%",
                padding: "0 10px",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: locale === "vi" ? 600 : 500,
                background: locale === "vi" ? (isDark ? "#334155" : "#e2e8f0") : "transparent",
                color: locale === "vi" ? textPrimary : textMuted,
                transition: "background .15s, color .15s",
              }}
            >
              VI
            </button>
          </div>
          {/* Avatar (only when authenticated) */}
          {authUser && (
            <UserAvatar user={authUser} isDark={isDark} locale={locale} onSignOut={onSignOut} />
          )}
        </div>
      </div>

      {/* ── Main header row ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px" }}>
        {/* Brand */}
        <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              background: isDark
                ? "linear-gradient(135deg,#34d399,#22d3ee)"
                : "linear-gradient(135deg,#0f172a,#334155)",
              color: isDark ? "#020617" : "#ffffff",
              boxShadow: isDark
                ? "0 8px 20px rgba(52,211,153,0.25)"
                : "0 8px 20px rgba(15,23,42,0.2)",
            }}
          >
            {initials || "HD"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.2,
                color: textPrimary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2,
                fontSize: 12,
                color: textMuted,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isDark ? "#34d399" : "#22c55e",
                }}
              />
              {locale === "vi" ? "Đang hoạt động" : "Operational"}
            </span>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 24,
            background: borderColor,
            flexShrink: 0,
          }}
        />

        {/* Navigation */}
        <nav style={{ display: "flex", minWidth: 0, flex: 1, alignItems: "center", gap: 2 }}>
          {megaMenu.map((menu) => (
            <NavItem key={menu.label} menu={menu} isDark={isDark} />
          ))}
        </nav>

        {/* Search */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <label
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              border: `1px solid ${searchFocused ? (isDark ? "#3b82f6" : "#3b82f6") : borderColor}`,
              background: surfaceMuted,
              padding: "8px 12px",
              fontSize: 14,
              transition: "border-color .2s, box-shadow .2s, width .25s ease",
              width: searchFocused ? 280 : 200,
              boxShadow: searchFocused ? `0 0 0 3px ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"}` : "none",
            }}
          >
            <IconSearch
              style={{ width: 16, height: 16, marginRight: 8, flexShrink: 0, color: textSubtle }}
            />
            <input
              type="search"
              placeholder={searchPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                background: "transparent",
                outline: "none",
                border: "none",
                fontSize: 14,
                color: textPrimary,
                colorScheme: isDark ? "dark" : "light",
              }}
            />
            {!searchFocused && (
              <kbd
                style={{
                  marginLeft: 8,
                  flexShrink: 0,
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  padding: "2px 6px",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: textSubtle,
                  lineHeight: 1.4,
                }}
              >
                ⌘K
              </kbd>
            )}
          </label>
        </div>
      </div>

      {/* ── Mobile nav pills (hidden on large screens via inline media) ── */}
      <div
        className="hdr-mobile-nav"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderTop: `1px solid ${borderColor}`,
          padding: "8px 16px",
        }}
      >
        <style>{`
          @media(min-width:1024px){.hdr-mobile-nav{display:none!important}}
        `}</style>
        {megaMenu.map((menu) => (
          <button
            key={`m-${menu.label}`}
            type="button"
            style={{
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              background: surfaceMuted,
              color: textMuted,
              border: "none",
              cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "#334155" : "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = surfaceMuted; }}
          >
            {menu.label}
          </button>
        ))}
      </div>
    </header>
  );
};
