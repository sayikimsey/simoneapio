// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";
// import { FiUser, FiUsers, FiLogOut, FiLoader, FiCpu } from "react-icons/fi";

// /**
//  * Lade-Spinner für den anfänglichen, bildschirmfüllenden Ladevorgang.
//  */
// const FullscreenSpinner = ({ message }: { message: string }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-lg text-[var(--color-text-inverted)]">{message}</p>
//     </div>
//   </div>
// );

// /**
//  * Lade-Spinner für Inhaltsübergänge innerhalb des Layouts.
//  */
// const ContentSpinner = ({ message }: { message: string }) => (
//   <div className="flex justify-center items-center py-20">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-base text-[var(--color-text-secondary)]">{message}</p>
//     </div>
//   </div>
// );

// // Globale Header-Höhe in Pixel.
// const GLOBAL_HEADER_HEIGHT_PX = 64;

// /**
//  * Definiert die Struktur für ein Navigationselement in der Seitenleiste.
//  */
// interface UserNavItem {
//   href: string;
//   icon: React.ElementType;
//   label: string;
// }

// /**
//  * Hauptlayout für den angemeldeten Benutzerbereich.
//  * Enthält die Seitenleiste und den Hauptinhaltsbereich.
//  */
// export default function UserDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
//   const [isAuthLoading, setIsAuthLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   // Überprüft den Anmeldestatus des Benutzers beim Laden der Komponente.
//   useEffect(() => {
//     const checkUserStatus = async () => {
//       setIsAuthLoading(true);
//       try {
//         const response = await apiClient("/profile/me", { method: "GET" });
//         const data = await response.json();
//         const user: UserData | null = data.user || null;
//         if (user) {
//           setCurrentUser(user);
//         } else {
//           router.replace("/auth/signin?error=session_expired_or_invalid");
//         }
//       } catch {
//         router.replace("/auth/signin?error=auth_check_failed");
//       } finally {
//         setIsAuthLoading(false);
//       }
//     };
//     checkUserStatus();
//   }, [router]);

//   /**
//    * Behandelt den Abmeldevorgang des Benutzers.
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await apiClient("/auth/logout", { method: "POST" });
//       setCurrentUser(null);
//       router.push("/auth/signin");
//     } catch {
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   // Zeigt einen Lade-Spinner, während der Benutzerstatus überprüft wird.
//   if (isAuthLoading || !currentUser) {
//     return <FullscreenSpinner message="Lade Ihren Kontobereich..." />;
//   }

//   // Definiert die Navigationselemente für die Seitenleiste.
//   const navItems: UserNavItem[] = [
//     { href: "/profile", icon: FiUser, label: "Profilübersicht" },
//     { href: "/simone-station", icon: FiCpu, label: "SIMONE Station" },
//   ];

//   // Fügt den Admin-Panel-Link für Administratoren hinzu.
//   if (currentUser.role === "admin") {
//     navItems.splice(1, 0, {
//       href: "/admin",
//       icon: FiUsers,
//       label: "Admin-Panel",
//     });
//   }

//   return (
//     <div className="flex relative">
//       <aside
//         onMouseEnter={() => setIsSidebarOpen(true)}
//         onMouseLeave={() => setIsSidebarOpen(false)}
//         className={`app-sidebar flex flex-col fixed left-0 shadow-lg z-20 transition-all duration-300 ease-in-out ${
//           isSidebarOpen ? "w-64" : "w-20"
//         }`}
//         style={{
//           top: `${GLOBAL_HEADER_HEIGHT_PX}px`,
//           height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT_PX}px)`,
//         }}
//       >
//         <div className="px-4 py-3 sidebar-border border-b flex items-center justify-center">
//           {isSidebarOpen && (
//             <span className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
//               Mein Konto
//             </span>
//           )}
//         </div>

//         {isSidebarOpen && (
//           <div className="px-4 pt-3 pb-3 sidebar-border border-b">
//             <p
//               className="text-xs text-[var(--color-text-secondary)] truncate"
//               title={currentUser.email}
//             >
//               {currentUser.email}
//             </p>
//           </div>
//         )}

