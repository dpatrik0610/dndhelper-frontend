import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeToken } from "@utils/decodeToken";
import { handleLogout } from "@utils/handleLogout";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

function isTokenExpired(token: string | null | undefined) {
  if (!token) return true;
  const expiry = decodeToken(token)?.exp;
  if (!expiry) return true;
  const now = Date.now() / 1000;
  return expiry < now;
}

export function useTokenExpiryGuard(token?: string | null, fallbackToken?: string | null) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/register") return;

    const tokens = [token, fallbackToken].filter(Boolean) as string[];
    if (tokens.length === 0) return;

    const allExpired = tokens.every((t) => isTokenExpired(t));
    if (!allExpired) return;

    showNotification({
      id: "expiredToken",
      title: "Token expired",
      message: "Your login token expired, now logging out.",
      color: SectionColor.Red,
      withBorder: true,
    });

    handleLogout();
    navigate("/login");
  }, [token, fallbackToken, navigate, location.pathname]);
}
