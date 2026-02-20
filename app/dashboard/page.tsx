"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * L'ancienne page dashboard a été supprimée.
 * Redirection vers la page profil.
 */
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400" />
    </div>
  );
}