//         <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
//           {navItems.map((item) => {
//             const isActive =
//               (item.href === "/profile" && pathname === item.href) ||
//               (item.href !== "/profile" && pathname.startsWith(item.href));
//             return (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 title={item.label}
//                 data-active={isActive}
//                 className={`sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
//                   isSidebarOpen ? "" : "justify-center h-12"
//                 }`}
//               >
//                 <item.icon
//                   className={`w-5 h-5 flex-shrink-0 ${
//                     isSidebarOpen ? "mr-3" : ""
//                   }`}
//                 />
//                 {isSidebarOpen && (
//                   <span className="truncate">{item.label}</span>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-2 sidebar-border border-t">
//           <button
//             onClick={handleLogout}
//             disabled={isLoggingOut}
//             className={`sidebar-logout-button w-full flex items-center text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
//               isSidebarOpen ? "px-3 py-2.5" : "justify-center h-12"
//             }`}
//           >
//             {isLoggingOut ? (
//               <FiLoader
//                 className={`w-5 h-5 animate-spin ${
//                   isSidebarOpen ? "mr-3" : ""
//                 }`}
//               />
//             ) : (
//               <FiLogOut
//                 className={`w-5 h-5 flex-shrink-0 ${
//                   isSidebarOpen ? "mr-3" : ""
//                 }`}
//               />
//             )}
//             {isSidebarOpen && (
//               <span>{isLoggingOut ? "Wird abgemeldet..." : "Abmelden"}</span>
//             )}
//           </button>
//         </div>
//       </aside>

//       <main
//         className={`flex-1 bg-[var(--color-background)] transition-all duration-300 ease-in-out ${
//           isSidebarOpen ? "ml-64" : "ml-20"
//         }`}
//         style={{ paddingTop: `${GLOBAL_HEADER_HEIGHT_PX}px` }}
//       >
//         <div className="p-6 md:p-8 lg:p-10 min-h-full">
//           <Suspense
//             fallback={<ContentSpinner message="Seiteninhalt wird geladen..." />}
//           >
//             {children}
//           </Suspense>
//         </div>
//       </main>
//     </div>
//   );
// }





// frontend/src/app/(user)/layout.tsx







// "use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

// import React, { useEffect, useState, Suspense } from "react"; // React Hooks für Zustand, Lebenszyklus und Suspense für Ladezustände.
// import { useRouter, usePathname } from "next/navigation"; // Next.js Hooks für Navigation und den aktuellen Pfad.
// import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
// import { apiClient } from "@/lib/apiClient"; // Benutzerdefinierter API-Client für Backend-Anfragen.
// import { UserData } from "@/types"; // Typdefinitionen für Benutzerdaten.
// import { FiUser, FiUsers, FiLogOut, FiLoader, FiCpu } from "react-icons/fi"; // Feather Icons für UI-Elemente.

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: FullscreenSpinner
//  * Ein bildschirmfüllender Lade-Spinner, der für den anfänglichen, kritischen
//  * Ladevorgang (z.B. Überprüfung des Anmeldestatus) verwendet wird.
//  * -------------------------------------------------------------------
//  */
// const FullscreenSpinner = ({ message }: { message: string }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" /> {/* Spinner-Icon mit Akzentfarbe. */}
//       <p className="text-lg text-[var(--color-text-inverted)]">{message}</p> {/* Lade-Nachricht in invertierter Farbe. */}
//     </div>
//   </div>
// );

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: ContentSpinner
//  * Ein kleinerer Lade-Spinner, der für Inhaltsübergänge oder Ladevorgänge
//  * innerhalb des Hauptinhaltsbereichs des Layouts verwendet wird.
//  * -------------------------------------------------------------------
//  */
// const ContentSpinner = ({ message }: { message: string }) => (
//   <div className="flex justify-center items-center py-20">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-4" /> {/* Spinner-Icon mit Akzentfarbe. */}
//       <p className="text-base text-[var(--color-text-secondary)]">{message}</p> {/* Lade-Nachricht in Sekundärfarbe. */}
//     </div>
//   </div>
// );

// // Globale Konstante für die Höhe des Headers in Pixeln.
// // Wird verwendet, um die Position der Seitenleiste und des Hauptinhalts zu berechnen.
// const GLOBAL_HEADER_HEIGHT_PX = 64;

