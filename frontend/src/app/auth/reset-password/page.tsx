// // frontend/src/app/auth/reset-password/page.tsx
// "use client";

// import { useState, FormEvent, Suspense } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import PageShell from "@/components/layout/PageShell";
// import { apiClient } from "@/lib/apiClient";
// import { /*FiKey,*/ FiLoader, FiCheckCircle } from "react-icons/fi";

// /**
//  * Die Inhaltskomponente für die Seite zum Zurücksetzen des Passworts.
//  * Enthält die Logik zur Handhabung des Passwort-Reset-Formulars.
//  */
// function ResetPasswordContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get("token");

//   const [password, setPassword] = useState("");
//   const [passwordConfirmation, setPasswordConfirmation] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   /**
//    * Behandelt das Absenden des Formulars zum Zurücksetzen des Passworts.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!token) {
//       setError(
//         "Kein Token zum Zurücksetzen gefunden. Bitte fordern Sie einen neuen Link an."
//       );
//       return;
//     }
//     if (password !== passwordConfirmation) {
//       setError("Die Passwörter stimmen nicht überein.");
//       return;
//     }
//     if (password.length < 8) {
//       setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     try {
//       const response = await apiClient("/auth/reset-password", {
//         method: "POST",
//         body: JSON.stringify({
//           token,
//           newPassword: password,
//           confirmNewPassword: passwordConfirmation,
//         }),
//       });
//       const data = await response.json();
//       setSuccessMessage(
//         data.message || "Ihr Passwort wurde erfolgreich zurückgesetzt!"
//       );

//       // Leitet nach einer Verzögerung zur Anmeldeseite weiter
//       setTimeout(() => {
//         router.push("/auth/signin");
//       }, 3000);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Ein unbekannter Fehler ist aufgetreten. Der Token könnte ungültig oder abgelaufen sein.";
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
//             Passwort zurücksetzen
//           </h2>
//           <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
//             Wählen Sie ein neues, sicheres Passwort für Ihr Konto.
//           </p>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
//             {successMessage ? (
//               <div className="text-center p-4">
//                 <FiCheckCircle className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />
//                 <p className="text-lg font-medium text-[var(--color-text-primary)]">
//                   Passwort zurückgesetzt!
//                 </p>
//                 <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
//                   {successMessage}
//                 </p>
//                 <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//                   Sie werden zur Anmeldeseite weitergeleitet...
//                 </p>
//                 <Link
//                   href="/auth/signin"
//                   className="mt-6 block text-sm font-medium"
//                 >
//                   Jetzt anmelden
//                 </Link>
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-[var(--color-text-primary)]"
//                   >
//                     Neues Passwort
//                   </label>
//                   <div className="mt-1 relative">
//                     {/* <FiKey
//                       className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
//                       aria-hidden="true"
//                     /> */}
//                     <input
//                       id="password"
//                       name="password"
//                       type="password"
//                       required
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="pl-10"
//                       placeholder="********"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="passwordConfirmation"
//                     className="block text-sm font-medium text-[var(--color-text-primary)]"
//                   >
//                     Neues Passwort bestätigen
//                   </label>
//                   <div className="mt-1 relative">
//                     {/* <FiKey
//                       className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
//                       aria-hidden="true"
//                     /> */}
//                     <input
//                       id="passwordConfirmation"
//                       name="passwordConfirmation"
//                       type="password"
//                       required
//                       value={passwordConfirmation}
//                       onChange={(e) => setPasswordConfirmation(e.target.value)}
//                       className="pl-10"
//                       placeholder="********"
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
//                       "Passwort zurücksetzen"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>
//     </PageShell>
//   );
// }

// /**
//  * Die Seite zum Zurücksetzen des Passworts, umgeben von einem Suspense-Fallback.
//  */
// export default function ResetPasswordPage() {
//   return (
//     <Suspense>
//       <ResetPasswordContent />
//     </Suspense>
//   );
// }

