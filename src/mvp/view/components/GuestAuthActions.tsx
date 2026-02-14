import type { HeaderLocale } from "../types";
import { IconSignIn, IconUserPlus } from "./icons";

type GuestAuthActionsProps = {
  locale: HeaderLocale;
};

export const GuestAuthActions = ({ locale }: GuestAuthActionsProps) => {
  const registerLabel = locale === "vi" ? "Đăng ký" : "Register";
  const loginLabel = locale === "vi" ? "Đăng nhập" : "Login";

  return (
    <div className="hdr-auth-actions">
      <a
        href="/auth/register"
        className="hdr-auth-btn is-register is-icon"
        aria-label={registerLabel}
        title={registerLabel}
      >
        <IconUserPlus />
      </a>
      <a
        href="/auth/login"
        className="hdr-auth-btn is-login is-icon"
        aria-label={loginLabel}
        title={loginLabel}
      >
        <IconSignIn />
      </a>
    </div>
  );
};
