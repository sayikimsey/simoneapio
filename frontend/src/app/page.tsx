// // frontend/src/app/page.tsx
// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { UserData } from "@/types";
// import LoginForm from "@/components/auth/LoginForm";
// import { FcGoogle } from "react-icons/fc";
// import { FiAlertCircle, FiLoader } from "react-icons/fi";

// /**
//  * Loading spinner component for the sign-in page.
//  */
// const LoadingSpinner = ({ message }: { message: string }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-lg text-[var(--color-text-inverted)]">{message}</p>
//     </div>
//   </div>
// );

// /**
//  * Main content component for the sign-in page.
//  * Handles display of errors and success messages from URL parameters.
//  */
// function SignInContent() {
//   const searchParams = useSearchParams();
//   const [oauthError, setOauthError] = useState<string | null>(null);
//   const [, /*successMessage*/ setSuccessMessage] = useState<string | null>(
//     null
//   );

//   useEffect(() => {
//     const errorParam = searchParams.get("error");
//     const messageParam = searchParams.get("message");
//     const successParam = searchParams.get("success");

//     if (errorParam) {
//       setOauthError(
//         decodeURIComponent(
//           messageParam ||
//             "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
//         )
//       );
//     }
//     if (successParam && messageParam) {
//       setSuccessMessage(decodeURIComponent(messageParam));
//     }
//   }, [searchParams]);

//   /**
//    * Handles a successful login.
//    * @param userData - The data of the logged-in user.
//    */
//   const handleSuccessfulLogin = (userData: UserData) => {
//     console.log("✅ Anmeldung erfolgreich von SignInPage:", userData);
//   };

//   /**
//    * Redirects the user to Google sign-in.
//    */
//   const handleGoogleSignIn = () => {
//     const googleAuthUrl = `${
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
//     }/auth/google`;
//     window.location.href = googleAuthUrl;
//   };

//   return (
//     <>
//       {/* Background Image Container */}
//       <div
//         className="fixed inset-0 bg-cover bg-center z-[-2]"
//         style={{ backgroundImage: "url(/background.png)" }}
//         aria-hidden="true"
//       />
//       {/* Dark Overlay for better text contrast */}
//       <div className="fixed inset-0 bg-black/60 z-[-1]" aria-hidden="true" />

//       {/* This is the main content container.
//         We apply a static light text color because the background is always dark.
//       */}
//       <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
//             Anmelden bei Ihrem Konto
//           </h2>
//           <p className="mt-2 text-center text-sm text-slate-300">
//             Oder{" "}
//             <Link
//               href="/auth/register"
//               className="font-medium text-indigo-400 hover:text-indigo-300"
//             >
//               erstellen Sie ein neues Konto
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
//             {oauthError && (
//               <div className="alert alert-danger mb-4">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <FiAlertCircle className="h-5 w-5" aria-hidden="true" />
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium">{oauthError}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <LoginForm onLoginSuccess={handleSuccessfulLogin} />

//             {/* <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-[var(--border-color)]" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
//                     Oder anmelden mit
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <div className="flex justify-center">
//                   <button
//                     onClick={handleGoogleSignIn}
//                     type="button"
//                     aria-label="Mit Google anmelden"
//                     className="btn-icon mx-auto"
//                   >
//                     <FcGoogle className="h-6 w-6" aria-hidden="true" />
//                   </button>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// /**
//  * Exports the sign-in page, wrapped in a Suspense fallback.
//  */
// export default function SignInPage() {
//   return (
//     <Suspense
//       fallback={<LoadingSpinner message="Anmeldeseite wird geladen..." />}
//     >
//       <SignInContent />
//     </Suspense>
//   );
// }

// // frontend/src/app/page.tsx
// "use client"; // This marks the file as a Client Component in Next.js, necessary for interactivity and hooks like useState, useEffect.

