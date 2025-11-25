// frontend/src/app/profile/layout.tsx
"use client";

import React from "react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";

/**
 * Diese Layout-Komponente stellt sicher, dass die Profilseite und alle
 * potenziellen Unterseiten vom UserDashboardLayout umschlossen werden.
 * Das UserDashboardLayout selbst enthält die themenbewusste Seitenleiste,
 * den Header und den Hintergrund für den authentifizierten Teil der App.
 */
export default function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
