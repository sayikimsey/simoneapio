// // frontend/src/app/auth/register/page.tsx
// "use client";

// import React from "react";
// import PageShell from "@/components/layout/PageShell";
// import RegistrationForm from "@/components/auth/RegistrationForm";
// import Link from "next/link";
// import { FcGoogle } from "react-icons/fc";

// /**
//  * Die Registrierungsseite, auf der neue Benutzer ein Konto erstellen können.
//  * Bietet Optionen zur Registrierung per E-Mail oder über Google.
//  */
// export default function RegisterPage() {
//   /**
//    * Leitet den Benutzer zur Google-Anmeldeseite weiter.
//    */
//   const handleGoogleSignIn = () => {
//     window.location.href = `${
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
//     }/auth/google`;
//   };

//   return (
//     <PageShell>
//       <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
//             Neues Konto erstellen
//           </h2>
//           <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
//             Oder{" "}
//             <Link href="/auth/signin" className="font-medium">
//               melden Sie sich bei Ihrem bestehenden Konto an
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
//             <RegistrationForm />

//             {/* <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-[var(--border-color)]" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
//                     Oder weiter mit
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-6 grid grid-cols-1 gap-3">
//                 <div>
//                   <button
//                     onClick={handleGoogleSignIn}
//                     className="btn-icon w-full"
//                   >
//                     <span className="sr-only">Mit Google anmelden</span>
//                     <FcGoogle className="h-6 w-6" aria-hidden="true" />
//                   </button>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </PageShell>
//   );
// }

// frontend/src/app/auth/register/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React from "react";
import PageShell from "@/components/layout/PageShell"; // Importiert die allgemeine Seiten-Shell/Layout-Komponente
import RegistrationForm from "@/components/auth/RegistrationForm"; // Importiert die Komponente für das Registrierungsformular
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation
import { FcGoogle } from "react-icons/fc"; // Importiert das Google-Icon aus 'react-icons'

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: RegisterPage
 * Die Registrierungsseite, auf der neue Benutzer ein Konto erstellen können.
 * Bietet die Möglichkeit zur Registrierung per E-Mail/Passwort.
 * Der Google-Login-Teil ist derzeit auskommentiert.
 * -------------------------------------------------------------------
 */
export default function RegisterPage() {
  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleGoogleSignIn
   * Leitet den Benutzer zur Google-Anmeldeseite weiter.
   * Dies initiiert den Google OAuth-Flow.
   * Der Basispfad zur API wird aus der öffentlichen Umgebungsvariable gelesen.
   * -------------------------------------------------------------------
   */
  const handleGoogleSignIn = () => {
    // Leitet das Browserfenster des Benutzers zur Google OAuth-Start-URL im Backend um.
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001" // Basis-URL des Backends
    }/auth/google`; // Der Endpunkt im Backend, der den Google OAuth-Flow startet
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der RegisterPage-Komponente
  // Die Seite enthält eine Überschrift, einen Link zum Login und das Registrierungsformular.
  // Optional kann ein Bereich für soziale Logins wie Google vorhanden sein.
  // -------------------------------------------------------------------
  return (
    <PageShell>
      {" "}
      {/* Die Seiten-Shell bietet ein grundlegendes Layout und Styling */}
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Neues Konto erstellen
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
            Oder{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-[var(--color-link)] hover:text-[var(--color-link-hover)]"
            >
              melden Sie sich bei Ihrem bestehenden Konto an
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--color-surface)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border-color)]">
            <RegistrationForm />{" "}
            {/* Rendert das eigentliche Registrierungsformular */}
            {/*
              // -------------------------------------------------------------------
              // ✅ Auskommentierter Bereich: Option zur Registrierung über Google
              // Dieser Abschnitt würde eine Trennlinie ("Oder weiter mit") und
              // einen Button für die Google-Anmeldung enthalten.
              // Er ist derzeit auskommentiert, falls diese Funktionalität
              // vorübergehend oder dauerhaft deaktiviert werden soll.
              // -------------------------------------------------------------------
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-color)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)]">
                    Oder weiter mit
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <button
                    onClick={handleGoogleSignIn} // Ruft die Google-Anmeldefunktion auf
                    className="btn-icon w-full" // Benutzerdefinierter Button-Stil für Icons
                  >
                    <span className="sr-only">Mit Google anmelden</span> // Text für Screenreader
                    <FcGoogle className="h-6 w-6" aria-hidden="true" /> // Google-Icon
                  </button>
                </div>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
