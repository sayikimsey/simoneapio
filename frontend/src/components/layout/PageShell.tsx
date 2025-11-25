// // frontend/src/components/layout/PageShell.tsx
// "use client";

// import React from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import ThemeToggleButton from "@/components/common/ThemeToggleButton";

// /**
//  * PageShell bietet eine grundlegende Seitenstruktur, einschließlich eines Headers,
//  * der auf bestimmten Routen (z. B. Authentifizierungsseiten) ausgeblendet wird.
//  * @param {object} props - Die Eigenschaften der Komponente.
//  * @param {React.ReactNode} props.children - Die Kind-Komponenten, die im Hauptinhaltsbereich gerendert werden sollen.
//  */
// export default function PageShell({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();

//   // Bestimmt, ob der Header angezeigt werden soll.
//   // Der Header wird für alle Routen angezeigt, außer für solche, die mit /auth beginnen.
//   const showHeader = !pathname.startsWith("/auth");

//   return (
//     <>
//       {showHeader && (
//         <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
//           <div className="w-full px-4 sm:px-6 lg:px-8">
//             <div className="flex h-16 items-center justify-between">
//               <div className="flex items-center">
//                 <Link href="/" className="flex-shrink-0">
//                   <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
//                     SimONE Simulation
//                   </span>
//                 </Link>
//               </div>
//               <div className="flex items-center">
//                 <ThemeToggleButton />
//               </div>
//             </div>
//           </div>
//         </header>
//       )}

//       {/*
//         Der Hauptinhaltsbereich. Die übergeordnete Seite (children) sollte bei Bedarf
//         ihren eigenen oberen Abstand verwalten, um nicht vom fixierten Header verdeckt zu werden.
//       */}
//       <main className="flex-grow w-full">{children}</main>
//     </>
//   );
// }

// frontend/src/components/layout/PageShell.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks wie usePathname.

import React from "react"; // Importiert die React-Bibliothek.
import { usePathname } from "next/navigation"; // Next.js Hook zum Abrufen des aktuellen Pfadnamens.
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
import ThemeToggleButton from "@/components/common/ThemeToggleButton"; // Importiert den Button zum Umschalten des Themes.

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: PageShell
 * Zweck: Bietet eine grundlegende Seitenstruktur, einschließlich eines Headers,
 * der auf bestimmten Routen (z. B. Authentifizierungsseiten) ausgeblendet wird.
 *
 * @param {object} props - Die Eigenschaften der Komponente.
 * @param {React.ReactNode} props.children - Die Kind-Komponenten, die im Hauptinhaltsbereich gerendert werden sollen.
 * -------------------------------------------------------------------
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Holt den aktuellen Pfadnamen der URL.

  // Bestimmt, ob der Header angezeigt werden soll.
  // Der Header wird für alle Routen angezeigt, außer für solche, die mit "/auth" beginnen.
  const showHeader = !pathname.startsWith("/auth");

  return (
    <> {/* Ein React Fragment, um mehrere Elemente zurückzugeben, ohne einen zusätzlichen DOM-Knoten zu erstellen. */}
      {showHeader && ( // Bedingtes Rendern des Headers: Nur wenn showHeader true ist.
        <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] transition-colors duration-300 ease-in-out">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0">
                  <span className="text-2xl font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
                    SimONE Simulation {/* Der Anwendungsname/Logo-Link. */}
                  </span>
                </Link>
              </div>
              <div className="flex items-center">
                <ThemeToggleButton /> {/* Button zum Umschalten zwischen hellem und dunklem Theme. */}
              </div>
            </div>
          </div>
        </header>
      )}

      {/*
        Der Hauptinhaltsbereich der Seite.
        Die übergeordnete Seite (children) sollte bei Bedarf
        ihren eigenen oberen Abstand verwalten, um nicht vom fixierten Header verdeckt zu werden.
        Die 'flex-grow' und 'w-full' Klassen sorgen dafür, dass dieser Bereich den
        verbleibenden vertikalen und horizontalen Platz im Flex-Container ausfüllt.
      */}
      <main className="flex-grow w-full">{children}</main>
    </>
  );
}