// import React, { useEffect, useState, Suspense } from "react"; // React Hooks for state management and Suspense for loading states.
// import Link from "next/link"; // Next.js component for client-side navigation between pages without full page reloads.
// import { useSearchParams } from "next/navigation"; // Next.js hook to access URL query parameters.
// import { UserData } from "@/types"; // Imports the UserData type definition.
// import LoginForm from "@/components/auth/LoginForm"; // Imports the login form component.
// import { FcGoogle } from "react-icons/fc"; // Imports the Google icon for social login buttons.
// import { FiAlertCircle, FiLoader } from "react-icons/fi"; // Imports Feather icons for alerts and loading spinners.

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: LoadingSpinner
//  * Eine Lade-Spinner-Komponente, die während des Ladevorgangs der Seite
//  * oder wichtiger Daten angezeigt wird.
//  * Sie ist für eine bildschirmfüllende Anzeige konzipiert.
//  * -------------------------------------------------------------------
//  */
// const LoadingSpinner = ({ message }: { message: string }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
//       {/* Spinner-Icon mit Akzentfarbe */}
//       <p className="text-lg text-[var(--color-text-inverted)]">
//         {message}
//       </p>{" "}
//       {/* Lade-Nachricht in invertierter Textfarbe */}
//     </div>
//   </div>
// );

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: SignInContent
//  * Die Hauptinhaltskomponente für die Anmeldeseite.
//  * Sie ist dafür zuständig, Login-Funktionalität bereitzustellen
//  * und Fehlermeldungen oder Erfolgsnachrichten anzuzeigen, die
//  * über URL-Parameter (z.B. nach einem OAuth-Rückruf) übergeben werden.
//  * -------------------------------------------------------------------
//  */
// function SignInContent() {
//   const searchParams = useSearchParams(); // Hook, um auf die Suchparameter (Query-Parameter) der aktuellen URL zuzugreifen.
//   const [oauthError, setOauthError] = useState<string | null>(null); // Zustand für OAuth-bezogene Fehlermeldungen.
//   const [, /*successMessage*/ setSuccessMessage] = useState<string | null>(
//     null
//   ); // Zustand für Erfolgsmeldungen (successMessage wird hier nicht direkt gerendert, aber könnte für zukünftige UI-Updates verwendet werden).

//   /**
//    * -------------------------------------------------------------------
//    * ✅ useEffect Hook: URL-Parameter auslesen und Zustände setzen
//    * Dieser Hook wird einmalig beim Mounten der Komponente und bei jeder
//    * Änderung der URL-Suchparameter ausgeführt.
//    * Er liest 'error' und 'message' Parameter aus der URL, die typischerweise
//    * von einem externen Authentifizierungsanbieter (z.B. Google OAuth)
//    * nach einem fehlgeschlagenen Anmeldeversuch zurückgegeben werden.
//    * -------------------------------------------------------------------
//    */
//   useEffect(() => {
//     const errorParam = searchParams.get("error"); // Holt den Wert des 'error'-Parameters.
//     const messageParam = searchParams.get("message"); // Holt den Wert des 'message'-Parameters.
//     const successParam = searchParams.get("success"); // Holt den Wert des 'success'-Parameters.

//     if (errorParam) {
//       // Wenn ein 'error'-Parameter in der URL vorhanden ist, wird eine Fehlermeldung gesetzt.
//       setOauthError(
//         decodeURIComponent(
//           // Dekodiert URL-kodierte Zeichen in der Fehlermeldung.
//           messageParam ||
//             "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut." // Fallback-Nachricht, falls keine spezifische Nachricht vorhanden ist.
//         )
//       );
//     }
//     if (successParam && messageParam) {
//       // Wenn sowohl 'success'- als auch 'message'-Parameter vorhanden sind, wird eine Erfolgsmeldung gesetzt.
//       setSuccessMessage(decodeURIComponent(messageParam));
//     }
//   }, [searchParams]); // Abhängigkeit: Der Effekt wird nur ausgelöst, wenn sich die 'searchParams' ändern.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleSuccessfulLogin
//    * Diese Callback-Funktion wird von der 'LoginForm'-Komponente aufgerufen,
//    * wenn der Benutzer erfolgreich angemeldet wurde.
//    * @param userData - Die Daten des erfolgreich angemeldeten Benutzers.
//    * -------------------------------------------------------------------
//    */
//   const handleSuccessfulLogin = (userData: UserData) => {
//     console.log("✅ Anmeldung erfolgreich von SignInPage:", userData); // Protokolliert die Benutzerdaten nach erfolgreicher Anmeldung.
//     // Hier könnte eine Weiterleitung des Benutzers zu seinem Dashboard oder Profil erfolgen.
//     // Beispiel: router.push("/dashboard");
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleGoogleSignIn
//    * Leitet den Benutzer zur Google-Anmeldeseite um.
//    * Dies initiiert den Google OAuth-Authentifizierungsablauf.
//    * -------------------------------------------------------------------
//    */
//   const handleGoogleSignIn = () => {
//     const googleAuthUrl = `${
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
//     }/auth/google`; // Konstruiert die URL zum Starten des Google OAuth-Flows im Backend.
//     window.location.href = googleAuthUrl; // Leitet den Browser des Benutzers zur generierten URL um.
//   };

