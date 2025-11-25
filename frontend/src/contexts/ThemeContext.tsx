// // frontend/src/contexts/ThemeContext.tsx
// "use client";

// import React, {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   ReactNode,
//   useCallback,
// } from "react";

// type Theme = "light" | "dark";

// interface ThemeContextType {
//   theme: Theme;
//   toggleTheme: () => void;
//   isThemeInitialized: boolean;
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// interface ThemeProviderProps {
//   children: ReactNode;
// }

// /**
//  * Ein Provider, der das Theme-Management für die gesamte Anwendung bereitstellt.
//  * Er initialisiert das Theme clientseitig, wendet es auf das HTML-Element an und ermöglicht das Umschalten.
//  */
// export const ThemeProvider = ({ children }: ThemeProviderProps) => {
//   // Der Zustand wird initial ohne Zugriff auf den localStorage initialisiert, um SSR-freundlich zu sein.
//   // Das tatsächliche Theme wird clientseitig in useEffect ermittelt.
//   const [theme, setTheme] = useState<Theme>("light"); // Optimistischer Standardwert
//   const [isThemeInitialized, setIsThemeInitialized] = useState(false);

//   // Effekt 1: Läuft einmal auf dem Client nach dem Mounten, um das initiale Theme festzulegen.
//   useEffect(() => {
//     console.log("[ThemeProvider] Initialisiere Theme...");
//     let initialUserPreference: Theme;
//     const storedTheme = localStorage.getItem("app-theme") as Theme | null;

//     if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
//       initialUserPreference = storedTheme;
//       console.log(
//         "[ThemeProvider] Gespeichertes Theme im localStorage gefunden:",
//         initialUserPreference
//       );
//     } else {
//       const prefersDarkQuery = window.matchMedia(
//         "(prefers-color-scheme: dark)"
//       );
//       initialUserPreference = prefersDarkQuery.matches ? "dark" : "light";
//       console.log(
//         "[ThemeProvider] Kein gespeichertes Theme, verwende Systemeinstellung:",
//         initialUserPreference,
//         "(bevorzugt Dunkel:",
//         prefersDarkQuery.matches,
//         ")"
//       );
//     }

//     setTheme(initialUserPreference);
//     setIsThemeInitialized(true); // Als initialisiert markieren, *nachdem* das Theme gesetzt wurde.

//     // Listener für Änderungen des System-Themes (optional, aber gute UX)
//     const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
//       // Nur aktualisieren, wenn keine explizite Benutzerauswahl im localStorage gespeichert ist.
//       if (!localStorage.getItem("app-theme")) {
//         const newSystemTheme = e.matches ? "dark" : "light";
//         console.log(
//           "[ThemeProvider] System-Theme geändert zu:",
//           newSystemTheme,
//           ". Aktualisiere App-Theme."
//         );
//         setTheme(newSystemTheme);
//       }
//     };
//     const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
//     prefersDarkQuery.addEventListener("change", systemThemeChangeHandler);

//     return () => {
//       prefersDarkQuery.removeEventListener("change", systemThemeChangeHandler);
//     };
//   }, []); // Leeres Abhängigkeitsarray: läuft einmal beim Mounten auf dem Client

//   // Effekt 2: Wendet die Theme-Klasse auf <html> an und aktualisiert den localStorage, wenn sich 'theme' oder 'isThemeInitialized' ändert.
//   useEffect(() => {
//     if (!isThemeInitialized) {
//       console.log(
//         "[ThemeProvider] Theme noch nicht initialisiert, überspringe Klassen-/localStorage-Update."
//       );
//       return;
//     }

//     const root = document.documentElement;
//     console.log(
//       `[ThemeProvider] Wende Theme an: ${theme}. Aktuelle classList:`,
//       root.classList.toString()
//     );
//     if (theme === "dark") {
//       root.classList.add("dark");
//       localStorage.setItem("app-theme", "dark");
//       console.log(
//         "[ThemeProvider] Dunkles Theme angewendet: Klasse 'dark' zu <html> hinzugefügt, localStorage gesetzt."
//       );
//     } else {
//       root.classList.remove("dark");
//       localStorage.setItem("app-theme", "light");
//       console.log(
//         "[ThemeProvider] Helles Theme angewendet: Klasse 'dark' von <html> entfernt, localStorage gesetzt."
//       );
//     }
//   }, [theme, isThemeInitialized]);

