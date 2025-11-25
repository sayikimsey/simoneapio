// // frontend/src/app/profile/page.tsx
// "use client";

// import React, { useEffect, useState, Suspense, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import { UserData } from "@/types";
// import { apiClient } from "@/lib/apiClient";
// import MfaSetup from "@/components/auth/MfaSetup";
// import { FiLoader, FiAlertCircle } from "react-icons/fi";

// /**
//  * Lade-Spinner-Komponente.
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
//  * Eine wiederverwendbare Komponente zur Darstellung eines Info-Badges.
//  */
// const InfoBadge = ({
//   children,
//   color,
// }: {
//   children: React.ReactNode;
//   color: "success" | "danger" | "neutral";
// }) => {
//   const baseClasses = "font-semibold px-2 py-0.5 rounded-full text-xs";
//   const colorClasses = {
//     success:
//       "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]",
//     danger:
//       "bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]",
//     neutral: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]",
//   };
//   return (
//     <span className={`${baseClasses} ${colorClasses[color]}`}>{children}</span>
//   );
// };

// /**
//  * Hauptinhaltskomponente für die Benutzerprofilseite.
//  */
// function ProfilePageContent() {
//   const router = useRouter();
//   const [user, setUser] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pageError, setPageError] = useState<string | null>(null);

//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState("");
//   const [changePasswordLoading, setChangePasswordLoading] = useState(false);
//   const [changePasswordError, setChangePasswordError] = useState<string | null>(
//     null
//   );
//   const [changePasswordSuccess, setChangePasswordSuccess] = useState<
//     string | null
//   >(null);

//   /**
//    * Ruft das Benutzerprofil vom Server ab.
//    */
//   const fetchUserProfile = async () => {
//     setIsLoading(true);
//     setPageError(null);
//     try {
//       const response = await apiClient("/profile/me", { method: "GET" });
//       const data = await response.json();
//       if (data.user) {
//         setUser(data.user as UserData);
//         console.log("👤 Benutzerprofil für Einstellungen geladen:", data.user);
//       } else {
//         throw new Error(
//           "Benutzerdaten nicht in der API-Antwort für /profile/me gefunden."
//         );
//       }
//     } catch (err) {
//       console.error(
//         "🔥 Fehler beim Abrufen des Benutzerprofils für Einstellungen:",
//         err
//       );
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Ein unbekannter Fehler ist aufgetreten.";
//       setPageError(errorMessage);
//       if (
//         errorMessage.includes("Session expired") ||
//         errorMessage.includes("refresh failed") ||
//         errorMessage.includes("Not authorized") ||
//         errorMessage.includes("No token")
//       ) {
//         router.push("/auth/signin");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /**
//    * Behandelt Änderungen des MFA-Status und lädt das Profil neu.
//    */
//   const handleMfaStatusChange = () => {
//     console.log("MFA-Status geändert, lade Profil auf der Seite neu...");
//     fetchUserProfile();
//   };

//   /**
//    * Behandelt das Absenden des Formulars zur Passwortänderung.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setChangePasswordLoading(true);
//     setChangePasswordError(null);
//     setChangePasswordSuccess(null);

//     if (newPassword !== confirmNewPassword) {
//       setChangePasswordError("Die neuen Passwörter stimmen nicht überein.");
//       setChangePasswordLoading(false);
//       return;
//     }
//     if (newPassword.length < 8) {
//       setChangePasswordError(
//         "Das neue Passwort muss mindestens 8 Zeichen lang sein."
//       );
//       setChangePasswordLoading(false);
//       return;
//     }

//     try {
//       await apiClient("/auth/change-password", {
//         method: "POST",
//         body: JSON.stringify({
//           currentPassword,
//           newPassword,
//           confirmNewPassword,
//         }),
//       });
//       setChangePasswordSuccess("Passwort erfolgreich geändert!");
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmNewPassword("");
//     } catch (err) {
//       console.error("🔥 Fehler beim Ändern des Passworts:", err);
//       setChangePasswordError(
//         err instanceof Error ? err.message : "Fehler beim Ändern des Passworts."
//       );
//     } finally {
//       setChangePasswordLoading(false);
//     }
//   };

