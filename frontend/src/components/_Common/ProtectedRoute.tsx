import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/acesso" replace />;
  }

  return children;
}