//   // -------------------------------------------------------------------
//   // ✅ JSX-Struktur der SignInContent-Komponente
//   // Der Code rendert die Anmelde-Benutzeroberfläche, einschließlich
//   // Hintergrund, Login-Formular und Links zur Registrierung.
//   // -------------------------------------------------------------------
//   return (
//     <>
//       {/* Container für das Hintergrundbild */}
//       <div
//         className="fixed inset-0 bg-cover bg-center z-[-2]" // Fixiert das Element, deckt den gesamten Viewport ab, z-index -2 für Hintergrund.
//         style={{ backgroundImage: "url(/background.png)" }} // Setzt das Hintergrundbild.
//         aria-hidden="true" // Versteckt das Element vor assistiven Technologien (Screenreadern).
//       />
//       {/* Dunkles Overlay für besseren Textkontrast auf dem Hintergrundbild */}
//       <div
//         className="fixed inset-0 bg-black/60 z-[-1]"
//         aria-hidden="true"
//       />{" "}
//       {/* Fixiert, deckt den Viewport ab, z-index -1 für ein dunkleres Overlay. */}
//       {/* Haupt-Inhaltscontainer.
//           Da der Hintergrund immer dunkel ist, wenden wir hier eine statische helle Textfarbe an.
//       */}
//       <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
//             Anmelden bei Ihrem Konto
//           </h2>
//           <p className="mt-2 text-center text-sm text-slate-300">
//             Oder{" "}
//             <Link
//               href="/auth/register" // Link zur Registrierungsseite.
//               className="font-medium text-indigo-400 hover:text-indigo-300" // Tailwind-Klassen für Link-Styling.
//             >
//               erstellen Sie ein neues Konto
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
//             {/* Anzeige von OAuth-Fehlermeldungen */}
//             {oauthError && (
//               <div className="alert alert-danger mb-4">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <FiAlertCircle className="h-5 w-5" aria-hidden="true" />{" "}
//                     {/* Warn-Icon. */}
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium">{oauthError}</p>{" "}
//                     {/* Die Fehlermeldung. */}
//                   </div>
//                 </div>
//               </div>
//             )}
//             <LoginForm onLoginSuccess={handleSuccessfulLogin} />{" "}
//             {/* Rendert das Login-Formular und übergibt den Erfolgs-Callback. */}
//             {/*
//               // -------------------------------------------------------------------
//               // ✅ Auskommentierter Bereich: Option zur Anmeldung über Google
//               // Dieser Abschnitt würde eine Trennlinie ("Oder anmelden mit") und
//               // einen Button für die Google-Anmeldung enthalten.
//               // Er ist derzeit auskommentiert, falls diese Funktionalität
//               // vorübergehend oder dauerhaft deaktiviert werden soll.
//               // -------------------------------------------------------------------
//             <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-[var(--border-color)]" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
//                     Oder anmelden mit
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <div className="flex justify-center">
//                   <button
//                     onClick={handleGoogleSignIn} // Ruft die Google-Anmeldefunktion auf.
//                     type="button"
//                     aria-label="Mit Google anmelden" // Zugänglichkeitslabel.
//                     className="btn-icon mx-auto" // Benutzerdefinierte Klasse für Icon-Buttons.
//                   >
//                     <FcGoogle className="h-6 w-6" aria-hidden="true" /> // Google-Icon.
//                   </button>
//                 </div>
//               </div>
//             </div>
//             */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: SignInPage (Export)
//  * Exportiert die Anmeldeseite, eingehüllt in ein Suspense-Fallback.
//  * Dies ist eine gängige Praxis in Next.js für Client-Komponenten,
//  * die Hooks wie `useSearchParams` verwenden, um einen Ladezustand
//  * anzuzeigen, während die Komponente oder ihre Daten geladen werden.
//  * -------------------------------------------------------------------
//  */
// export default function SignInPage() {
//   return (
//     <Suspense
//       fallback={<LoadingSpinner message="Anmeldeseite wird geladen..." />} // Zeigt den 'LoadingSpinner' an, während der Inhalt geladen wird.
//     >
//       <SignInContent /> {/* Rendert den Hauptinhalt der Anmeldeseite. */}
//     </Suspense>
//   );
// }

