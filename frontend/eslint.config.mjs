// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;

import { dirname } from "path"; // Importiert `dirname` aus dem Node.js `path`-Modul, um Verzeichnisnamen zu extrahieren.
import { fileURLToPath } from "url"; // Importiert `fileURLToPath` aus dem Node.js `url`-Modul, um eine Datei-URL in einen Dateipfad umzuwandeln.
import { FlatCompat } from "@eslint/eslintrc"; // Importiert `FlatCompat` aus der `@eslint/eslintrc`-Bibliothek, um ältere ESLint-Konfigurationen (im "Legacy"-Format) mit dem neuen "Flat Config"-Format kompatibel zu machen.

// Ermittelt den aktuellen Dateipfad und das Verzeichnis.
// `import.meta.url` gibt die URL der aktuellen Moduldatei zurück.
// `fileURLToPath` konvertiert diese URL in einen plattformspezifischen Dateipfad.
// `dirname` extrahiert den Verzeichnisnamen aus diesem Pfad.
const __filename = fileURLToToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialisiert `FlatCompat`.
// `baseDirectory`: Das Basisverzeichnis, von dem aus relative Pfade in den Legacy-Konfigurationen aufgelöst werden.
// Dies ist wichtig, damit ESLint die Konfigurationsdateien (wie die von 'next') korrekt finden kann.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Definiert die ESLint-Konfiguration als Array von Konfigurationsobjekten (Flat Config-Format).
const eslintConfig = [
  // Erweitert bestehende Konfigurationen.
  // `compat.extends()`: Wird verwendet, um Konfigurationen aus dem Legacy-Format (wie die von `next`) in das Flat Config-Format zu importieren.
  // "next/core-web-vitals": Enthält empfohlene Regeln für Next.js-Anwendungen, die sich auf Core Web Vitals und allgemeine Leistung beziehen.
  // "next/typescript": Enthält Regeln, die speziell für die Verwendung von TypeScript in Next.js-Projekten optimiert sind.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// Exportiert die finalisierte ESLint-Konfiguration.
export default eslintConfig;
