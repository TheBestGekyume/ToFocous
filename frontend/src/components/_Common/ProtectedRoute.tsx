import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getTokenExpiration } from "../../utils/tokenUtils";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/acesso" replace />;
  }

  const exp = getTokenExpiration(token);

  if (exp) {
    const now = Math.floor(Date.now() / 1000);

    if (exp < now) {
      return <Navigate to="/acesso" replace />;
    }
  }

  return children;
}