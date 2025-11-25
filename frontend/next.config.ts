// // export default nextConfig;
// /** @type {import('next').NextConfig} */ // JSDoc-Typisierung für Autovervollständigung und Typenprüfung.
// const nextConfig = {
//   // Die 'rewrites'-Funktion ist eine asynchrone Methode in Next.js,
//   // die es ermöglicht, URL-Pfade intern umzuschreiben.
//   async rewrites() {
//     return [
//       {
//         // source: Definiert den eingehenden Pfad, der umgeschrieben werden soll.
//         // Hier: Matcht jeden Request-Pfad, der mit '/api/' beginnt.
//         // ':path*' ist ein Wildcard-Parameter, der den Rest des Pfades nach '/api/' erfasst.
//         source: "/api/:path*",
//         // destination: Definiert die Ziel-URL, an die der Request weitergeleitet wird.
//         // Hier: Leitet die Anfrage an den Backend-Server weiter, der auf localhost:3001 läuft.
//         // Der ':path*'-Platzhalter stellt sicher, dass der erfasste Teil des 'source'-Pfades
//         // (z.B. alles nach '/api/') korrekt an die 'destination'-URL angehängt wird.
//         // Dadurch wird effektiv das '/api'-Präfix entfernt, wenn der Request an das Backend gesendet wird.
//          //destination: "http://localhost:3001/:path*",
//         destination: "http://localhost:4201:path*",
//       },
//     ];
//   },
// };

// // Exportiert die Next.js-Konfiguration, damit sie vom Framework verwendet werden kann.
// export default nextConfig;

// frontend/next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only apply rewrites in the development environment
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:4201/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;