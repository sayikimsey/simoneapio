// // frontend/src/app/admin/layout.tsx
// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";
// import { FiHome, FiUsers, FiCpu, FiLogOut, FiLoader } from "react-icons/fi";

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
//       <p className="text-[var(--color-text-secondary)] text-base">{message}</p>
//     </div>
//   </div>
// );

// // Globale Header-Höhe in Pixel.
// const GLOBAL_HEADER_HEIGHT_PX = 64;

// /**
//  * Definiert die Struktur für ein Navigationselement in der Seitenleiste.
//  */
// interface NavItem {
//   href: string;
//   icon: React.ElementType;
//   label: string;
// }

// /**
//  * Layout-Komponente für den Admin-Bereich der Anwendung.
//  * Stellt eine Seitenleiste und einen Hauptinhaltsbereich bereit.
//  */
// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
//   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   // Überprüft den Benutzerstatus und die Admin-Rolle beim Laden der Komponente.
//   useEffect(() => {
//     const authCheck = async () => {
//       setIsLoading(true);
//       try {
//         const res = await apiClient("/profile/me", { method: "GET" });
//         const data = await res.json();
//         const user: UserData | null = data.user || null;
//         if (user && user.role === "admin") {
//           setCurrentUser(user);
//           setIsAdmin(true);
//         } else {
//           setIsAdmin(false);
//           router.replace("/auth/signin?error=unauthorized_admin_access");
//         }
//       } catch {
//         setIsAdmin(false);
//         router.replace("/auth/signin?error=admin_auth_check_failed");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     authCheck();
//   }, [router]);

//   /**
//    * Behandelt den Abmeldevorgang des Benutzers.
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await apiClient("/auth/logout", { method: "POST" });
//       router.push("/auth/signin");
//     } catch {
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   // Zeigt einen Lade-Spinner an, während die Berechtigungen überprüft werden.
//   if (isLoading || isAdmin === null) {
//     return <FullscreenSpinner message="Überprüfe Administratorzugriff..." />;
//   }
//   // Leitet um, wenn der Benutzer kein Administrator ist.
//   if (!isAdmin) {
//     return (
//       <FullscreenSpinner message="Zugriff verweigert. Sie werden weitergeleitet..." />
//     );
//   }

//   // Navigationselemente für den Admin-Bereich
//   const navItems: NavItem[] = [
//     { href: "/admin", icon: FiHome, label: "Dashboard" },
//     { href: "/admin/users", icon: FiUsers, label: "Benutzerverwaltung" },
//     { href: "/simone-station", icon: FiCpu, label: "SIMONE Station" },
//   ];

//   return (
//     <div className="flex">
//       <aside
//         onMouseEnter={() => setIsSidebarOpen(true)}
//         onMouseLeave={() => setIsSidebarOpen(false)}
//         className={`app-sidebar flex flex-col fixed left-0 shadow-lg z-30 transition-all duration-300 ease-in-out ${
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
//               Admin-Menü
//             </span>
//           )}
//         </div>

//         {isSidebarOpen && (
//           <div className="px-4 pt-3 pb-3 sidebar-border border-b">
//             <p
//               className="text-xs text-[var(--color-text-secondary)] truncate"
//               title={currentUser?.email}
//             >
//               {currentUser?.email}
//             </p>
//           </div>
//         )}

//         <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
//           {navItems.map((item) => {
//             const isActive =
//               item.href === "/admin"
//                 ? pathname === item.href
//                 : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 data-active={isActive}
//                 className={`sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
//                   isSidebarOpen ? "" : "justify-center h-12"
//                 }`}
//                 title={item.label}
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
//             title="Abmelden"
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
//               <span>{isLoggingOut ? "Abmelden..." : "Abmelden"}</span>
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
//         <div className="p-6 min-h-[calc(100vh-4rem)] overflow-auto">
//           <Suspense
//             fallback={<ContentSpinner message="Inhalt wird geladen..." />}
//           >
//             {children}
//           </Suspense>
//         </div>
//       </main>
//     </div>
//   );
// }

// frontend/src/app/admin/layout.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation"; // Next.js Hooks für Routing und aktuellen Pfad
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation
import { apiClient } from "@/lib/apiClient"; // Benutzerdefinierter API-Client
import { UserData } from "@/types"; // Typdefinitionen für Benutzerdaten
import { FiHome, FiUsers, FiCpu, FiLogOut, FiLoader } from "react-icons/fi"; // Feather Icons für UI-Elemente

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: FullscreenSpinner
 * Ein bildschirmfüllender Lade-Spinner, der für anfängliche, kritische
 * Ladevorgänge (z.B. Authentifizierungsprüfung) verwendet wird.
 * -------------------------------------------------------------------
 */
const FullscreenSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
      {/* Großer Spinner */}
      <p className="text-lg text-[var(--color-text-inverted)]">
        {message}
      </p>{" "}
      {/* Nachricht in invertierter Farbe */}
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
      <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-4" />{" "}
      {/* Kleinerer Spinner */}
      <p className="text-[var(--color-text-secondary)] text-base">
        {message}
      </p>{" "}
      {/* Nachricht in Sekundärfarbe */}
    </div>
  </div>
);

