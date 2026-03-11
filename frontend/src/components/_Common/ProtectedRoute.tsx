import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../../utils/authUtils";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const token = localStorage.getItem("access_token");

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("access_token");
    return <Navigate to="/acesso" replace />;
  }

  return children;
}
