// frontend/src/app/simone-station/layout.tsx
"use client";

import React from "react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";

/**
 * Diese Layout-Komponente stellt sicher, dass der SIMONE Station-Bereich
 * vom UserDashboardLayout umschlossen wird, welches die Hauptnavigation
 * und das Seitenlayout für authentifizierte Benutzer bereitstellt.
 */
export default function SimoneStationSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
