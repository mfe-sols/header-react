import type { HeaderLocale } from "../types";
import type { HeaderMenuGroup } from "../header.config";
import { DesktopNavItem } from "./DesktopNavItem";

type DesktopNavProps = {
  locale: HeaderLocale;
  menu: HeaderMenuGroup[];
};

export const DesktopNav = ({ locale, menu }: DesktopNavProps) => (
  <nav className="hdr-desktop-nav" aria-label={locale === "vi" ? "Điều hướng chính" : "Primary navigation"}>
    {menu.map((item) => (
      <DesktopNavItem key={item.id} item={item} />
    ))}
  </nav>
);
