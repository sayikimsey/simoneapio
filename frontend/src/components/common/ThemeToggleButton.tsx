// // frontend/src/components/common/ThemeToggleButton.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { useTheme } from "@/contexts/ThemeContext";
// import { FiSun, FiMoon, FiLoader } from "react-icons/fi";

// /**
//  * Eine Schaltfläche zum Umschalten des Farbschemas der Anwendung (Hell/Dunkel).
//  * Zeigt einen Ladezustand an, bis das Theme initialisiert ist.
//  */
// export default function ThemeToggleButton() {
//   const { theme, toggleTheme, isThemeInitialized } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   // Stellt sicher, dass die Komponente nur auf dem Client gerendert wird, um Hydrationsfehler zu vermeiden.
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   /**
//    * Behandelt den Klick auf die Schaltfläche, um das Theme umzuschalten.
//    */
//   const handleToggle = () => {
//     toggleTheme();
//   };

//   // Zeigt einen Platzhalter an, bis die Komponente gemountet und das Theme initialisiert ist.
//   if (!mounted || !isThemeInitialized) {
//     return (
//       <button
//         aria-label="Lade Theme-Einstellung"
//         title="Theme-Einstellung wird geladen..."
//         className="btn-icon animate-pulse"
//         disabled
//       >
//         <FiLoader className="h-5 w-5 animate-spin" />
//       </button>
//     );
//   }

//   return (
//     <button
//       onClick={handleToggle}
//       aria-label={
//         theme === "light"
//           ? "In den Dunkelmodus wechseln"
//           : "In den Hellmodus wechseln"
//       }
//       title={
//         theme === "light"
//           ? "In den Dunkelmodus wechseln"
//           : "In den Hellmodus wechseln"
//       }
//       className="btn-icon"
//     >
//       {theme === "light" ? (
//         <FiMoon className="h-5 w-5 sm:h-6 sm:w-6" />
//       ) : (
//         <FiSun className="h-5 w-5 sm:h-6 sm:w-6" />
//       )}
//     </button>
//   );
// }

// frontend/src/components/common/ThemeToggleButton.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

import React, { useEffect, useState } from "react"; // React Hooks für Zustand und Lebenszyklus.
import { useTheme } from "@/contexts/ThemeContext"; // Importiert den benutzerdefinierten Hook 'useTheme' aus dem ThemeContext.
import { FiSun, FiMoon, FiLoader } from "react-icons/fi"; // Importiert Icons (Sonne für hell, Mond für dunkel, Lade-Spinner).

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ThemeToggleButton
 * Eine Schaltfläche zum Umschalten des Farbschemas der Anwendung (Hell/Dunkel).
 * Sie interagiert mit dem ThemeContext, um den aktuellen Theme-Zustand abzurufen
 * und die Umschaltfunktion aufzurufen.
 * Zeigt einen Ladezustand an, bis das Theme initialisiert ist, um Hydrationsfehler zu vermeiden.
 * -------------------------------------------------------------------
 */
export default function ThemeToggleButton() {
  // Holt den aktuellen Theme-Status, die Umschaltfunktion und den Initialisierungsstatus vom ThemeContext.
  const { theme, toggleTheme, isThemeInitialized } = useTheme();
  // 'mounted' Zustand, um sicherzustellen, dass die Komponente nur auf dem Client gerendert wird.
  const [mounted, setMounted] = useState(false);

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Komponente mounten
   * Dieser Hook wird einmalig nach dem ersten Rendern auf dem Client ausgeführt.
   * Er setzt 'mounted' auf true, was signalisiert, dass die Komponente sicher
   * auf dem Client interaktiv ist. Dies ist wichtig, da Theme-Einstellungen oft
   * vom `localStorage` gelesen werden und es sonst zu Hydrationsfehlern kommen kann,
   * wenn der Server und Client unterschiedliche initiale Renderings erzeugen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    setMounted(true);
  }, []); // Leeres Abhängigkeitsarray: Effekt läuft nur einmal nach dem ersten Rendern.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleToggle
   * Behandelt den Klick auf die Schaltfläche, um das Theme umzuschalten.
   * Ruft die 'toggleTheme'-Funktion aus dem ThemeContext auf.
   * -------------------------------------------------------------------
   */
  const handleToggle = () => {
    toggleTheme(); // Ruft die Funktion zum Umschalten des Themes auf.
  };

  // -------------------------------------------------------------------
  // ✅ Render-Logik: Ladezustand oder Theme-Schaltfläche
  // -------------------------------------------------------------------

  // Zeigt einen Platzhalter (Spinner-Button) an, bis die Komponente gemountet
  // und das Theme aus dem Kontext initialisiert ist.
  if (!mounted || !isThemeInitialized) {
    return (
      <button
        aria-label="Lade Theme-Einstellung" // Zugänglichkeitslabel für Screenreader.
        title="Theme-Einstellung wird geladen..." // Tooltip beim Hover.
        className="btn-icon animate-pulse" // Styling-Klassen für Icon-Button mit Pulsen-Animation.
        disabled // Button deaktivieren, solange geladen wird.
      >
        <FiLoader className="h-5 w-5 animate-spin" /> {/* Lade-Spinner-Icon. */}
      </button>
    );
  }

  // Wenn die Komponente gemountet und das Theme initialisiert ist,
  // wird der tatsächliche Umschalt-Button gerendert.
  return (
    <button
      onClick={handleToggle} // Klick-Handler zum Umschalten des Themes.
      aria-label={
        theme === "light"
          ? "In den Dunkelmodus wechseln"
          : "In den Hellmodus wechseln"
      } // Zugänglichkeitslabel, das den aktuellen Status beschreibt.
      title={
        theme === "light"
          ? "In den Dunkelmodus wechseln"
          : "In den Hellmodus wechseln"
      } // Tooltip, der den aktuellen Status beschreibt.
      className="btn-icon" // Styling-Klassen für Icon-Button.
    >
      {theme === "light" ? (
        // Wenn das Theme 'light' ist, zeige das Mond-Icon (zum Wechseln in den Dunkelmodus).
        <FiMoon className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        // Wenn das Theme 'dark' ist, zeige das Sonnen-Icon (zum Wechseln in den Hellmodus).
        <FiSun className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </button>
  );
}