// Globale Konstante für die Höhe des Headers in Pixeln.
// Wird verwendet, um die Position der Seitenleiste und des Hauptinhalts zu berechnen.
const GLOBAL_HEADER_HEIGHT_PX = 64;

/**
 * -------------------------------------------------------------------
 * ✅ Interface: NavItem
 * Definiert die Struktur für ein Navigationselement in der Seitenleiste.
 * -------------------------------------------------------------------
 */
interface NavItem {
  href: string; // Der Pfad, zu dem der Link führt
  icon: React.ElementType; // Die React-Komponente des Icons (z.B. FiHome)
  label: string; // Der Anzeigetext für das Navigationselement
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: AdminLayout
 * Layout-Komponente für den Admin-Bereich der Anwendung.
 * Stellt eine responsive Seitenleiste und einen Hauptinhaltsbereich bereit.
 * Führt eine Authentifizierungs- und Rollenprüfung durch, um den Zugriff
 * auf den Admin-Bereich zu steuern.
 * -------------------------------------------------------------------
 */
export default function AdminLayout({
  children, // Die Kind-Komponenten, die im Hauptinhaltsbereich gerendert werden sollen
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // Hook zum Navigieren zwischen Routen
  const pathname = usePathname(); // Hook zum Abrufen des aktuellen Pfadnamens
  const [currentUser, setCurrentUser] = useState<UserData | null>(null); // Speichert die Daten des aktuell angemeldeten Benutzers
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Speichert, ob der Benutzer ein Administrator ist (null = wird geprüft)
  const [isLoading, setIsLoading] = useState(true); // Zeigt an, ob die anfängliche Lade-/Prüfphase läuft
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Steuert den Zustand der Seitenleiste (offen/geschlossen)
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Zeigt an, ob der Abmeldevorgang läuft

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Authentifizierungs- und Admin-Rollenprüfung
   * Dieser Hook wird beim Laden der Komponente ausgeführt, um den Benutzerstatus
   * abzurufen und zu überprüfen, ob der Benutzer die Admin-Rolle besitzt.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const authCheck = async () => {
      setIsLoading(true); // Setzt den Ladezustand auf true
      try {
        const res = await apiClient("/profile/me", { method: "GET" }); // Ruft die Profilinformationen des Benutzers ab
        const data = await res.json();
        const user: UserData | null = data.user || null; // Extrahiert Benutzerdaten aus der Antwort

        // Prüft, ob ein Benutzer gefunden wurde und ob dieser die Rolle "admin" hat
        if (user && user.role === "admin") {
          setCurrentUser(user); // Speichert die Benutzerdaten
          setIsAdmin(true); // Setzt den Admin-Status auf true
        } else {
          // Wenn kein Benutzer oder keine Admin-Rolle: Zugriff verweigern und umleiten
          setIsAdmin(false);
          router.replace("/auth/signin?error=unauthorized_admin_access"); // Leitet zur Login-Seite um mit Fehlermeldung
        }
      } catch {
        // Fehler beim API-Aufruf (z.B. nicht authentifiziert)
        setIsAdmin(false);
        router.replace("/auth/signin?error=admin_auth_check_failed"); // Leitet zur Login-Seite um mit Fehlermeldung
      } finally {
        setIsLoading(false); // Setzt den Ladezustand auf false
      }
    };
    authCheck(); // Ruft die Authentifizierungsprüfung auf
  }, [router]); // Abhängigkeit: Effekt wird bei Änderungen des Routers ausgeführt

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleLogout
   * Behandelt den Abmeldevorgang des Benutzers.
   * Sendet eine Abmeldeanfrage an das Backend und leitet dann zur Login-Seite um.
   * -------------------------------------------------------------------
   */
  const handleLogout = async () => {
    setIsLoggingOut(true); // Zeigt an, dass der Abmeldevorgang läuft
    try {
      await apiClient("/auth/logout", { method: "POST" }); // Sendet Abmeldeanfrage an die API
      router.push("/auth/signin"); // Leitet zur Login-Seite um
    } catch {
      alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut."); // Einfache Fehlermeldung bei Abmeldefehler
    } finally {
      setIsLoggingOut(false); // Setzt den Abmeldezustand zurück
    }
  };

  // -------------------------------------------------------------------
  // ✅ Render-Logik für Lade- und Zugriffsstatus
  // -------------------------------------------------------------------

  // Zeigt einen bildschirmfüllenden Lade-Spinner an, während die Berechtigungen überprüft werden.
  if (isLoading || isAdmin === null) {
    return <FullscreenSpinner message="Überprüfe Administratorzugriff..." />;
  }
  // Leitet um, wenn der Benutzer kein Administrator ist.
  // Diese Nachricht wird kurz angezeigt, bevor die Umleitung erfolgt.
  if (!isAdmin) {
    return (
      <FullscreenSpinner message="Zugriff verweigert. Sie werden weitergeleitet..." />
    );
  }