// /**
//  * -------------------------------------------------------------------
//  * ✅ Interface: UserNavItem
//  * Definiert die Struktur für ein Navigationselement in der Seitenleiste.
//  * -------------------------------------------------------------------
//  */
// interface UserNavItem {
//   href: string; // Der Pfad, zu dem der Link führt.
//   icon: React.ElementType; // Die React-Komponente des Icons (z.B. FiUser).
//   label: string; // Der Anzeigetext für das Navigationselement.
// }

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: UserDashboardLayout
//  * Das Hauptlayout für den angemeldeten Benutzerbereich.
//  * Es enthält die Seitenleiste und den Hauptinhaltsbereich.
//  * Führt eine Authentifizierungsprüfung durch, um sicherzustellen,
//  * dass nur angemeldete Benutzer Zugriff haben.
//  * -------------------------------------------------------------------
//  */
// export default function UserDashboardLayout({
//   children, // Die Kind-Komponenten, die im Hauptinhaltsbereich gerendert werden sollen.
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter(); // Hook zum Navigieren.
//   const pathname = usePathname(); // Hook zum Abrufen des aktuellen Pfadnamens.
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null); // Speichert die Daten des aktuell angemeldeten Benutzers.
//   const [isAuthLoading, setIsAuthLoading] = useState(true); // Zeigt an, ob der Authentifizierungsstatus überprüft wird.
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Steuert den Zustand der Seitenleiste (offen/geschlossen).
//   const [isLoggingOut, setIsLoggingOut] = useState(false); // Zeigt an, ob der Abmeldevorgang läuft.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ useEffect Hook: Anmeldestatus des Benutzers überprüfen
//    * Dieser Hook wird beim Laden der Komponente ausgeführt, um den
//    * Anmeldestatus des Benutzers zu überprüfen und dessen Daten abzurufen.
//    * Bei fehlgeschlagener Authentifizierung wird zur Anmeldeseite umgeleitet.
//    * -------------------------------------------------------------------
//    */
//   useEffect(() => {
//     const checkUserStatus = async () => {
//       setIsAuthLoading(true); // Setzt den Ladezustand auf true.
//       try {
//         const response = await apiClient("/profile/me", { method: "GET" }); // Ruft das Benutzerprofil ab.
//         const data = await response.json();
//         const user: UserData | null = data.user || null; // Extrahiert Benutzerdaten.
//         if (user) {
//           setCurrentUser(user); // Speichert die Benutzerdaten.
//         } else {
//           // Wenn kein Benutzer gefunden wird, zur Anmeldeseite umleiten.
//           router.replace("/auth/signin?error=session_expired_or_invalid");
//         }
//       } catch {
//         // Bei Fehlern (z.B. Netzwerk, ungültiges Token) zur Anmeldeseite umleiten.
//         router.replace("/auth/signin?error=auth_check_failed");
//       } finally {
//         setIsAuthLoading(false); // Beendet den Ladezustand.
//       }
//     };
//     checkUserStatus(); // Führt die Statusprüfung aus.
//   }, [router]); // Abhängigkeit: Effekt wird bei Änderungen des Routers ausgeführt.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleLogout
//    * Behandelt den Abmeldevorgang des Benutzers.
//    * Sendet eine Abmeldeanfrage an das Backend und leitet den Benutzer um.
//    * -------------------------------------------------------------------
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true); // Setzt den Abmelde-Ladezustand.
//     try {
//       await apiClient("/auth/logout", { method: "POST" }); // Sendet Abmeldeanfrage.
//       setCurrentUser(null); // Löscht die aktuellen Benutzerdaten.
//       router.push("/auth/signin"); // Leitet zur Anmeldeseite um.
//     } catch {
//       // Einfache Fehlermeldung bei Abmeldefehler.
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false); // Setzt den Abmelde-Ladezustand zurück.
//     }
//   };

//   // -------------------------------------------------------------------
//   // ✅ Render-Logik für Lade- und Benutzerstatus
//   // -------------------------------------------------------------------