//   if (isLoading) {
//     return <LoadingSpinner message="Ihr Profil wird geladen..." />;
//   }

//   if (pageError && !user) {
//     return (
//       <div className="flex flex-col justify-center items-center p-8 text-center min-h-screen">
//         <div className="bg-[var(--color-surface)] p-10 rounded-lg shadow-xl max-w-md w-full border border-[var(--border-color)]">
//           <h1 className="text-2xl font-bold text-[var(--color-danger)] mb-3">
//             Fehler beim Laden des Profils
//           </h1>
//           <p className="mt-4 text-md text-[var(--color-danger)]">{pageError}</p>
//           <button
//             onClick={() => router.push("/auth/signin")}
//             className="btn-primary mt-8 w-full"
//           >
//             Zur Anmeldung
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex flex-col justify-center items-center text-center p-4 min-h-screen">
//         <p className="text-xl font-medium text-[var(--color-text-primary)]">
//           Benutzerprofil konnte nicht geladen werden. Möglicherweise müssen Sie
//           sich anmelden.
//         </p>
//         <button
//           onClick={() => router.push("/auth/signin")}
//           className="btn-primary mt-4"
//         >
//           Zur Anmeldung
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-10">
//       <header className="pb-6 border-b border-[var(--border-color)]">
//         <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
//           Benutzerprofil & Einstellungen
//         </h1>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Verwalten Sie Ihre Kontodetails, Sicherheitseinstellungen und
//           Präferenzen.
//         </p>
//       </header>

//       {pageError && user && (
//         <div className="alert alert-danger mb-6">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <FiAlertCircle className="h-5 w-5" aria-hidden="true" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm font-medium">{pageError}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <section
//         aria-labelledby="account-info-heading"
//         className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
//       >
//         <div className="p-6 sm:p-8">
//           <h2
//             id="account-info-heading"
//             className="text-xl font-semibold text-[var(--color-text-primary)]"
//           >
//             Kontoinformationen
//           </h2>
//           <dl className="mt-5 text-sm">
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)] first:border-t-0">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 Benutzer-ID:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2 break-all">
//                 {user.id}
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 E-Mail:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2">
//                 {user.email}
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 Vorname:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2">
//                 {user.firstName || (
//                   <span className="italic text-[var(--color-text-secondary)]">
//                     Nicht festgelegt
//                   </span>
//                 )}
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 Nachname:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2">
//                 {user.lastName || (
//                   <span className="italic text-[var(--color-text-secondary)]">
//                     Nicht festgelegt
//                   </span>
//                 )}
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 Rolle:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2 capitalize">
//                 {user.role}
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 MFA-Status:
//               </dt>
//               <dd className="sm:col-span-2">
//                 <InfoBadge color={user.isMfaEnabled ? "success" : "danger"}>
//                   {user.isMfaEnabled ? "Aktiviert" : "Deaktiviert"}
//                 </InfoBadge>
//               </dd>
//             </div>
//             <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
//               <dt className="font-medium text-[var(--color-text-secondary)]">
//                 Anmeldeanbieter:
//               </dt>
//               <dd className="text-[var(--color-text-primary)] sm:col-span-2">
//                 {user.authProvider || (
//                   <span className="italic text-[var(--color-text-secondary)]">
//                     Nicht festgelegt
//                   </span>
//                 )}
//               </dd>
//             </div>
//           </dl>
//         </div>
//       </section>

//       <section
//         aria-labelledby="mfa-setup-heading"
//         className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
//       >
//         <div className="p-6 sm:p-8">
//           <h2
//             id="mfa-setup-heading"
//             className="text-xl font-semibold text-[var(--color-text-primary)] mb-4"
//           >
//             Multi-Faktor-Authentifizierung (MFA)
//           </h2>
//           <MfaSetup
//             initialIsMfaEnabled={user.isMfaEnabled || false}
//             onMfaStatusChange={handleMfaStatusChange}
//           />
//         </div>
//       </section>

