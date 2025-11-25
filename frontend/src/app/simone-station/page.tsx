// // frontend/src/app/simone-station/page.tsx
// "use client";

// import React from "react";
// import { FiCpu } from "react-icons/fi";
// import StationTabs from "@/components/simone/StationTabs";
// import { SimoneProvider } from "@/contexts/SimoneContext";

// /**
//  * Die Hauptkomponente für die SIMONE-Station-Seite.
//  * Sie verwendet den SimoneProvider, um den Zustand für die untergeordneten Tab-Komponenten zu verwalten.
//  */
// export default function SimoneStationPage() {
//   return (
//     <SimoneProvider>
//       <div className="space-y-8">
//         <header className="pb-6 border-b border-[var(--border-color)]">
//           <div className="flex items-center space-x-3">
//             <FiCpu className="h-8 w-8 text-[var(--color-accent)]" />
//             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
//               SIMONE Interaktionsstation
//             </h1>
//           </div>
//           <p className="mt-2 text-md text-[var(--color-text-secondary)]">
//             Die zentrale Anlaufstelle für die Verwaltung von Netzwerken,
//             Szenarien, Daten und Berechnungen.
//           </p>
//         </header>

//         <StationTabs />
//       </div>
//     </SimoneProvider>
//   );
// }

// frontend/src/app/simone-station/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, was für interaktive UI-Elemente notwendig ist.

import React from "react"; // Importiert die React-Bibliothek.
import { FiCpu } from "react-icons/fi"; // Importiert das CPU-Icon von Feather Icons für visuelle Akzente.
import StationTabs from "@/components/simone/StationTabs"; // Importiert die Komponente, die die Tab-Navigation und -Inhalte der Station rendert.
import { SimoneProvider } from "@/contexts/SimoneContext"; // Importiert den SimoneContext Provider, der den gemeinsamen Zustand für die SIMONE-Interaktionen bereitstellt.

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: SimoneStationPage
 * Die Hauptkomponente für die SIMONE-Station-Seite.
 * Sie umschließt den gesamten Inhalt mit dem `SimoneProvider`,
 * um den zentralen Zustand (z.B. aktuelles Netzwerk, Szenario-Status)
 * für alle untergeordneten Tab-Komponenten zu verwalten. Dies ist entscheidend
 * für die kohärente Interaktion mit der SIMONE-API über verschiedene UI-Bereiche hinweg.
 * -------------------------------------------------------------------
 */
export default function SimoneStationPage() {
  return (
    <SimoneProvider> {/* Umschließt die gesamte Seite mit dem SimoneProvider, um den Kontext bereitzustellen. */}
      <div className="space-y-8"> {/* Tailwind CSS für vertikalen Abstand zwischen den Abschnitten. */}
        <header className="pb-6 border-b border-[var(--border-color)]"> {/* Header-Bereich mit unterer Trennlinie. */}
          <div className="flex items-center space-x-3"> {/* Layout für Icon und Überschrift. */}
            <FiCpu className="h-8 w-8 text-[var(--color-accent)]" /> {/* CPU-Icon als visuelles Element. */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
              SIMONE Interaktionsstation {/* Hauptüberschrift der Seite. */}
            </h1>
          </div>
          <p className="mt-2 text-md text-[var(--color-text-secondary)]">
            Die zentrale Anlaufstelle für die Verwaltung von Netzwerken,
            Szenarien, Daten und Berechnungen. {/* Beschreibung der Seite. */}
          </p>
        </header>

        <StationTabs /> {/* Rendert die Tab-Navigation und den Inhalt für die verschiedenen SIMONE-Funktionen. */}
      </div>
    </SimoneProvider>
  );
}