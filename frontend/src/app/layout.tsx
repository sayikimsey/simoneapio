// "use client";
// import React, { Suspense, useState, useEffect, Fragment } from "react";
// import { Inter } from "next/font/google";
// import Link from "next/link";
// import "./globals.css";
// import { ThemeProvider } from "@/contexts/ThemeContext";
// import ThemeToggleButton from "@/components/common/ThemeToggleButton";
// import { Toaster } from "react-hot-toast";
// import { FiLoader, FiUser, FiLogOut } from "react-icons/fi";
// import { Menu, Transition } from "@headlessui/react";
// import { usePathname, useRouter } from "next/navigation";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";

// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-inter",
// });

// /**
//  * Ein Lade-Spinner für das Root-Layout, mit Theme-Variablen gestaltet.
//  */
// const RootLoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-lg text-[var(--color-text-secondary)]">
//         Seite wird geladen...
//       </p>
//     </div>
//   </div>
// );

// /**
//  * Hook zur Verwaltung des Authentifizierungsstatus und der Benutzerdaten.
//  */
// const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       // Auf Authentifizierungsseiten ist der Benutzer nicht angemeldet.
//       if (pathname.startsWith("/auth") || pathname === "/") {
//         setIsAuthenticated(false);
//         setUser(null);
//         setIsLoading(false);
//         return;
//       }

//       // Versucht, die Benutzerdaten abzurufen, um die Sitzung zu überprüfen.
//       setIsLoading(true);
//       try {
//         const response = await apiClient("/profile/me");
//         const data = await response.json();
//         if (response.ok && data.user) {
//           setUser(data.user);
//           setIsAuthenticated(true);
//         } else {
//           // Wenn kein Benutzer gefunden wird, zur Anmeldeseite umleiten.
//           setIsAuthenticated(false);
//           setUser(null);
//           router.replace("/auth/signin?error=session_expired");
//         }
//       } catch (error) {
//         console.error("Fehler bei der Authentifizierungsprüfung:", error);
//         setIsAuthenticated(false);
//         setUser(null);
//         router.replace("/auth/signin?error=auth_check_failed");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, [pathname, router]);

//   return { isAuthenticated, user, isLoading };
// };