// frontend/src/app/auth/reset-password/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import { useState, FormEvent, Suspense } from "react"; // React Hooks für Zustand, Formularereignisse und Suspense
import { useSearchParams, useRouter } from "next/navigation"; // Next.js Hooks für URL-Suchparameter und Navigation
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation
import PageShell from "@/components/layout/PageShell"; // Importiert die allgemeine Seiten-Shell/Layout-Komponente
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen
import { /*FiKey,*/ FiLoader, FiCheckCircle } from "react-icons/fi"; // Importiert Icons (FiLoader für Spinner, FiCheckCircle für Erfolg)

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ResetPasswordContent
 * Die Hauptinhaltskomponente für die Seite zum Zurücksetzen des Passworts.
 * Enthält die Logik zur Handhabung des Passwort-Reset-Formulars,
 * einschließlich der Validierung des Tokens und der Passwörter sowie
 * der Kommunikation mit dem Backend.
 * -------------------------------------------------------------------
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams(); // Hook zum Zugriff auf URL-Suchparameter
  const router = useRouter(); // Hook zum Navigieren zwischen Routen
  const token = searchParams.get("token"); // Extrahiert den "token"-Parameter aus der URL

  // Zustandsvariablen für das Formular und den UI-Status
  const [password, setPassword] = useState(""); // Speichert das neue Passwort
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // Speichert die Bestätigung des neuen Passworts
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob die Anfrage läuft
  const [error, setError] = useState<string | null>(null); // Speichert Fehlermeldungen
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Speichert Erfolgsmeldungen

  /**
   * -------------------------------------------------------------------
   * ✅ handleSubmit
   * Behandelt das Absenden des Formulars zum Zurücksetzen des Passworts.
   * Führt Client-seitige Validierungen durch und sendet die Daten an die API.
   * @param event - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite

    // Client-seitige Validierungen
    if (!token) {
      setError(
        "Kein Token zum Zurücksetzen gefunden. Bitte fordern Sie einen neuen Link an."
      );
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setIsLoading(true); // Setzt Ladezustand auf true
    setError(null); // Löscht vorherige Fehler
    setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen

    try {
      // Führt die POST-Anfrage an den "/auth/reset-password"-Endpunkt der API aus
      const response = await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token, // Der aus der URL extrahierte Token
          newPassword: password, // Das neue Passwort
          confirmNewPassword: passwordConfirmation, // Die Passwortbestätigung
        }),
      });
      const data = await response.json(); // Parsed die JSON-Antwort

      // Setzt die Erfolgsmeldung basierend auf der Serverantwort
      setSuccessMessage(
        data.message || "Ihr Passwort wurde erfolgreich zurückgesetzt!"
      );

      // Leitet nach einer Verzögerung zur Anmeldeseite weiter
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000); // 3 Sekunden Verzögerung
    } catch (err) {
      // Fehlerbehandlung bei API-Aufruf
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ein unbekannter Fehler ist aufgetreten. Der Token könnte ungültig oder abgelaufen sein.";
      setError(errorMessage); // Setzt die Fehlermeldung
    } finally {
      setIsLoading(false); // Setzt den Ladezustand auf false
    }
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ResetPasswordContent-Komponente
  // Zeigt je nach Zustand (Erfolg, Fehler, Eingabe) unterschiedliche UI-Elemente an.
  // -------------------------------------------------------------------
  return (
    <PageShell>
      {" "}
      {/* Die Seiten-Shell bietet ein grundlegendes Layout */}
      <div className="flex flex-col justify-center items-center min-h-full px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Passwort zurücksetzen
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
            Wählen Sie ein neues, sicheres Passwort für Ihr Konto.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
            {successMessage ? (
              // Erfolgsanzeige nach erfolgreichem Passwort-Reset
              <div className="text-center p-4">
                <FiCheckCircle className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />{" "}
                {/* Erfolgs-Icon */}
                <p className="text-lg font-medium text-[var(--color-text-primary)]">
                  Passwort zurückgesetzt!
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {successMessage}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Sie werden zur Anmeldeseite weitergeleitet...
                </p>
                <Link
                  href="/auth/signin" // Link zur Anmeldeseite
                  className="mt-6 block text-sm font-medium text-[var(--color-link)] hover:text-[var(--color-link-hover)]"
                >
                  Jetzt anmelden
                </Link>
              </div>
            ) : (
              // Formular zur Eingabe des neuen Passworts
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    Neues Passwort
                  </label>
                  <div className="mt-1 relative">
                    {/* Icon für Passwortfeld (auskommentiert) */}
                    {/* <FiKey
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
                      aria-hidden="true"
                    /> */}
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required // Pflichtfeld
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} // Aktualisiert den Passwort-Zustand
                      className="pl-10" // Padding links für optionales Icon
                      placeholder="********"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirmation"
                    className="block text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    Neues Passwort bestätigen
                  </label>
                  <div className="mt-1 relative">
                    {/* Icon für Passwortbestätigungsfeld (auskommentiert) */}
                    {/* <FiKey
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-[var(--color-text-secondary)]"
                      aria-hidden="true"
                    /> */}
                    <input
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      type="password"
                      required // Pflichtfeld
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)} // Aktualisiert den Passwortbestätigungs-Zustand
                      className="pl-10" // Padding links für optionales Icon
                      placeholder="********"
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
                      "Passwort zurücksetzen" // Button-Text
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ResetPasswordPage (Export)
 * Die Seite zum Zurücksetzen des Passworts, umgeben von einem Suspense-Fallback.
 * Dies ist notwendig, da 'useSearchParams' eine Client-Komponente ist
 * und in einer Suspense-Boundary gerendert werden muss, wenn sie in einem
 * Server Components Tree verwendet wird.
 * -------------------------------------------------------------------
 */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      {" "}
      {/* Suspense-Boundary für den Inhalt */}
      <ResetPasswordContent /> {/* Die eigentliche Logik und UI der Seite */}
    </Suspense>
  );
}
