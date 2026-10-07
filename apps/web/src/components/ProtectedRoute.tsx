import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  isAuthenticated,
  refreshToken,
} from "../api/auth";

export default function ProtectedRoute() {
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      // Access token is already available.
      if (isAuthenticated()) {
        if (mounted) {
          setAuthenticated(true);
          setCheckingSession(false);
        }

        return;
      }

      // No access token, but a refresh token may
      // still represent a valid session.
      const storedRefreshToken =
        localStorage.getItem("shef_refresh_token");

      if (!storedRefreshToken) {
        if (mounted) {
          setAuthenticated(false);
          setCheckingSession(false);
        }

        return;
      }

      try {
        await refreshToken();

        if (mounted) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error(
          "SHEF session refresh failed:",
          error,
        );

        localStorage.removeItem("shef_token");
        localStorage.removeItem(
          "shef_refresh_token",
        );
        localStorage.removeItem("shef_user");

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}