// /**
//  * Die Haupt-Header-Komponente der Anwendung.
//  */
// const AppHeader = () => {
//   const { isAuthenticated, user, isLoading } = useAuth();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   /**
//    * Behandelt den Abmeldevorgang des Benutzers.
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       // Ruft den Logout-Endpunkt des Backends auf
//       await apiClient("/auth/logout", { method: "POST" });
//       // Leitet den Benutzer nach erfolgreicher Abmeldung zur Anmeldeseite weiter.
//       router.push("/auth/signin");
//     } catch (error) {
//       console.error("Abmeldung fehlgeschlagen:", error);
//       // In einer echten App, verwenden Sie eine themenbewusste Toast-Benachrichtigung anstelle eines Alerts.
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const UserMenu = () => (
//     <Menu as="div" className="relative ml-2">
//       <div>
//         <Menu.Button className="btn-icon">
//           <span className="sr-only">Benutzermenü öffnen</span>
//           <div className="h-9 w-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center font-bold text-[var(--color-text-on-accent)]">
//             {user?.firstName?.charAt(0).toUpperCase() || <FiUser />}
//           </div>
//         </Menu.Button>
//       </div>
//       <Transition
//         as={Fragment}
//         enter="transition ease-out duration-200"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border-color)]">
//           <div className="px-4 py-3 border-b border-[var(--border-color)]">
//             <p className="text-sm text-[var(--color-text-primary)]">
//               Angemeldet als
//             </p>
//             <p className="truncate text-sm font-medium text-[var(--color-text-secondary)]">
//               {user?.email}
//             </p>
//           </div>
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 href="/profile"
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 <FiUser className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />
//                 Mein Profil
//               </Link>
//             )}
//           </Menu.Item>
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 disabled={isLoggingOut}
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-danger)] disabled:opacity-50 ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 {isLoggingOut ? (
//                   <FiLoader className="animate-spin mr-2 h-5 w-5" />
//                 ) : (
//                   <FiLogOut className="mr-2 h-5 w-5" />
//                 )}
//                 {isLoggingOut ? "Melde ab..." : "Abmelden"}
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );

//   return (
//     <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center gap-8">
//             <Link href="/" className="flex-shrink-0">
//               <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
//                 SimONE Simulation
//               </span>
//             </Link>
//           </div>
//           <div className="flex items-center">
//             <ThemeToggleButton />
//             {isLoading ? (
//               <div className="w-10 h-10 ml-2 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
//             ) : isAuthenticated ? (
//               <UserMenu />
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// /**
//  * Das Root-Layout der gesamten Anwendung.
//  */
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="de" suppressHydrationWarning>
//       <head>
//         <title>SIMONE Simulation</title>
//         <meta
//           name="description"
//           content="Weboberfläche für die SIMONE-Simulationssteuerung"
//         />
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//       </head>
//       <body
//         className={`${inter.className} min-h-screen flex flex-col transition-colors duration-300 ease-in-out`}
//       >
//         <ThemeProvider>
//           <Toaster
//             position="top-right"
//             toastOptions={
//               {
//                 // Optionen für Toast-Benachrichtigungen können hier hinzugefügt werden
//               }
//             }
//           />
//           <AppHeader />
//           <main className="flex-grow w-full">
//             <Suspense fallback={<RootLoadingSpinner />}>{children}</Suspense>
//           </main>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

// // frontend/src/app/layout.tsx
// "use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

// import React, { Suspense, useState, useEffect, Fragment } from "react"; // React Hooks und Fragment für Headless UI Transitionen.
// import { Inter } from "next/font/google"; // Importiert die Inter-Schriftart von Google Fonts für Next.js.
// import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
// import "./globals.css"; // Importiert globale CSS-Stile.
// import { ThemeProvider } from "@/contexts/ThemeContext"; // Importiert den Theme-Provider für die Licht-/Dunkel-Theme-Verwaltung.
// import ThemeToggleButton from "@/components/common/ThemeToggleButton"; // Importiert den Button zum Umschalten des Themes.
// import { Toaster } from "react-hot-toast"; // Importiert Toaster für Benachrichtigungen (Pop-ups).
// import { FiLoader, FiUser, FiLogOut } from "react-icons/fi"; // Importiert Icons von Feather Icons (Lade-Spinner, Benutzer, Abmelden).
// import { Menu, Transition } from "@headlessui/react"; // Komponenten für zugängliche Menüs von Headless UI.
// import { usePathname, useRouter } from "next/navigation"; // Next.js Hooks für den aktuellen Pfad und Navigation.
// import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für Backend-Anfragen.
// import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten.

// // Initialisiert die Inter-Schriftart und lädt sie.
// const inter = Inter({
//   subsets: ["latin"], // Lädt lateinische Zeichensätze.
//   display: "swap", // Stellt sicher, dass der Text sichtbar ist, während die Schriftart geladen wird.
//   variable: "--font-inter", // Definiert eine CSS-Variable für die Schriftart.
// });

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: RootLoadingSpinner
//  * Ein Lade-Spinner für das Root-Layout, der angezeigt wird, während
//  * die anfängliche Seite oder kritische Daten geladen werden.
//  * Er ist mit Theme-Variablen gestaltet, um sich an das aktuelle Design anzupassen.
//  * -------------------------------------------------------------------
//  */
// const RootLoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
//       {/* Spinner-Icon mit Akzentfarbe */}
//       <p className="text-lg text-[var(--color-text-secondary)]">
//         Seite wird geladen...
//       </p>{" "}
//       {/* Lade-Nachricht */}
//     </div>
//   </div>
// );

// /**
//  * -------------------------------------------------------------------
//  * ✅ Hook: useAuth
//  * Ein benutzerdefinierter Hook zur Verwaltung des Authentifizierungsstatus
//  * des Benutzers und zum Abrufen seiner Daten.
//  * Er überprüft die Sitzung beim Laden der Seite und leitet bei Bedarf um.
//  * -------------------------------------------------------------------
//  */
// const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Zeigt an, ob der Benutzer authentifiziert ist.
//   const [user, setUser] = useState<UserData | null>(null); // Speichert die Benutzerdaten.
//   const [isLoading, setIsLoading] = useState(true); // Zeigt an, ob der Authentifizierungsstatus überprüft wird.
//   const pathname = usePathname(); // Holt den aktuellen Pfadnamen.
//   const router = useRouter(); // Hook zum Navigieren.

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       // Wenn der Benutzer sich auf einer Authentifizierungsseite (z.B. Login, Registrierung)
//       // oder auf der Startseite befindet, gehen wir davon aus, dass er nicht eingeloggt ist,
//       // um unnötige API-Aufrufe zu vermeiden.
//       if (pathname.startsWith("/auth") || pathname === "/") {
//         setIsAuthenticated(false);
//         setUser(null);
//         setIsLoading(false);
//         return;
//       }

//       // Versucht, die Benutzerdaten abzurufen, um die aktuelle Sitzung zu überprüfen.
//       setIsLoading(true);
//       try {
//         const response = await apiClient("/profile/me"); // API-Aufruf zum Abrufen des Benutzerprofils.
//         const data = await response.json();
//         // Wenn die Antwort erfolgreich ist und Benutzerdaten vorhanden sind:
//         if (response.ok && data.user) {
//           setUser(data.user); // Benutzerdaten speichern.
//           setIsAuthenticated(true); // Authentifizierungsstatus auf true setzen.
//         } else {
//           // Wenn kein Benutzer gefunden wird (z.B. Sitzung abgelaufen, Token ungültig),
//           // wird der Benutzer zur Anmeldeseite umgeleitet.
//           setIsAuthenticated(false);
//           setUser(null);
//           router.replace("/auth/signin?error=session_expired"); // Umleitung mit Fehlermeldung.
//         }
//       } catch (error) {
//         // Fehler beim API-Aufruf (z.B. Netzwerkfehler, Serverfehler).
//         console.error("Fehler bei der Authentifizierungsprüfung:", error);
//         setIsAuthenticated(false);
//         setUser(null);
//         router.replace("/auth/signin?error=auth_check_failed"); // Umleitung mit Fehlermeldung.
//       } finally {
//         setIsLoading(false); // Ladezustand beenden.
//       }
//     };

//     checkAuthStatus(); // Führt die Authentifizierungsprüfung aus.
//   }, [pathname, router]); // Abhängigkeiten: wird bei Pfadänderungen oder Router-Änderungen erneut ausgeführt.

//   return { isAuthenticated, user, isLoading }; // Gibt den Authentifizierungsstatus, Benutzerdaten und Ladezustand zurück.
// };

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: AppHeader
//  * Die Haupt-Header-Komponente der Anwendung.
//  * Zeigt den Anwendungsnamen, den Theme-Umschalter und ein Benutzermenü
//  * (wenn der Benutzer angemeldet ist) an.
//  * -------------------------------------------------------------------
//  */
// const AppHeader = () => {
//   const { isAuthenticated, user, isLoading } = useAuth(); // Holt Authentifizierungsstatus und Benutzerdaten.
//   const router = useRouter(); // Hook zum Navigieren.
//   const [isLoggingOut, setIsLoggingOut] = useState(false); // Zeigt an, ob der Abmeldevorgang läuft.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleLogout
//    * Behandelt den Abmeldevorgang des Benutzers.
//    * Sendet eine Anfrage an das Backend zum Abmelden und leitet dann um.
//    * -------------------------------------------------------------------
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true); // Setzt den Abmelde-Ladezustand.
//     try {
//       await apiClient("/auth/logout", { method: "POST" }); // Ruft den Logout-Endpunkt des Backends auf.
//       router.push("/auth/signin"); // Leitet den Benutzer nach erfolgreicher Abmeldung zur Anmeldeseite weiter.
//     } catch (error) {
//       console.error("Abmeldung fehlgeschlagen:", error);
//       // In einer echten App würde man hier eine benutzerfreundlichere
//       // Benachrichtigung (z.B. mit React Hot Toast) verwenden.
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false); // Setzt den Abmelde-Ladezustand zurück.
//     }
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Komponente: UserMenu (Innerhalb von AppHeader)
//    * Das Dropdown-Menü für authentifizierte Benutzer.
//    * Zeigt Benutzerinformationen und Links zu Profil und Abmeldung.
//    * -------------------------------------------------------------------
//    */
//   const UserMenu = () => (
//     <Menu as="div" className="relative ml-2">
//       {" "}
//       {/* Headless UI Menu-Komponente */}
//       <div>
//         <Menu.Button className="btn-icon">
//           {" "}
//           {/* Button zum Öffnen des Menüs */}
//           <span className="sr-only">Benutzermenü öffnen</span>{" "}
//           {/* Text für Screenreader */}
//           <div className="h-9 w-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center font-bold text-[var(--color-text-on-accent)]">
//             {/* Zeigt den ersten Buchstaben des Vornamens des Benutzers an oder ein Standard-Icon */}
//             {user?.firstName?.charAt(0).toUpperCase() || <FiUser />}
//           </div>
//         </Menu.Button>
//       </div>
//       {/* Übergangseffekte für das Menü */}
//       <Transition
//         as={Fragment}
//         enter="transition ease-out duration-200"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border-color)]">
//           {/* Header des Benutzermenüs mit E-Mail-Anzeige */}
//           <div className="px-4 py-3 border-b border-[var(--border-color)]">
//             <p className="text-sm text-[var(--color-text-primary)]">
//               Angemeldet als
//             </p>
//             <p className="truncate text-sm font-medium text-[var(--color-text-secondary)]">
//               {user?.email}
//             </p>
//           </div>
//           {/* Menüpunkt "Mein Profil" */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 href="/profile"
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] ${
//                   active ? "bg-[var(--color-surface-2)]" : "" // Hintergrundfarbe bei Hover/Fokus
//                 }`}
//               >
//                 <FiUser className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />
//                 Mein Profil
//               </Link>
//             )}
//           </Menu.Item>
//           {/* Menüpunkt "Abmelden" */}
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 disabled={isLoggingOut} // Button während des Abmeldens deaktivieren.
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-danger)] disabled:opacity-50 ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 {isLoggingOut ? (
//                   <FiLoader className="animate-spin mr-2 h-5 w-5" /> // Spinner beim Abmelden.
//                 ) : (
//                   <FiLogOut className="mr-2 h-5 w-5" /> // Abmelde-Icon.
//                 )}
//                 {isLoggingOut ? "Melde ab..." : "Abmelden"}
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );

//   // -------------------------------------------------------------------
//   // ✅ JSX-Struktur des AppHeaders
//   // Der Header bleibt beim Scrollen oben fixiert und zeigt den App-Titel
//   // sowie das Benutzermenü (oder einen Platzhalter) an.
//   // -------------------------------------------------------------------
//   return (
//     <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center gap-8">
//             <Link href="/" className="flex-shrink-0">
//               <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
//                 SimONE Simulation {/* Anwendungsname */}
//               </span>
//             </Link>
//           </div>
//           <div className="flex items-center">
//             <ThemeToggleButton /> {/* Button zum Umschalten des Themes */}
//             {isLoading ? (
//               // Platzhalter beim Laden des Authentifizierungsstatus
//               <div className="w-10 h-10 ml-2 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
//             ) : isAuthenticated ? (
//               // Benutzermenü, wenn authentifiziert
//               <UserMenu />
//             ) : null}{" "}
//             {/* Nichts anzeigen, wenn nicht authentifiziert und nicht geladen */}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: RootLayout (Export)
//  * Das Root-Layout der gesamten Anwendung. Es umschließt alle Seiten
//  * und Komponenten und stellt die grundlegende HTML-Struktur,
//  * globale Stile, den Theme-Provider und den App-Header bereit.
//  * -------------------------------------------------------------------
//  */
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     // FIX 1: Remove whitespace directly inside <html>
//     <html lang="de" suppressHydrationWarning={true}>
//       {/* FIX 2: Remove whitespace directly inside <head> */}
//       <head>
//         <title>SIMONE Simulation</title>
//         <meta
//           name="description"
//           content="Weboberfläche für die SIMONE-Simulationssteuerung"
//         />
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//       </head>
//       {/* No whitespace directly after <body> */}
//       <body
//         className={`${inter.className} min-h-screen flex flex-col transition-colors duration-300 ease-in-out`}
//       >
//         <ThemeProvider>
//           <Toaster
//             position="top-right"
//             toastOptions={
//               {} // Options for Toast-Benachrichtigungen can be added here (e.g., styling, duration).
//             }
//           />
//           <AppHeader />
//           <main className="flex-grow w-full">
//             <Suspense fallback={<RootLoadingSpinner />}>{children}</Suspense>
//           </main>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

// // frontend/src/app/layout.tsx
// "use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

// import React, {
//   Suspense,
//   useState,
//   useEffect /* Removed: Fragment */,
// } from "react"; // React Hooks und Fragment für Headless UI Transitionen.
// import { Inter } from "next/font/google"; // Importiert die Inter-Schriftart von Google Fonts für Next.js.
// import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
// import "./globals.css"; // Importiert globale CSS-Stile.
// import { ThemeProvider } from "@/contexts/ThemeContext"; // Importiert den Theme-Provider für die Licht-/Dunkel-Theme-Verwaltung.
// import ThemeToggleButton from "@/components/common/ThemeToggleButton"; // Importiert den Button zum Umschalten des Themes.
// // import { Toaster } from "react-hot-toast"; // ENTFERNT: Direkter Import
// import dynamic from "next/dynamic"; // NEU: Import von next/dynamic für Client-Side Rendering
// import { FiLoader, FiUser, FiLogOut } from "react-icons/fi"; // Importiert Icons von Feather Icons (Lade-Spinner, Benutzer, Abmelden).
// import { Menu, Transition } from "@headlessui/react"; // Komponenten für zugängliche Menüs von Headless UI.
// import { usePathname, useRouter } from "next/navigation"; // Next.js Hooks für den aktuellen Pfad und Navigation.
// import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für Backend-Anfragen.
// import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten.

// // NEU: Dynamischer Import des Toasters, um ihn nur clientseitig zu rendern (SSR deaktiviert).
// // (NEW: Dynamic import of Toaster to render it only client-side (SSR disabled).)
// const ClientSideToaster = dynamic(
//   () => import("react-hot-toast").then((mod) => mod.Toaster),
//   { ssr: false }
// );

// // Initialisiert die Inter-Schriftart und lädt sie.
// const inter = Inter({
//   subsets: ["latin"], // Lädt lateinische Zeichensätze.
//   display: "swap", // Stellt sicher, dass der Text sichtbar ist, während die Schriftart geladen wird.
//   variable: "--font-inter", // Definiert eine CSS-Variable für die Schriftart.
// });

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: RootLoadingSpinner
//  * Ein Lade-Spinner für das Root-Layout, der angezeigt wird, während
//  * die anfängliche Seite oder kritische Daten geladen werden.
//  * Er ist mit Theme-Variablen gestaltet, um sich an das aktuelle Design anzupassen.
//  * -------------------------------------------------------------------
//  */
// const RootLoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
//       {/* Spinner-Icon mit Akzentfarbe */}
//       <p className="text-lg text-[var(--color-text-secondary)]">
//         Seite wird geladen...
//       </p>{" "}
//       {/* Lade-Nachricht */}
//     </div>
//   </div>
// );

// /**
//  * -------------------------------------------------------------------
//  * ✅ Hook: useAuth
//  * Ein benutzerdefinierter Hook zur Verwaltung des Authentifizierungsstatus
//  * des Benutzers und zum Abrufen seiner Daten.
//  * Er überprüft die Sitzung beim Laden der Seite und leitet bei Bedarf um.
//  * -------------------------------------------------------------------
//  */
// const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       if (pathname.startsWith("/auth") || pathname === "/") {
//         setIsAuthenticated(false);
//         setUser(null);
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const response = await apiClient("/profile/me");
//         const data = await response.json();
//         if (response.ok && data.user) {
//           setUser(data.user);
//           setIsAuthenticated(true);
//         } else {
//           setIsAuthenticated(false);
//           setUser(null);
//           router.replace("/auth/signin?error=session_expired");
//         }
//       } catch (error) {
//         console.error("Fehler bei der Authentifizierungsprüfung:", error);
//         setIsAuthenticated(false);
//         setUser(null);
//         router.replace("/auth/signin?error=auth_check_failed");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, [pathname, router]);

//   return { isAuthenticated, user, isLoading };
// };

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: AppHeader
//  * Die Haupt-Header-Komponente der Anwendung.
//  * Zeigt den Anwendungsnamen, den Theme-Umschalter und ein Benutzermenü
//  * (wenn der Benutzer angemeldet ist) an.
//  * -------------------------------------------------------------------
//  */
// const AppHeader = () => {
//   const { isAuthenticated, user, isLoading } = useAuth();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleLogout
//    * Behandelt den Abmeldevorgang des Benutzers.
//    * Sendet eine Anfrage an das Backend zum Abmelden und leitet dann um.
//    * -------------------------------------------------------------------
//    */
//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await apiClient("/auth/logout", { method: "POST" });
//       router.push("/auth/signin");
//     } catch (error) {
//       console.error("Abmeldung fehlgeschlagen:", error);
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Komponente: UserMenu (Innerhalb von AppHeader)
//    * Das Dropdown-Menü für authentifizierte Benutzer.
//    * Zeigt Benutzerinformationen und Links zu Profil und Abmeldung.
//    * -------------------------------------------------------------------
//    */
//   const UserMenu = () => (
//     <Menu as="div" className="relative ml-2">
//       <div>
//         <Menu.Button className="btn-icon">
//           <span className="sr-only">Benutzermenü öffnen</span>
//           <div className="h-9 w-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center font-bold text-[var(--color-text-on-accent)]">
//             {/* Zeigt den ersten Buchstaben des Vornamens des Benutzers an oder ein Standard-Icon */}
//             {user?.firstName?.charAt(0).toUpperCase() || <FiUser />}
//           </div>
//         </Menu.Button>
//       </div>
//       <Transition
//         // as={Fragment} // Removed Fragment as it is not used directly
//         enter="transition ease-out duration-200"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border-color)]">
//           <div className="px-4 py-3 border-b border-[var(--border-color)]">
//             <p className="text-sm text-[var(--color-text-primary)]">
//               Angemeldet als
//             </p>
//             <p className="truncate text-sm font-medium text-[var(--color-text-secondary)]">
//               {user?.email}
//             </p>
//           </div>
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 href="/profile"
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 <FiUser className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />
//                 Mein Profil
//               </Link>
//             )}
//           </Menu.Item>
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 disabled={isLoggingOut}
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-danger)] disabled:opacity-50 ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 {isLoggingOut ? (
//                   <FiLoader className="animate-spin mr-2 h-5 w-5" />
//                 ) : (
//                   <FiLogOut className="mr-2 h-5 w-5" />
//                 )}
//                 {isLoggingOut ? "Melde ab..." : "Abmelden"}
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );

//   /**
//    * -------------------------------------------------------------------
//    * ✅ JSX-Struktur des AppHeaders
//    * Der Header bleibt beim Scrollen oben fixiert und zeigt den App-Titel
//    * sowie das Benutzermenü (oder einen Platzhalter) an.
//    * -------------------------------------------------------------------
//    */
//   return (
//     <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center gap-8">
//             <Link href="/" className="flex-shrink-0">
//               <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
//                 SimONE Simulation {/* Anwendungsname */}
//               </span>
//             </Link>
//           </div>
//           <div className="flex items-center">
//             <ThemeToggleButton />
//             {isLoading ? (
//               <div className="w-10 h-10 ml-2 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
//             ) : isAuthenticated ? (
//               <UserMenu />
//             ) : null}{" "}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: RootLayout (Export)
//  * Das Root-Layout der gesamten Anwendung. Es umschließt alle Seiten
//  * und Komponenten und stellt die grundlegende HTML-Struktur,
//  * globale Stile, den Theme-Provider und den App-Header bereit.
//  * -------------------------------------------------------------------
//  */
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="de" suppressHydrationWarning={true}>
//       <head>
//         <title>SIMONE Simulation</title>
//         <meta
//           name="description"
//           content="Weboberfläche für die SIMONE-Simulationssteuerung"
//         />
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//       </head>
//       <body
//         className={`${inter.className} min-h-screen flex flex-col transition-colors duration-300 ease-in-out`}
//       >
//         <ThemeProvider>
//           {/* NEU: Ersetzt <Toaster /> durch die clientseitige Version */}
//           <ClientSideToaster
//             position="top-right"
//             toastOptions={
//               {} // Options for Toast-Benachrichtigungen can be added here (e.g., styling, duration).
//             }
//           />
//           <AppHeader />
//           <main className="flex-grow w-full">
//             <Suspense fallback={<RootLoadingSpinner />}>{children}</Suspense>
//           </main>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }






// // frontend/src/app/layout.tsx
// "use client";

// import React, {
//   Suspense,
//   useState,
//   useEffect,
// } from "react";
// // ✅ ENTFERNT: Die Inter-Schriftart, da sie den Build-Prozess blockierte.
// // import { Inter } from "next/font/google";
// import Link from "next/link";
// import "./globals.css";
// import { ThemeProvider } from "@/contexts/ThemeContext";
// import ThemeToggleButton from "@/components/common/ThemeToggleButton";
// import dynamic from "next/dynamic";
// import { FiLoader, FiUser, FiLogOut } from "react-icons/fi";
// import { Menu, Transition } from "@headlessui/react";
// import { usePathname, useRouter } from "next/navigation";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";

// const ClientSideToaster = dynamic(
//   () => import("react-hot-toast").then((mod) => mod.Toaster),
//   { ssr: false }
// );

// // ✅ Hinzugefügt: Ein Standard-Schriftarten-Stack, um die externe Abhängigkeit zu entfernen.
// const RootFontClass = "font-sans antialiased";

// const RootLoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-lg text-[var(--color-text-secondary)]">
//         Seite wird geladen...
//       </p>
//     </div>
//   </div>
// );

// const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       if (pathname.startsWith("/auth") || pathname === "/") {
//         setIsAuthenticated(false);
//         setUser(null);
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const response = await apiClient("/profile/me");
//         const data = await response.json();
//         if (response.ok && data.user) {
//           setUser(data.user);
//           setIsAuthenticated(true);
//         } else {
//           setIsAuthenticated(false);
//           setUser(null);
//           router.replace("/auth/signin?error=session_expired");
//         }
//       } catch (error) {
//         console.error("Fehler bei der Authentifizierungsprüfung:", error);
//         setIsAuthenticated(false);
//         setUser(null);
//         router.replace("/auth/signin?error=auth_check_failed");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, [pathname, router]);

//   return { isAuthenticated, user, isLoading };
// };

// const AppHeader = () => {
//   const { isAuthenticated, user, isLoading } = useAuth();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await apiClient("/auth/logout", { method: "POST" });
//       router.push("/auth/signin");
//     } catch (error) {
//       console.error("Abmeldung fehlgeschlagen:", error);
//       alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const UserMenu = () => (
//     <Menu as="div" className="relative ml-2">
//       <div>
//         <Menu.Button className="btn-icon">
//           <span className="sr-only">Benutzermenü öffnen</span>
//           <div className="h-9 w-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center font-bold text-[var(--color-text-on-accent)]">
//             {user?.firstName?.charAt(0).toUpperCase() || <FiUser />}
//           </div>
//         </Menu.Button>
//       </div>
//       <Transition
//         enter="transition ease-out duration-200"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border-color)]">
//           <div className="px-4 py-3 border-b border-[var(--border-color)]">
//             <p className="text-sm text-[var(--color-text-primary)]">
//               Angemeldet als
//             </p>
//             <p className="truncate text-sm font-medium text-[var(--color-text-secondary)]">
//               {user?.email}
//             </p>
//           </div>
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 href="/profile"
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 <FiUser className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />
//                 Mein Profil
//               </Link>
//             )}
//           </Menu.Item>
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 disabled={isLoggingOut}
//                 className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-danger)] disabled:opacity-50 ${
//                   active ? "bg-[var(--color-surface-2)]" : ""
//                 }`}
//               >
//                 {isLoggingOut ? (
//                   <FiLoader className="animate-spin mr-2 h-5 w-5" />
//                 ) : (
//                   <FiLogOut className="mr-2 h-5 w-5" />
//                 )}
//                 {isLoggingOut ? "Melde ab..." : "Abmelden"}
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );

//   return (
//     <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center gap-8">
//             <Link href="/" className="flex-shrink-0">
//               <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
//                 SimONE Simulation
//               </span>
//             </Link>
//           </div>
//           <div className="flex items-center">
//             <ThemeToggleButton />
//             {isLoading ? (
//               <div className="w-10 h-10 ml-2 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
//             ) : isAuthenticated ? (
//               <UserMenu />
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="de" suppressHydrationWarning={true}>
//       <head>
//         <title>SIMONE Simulation</title>
//         <meta
//           name="description"
//           content="Weboberfläche für die SIMONE-Simulationssteuerung"
//         />
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//       </head>
//       <body className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ease-in-out`}>
//         <ThemeProvider>
//           <ClientSideToaster
//             position="top-right"
//             toastOptions={
//               {}
//             }
//           />
//           <AppHeader />
//           <main className="flex-grow w-full">
//             <Suspense fallback={<RootLoadingSpinner />}>{children}</Suspense>
//           </main>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }




// frontend/src/app/layout.tsx
"use client";

import React, {
  Suspense,
  useState,
  useEffect,
} from "react";
// ✅ ENTFERNT: Die Inter-Schriftart, da sie den Build-Prozess blockierte.
// import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import dynamic from "next/dynamic";
import { FiLoader, FiUser, FiLogOut } from "react-icons/fi";
import { Menu, Transition } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { UserData } from "@/types";

const ClientSideToaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

// ✅ Hinzugefügt: Ein Standard-Schriftarten-Stack, um die externe Abhängigkeit zu entfernen.
const RootFontClass = "font-sans antialiased";

const RootLoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
      <p className="text-lg text-[var(--color-text-secondary)]">
        Seite wird geladen...
      </p>
    </div>
  </div>
);

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (pathname.startsWith("/auth") || pathname === "/") {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient("/profile/me");
        const data = await response.json();
        if (response.ok && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          router.replace("/auth/signin?error=session_expired");
        }
      } catch (error) {
        console.error("Fehler bei der Authentifizierungsprüfung:", error);
        setIsAuthenticated(false);
        setUser(null);
        router.replace("/auth/signin?error=auth_check_failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [pathname, router]);

  return { isAuthenticated, user, isLoading };
};

const AppHeader = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // ✅ NEU: Aufruf zum Beenden des Simone-Dienstes
      try {
        await apiClient("/simone/terminate", { method: "POST" });
      } catch (simoneError) {
        console.error("Failed to terminate Simone service:", simoneError);
        // Fehler bei der Beendigung des Dienstes wird nicht als kritisch
        // für den Logout-Vorgang angesehen.
      }
      
      await apiClient("/auth/logout", { method: "POST" });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Abmeldung fehlgeschlagen:", error);
      alert("Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const UserMenu = () => (
    <Menu as="div" className="relative ml-2">
      <div>
        <Menu.Button className="btn-icon">
          <span className="sr-only">Benutzermenü öffnen</span>
          <div className="h-9 w-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center font-bold text-[var(--color-text-on-accent)]">
            {user?.firstName?.charAt(0).toUpperCase() || <FiUser />}
          </div>
        </Menu.Button>
      </div>
      <Transition
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border-color)]">
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <p className="text-sm text-[var(--color-text-primary)]">
              Angemeldet als
            </p>
            <p className="truncate text-sm font-medium text-[var(--color-text-secondary)]">
              {user?.email}
            </p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] ${
                  active ? "bg-[var(--color-surface-2)]" : ""
                }`}
              >
                <FiUser className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />
                Mein Profil
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`group flex w-full items-center rounded-md px-3 py-2 text-sm text-[var(--color-danger)] disabled:opacity-50 ${
                  active ? "bg-[var(--color-surface-2)]" : ""
                }`}
              >
                {isLoggingOut ? (
                  <FiLoader className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <FiLogOut className="mr-2 h-5 w-5" />
                )}
                {isLoggingOut ? "Melde ab..." : "Abmelden"}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
                SimONE Simulation
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <ThemeToggleButton />
            {isLoading ? (
              <div className="w-10 h-10 ml-2 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
            ) : isAuthenticated ? (
              <UserMenu />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning={true}>
      <head>
        <title>SIMONE Simulation</title>
        <meta
          name="description"
          content="Weboberfläche für die SIMONE-Simulationssteuerung"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ease-in-out`}>
        <ThemeProvider>
          <ClientSideToaster
            position="top-right"
            toastOptions={
              {}
            }
          />
          <AppHeader />
          <main className="flex-grow w-full">
            <Suspense fallback={<RootLoadingSpinner />}>{children}</Suspense>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}