//   /**
//    * Schaltet das Theme zwischen 'light' und 'dark' um.
//    */
//   const toggleTheme = useCallback(() => {
//     if (!isThemeInitialized) {
//       console.log(
//         "[ThemeProvider] toggleTheme vor der Theme-Initialisierung aufgerufen. Breche ab."
//       );
//       return;
//     }
//     setTheme((prevTheme) => {
//       const newTheme = prevTheme === "light" ? "dark" : "light";
//       console.log(
//         `[ThemeProvider] Schalte Theme von '${prevTheme}' zu '${newTheme}' um.`
//       );
//       return newTheme;
//     });
//   }, [isThemeInitialized]);

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme, isThemeInitialized }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// /**
//  * Ein benutzerdefinierter Hook für den einfachen Zugriff auf den ThemeContext.
//  * Löst einen Fehler aus, wenn er außerhalb eines ThemeProvider verwendet wird.
//  */
// export const useTheme = (): ThemeContextType => {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error(
//       "useTheme muss innerhalb eines ThemeProvider verwendet werden."
//     );
//   }
//   return context;
// };

// frontend/src/contexts/ThemeContext.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

import React, {
  createContext, // Zum Erstellen eines Context-Objekts.
  useState, // Für lokalen Komponentenzustand.
  useEffect, // Für Nebenwirkungen (z.B. DOM-Manipulation, localStorage).
  useContext, // Zum Konsumieren des Contexts.
  ReactNode, // Typ für React-Kindelemente.
  useCallback, // Zum Memoizen von Funktionen.
} from "react";

// -------------------------------------------------------------------
// ✅ Typdefinitionen
// -------------------------------------------------------------------

// Definiert die möglichen Theme-Werte.
type Theme = "light" | "dark";

// Definiert die Struktur des Kontextwerts, der vom ThemeProvider bereitgestellt wird.
interface ThemeContextType {
  theme: Theme; // Der aktuelle Theme-Zustand ('light' oder 'dark').
  toggleTheme: () => void; // Funktion zum Umschalten des Themes.
  isThemeInitialized: boolean; // Zeigt an, ob das Theme initial vom Client geladen wurde.
}

// Erstellt das Context-Objekt. Der Initialwert ist 'undefined' und wird später vom Provider überschrieben.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Definiert die Props für die ThemeProvider-Komponente.
interface ThemeProviderProps {
  children: ReactNode; // Die Kindelemente, die innerhalb des Providers gerendert werden sollen.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ThemeProvider
 * Ein Provider, der das Theme-Management für die gesamte Anwendung bereitstellt.
 * Er initialisiert das Theme clientseitig (aus localStorage oder Systempräferenz),
 * wendet es auf das HTML-Element an und ermöglicht das Umschalten.
 * -------------------------------------------------------------------
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Der Zustand wird initial ohne direkten Zugriff auf den localStorage gesetzt,
  // um SSR (Server-Side Rendering) freundlich zu sein. Das tatsächliche Theme
  // wird clientseitig in einem useEffect-Hook ermittelt.
  const [theme, setTheme] = useState<Theme>("light"); // Optimistischer Standardwert, bevor das Theme ermittelt wird.
  const [isThemeInitialized, setIsThemeInitialized] = useState(false); // Zeigt an, ob die Theme-Initialisierung abgeschlossen ist.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook 1: Initiale Theme-Erkennung und System-Theme-Listener
   * Dieser Hook läuft einmal auf dem Client nach dem Mounten, um:
   * 1. Die gespeicherte Theme-Einstellung aus `localStorage` zu laden.
   * 2. Wenn keine gespeichert ist, die Systempräferenz (`prefers-color-scheme`) zu verwenden.
   * 3. Listener für Änderungen der System-Theme-Einstellung hinzuzufügen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    console.log("[ThemeProvider] Initialisiere Theme...");
    let initialUserPreference: Theme;
    const storedTheme = localStorage.getItem("app-theme") as Theme | null; // Versucht, das Theme aus dem localStorage zu laden.

