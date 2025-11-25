// // frontend/src/app/auth/forgot-password/page.tsx
// "use client";

// import { useState, FormEvent } from "react";
// import Link from "next/link";
// import { /*FiMail*/ FiLoader, FiCheckCircle } from "react-icons/fi";
// import PageShell from "@/components/layout/PageShell";
// import { apiClient } from "@/lib/apiClient";

// /**
//  * Eine Seite, die es Benutzern ermöglicht, ihr Passwort zurückzusetzen.
//  * Benutzer geben ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten.
//  */
// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   /**
//    * Behandelt das Absenden des Formulars zum Anfordern eines Links zum Zurücksetzen des Passworts.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     try {
//       const response = await apiClient("/auth/forgot-password", {
//         method: "POST",
//         body: JSON.stringify({ email }),
//       });
//       const data = await response.json();
//       setSuccessMessage(
//         data.message ||
//           "Link zum Zurücksetzen des Passworts erfolgreich gesendet!"
//       );
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <PageShell>
//       <div className="flex flex-col justify-center items-center min-h-full px-6 py-12 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
//             Haben Sie Ihr Passwort vergessen?
//           </h2>
//           <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
//             Geben Sie bitte Ihre E-Mail ein und wir senden Ihnen einen Link zum
//             Zurücksetzen.
//           </p>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
//             {successMessage ? (
//               <div className="text-center p-4">
//                 <FiCheckCircle className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />
//                 <p className="text-lg font-medium text-[var(--color-text-primary)]">
//                   Anfrage gesendet
//                 </p>
//                 <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
//                   {successMessage}
//                 </p>
//                 <Link
//                   href="/auth/signin"
//                   className="mt-6 block text-sm font-medium"
//                 >
//                   Zurück zum Anmelden
//                 </Link>
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-sm font-medium text-[var(--color-text-primary)]"
//                   >
//                     E-Mail-Adresse
//                   </label>
//                   <div className="mt-1 relative">
//                     {/* <FiMail
//                       className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
//                       aria-hidden="true"
//                     /> */}
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       autoComplete="email"
//                       required
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className="pl-10"
//                       placeholder="Ihre@email.com"
//                     />
//                   </div>
//                 </div>

//                 {error && (
//                   <p className="text-sm text-[var(--color-danger)]">{error}</p>
//                 )}

//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="btn-primary w-full disabled:opacity-50"
//                   >
//                     {isLoading ? (
//                       <FiLoader className="animate-spin h-5 w-5" />
//                     ) : (
//                       "Link zum Zurücksetzen senden"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             )}

//             <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-[var(--border-color)]" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
//                     Passwort wieder eingefallen?
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <Link
//                   href="/auth/signin"
//                   className="w-full flex justify-center rounded-md border py-2 px-4 text-sm font-medium shadow-sm"
//                 >
//                   Anmelden
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </PageShell>
//   );
// }

// frontend/src/app/auth/forgot-password/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import { useState, FormEvent } from "react"; // React Hooks für Zustand und Formularereignisse
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation
import { /*FiMail*/ FiLoader, FiCheckCircle } from "react-icons/fi"; // Importiert Icons (FiLoader für Spinner, FiCheckCircle für Erfolg)
import PageShell from "@/components/layout/PageShell"; // Importiert die allgemeine Seiten-Shell/Layout-Komponente
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ForgotPasswordPage
 * Eine Seite, die es Benutzern ermöglicht, ihr Passwort zurückzusetzen.
 * Benutzer geben ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen
 * des Passworts per E-Mail zu erhalten.
 * -------------------------------------------------------------------
 */
