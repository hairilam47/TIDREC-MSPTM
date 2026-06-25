import React from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });

  React.useEffect(() => {
    if (isError) {
      window.location.href = "/login";
    }
  }, [isError]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) return null;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });

  React.useEffect(() => {
    if (isError) {
      window.location.href = "/login";
    } else if (user && user.role !== "admin" && user.role !== "super_admin") {
      // Non-admin authenticated users → redirect to customer portal
      window.location.href = "/portal/";
    }
  }, [isError, user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return null;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });

  React.useEffect(() => {
    if (isError) {
      window.location.href = "/login";
    } else if (user && user.role !== "super_admin") {
      window.location.href = "/admin";
    }
  }, [isError, user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user || user.role !== "super_admin") return null;
  return <>{children}</>;
}