//   // Zeigt einen bildschirmfüllenden Lade-Spinner, während der Benutzerstatus überprüft wird.
//   if (isAuthLoading || !currentUser) {
//     return <FullscreenSpinner message="Lade Ihren Kontobereich..." />;
//   }

//   // Definiert die Navigationselemente für die Seitenleiste.
//   const navItems: UserNavItem[] = [
//     { href: "/profile", icon: FiUser, label: "Profilübersicht" }, // Link zur Profilübersicht.
//     { href: "/simone-station", icon: FiCpu, label: "SIMONE Station" }, // Link zur SIMONE-Station.
//   ];

//   // Fügt den "Admin-Panel"-Link für Benutzer mit der Rolle "admin" hinzu.
//   if (currentUser.role === "admin") {
//     navItems.splice(1, 0, {
//       href: "/admin", // Link zum Admin-Dashboard.
//       icon: FiUsers, // Icon für Benutzerverwaltung.
//       label: "Admin-Panel", // Label für den Admin-Link.
//     });
//   }

//   return (
//     <div className="flex relative">
//       {/* Seitenleiste (Sidebar) */}
//       <aside
//         onMouseEnter={() => setIsSidebarOpen(true)} // Öffnet die Seitenleiste beim Mouse-Over.
//         onMouseLeave={() => setIsSidebarOpen(false)} // Schließt die Seitenleiste beim Mouse-Leave.
//         className={`app-sidebar flex flex-col fixed left-0 shadow-lg z-20 transition-all duration-300 ease-in-out ${
//           isSidebarOpen ? "w-64" : "w-20" // Breite der Seitenleiste basierend auf 'isSidebarOpen'.
//         }`}
//         style={{
//           top: `${GLOBAL_HEADER_HEIGHT_PX}px`, // Positioniert unterhalb des globalen Headers.
//           height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT_PX}px)`, // Füllt den Rest des Viewports aus.
//         }}
//       >
//         <div className="px-4 py-3 sidebar-border border-b flex items-center justify-center">
//           {isSidebarOpen && (
//             <span className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
//               Mein Konto
//             </span>
//           )}
//         </div>

//         {isSidebarOpen && (
//           <div className="px-4 pt-3 pb-3 sidebar-border border-b">
//             <p
//               className="text-xs text-[var(--color-text-secondary)] truncate"
//               title={currentUser.email} // Zeigt die volle E-Mail als Tooltip.
//             >
//               {currentUser.email}
//             </p>
//           </div>
//         )}

//         <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
//           {navItems.map((item) => {
//             // Bestimmt, ob der aktuelle Navigationspunkt aktiv ist.
//             // Sonderbehandlung für den Profil-Link, der exakt übereinstimmen muss,
//             // während andere Links mit 'startsWith' geprüft werden.
//             const isActive =
//               (item.href === "/profile" && pathname === item.href) ||
//               (item.href !== "/profile" && pathname.startsWith(item.href));
//             return (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 title={item.label}
//                 data-active={isActive} // Benutzerdefiniertes Attribut für Styling aktiver Links.
//                 className={`sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
//                   isSidebarOpen ? "" : "justify-center h-12" // Zentriert Icons, wenn Seitenleiste geschlossen ist.
//                 }`}
//               >
//                 <item.icon
//                   className={`w-5 h-5 flex-shrink-0 ${
//                     isSidebarOpen ? "mr-3" : "" // Abstand zum Text, wenn Seitenleiste offen ist.
//                   }`}
//                 />
//                 {isSidebarOpen && (
//                   <span className="truncate">{item.label}</span> // Label nur anzeigen, wenn Seitenleiste offen ist.
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-2 sidebar-border border-t">
//           <button
//             onClick={handleLogout}
//             disabled={isLoggingOut} // Deaktiviert den Button während des Abmeldevorgangs.
//             className={`sidebar-logout-button w-full flex items-center text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
//               isSidebarOpen ? "px-3 py-2.5" : "justify-center h-12" // Layout basierend auf Seitenleistenstatus.
//             }`}
//           >
//             {isLoggingOut ? (
//               <FiLoader
//                 className={`w-5 h-5 animate-spin ${
//                   isSidebarOpen ? "mr-3" : ""
//                 }`}
//               /> // Spinner während des Abmeldens.
//             ) : (
//               <FiLogOut
//                 className={`w-5 h-5 flex-shrink-0 ${
//                   isSidebarOpen ? "mr-3" : ""
//                 }`}
//               /> // Abmelde-Icon.
//             )}
//             {isSidebarOpen && (
//               <span>{isLoggingOut ? "Wird abgemeldet..." : "Abmelden"}</span>
//             )}
//           </button>
//         </div>
//       </aside>