    if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
      // Wenn ein gültiges Theme im localStorage gefunden wird, dieses verwenden.
      initialUserPreference = storedTheme;
      console.log(
        "[ThemeProvider] Gespeichertes Theme im localStorage gefunden:",
        initialUserPreference
      );
    } else {
      // Wenn kein Theme im localStorage gefunden wird, die Systempräferenz abfragen.
      const prefersDarkQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );
      initialUserPreference = prefersDarkQuery.matches ? "dark" : "light"; // 'dark' wenn System es bevorzugt, sonst 'light'.
      console.log(
        "[ThemeProvider] Kein gespeichertes Theme, verwende Systemeinstellung:",
        initialUserPreference,
        "(bevorzugt Dunkel:",
        prefersDarkQuery.matches,
        ")"
      );
    }

    setTheme(initialUserPreference); // Setzt das ermittelte initiale Theme.
    setIsThemeInitialized(true); // Markiert das Theme als initialisiert, *nachdem* es gesetzt wurde.

    // Listener für Änderungen des System-Themes (optional, aber gute UX).
    // Wenn der Benutzer das Theme manuell über den Toggle ändert, wird dies
    // in localStorage gespeichert und überschreibt die Systempräferenz.
    const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
      // Nur aktualisieren, wenn keine explizite Benutzerauswahl im localStorage gespeichert ist.
      if (!localStorage.getItem("app-theme")) {
        const newSystemTheme = e.matches ? "dark" : "light";
        console.log(
          "[ThemeProvider] System-Theme geändert zu:",
          newSystemTheme,
          ". Aktualisiere App-Theme."
        );
        setTheme(newSystemTheme); // Aktualisiert das App-Theme entsprechend der Systempräferenz.
      }
    };
    const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    prefersDarkQuery.addEventListener("change", systemThemeChangeHandler); // Fügt den Event-Listener hinzu.

    // Cleanup-Funktion: Entfernt den Event-Listener, wenn die Komponente unmounted wird.
    return () => {
      prefersDarkQuery.removeEventListener("change", systemThemeChangeHandler);
    };
  }, []); // Leeres Abhängigkeitsarray: läuft einmal beim ersten Mount auf dem Client.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook 2: Theme-Klasse auf HTML-Element anwenden & localStorage aktualisieren
   * Dieser Hook wird ausgelöst, wenn sich der 'theme'-Zustand oder
   * 'isThemeInitialized' ändert. Er sorgt dafür, dass die CSS-Klasse
   * ("dark") auf dem `<html>`-Element korrekt gesetzt und die Theme-Einstellung
   * im `localStorage` gespeichert wird.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    // Überspringen, wenn das Theme noch nicht initialisiert wurde (um Hydrationsfehler zu vermeiden).
    if (!isThemeInitialized) {
      console.log(
        "[ThemeProvider] Theme noch nicht initialisiert, überspringe Klassen-/localStorage-Update."
      );
      return;
    }

    const root = document.documentElement; // Greift auf das HTML-Wurzelelement zu.
    console.log(
      `[ThemeProvider] Wende Theme an: ${theme}. Aktuelle classList:`,
      root.classList.toString()
    );
    if (theme === "dark") {
      // Wenn das Theme 'dark' ist:
      root.classList.add("dark"); // Fügt die CSS-Klasse "dark" zum HTML-Element hinzu.
      localStorage.setItem("app-theme", "dark"); // Speichert die Präferenz im localStorage.
      console.log(
        "[ThemeProvider] Dunkles Theme angewendet: Klasse 'dark' zu <html> hinzugefügt, localStorage gesetzt."
      );
    } else {
      // Wenn das Theme 'light' ist:
      root.classList.remove("dark"); // Entfernt die CSS-Klasse "dark" vom HTML-Element.
      localStorage.setItem("app-theme", "light"); // Speichert die Präferenz im localStorage.
      console.log(
        "[ThemeProvider] Helles Theme angewendet: Klasse 'dark' von <html> entfernt, localStorage gesetzt."
      );
    }
  }, [theme, isThemeInitialized]); // Abhängigkeiten: wird bei Änderungen von 'theme' oder 'isThemeInitialized' ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: toggleTheme
   * Schaltet das Theme zwischen 'light' und 'dark' um.
   * Aktualisiert den 'theme'-Zustand.
   * Verwendet `useCallback` zur Memoizierung für Performance-Optimierung.
   * -------------------------------------------------------------------
   */
  const toggleTheme = useCallback(() => {
    // Verhindert das Umschalten, bevor das Theme initialisiert ist.
    if (!isThemeInitialized) {
      console.log(
        "[ThemeProvider] toggleTheme vor der Theme-Initialisierung aufgerufen. Breche ab."
      );
      return;
    }
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light"; // Ermittelt das neue Theme.
      console.log(
        `[ThemeProvider] Schalte Theme von '${prevTheme}' zu '${newTheme}' um.`
      );
      return newTheme; // Gibt das neue Theme zurück, um den Zustand zu aktualisieren.
    });
  }, [isThemeInitialized]); // Abhängigkeit: wird neu erstellt, wenn 'isThemeInitialized' sich ändert.

  // -------------------------------------------------------------------
  // ✅ Kontext-Provider
  // Stellt den Theme-Kontextwert (theme, toggleTheme, isThemeInitialized)
  // für alle Kindelemente bereit, die innerhalb des Providers gerendert werden.
  // -------------------------------------------------------------------
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeInitialized }}>
      {children} {/* Rendert die Kindelemente der Anwendung. */}
    </ThemeContext.Provider>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Hook: useTheme
 * Ein benutzerdefinierter Hook für den einfachen Zugriff auf den ThemeContext.
 * Löst einen Fehler aus, wenn er außerhalb eines ThemeProvider verwendet wird,
 * um eine korrekte Hook-Nutzung zu erzwingen.
 * -------------------------------------------------------------------
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext); // Versucht, den Kontextwert abzurufen.
  if (context === undefined) {
    // Wenn der Kontext undefined ist, bedeutet dies, dass der Hook außerhalb des Providers verwendet wurde.
    throw new Error(
      "useTheme muss innerhalb eines ThemeProvider verwendet werden."
    );
  }
  return context; // Gibt den Kontextwert zurück.
};