// frontend/src/app/page.tsx
"use client"; // Dies ist ein Next.js Client Component, notwendig für Hooks und interaktive Elemente.

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link"; // Component für Client-seitige Navigation.
import { useSearchParams } from "next/navigation"; // Hook zum Lesen von URL-Parametern.
import { UserData } from "@/types"; // Importiert den UserData-Typ.
import LoginForm from "@/components/auth/LoginForm"; // Importiert die Login-Formular-Komponente.
import { FcGoogle } from "react-icons/fc"; // Google-Icon.
import { FiAlertCircle, FiLoader } from "react-icons/fi"; // Icons für Warnungen und Ladezustand.
import { FaMicrosoft } from "react-icons/fa"; // Microsoft-Icon für SSO.

/**
 * Bestimmt die Basis-URL der API basierend auf der Umgebung.
 * Verwendet die korrekte Variable `NEXT_PUBLIC_API_BASE_URL`.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4201";

/**
 * Lade-Spinner-Komponente, die während des Ladevorgangs angezeigt wird.
 * @param {object} props
 * @param {string} props.message - Die Lade-Nachricht.
 */
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
      <p className="text-lg text-[var(--color-text-inverted)]">
        {message}
      </p>
    </div>
  </div>
);

/**
 * Hauptinhaltskomponente für die Anmeldeseite.
 * Zeigt das Login-Formular und die SSO-Buttons an.
 */
function SignInContent() {
  const searchParams = useSearchParams();
  const [oauthError, setOauthError] = useState<string | null>(null);

  /**
   * Liest URL-Parameter aus und setzt entsprechende Fehlermeldungen.
   * Zum Beispiel, wenn ein externer Login-Anbieter einen Fehler zurückgibt.
   */
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam) {
      setOauthError(
        decodeURIComponent(
          messageParam ||
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
        )
      );
    }
  }, [searchParams]);

  /**
   * Callback-Funktion, die nach einem erfolgreichen Login aufgerufen wird.
   */
  const handleSuccessfulLogin = (userData: UserData) => {
    console.log("✅ Anmeldung erfolgreich von SignInPage:", userData);
  };

  /**
   * Leitet den Benutzer zum Google-Anmelde-Flow um.
   */
  const handleGoogleSignIn = () => {
    const googleAuthUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  /**
   * Leitet den Benutzer zum Microsoft Azure AD SAML-Anmelde-Flow um.
   * Die Anfrage wird an den Node.js Proxy weitergeleitet.
   */
  const handleMicrosoftSignIn = () => {
    const azureAdAuthUrl = `${API_BASE_URL}/simone/saml2/authenticate/azure-ad`;
    window.location.href = azureAdAuthUrl;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center z-[-2]"
        style={{ backgroundImage: "url(/background.png)" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 bg-black/60 z-[-1]"
        aria-hidden="true"
      />
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Anmelden bei Ihrem Konto
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Oder{" "}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              erstellen Sie ein neues Konto
            </Link>
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
            {oauthError && (
              <div className="alert alert-danger mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{oauthError}</p>
                  </div>
                </div>
              </div>
            )}
            <LoginForm onLoginSuccess={handleSuccessfulLogin} />
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-color)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
                    Oder anmelden mit
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  aria-label="Mit Google anmelden"
                  className="inline-flex w-full justify-center rounded-md border border-[var(--border-color)] bg-[var(--color-input-background)] py-2 px-4 shadow-sm hover:bg-[var(--color-hover-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 text-sm font-medium text-[var(--color-text-primary)]"
                >
                  <FcGoogle className="h-5 w-5 mr-2" aria-hidden="true" />
                  Google
                </button>
                <button
                  onClick={handleMicrosoftSignIn}
                  type="button"
                  aria-label="Mit Microsoft Azure AD anmelden"
                  className="inline-flex w-full justify-center rounded-md border border-[var(--border-color)] bg-[var(--color-input-background)] py-2 px-4 shadow-sm hover:bg-[var(--color-hover-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 text-sm font-medium text-[var(--color-text-primary)]"
                >
                  <FaMicrosoft
                    className="h-5 w-5 mr-2 text-blue-500"
                    aria-hidden="true"
                  />
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Wrapper für Suspense, um einen Ladezustand für Client-Komponenten zu handhaben.
 */
export default function SignInPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner message="Anmeldeseite wird geladen..." />}
    >
      <SignInContent />
    </Suspense>
  );
}