//       {/* Hauptinhaltsbereich */}
//       <main
//         className={`flex-1 bg-[var(--color-background)] transition-all duration-300 ease-in-out ${
//           isSidebarOpen ? "ml-64" : "ml-20" // Passt den linken Rand an die Breite der Seitenleiste an.
//         }`}
//         style={{ paddingTop: `${GLOBAL_HEADER_HEIGHT_PX}px` }} // Fügt oberen Abstand für den globalen Header hinzu.
//       >
//         <div className="p-6 md:p-8 lg:p-10 min-h-full">
//           {/* Suspense-Boundary für den Hauptinhalt. */}
//           {/* Zeigt einen 'ContentSpinner' an, wenn die Kind-Komponenten (children) asynchron geladen werden. */}
//           <Suspense
//             fallback={<ContentSpinner message="Seiteninhalt wird geladen..." />}
//           >
//             {children} {/* Hier werden die jeweiligen Seiteninhalte gerendert. */}
//           </Suspense>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

import React, { useEffect, useState, Suspense } from "react"; // React Hooks für Zustand, Lebenszyklus und Suspense für Ladezustände.
import { useRouter, usePathname } from "next/navigation"; // Next.js Hooks für Navigation und den aktuellen Pfad.
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
import { apiClient } from "@/lib/apiClient"; // Benutzerdefinierter API-Client für Backend-Anfragen.
import { UserData } from "@/types"; // Typdefinitionen für Benutzerdaten.
import { FiUser, FiUsers, FiLogOut, FiLoader, FiCpu } from "react-icons/fi"; // Feather Icons für UI-Elemente.

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: FullscreenSpinner
 * Ein bildschirmfüllender Lade-Spinner, der für den anfänglichen, kritischen
 * Ladevorgang (z.B. Überprüfung des Anmeldestatus) verwendet wird.
 * -------------------------------------------------------------------
 */
const FullscreenSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" /> {/* Spinner-Icon mit Akzentfarbe. */}
      <p className="text-lg text-[var(--color-text-inverted)]">{message}</p> {/* Lade-Nachricht in invertierter Farbe. */}
    </div>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ContentSpinner
 * Ein kleinerer Lade-Spinner, der für Inhaltsübergänge oder Ladevorgänge
 * innerhalb des Hauptinhaltsbereichs des Layouts verwendet wird.
 * -------------------------------------------------------------------
 */
const ContentSpinner = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center py-20">
    <div className="text-center">
      <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-4" /> {/* Spinner-Icon mit Akzentfarbe. */}
      <p className="text-base text-[var(--color-text-secondary)]">{message}</p> {/* Lade-Nachricht in Sekundärfarbe. */}
    </div>
  </div>
);

// Globale Konstante für die Höhe des Headers in Pixeln.
// Wird verwendet, um die Position der Seitenleiste und des Hauptinhalts zu berechnen.
const GLOBAL_HEADER_HEIGHT_PX = 64;

/**
 * -------------------------------------------------------------------
 * ✅ Interface: UserNavItem
 * Definiert die Struktur für ein Navigationselement in der Seitenleiste.
 * -------------------------------------------------------------------
 */