  // -------------------------------------------------------------------
  // ✅ Navigationselemente für den Admin-Bereich
  // -------------------------------------------------------------------
  const navItems: NavItem[] = [
    { href: "/admin", icon: FiHome, label: "Dashboard" }, // Link zum Admin-Dashboard
    { href: "/admin/users", icon: FiUsers, label: "Benutzerverwaltung" }, // Link zur Benutzerverwaltung
    { href: "/simone-station", icon: FiCpu, label: "SIMONE Station" }, // Link zur SIMONE-Station
  ];

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur des AdminLayouts
  // Enthält die Seitenleiste und den Hauptinhaltsbereich.
  // -------------------------------------------------------------------
  return (
    <div className="flex">
      {/* Seitenleiste (Sidebar) */}
      <aside
        onMouseEnter={() => setIsSidebarOpen(true)} // Öffnet die Seitenleiste beim Mouse-Over
        onMouseLeave={() => setIsSidebarOpen(false)} // Schließt die Seitenleiste beim Mouse-Leave
        className={`app-sidebar flex flex-col fixed left-0 shadow-lg z-30 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20" // Breite der Seitenleiste basierend auf 'isSidebarOpen'
        }`}
        style={{
          top: `${GLOBAL_HEADER_HEIGHT_PX}px`, // Positioniert unterhalb des globalen Headers
          height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT_PX}px)`, // Füllt den Rest des Viewports aus
        }}
      >
        {/* Kopfbereich der Seitenleiste */}
        <div className="px-4 py-3 sidebar-border border-b flex items-center justify-center">
          {isSidebarOpen && (
            <span className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
              Admin-Menü
            </span>
          )}
        </div>

        {/* Anzeige der aktuellen Benutzer-E-Mail in der geöffneten Seitenleiste */}
        {isSidebarOpen && (
          <div className="px-4 pt-3 pb-3 sidebar-border border-b">
            <p
              className="text-xs text-[var(--color-text-secondary)] truncate"
              title={currentUser?.email} // Zeigt die volle E-Mail als Tooltip
            >
              {currentUser?.email}
            </p>
          </div>
        )}

        {/* Navigationsbereich der Seitenleiste */}
        <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            // Bestimmt, ob der aktuelle Navigationspunkt aktiv ist
            const isActive =
              item.href === "/admin" // Sonderbehandlung für das Root-Dashboard
                ? pathname === item.href
                : pathname.startsWith(item.href); // Für andere Pfade, wenn der Pfad mit dem Link beginnt
            return (
              <Link
                key={item.label}
                href={item.href}
                data-active={isActive} // Benutzerdefiniertes Attribut für Styling aktiver Links
                className={`sidebar-link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isSidebarOpen ? "" : "justify-center h-12" // Zentriert Icons, wenn Seitenleiste geschlossen ist
                }`}
                title={item.label} // Tooltip für Navigationselemente
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isSidebarOpen ? "mr-3" : "" // Abstand zum Text, wenn Seitenleiste offen ist
                  }`}
                />
                {isSidebarOpen && (
                  <span className="truncate">{item.label}</span> // Label nur anzeigen, wenn Seitenleiste offen ist
                )}
              </Link>
            );
          })}
        </nav>

        {/* Abmelde-Button in der Seitenleiste */}
        <div className="p-2 sidebar-border border-t">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut} // Deaktiviert den Button während des Abmeldevorgangs
            className={`sidebar-logout-button w-full flex items-center text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSidebarOpen ? "px-3 py-2.5" : "justify-center h-12" // Layout basierend auf Seitenleistenstatus
            }`}
            title="Abmelden" // Tooltip für den Abmelde-Button
          >
            {isLoggingOut ? (
              <FiLoader
                className={`w-5 h-5 animate-spin ${
                  isSidebarOpen ? "mr-3" : ""
                }`}
              /> // Spinner während des Abmeldens
            ) : (
              <FiLogOut
                className={`w-5 h-5 flex-shrink-0 ${
                  isSidebarOpen ? "mr-3" : ""
                }`}
              /> // Abmelde-Icon
            )}
            {isSidebarOpen && (
              <span>{isLoggingOut ? "Abmelden..." : "Abmelden"}</span> // Text nur anzeigen, wenn Seitenleiste offen
            )}
          </button>
        </div>
      </aside>

      {/* Hauptinhaltsbereich */}
      <main
        className={`flex-1 bg-[var(--color-background)] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-20" // Passt den linken Rand an die Breite der Seitenleiste an
        }`}
        style={{ paddingTop: `${GLOBAL_HEADER_HEIGHT_PX}px` }} // Fügt oberen Abstand für den globalen Header hinzu
      >
        <div className="p-6 min-h-[calc(100vh-4rem)] overflow-auto">
          {/* Suspense-Boundary für den Hauptinhalt */}
          {/* Zeigt einen 'ContentSpinner' an, wenn die Kind-Komponenten (children) asynchron geladen werden */}
          <Suspense
            fallback={<ContentSpinner message="Inhalt wird geladen..." />}
          >
            {children}{" "}
            {/* Hier werden die jeweiligen Seiteninhalte gerendert */}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