export default function ForgotPasswordPage() {
  // Zustandsvariablen für das Formular und den UI-Status
  const [email, setEmail] = useState(""); // Speichert die vom Benutzer eingegebene E-Mail-Adresse
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob die Anfrage läuft (Ladezustand)
  const [error, setError] = useState<string | null>(null); // Speichert Fehlermeldungen
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Speichert Erfolgsmeldungen

  /**
   * -------------------------------------------------------------------
   * ✅ handleSubmit
   * Behandelt das Absenden des Formulars zum Anfordern eines Links zum
   * Zurücksetzen des Passworts.
   * Sendet die E-Mail-Adresse an das Backend.
   * @param event - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite bei Formularübermittlung
    setIsLoading(true); // Setzt den Ladezustand auf true
    setError(null); // Löscht vorherige Fehlermeldungen
    setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen

    try {
      // Führt die POST-Anfrage an den "/auth/forgot-password"-Endpunkt der API aus
      const response = await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }), // Sendet die E-Mail-Adresse im JSON-Format
      });
      const data = await response.json(); // Parsed die JSON-Antwort vom Server

      // Setzt die Erfolgsmeldung basierend auf der Serverantwort oder einer Standardnachricht
      setSuccessMessage(
        data.message ||
          "Link zum Zurücksetzen des Passworts erfolgreich gesendet! Bitte überprüfen Sie Ihren Posteingang."
      );
    } catch (err) {
      // Fehlerbehandlung bei API-Aufruf
      const errorMessage =
        err instanceof Error
          ? err.message // Wenn es ein Error-Objekt ist, verwende dessen Nachricht
          : "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."; // Generische Fehlermeldung
      setError(errorMessage); // Setzt die Fehlermeldung
    } finally {
      setIsLoading(false); // Setzt den Ladezustand auf false, unabhängig vom Ergebnis
    }
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ForgotPasswordPage-Komponente
  // Zeigt je nach Zustand (Erfolg, Fehler, Eingabe) unterschiedliche UI-Elemente an.
  // -------------------------------------------------------------------
  return (
    <PageShell>
      {" "}
      {/* Die Seiten-Shell bietet ein grundlegendes Layout */}
      <div className="flex flex-col justify-center items-center min-h-full px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Haben Sie Ihr Passwort vergessen?
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
            Geben Sie bitte Ihre E-Mail ein und wir senden Ihnen einen Link zum
            Zurücksetzen.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
            {successMessage ? (
              // Erfolgsanzeige, wenn ein Link gesendet wurde
              <div className="text-center p-4">
                <FiCheckCircle className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />{" "}
                {/* Erfolgs-Icon */}
                <p className="text-lg font-medium text-[var(--color-text-primary)]">
                  Anfrage gesendet
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {successMessage} {/* Zeigt die Erfolgsmeldung an */}
                </p>
                <Link
                  href="/auth/signin" // Link zurück zur Anmeldeseite
                  className="mt-6 block text-sm font-medium text-[var(--color-link)] hover:text-[var(--color-link-hover)]"
                >
                  Zurück zum Anmelden
                </Link>
              </div>
            ) : (
              // Formular zur Eingabe der E-Mail-Adresse
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    E-Mail-Adresse
                  </label>
                  <div className="mt-1 relative">
                    {/* Icon für E-Mail-Feld (auskommentiert, da FiMail nicht importiert wurde) */}
                    {/* <FiMail
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
                      aria-hidden="true"
                    /> */}
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email" // Auto-Vervollständigung für E-Mail
                      required // Pflichtfeld
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Aktualisiert den E-Mail-Zustand
                      className="pl-10" // Padding links für optionales Icon
                      placeholder="Ihre@email.com"
                    />
                  </div>
                </div>

                {/* Fehlermeldung, wenn ein Fehler aufgetreten ist */}
                {error && (
                  <p className="text-sm text-[var(--color-danger)]">{error}</p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading} // Deaktiviert den Button während des Ladens
                    className="btn-primary w-full disabled:opacity-50" // Primärer Button-Stil, opaker wenn deaktiviert
                  >
                    {isLoading ? (
                      <FiLoader className="animate-spin h-5 w-5 mx-auto" /> // Spinner, wenn geladen wird
                    ) : (
                      "Link zum Zurücksetzen senden" // Button-Text
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Trennlinie und Link zur Anmeldeseite */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-color)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
                    Passwort wieder eingefallen?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/auth/signin" // Link zur Anmeldeseite
                  className="w-full flex justify-center rounded-md border border-[var(--border-color)] bg-[var(--color-button-secondary-bg)] py-2 px-4 text-sm font-medium text-[var(--color-button-secondary-text)] shadow-sm hover:bg-[var(--color-button-secondary-hover-bg)]"
                >
                  Anmelden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