interface UserNavItem {
  href: string; // Der Pfad, zu dem der Link führt.
  icon: React.ElementType; // Die React-Komponente des Icons (z.B. FiUser).
  label: string; // Der Anzeigetext für das Navigationselement.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: UserDashboardLayout
 * Das Hauptlayout für den angemeldeten Benutzerbereich.
 * Es enthält die Seitenleiste und den Hauptinhaltsbereich.
 * Führt eine Authentifizierungsprüfung durch, um sicherzustellen,
 * dass nur angemeldete Benutzer Zugriff haben.
 * -------------------------------------------------------------------
 */
export default function UserDashboardLayout({
  children, // Die Kind-Komponenten, die im Hauptinhaltsbereich gerendert werden sollen.
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // Hook zum Navigieren.
  const pathname = usePathname(); // Hook zum Abrufen des aktuellen Pfadnamens.
  const [currentUser, setCurrentUser] = useState<UserData | null>(null); // Speichert die Daten des aktuell angemeldeten Benutzers.
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Zeigt an, ob der Authentifizierungsstatus überprüft wird.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Steuert den Zustand der Seitenleiste (offen/geschlossen).
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Zeigt an, ob der Abmeldevorgang läuft.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Anmeldestatus des Benutzers überprüfen
   * Dieser Hook wird beim Laden der Komponente ausgeführt, um den
   * Anmeldestatus des Benutzers zu überprüfen und dessen Daten abzurufen.
   * Bei fehlgeschlagener Authentifizierung wird zur Anmeldeseite umgeleitet.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const checkUserStatus = async () => {
      setIsAuthLoading(true); // Setzt den Ladezustand auf true.
      try {
        const response = await apiClient("/profile/me", { method: "GET" }); // Ruft das Benutzerprofil ab.
        const data = await response.json();
        const user: UserData | null = data.user || null; // Extrahiert Benutzerdaten.
        if (user) {
          setCurrentUser(user); // Speichert die Benutzerdaten.
        } else {
          // Wenn kein Benutzer gefunden wird, zur Anmeldeseite umleiten.
          router.replace("/auth/signin?error=session_expired_or_invalid");
        }
      } catch {
        // Bei Fehlern (z.B. Netzwerk, ungültiges Token) zur Anmeldeseite umleiten.
        router.replace("/auth/signin?error=auth_check_failed");
      } finally {
        setIsAuthLoading(false); // Beendet den Ladezustand.
      }
    };
    checkUserStatus(); // Führt die Statusprüfung aus.
  }, [router]); // Abhängigkeit: Effekt wird bei Änderungen des Routers ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleLogout
   * Behandelt den Abmeldevorgang des Benutzers.
   * Sendet eine Abmeldeanfrage an das Backend und leitet den Benutzer um.
   *
   * Zusätzlich zur Abmeldung wird auch der Simone-Dienst beendet.
   * -------------------------------------------------------------------
   */
  const handleLogout = async () => {
    setIsLoggingOut(true); // Setzt den Abmelde-Ladezustand.
    try {

      try {
        await apiClient("/simone/lifecycle/shutdown", { method: "POST" });
      } catch (simoneError) {
        console.error("Failed to shut down Simone service:", simoneError);
        // Fehler bei der Beendigung des Simone-Dienstes wird nicht als kritisch
        // für den Logout-Vorgang angesehen.
      }

      await apiClient("/auth/logout", { method: "POST" }); // Sendet Abmeldeanfrage.
      setCurrentUser(null); // Löscht die aktuellen Benutzerdaten.
      router.push("/auth/signin"); // Leitet zur Anmeldeseite um.
    } catch {
      // Einfache Fehlermeldung bei Abmeldefehler.
      alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoggingOut(false); // Setzt den Abmelde-Ladezustand zurück.
    }
  };

  // -------------------------------------------------------------------
  // ✅ Render-Logik für Lade- und Benutzerstatus
  // -------------------------------------------------------------------

  // Zeigt einen bildschirmfüllenden Lade-Spinner, während der Benutzerstatus überprüft wird.
  if (isAuthLoading || !currentUser) {
    return <FullscreenSpinner message="Lade Ihren Kontobereich..." />;
  }

  // Definiert die Navigationselemente für die Seitenleiste.
  const navItems: UserNavItem[] = [
    { href: "/profile", icon: FiUser, label: "Profilübersicht" }, // Link zur Profilübersicht.
    { href: "/simone-station", icon: FiCpu, label: "SIMONE Station" }, // Link zur SIMONE-Station.
  ];

