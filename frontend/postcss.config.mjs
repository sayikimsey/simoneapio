// const config = {
//   plugins: ["@tailwindcss/postcss"],
// };

// export default config;

const config = {
  // `plugins`: Ein Array von PostCSS-Plugins, die angewendet werden sollen.
  plugins: [
    // "@tailwindcss/postcss": Dies ist das offizielle PostCSS-Plugin für Tailwind CSS.
    // Es ist dafür verantwortlich, die Tailwind-Direktiven (@tailwind base, @tailwind components, @tailwind utilities)
    // in Ihren CSS-Dateien zu verarbeiten und Tailwinds Utility-Klassen zu generieren.
    "@tailwindcss/postcss",
  ],
};

export default config; // Exportiert die Konfiguration, damit PostCSS sie verwenden kann.