//       {user.authProvider === "email" && (
//         <section
//           aria-labelledby="change-password-heading"
//           className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
//         >
//           <div className="p-6 sm:p-8">
//             <h2
//               id="change-password-heading"
//               className="text-xl font-semibold text-[var(--color-text-primary)] mb-6"
//             >
//               Passwort ändern
//             </h2>
//             <form onSubmit={handleChangePassword} className="space-y-6">
//               {changePasswordError && (
//                 <div className="alert alert-danger p-3">
//                   <p className="text-sm font-medium">{changePasswordError}</p>
//                 </div>
//               )}
//               {changePasswordSuccess && (
//                 <div className="alert alert-success p-3">
//                   <p className="text-sm font-medium">{changePasswordSuccess}</p>
//                 </div>
//               )}
//               <div>
//                 <label
//                   htmlFor="currentPasswordProfile"
//                   className="block text-sm font-medium text-[var(--color-text-primary)]"
//                 >
//                   Aktuelles Passwort
//                 </label>
//                 <input
//                   type="password"
//                   id="currentPasswordProfile"
//                   name="currentPassword"
//                   required
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="newPasswordProfile"
//                   className="block text-sm font-medium text-[var(--color-text-primary)]"
//                 >
//                   Neues Passwort
//                 </label>
//                 <input
//                   type="password"
//                   id="newPasswordProfile"
//                   name="newPassword"
//                   required
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="confirmNewPasswordProfile"
//                   className="block text-sm font-medium text-[var(--color-text-primary)]"
//                 >
//                   Neues Passwort bestätigen
//                 </label>
//                 <input
//                   type="password"
//                   id="confirmNewPasswordProfile"
//                   name="confirmNewPassword"
//                   required
//                   value={confirmNewPassword}
//                   onChange={(e) => setConfirmNewPassword(e.target.value)}
//                   className="mt-1"
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={changePasswordLoading}
//                   className="btn-primary disabled:opacity-50"
//                 >
//                   {changePasswordLoading ? "Ändere..." : "Passwort ändern"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

// /**
//  * Exportiert die Profilseite, umgeben von einem Suspense-Fallback.
//  */
// export default function ProfilePage() {
//   return (
//     <Suspense
//       fallback={<LoadingSpinner message="Lade Profileinstellungen..." />}
//     >
//       <ProfilePageContent />
//     </Suspense>
//   );
// }

// frontend/src/app/profile/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState, Suspense, FormEvent } from "react"; // React Hooks für Zustand, Lebenszyklus, Suspense und Formularereignisse
import { useRouter } from "next/navigation"; // Next.js Hook für Navigation
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen
import MfaSetup from "@/components/auth/MfaSetup"; // Importiert die Komponente für die MFA-Einrichtung
import { FiLoader, FiAlertCircle } from "react-icons/fi"; // Importiert Icons (Lade-Spinner, Warnung)

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: LoadingSpinner
 * Eine Lade-Spinner-Komponente, die für den anfänglichen Ladevorgang
 * der Profilseite verwendet wird.
 * -------------------------------------------------------------------
 */
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[100]">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
      {/* Spinner-Icon */}
      <p className="text-lg text-[var(--color-text-inverted)]">
        {message}
      </p>{" "}
      {/* Nachricht in invertierter Farbe */}
    </div>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: InfoBadge
 * Eine wiederverwendbare Komponente zur Darstellung kleiner Informations-Badges.
 * Zeigt einen Text mit einer farblichen Kennzeichnung (Erfolg, Gefahr, neutral).
 * -------------------------------------------------------------------
 */