  // Fügt den "Admin-Panel"-Link für Benutzer mit der Rolle "admin" hinzu.
  if (currentUser.role === "admin") {
    navItems.splice(1, 0, {
      href: "/admin", // Link zum Admin-Dashboard.
      icon: FiUsers, // Icon für Benutzerverwaltung.
      label: "Admin-Panel", // Label für den Admin-Link.
    });
  }

  return (
    <div className="flex relative">
      {/* Seitenleiste (Sidebar) */}
      <aside
        onMouseEnter={() => setIsSidebarOpen(true)} // Öffnet die Seitenleiste beim Mouse-Over.
        onMouseLeave={() => setIsSidebarOpen(false)} // Schließt die Seitenleiste beim Mouse-Leave.
        className={`app-sidebar flex flex-col fixed left-0 shadow-lg z-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20" // Breite der Seitenleiste basierend auf 'isSidebarOpen'.
        }`}
        style={{
          top: `${GLOBAL_HEADER_HEIGHT_PX}px`, // Positioniert unterhalb des globalen Headers.
          height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT_PX}px)`, // Füllt den Rest des Viewports aus.
        }}
      >
        <div className="px-4 py-3 sidebar-border border-b flex items-center justify-center">
          {isSidebarOpen && (
            <span className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
              Mein Konto
            </span>
          )}
        </div>

        {isSidebarOpen && (
          <div className="px-4 pt-3 pb-3 sidebar-border border-b">
            <p
              className="text-xs text-[var(--color-text-secondary)] truncate"
              title={currentUser.email} // Zeigt die volle E-Mail als Tooltip.
            >
              {currentUser.email}
            </p>
          </div>
        )}

        <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            // Bestimmt, ob der aktuelle Navigationspunkt aktiv ist.
            // Sonderbehandlung für den Profil-Link, der exakt übereinstimmen muss,
            // während andere Links mit 'startsWith' geprüft werden.
            const isActive =
              (item.href === "/profile" && pathname === item.href) ||
              (item.href !== "/profile" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                data-active={isActive} // Benutzerdefiniertes Attribut für Styling aktiver Links.
                className={`sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isSidebarOpen ? "" : "justify-center h-12" // Zentriert Icons, wenn Seitenleiste geschlossen ist.
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isSidebarOpen ? "mr-3" : "" // Abstand zum Text, wenn Seitenleiste offen ist.
                  }`}
                />
                {isSidebarOpen && (
                  <span className="truncate">{item.label}</span> // Label nur anzeigen, wenn Seitenleiste offen ist.
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 sidebar-border border-t">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut} // Deaktiviert den Button während des Abmeldevorgangs.
            className={`sidebar-logout-button w-full flex items-center text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSidebarOpen ? "px-3 py-2.5" : "justify-center h-12" // Layout basierend auf Seitenleistenstatus.
            }`}
          >
            {isLoggingOut ? (
              <FiLoader
                className={`w-5 h-5 animate-spin ${
                  isSidebarOpen ? "mr-3" : ""
                }`}
              /> // Spinner während des Abmeldens.
            ) : (
              <FiLogOut
                className={`w-5 h-5 flex-shrink-0 ${
                  isSidebarOpen ? "mr-3" : ""
                }`}
              /> // Abmelde-Icon.
            )}
            {isSidebarOpen && (
              <span>{isLoggingOut ? "Wird abgemeldet..." : "Abmelden"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Hauptinhaltsbereich */}
      <main
        className={`flex-1 bg-[var(--color-background)] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-20" // Passt den linken Rand an die Breite der Seitenleiste an.
        }`}
        style={{ paddingTop: `${GLOBAL_HEADER_HEIGHT_PX}px` }} // Fügt oberen Abstand für den globalen Header hinzu.
      >
        <div className="p-6 md:p-8 lg:p-10 min-h-full">
          {/* Suspense-Boundary für den Hauptinhalt. */}
          {/* Zeigt einen 'ContentSpinner' an, wenn die Kind-Komponenten (children) asynchron geladen werden. */}
          <Suspense
            fallback={<ContentSpinner message="Seiteninhalt wird geladen..." />}
          >
            {children} {/* Hier werden die jeweiligen Seiteninhalte gerendert. */}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
