// import type { Config } from "tailwindcss";

// const config: Config = {
//   // This is the most critical line. It enables class-based dark mode.
//   darkMode: "class",

//   // This tells Tailwind where to look for class names.
//   // It's essential that these paths are correct for your project structure.
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],

//   // Your project's theme extensions can go here.
//   theme: {
//     extend: {
//       // For example, if you had custom animations or background images:
//       // backgroundImage: {
//       //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//       //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
//       // },
//     },
//   },

//   // Any Tailwind plugins you use are listed here.
//   plugins: [],
// };

// export default config;

import type { Config } from "tailwindcss"; // Importiert den Typ 'Config' von Tailwind CSS für bessere Typüberprüfung.

const config: Config = {
  // -------------------------------------------------------------------
  // ✅ Dark Mode-Strategie
  // Dies ist die kritischste Zeile, die den klassenbasierten Dark Mode aktiviert.
  // -------------------------------------------------------------------
  // `darkMode: "class"`:
  // Legt fest, wie Tailwind den Dark Mode erkennen soll. Bei "class" sucht Tailwind
  // nach einer Klasse `dark` im HTML-Baum (typischerweise auf dem `<html>`-Tag).
  // Wenn diese Klasse vorhanden ist, werden die `dark:`-Varianten von Utility-Klassen
  // angewendet (z.B. `dark:bg-gray-800`). Dies ermöglicht es Ihnen, den Dark Mode
  // über JavaScript ein- und auszuschalten.
  darkMode: "class",

  // -------------------------------------------------------------------
  // ✅ Inhalt (Content)
  // Dies teilt Tailwind mit, wo es nach Klassennamen suchen soll, die in Ihrem Code verwendet werden.
  // Es ist entscheidend, dass diese Pfade korrekt sind, damit Tailwind alle benötigten CSS-Klassen
  // generiert und ungenutzte Klassen entfernen kann (Purging).
  // -------------------------------------------------------------------
  content: [
    // Pfade zu Ihren Dateien, die Tailwind-Klassen enthalten könnten.
    // Tailwind scannt diese Dateien und extrahiert alle Klassennamen.
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Für Seiten im 'pages'-Verzeichnis.
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Für Komponenten.
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Für das 'app'-Verzeichnis (Next.js App Router).
  ],

  // -------------------------------------------------------------------
  // ✅ Theme-Erweiterungen
  // Hier können Sie das Standard-Theme von Tailwind erweitern und anpassen.
  // Sie können Farben, Schriftarten, Abstände, Breakpoints usw. hinzufügen oder ändern.
  // -------------------------------------------------------------------
  theme: {
    extend: {
      // Der `extend`-Block ermöglicht es Ihnen, neue Werte hinzuzufügen
      // oder die Standardwerte von Tailwind zu überschreiben, ohne sie komplett zu ersetzen.
      // Zum Beispiel, wenn Sie benutzerdefinierte Animationen oder Hintergrundbilder hätten:
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
    },
  },

  // -------------------------------------------------------------------
  // ✅ Plugins
  // Alle Tailwind-Plugins, die Sie verwenden, werden hier aufgelistet.
  // Plugins fügen Utility-Klassen oder neue CSS-Funktionen hinzu.
  // -------------------------------------------------------------------
  plugins: [],
};

export default config; // Exportiert das Konfigurationsobjekt für Tailwind CSS.