const InfoBadge = ({
  children, // Der Inhalt des Badges (z.B. "Aktiviert")
  color, // Die Farbgebung des Badges ("success", "danger", "neutral")
}: {
  children: React.ReactNode;
  color: "success" | "danger" | "neutral";
}) => {
  const baseClasses = "font-semibold px-2 py-0.5 rounded-full text-xs"; // Grundlegende CSS-Klassen
  const colorClasses = {
    // Farbklassen basierend auf der 'color'-Prop
    success:
      "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]",
    danger:
      "bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]",
    neutral:
      "bg-[color-mix(in_srgb,var(--color-surface)_20%,transparent)] text-[var(--color-text-secondary)]",
  };
  return (
    <span className={`${baseClasses} ${colorClasses[color]}`}>{children}</span>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ProfilePageContent
 * Die Hauptinhaltskomponente für die Benutzerprofilseite.
 * Ruft Benutzerdaten ab, zeigt diese an und ermöglicht die Verwaltung
 * von MFA-Einstellungen und Passwortänderungen.
 * -------------------------------------------------------------------
 */
function ProfilePageContent() {
  const router = useRouter(); // Hook zum Navigieren
  const [user, setUser] = useState<UserData | null>(null); // Speichert die Benutzerdaten
  const [isLoading, setIsLoading] = useState(true); // Zeigt an, ob das Profil geladen wird
  const [pageError, setPageError] = useState<string | null>(null); // Speichert Fehler beim Laden der Seite

  // Zustandsvariablen für das Passwortänderungsformular
  const [currentPassword, setCurrentPassword] = useState(""); // Aktuelles Passwort
  const [newPassword, setNewPassword] = useState(""); // Neues Passwort
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Bestätigung des neuen Passworts
  const [changePasswordLoading, setChangePasswordLoading] = useState(false); // Ladezustand für Passwortänderung
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null
  ); // Fehler für Passwortänderung
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<
    string | null
  >(null); // Erfolgsmeldung für Passwortänderung

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: fetchUserProfile
   * Ruft das Benutzerprofil vom Backend-Server ab.
   * Aktualisiert den 'user'-Zustand oder setzt 'pageError' bei Fehlschlag.
   * -------------------------------------------------------------------
   */
  const fetchUserProfile = async () => {
    setIsLoading(true); // Setzt Ladezustand auf true
    setPageError(null); // Löscht vorherige Fehler
    try {
      const response = await apiClient("/profile/me", { method: "GET" }); // Ruft das eigene Profil ab
      const data = await response.json(); // Parsed die JSON-Antwort
      if (data.user) {
        setUser(data.user as UserData); // Setzt die Benutzerdaten
        console.log("👤 Benutzerprofil für Einstellungen geladen:", data.user);
      } else {
        throw new Error(
          "Benutzerdaten nicht in der API-Antwort für /profile/me gefunden."
        );
      }
    } catch (err) {
      console.error(
        "🔥 Fehler beim Abrufen des Benutzerprofils für Einstellungen:",
        err
      );
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setPageError(errorMessage); // Setzt den Fehler der Seite

      // Bei Authentifizierungsfehlern zur Anmeldeseite umleiten
      if (
        errorMessage.includes("Session expired") ||
        errorMessage.includes("refresh failed") ||
        errorMessage.includes("Not authorized") ||
        errorMessage.includes("No token")
      ) {
        router.push("/auth/signin");
      }
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Profil beim Laden der Komponente abrufen
   * Dieser Hook wird einmalig beim Mounten der Komponente ausgeführt.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Leeres Abhängigkeitsarray: Effekt läuft nur einmal

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleMfaStatusChange
   * Callback-Funktion, die von der MfaSetup-Komponente aufgerufen wird,
   * wenn sich der MFA-Status geändert hat. Löst ein Neuladen des Profils aus.
   * -------------------------------------------------------------------
   */
  const handleMfaStatusChange = () => {
    console.log("MFA-Status geändert, lade Profil auf der Seite neu...");
    fetchUserProfile(); // Lädt das Benutzerprofil erneut, um den aktualisierten MFA-Status zu erhalten
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleChangePassword
   * Behandelt das Absenden des Formulars zur Passwortänderung.
   * Führt Client-seitige Validierungen durch und sendet die Anfrage an die API.
   * @param event - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das Neuladen der Seite
    setChangePasswordLoading(true); // Setzt Ladezustand auf true
    setChangePasswordError(null); // Löscht vorherige Fehler
    setChangePasswordSuccess(null); // Löscht vorherige Erfolgsmeldungen

    // Client-seitige Passwort-Validierungen
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("Die neuen Passwörter stimmen nicht überein.");
      setChangePasswordLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError(
        "Das neue Passwort muss mindestens 8 Zeichen lang sein."
      );
      setChangePasswordLoading(false);
      return;
    }

    try {
      // Sendet die POST-Anfrage zur Passwortänderung an die API
      await apiClient("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      setChangePasswordSuccess("Passwort erfolgreich geändert!"); // Setzt die Erfolgsmeldung
      // Felder nach Erfolg leeren
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("🔥 Fehler beim Ändern des Passworts:", err);
      // Setzt die Fehlermeldung
      setChangePasswordError(
        err instanceof Error ? err.message : "Fehler beim Ändern des Passworts."
      );
    } finally {
      setChangePasswordLoading(false); // Setzt Ladezustand auf false
    }
  };

  // -------------------------------------------------------------------
  // ✅ Render-Logik basierend auf dem Lade- und Fehlerzustand
  // -------------------------------------------------------------------

  // Zeigt einen bildschirmfüllenden Lade-Spinner an, wenn das Profil geladen wird
  if (isLoading) {
    return <LoadingSpinner message="Ihr Profil wird geladen..." />;
  }

  // Zeigt eine Fehlerseite an, wenn ein kritischer Fehler beim Laden des Profils auftrat und kein Benutzer geladen wurde
  if (pageError && !user) {
    return (
      <div className="flex flex-col justify-center items-center p-8 text-center min-h-screen">
        <div className="bg-[var(--color-surface)] p-10 rounded-lg shadow-xl max-w-md w-full border border-[var(--border-color)]">
          <h1 className="text-2xl font-bold text-[var(--color-danger)] mb-3">
            Fehler beim Laden des Profils
          </h1>
          <p className="mt-4 text-md text-[var(--color-danger)]">{pageError}</p>
          <button
            onClick={() => router.push("/auth/signin")} // Button zum Umleiten zum Login
            className="btn-primary mt-8 w-full"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  // Zeigt eine Nachricht an, wenn aus irgendeinem Grund kein Benutzerprofil geladen werden konnte
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center text-center p-4 min-h-screen">
        <p className="text-xl font-medium text-[var(--color-text-primary)]">
          Benutzerprofil konnte nicht geladen werden. Möglicherweise müssen Sie
          sich anmelden.
        </p>
        <button
          onClick={() => router.push("/auth/signin")} // Button zum Umleiten zum Login
          className="btn-primary mt-4"
        >
          Zur Anmeldung
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ProfilePageContent-Komponente
  // Das Haupt-Layout der Profilseite, das Benutzerinformationen,
  // MFA-Einstellungen und das Passwortänderungsformular enthält.
  // -------------------------------------------------------------------
  return (
    <div className="space-y-10">
      {/* Header-Bereich der Seite */}
      <header className="pb-6 border-b border-[var(--border-color)]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Benutzerprofil & Einstellungen
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Verwalten Sie Ihre Kontodetails, Sicherheitseinstellungen und
          Präferenzen.
        </p>
      </header>

      {/* Allgemeine Fehlermeldung im oberen Bereich (falls vorhanden und der Benutzer geladen wurde) */}
      {pageError && user && (
        <div className="alert alert-danger mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5" aria-hidden="true" />{" "}
              {/* Warn-Icon */}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{pageError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Abschnitt: Kontoinformationen */}
      <section
        aria-labelledby="account-info-heading"
        className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <h2
            id="account-info-heading"
            className="text-xl font-semibold text-[var(--color-text-primary)]"
          >
            Kontoinformationen
          </h2>
          <dl className="mt-5 text-sm">
            {" "}
            {/* Definitionsliste für Details */}
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)] first:border-t-0">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                Benutzer-ID:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2 break-all">
                {user.id}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                E-Mail:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                Vorname:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2">
                {user.firstName || (
                  <span className="italic text-[var(--color-text-secondary)]">
                    Nicht festgelegt
                  </span>
                )}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                Nachname:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2">
                {user.lastName || (
                  <span className="italic text-[var(--color-text-secondary)]">
                    Nicht festgelegt
                  </span>
                )}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                Rolle:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2 capitalize">
                {user.role}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                MFA-Status:
              </dt>
              <dd className="sm:col-span-2">
                <InfoBadge color={user.isMfaEnabled ? "success" : "danger"}>
                  {" "}
                  {/* Badge für MFA-Status */}
                  {user.isMfaEnabled ? "Aktiviert" : "Deaktiviert"}
                </InfoBadge>
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
              <dt className="font-medium text-[var(--color-text-secondary)]">
                Anmeldeanbieter:
              </dt>
              <dd className="text-[var(--color-text-primary)] sm:col-span-2">
                {user.authProvider || (
                  <span className="italic text-[var(--color-text-secondary)]">
                    Nicht festgelegt
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Abschnitt: Multi-Faktor-Authentifizierung (MFA) */}
      <section
        aria-labelledby="mfa-setup-heading"
        className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <h2
            id="mfa-setup-heading"
            className="text-xl font-semibold text-[var(--color-text-primary)] mb-4"
          >
            Multi-Faktor-Authentifizierung (MFA)
          </h2>
          <MfaSetup
            initialIsMfaEnabled={user.isMfaEnabled || false} // Übergibt den initialen MFA-Status an die Komponente
            onMfaStatusChange={handleMfaStatusChange} // Callback für Änderungen des MFA-Status
          />
        </div>
      </section>

      {/* Abschnitt: Passwort ändern (nur sichtbar für Benutzer, die sich per E-Mail angemeldet haben) */}
      {user.authProvider === "email" && (
        <section
          aria-labelledby="change-password-heading"
          className="bg-[var(--color-surface)] border border-[var(--border-color)] shadow-xl rounded-lg overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <h2
              id="change-password-heading"
              className="text-xl font-semibold text-[var(--color-text-primary)] mb-6"
            >
              Passwort ändern
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Fehlermeldung für Passwortänderung */}
              {changePasswordError && (
                <div className="alert alert-danger p-3">
                  <p className="text-sm font-medium">{changePasswordError}</p>
                </div>
              )}
              {/* Erfolgsmeldung für Passwortänderung */}
              {changePasswordSuccess && (
                <div className="alert alert-success p-3">
                  <p className="text-sm font-medium">{changePasswordSuccess}</p>
                </div>
              )}
              {/* Feld für aktuelles Passwort */}
              <div>
                <label
                  htmlFor="currentPasswordProfile"
                  className="block text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Aktuelles Passwort
                </label>
                <input
                  type="password"
                  id="currentPasswordProfile"
                  name="currentPassword"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* Feld für neues Passwort */}
              <div>
                <label
                  htmlFor="newPasswordProfile"
                  className="block text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Neues Passwort
                </label>
                <input
                  type="password"
                  id="newPasswordProfile"
                  name="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* Feld für Bestätigung des neuen Passworts */}
              <div>
                <label
                  htmlFor="confirmNewPasswordProfile"
                  className="block text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Neues Passwort bestätigen
                </label>
                <input
                  type="password"
                  id="confirmNewPasswordProfile"
                  name="confirmNewPassword"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* Button zum Absenden der Passwortänderung */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changePasswordLoading} // Deaktiviert während des Ladens
                  className="btn-primary disabled:opacity-50" // Button-Styling
                >
                  {changePasswordLoading ? "Ändere..." : "Passwort ändern"}{" "}
                  {/* Text ändert sich während des Ladens */}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ProfilePage (Export)
 * Exportiert die Profilseite, umgeben von einem Suspense-Fallback.
 * Dies ist eine Best Practice für clientseitige Datenabrufe in Next.js,
 * um einen Ladezustand anzuzeigen, während die Daten für die Seite geladen werden.
 * -------------------------------------------------------------------
 */
export default function ProfilePage() {
  return (
    <Suspense
      fallback={<LoadingSpinner message="Lade Profileinstellungen..." />} // Zeigt diesen Spinner an, während Daten geladen werden
    >
      <ProfilePageContent />{" "}
      {/* Die eigentliche Logik und UI der Profilseite */}
    </Suspense>
  );
}
