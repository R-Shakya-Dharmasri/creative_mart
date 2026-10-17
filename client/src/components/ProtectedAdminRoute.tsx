
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { verifyAdmin } from "../services/authService";

type AuthStatus =
  | "loading"
  | "authorized"
  | "unauthorized";

export default function ProtectedAdminRoute() {
  const [status, setStatus] =
    useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    const token = sessionStorage.getItem(
      "srivora_admin_token"
    );

    if (!token) {
      setStatus("unauthorized");
      return;
    }

    verifyAdmin(token)
      .then((data) => {
        if (active) {
          setStatus(
            data.authenticated && data.role === "admin"
              ? "authorized"
              : "unauthorized"
          );
        }
      })
      .catch(() => {
        sessionStorage.removeItem(
          "srivora_admin_token"
        );

        if (active) {
          setStatus("unauthorized");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <p className="text-white">
          Verifying admin session...
        </p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
