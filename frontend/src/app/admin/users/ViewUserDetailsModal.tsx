// "use client";

// import React, { useEffect, useState } from "react";
// import Modal from "@/components/common/Modal";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";
// import { FiLoader, FiAlertTriangle } from "react-icons/fi";

// /**
//  * Defines the props for the ViewUserDetailsModal component.
//  */
// interface ViewUserDetailsModalProps {
//   userId: string | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// /**
//  * A component to display a single detail in a list.
//  */
// const DetailItem = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: React.ReactNode;
// }) => (
//   <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)] first:border-t-0">
//     <dt className="text-sm font-medium text-[var(--color-text-secondary)]">
//       {label}
//     </dt>
//     <dd className="mt-1 text-sm text-[var(--color-text-primary)] sm:mt-0 sm:col-span-2 break-words">
//       {value !== null && value !== undefined && value !== "" ? (
//         value
//       ) : (
//         <span className="italic text-[var(--color-text-secondary)] opacity-75">
//           N/A
//         </span>
//       )}
//     </dd>
//   </div>
// );

// /**
//  * A modal component for displaying the detailed information of a user.
//  */
// export default function ViewUserDetailsModal({
//   userId,
//   isOpen,
//   onClose,
// }: ViewUserDetailsModalProps) {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (userId && isOpen) {
//       const fetchUserDetails = async () => {
//         setIsLoading(true);
//         setError(null);
//         setUserData(null);
//         try {
//           console.log(
//             `Rufe Details für Benutzer-ID ab (ViewUserDetailsModal): ${userId}`
//           );
//           const response = await apiClient(`/admin/users/${userId}`, {
//             method: "GET",
//           });
//           const data = await response.json();
//           if (data.user) {
//             setUserData(data.user as UserData);
//           } else {
//             throw new Error(
//               data.message ||
//                 "Benutzerdetails nicht in der API-Antwort gefunden."
//             );
//           }
//         } catch (err) {
//           console.error(
//             `🔥 Fehler beim Abrufen der Details für Benutzer ${userId}:`,
//             err
//           );
//           setError(
//             err instanceof Error
//               ? err.message
//               : "Benutzerdetails konnten nicht geladen werden."
//           );
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchUserDetails();
//     } else if (!isOpen) {
//       setUserData(null);
//       setError(null);
//       setIsLoading(false);
//     }
//   }, [userId, isOpen]);

//   /**
//    * Formats a date string into a readable, localized format.
//    * @param dateString - The ISO date string to format.
//    * @returns The formatted date or null.
//    */
//   const formatDate = (dateString?: string | null) => {
//     if (!dateString) return null;
//     try {
//       return new Date(dateString).toLocaleString("de-DE", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//       });
//     } catch (e) {
//       console.error(
//         "Fehler beim Formatieren des Datums in ViewUserDetailsModal:",
//         dateString,
//         e
//       );
//       return "Ungültiges Datum";
//     }
//   };

//   const Badge = ({
//     children,
//     color,
//   }: {
//     children: React.ReactNode;
//     color: "success" | "danger" | "neutral";
//   }) => {
//     const baseClasses = "font-semibold px-2 py-0.5 rounded-full text-xs";
//     const colorClasses = {
//       success:
//         "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]",
//       danger:
//         "bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]",
//       neutral: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]",
//     };
//     return (
//       <span className={`${baseClasses} ${colorClasses[color]}`}>
//         {children}
//       </span>
//     );
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={`Benutzerdetails: ${userData?.email || "Wird geladen..."}`}
//       size="3xl"
//     >
//       {isLoading && (
//         <div className="flex justify-center items-center py-10">
//           <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />
//           <p className="ml-3 text-[var(--color-text-secondary)]">
//             Lade Benutzerdetails...
//           </p>
//         </div>
//       )}
//       {error && !isLoading && (
//         <div className="alert alert-danger my-4">
//           <div className="flex items-center">
//             <FiAlertTriangle className="h-5 w-5 mr-2" />
//             <p>{error}</p>
//           </div>
//         </div>
//       )}
//       {!isLoading && !error && userData && (
//         <dl className="space-y-0">
//           <DetailItem label="Benutzer-ID" value={userData.id} />
//           <DetailItem label="E-Mail" value={userData.email} />
//           <DetailItem label="Vorname" value={userData.firstName} />
//           <DetailItem label="Nachname" value={userData.lastName} />
//           <DetailItem
//             label="Rolle"
//             value={
//               <span className="capitalize font-medium">{userData.role}</span>
//             }
//           />
//           <DetailItem
//             label="Anmeldeanbieter"
//             value={<span className="capitalize">{userData.authProvider}</span>}
//           />
//           <DetailItem
//             label="Status"
//             value={
//               <Badge color={userData.isActive ? "success" : "danger"}>
//                 {userData.isActive ? "Aktiv" : "Inaktiv"}
//               </Badge>
//             }
//           />
//           <DetailItem
//             label="MFA aktiviert"
//             value={
//               <Badge color={userData.isMfaEnabled ? "success" : "neutral"}>
//                 {userData.isMfaEnabled ? "Ja" : "Nein"}
//               </Badge>
//             }
//           />
//           <DetailItem
//             label="Beigetreten am"
//             value={formatDate(userData.createdAt)}
//           />
//           <DetailItem
//             label="Zuletzt aktualisiert am"
//             value={formatDate(userData.updatedAt)}
//           />
//           <DetailItem
//             label="Letzter Login am"
//             value={formatDate(userData.lastLoginAt)}
//           />
//         </dl>
//       )}
//       {!isLoading && !error && !userData && isOpen && (
//         <p className="text-[var(--color-text-secondary)] py-10 text-center">
//           Kein Benutzer ausgewählt oder Details konnten nicht geladen werden.
//         </p>
//       )}
//       <div className="mt-6 flex justify-end">
//         <button type="button" onClick={onClose}>
//           Schließen
//         </button>
//       </div>
//     </Modal>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten
import { FiLoader, FiAlertTriangle } from "react-icons/fi"; // Importiert Icons aus 'react-icons' (Lade-Spinner, Warnung)

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ViewUserDetailsModalProps
 * Definiert die Props (Eigenschaften), die an die ViewUserDetailsModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface ViewUserDetailsModalProps {
  userId: string | null; // Die ID des Benutzers, dessen Details angezeigt werden sollen. Null, wenn kein Benutzer ausgewählt ist.
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: DetailItem
 * Eine kleine Hilfskomponente, um ein einzelnes Detail in einer Liste (Definition List)
 * mit einem Label und einem Wert anzuzeigen.
 * Behandelt auch leere oder undefined Werte.
 * -------------------------------------------------------------------
 */
const DetailItem = ({
  label, // Der Text, der das Detail beschreibt (z.B. "E-Mail")
  value, // Der tatsächliche Wert des Details (kann String, Zahl, JSX-Element sein)
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)] first:border-t-0">
    {/* dt: Definitionsterm (Label) */}
    <dt className="text-sm font-medium text-[var(--color-text-secondary)]">
      {label}
    </dt>
    {/* dd: Definitionsbeschreibung (Wert) */}
    <dd className="mt-1 text-sm text-[var(--color-text-primary)] sm:mt-0 sm:col-span-2 break-words">
      {/* Prüft, ob der Wert vorhanden und nicht leer ist. */}
      {value !== null && value !== undefined && value !== "" ? (
        value // Zeigt den Wert an
      ) : (
        // Wenn der Wert leer ist, zeige "N/A" (Not Available)
        <span className="italic text-[var(--color-text-secondary)] opacity-75">
          N/A
        </span>
      )}
    </dd>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ViewUserDetailsModal
 * Ein modales Fenster zur detaillierten Anzeige der Informationen eines Benutzers.
 * Ruft die Benutzerdetails von der API ab und zeigt sie in einer strukturierten Liste an.
 * -------------------------------------------------------------------
 */
export default function ViewUserDetailsModal({
  userId,
  isOpen,
  onClose,
}: ViewUserDetailsModalProps) {
  // Zustandsvariablen für die Benutzerdaten und den Lade-/Fehlerstatus
  const [userData, setUserData] = useState<UserData | null>(null); // Speichert die abgerufenen Benutzerdetails
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob Details geladen werden
  const [error, setError] = useState<string | null>(null); // Speichert Fehlermeldungen beim Laden

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Benutzerdetails abrufen
   * Dieser Hook wird ausgelöst, wenn sich 'userId' oder 'isOpen' ändert.
   * Wenn das Modal mit einer gültigen userId geöffnet wird, werden die Details geladen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (userId && isOpen) {
      // Nur abrufen, wenn eine userId vorhanden und das Modal geöffnet ist
      const fetchUserDetails = async () => {
        setIsLoading(true); // Setzt den Ladezustand auf true
        setError(null); // Löscht vorherige Fehler
        setUserData(null); // Löscht vorherige Benutzerdaten, um einen sauberen Ladezustand zu gewährleisten

        try {
          console.log(
            `Rufe Details für Benutzer-ID ab (ViewUserDetailsModal): ${userId}`
          );
          // Führt GET-Anfrage an /admin/users/:userId aus
          const response = await apiClient(`/admin/users/${userId}`, {
            method: "GET",
          });
          const data = await response.json(); // Parsed die JSON-Antwort

          // Prüft, ob die Benutzerdaten im erwarteten Format in der Antwort enthalten sind
          if (data.user) {
            setUserData(data.user as UserData); // Aktualisiert den Zustand mit den abgerufenen Daten
          } else {
            // Wenn 'data.user' fehlt, werfe einen Fehler
            throw new Error(
              data.message ||
                "Benutzerdetails nicht in der API-Antwort gefunden."
            );
          }
        } catch (err) {
          console.error(
            `🔥 Fehler beim Abrufen der Details für Benutzer ${userId}:`,
            err
          );
          // Setzt die Fehlermeldung, entweder aus dem Fehlerobjekt oder eine generische Nachricht
          setError(
            err instanceof Error
              ? err.message
              : "Benutzerdetails konnten nicht geladen werden."
          );
        } finally {
          setIsLoading(false); // Setzt den Ladezustand auf false, unabhängig vom Ergebnis
        }
      };
      fetchUserDetails(); // Ruft die Funktion zum Laden der Details auf
    } else if (!isOpen) {
      // Wenn das Modal geschlossen wird, alle Zustände zurücksetzen
      setUserData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [userId, isOpen]); // Abhängigkeiten: Effekt wird bei Änderungen von 'userId' oder 'isOpen' ausgeführt

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: formatDate
   * Formatiert einen Datumsstring in ein lesbares, lokalisiertes Format
   * mit Datum und Uhrzeit.
   * @param dateString - Der ISO-Datumsstring, der formatiert werden soll. Kann null/undefined sein.
   * @returns Das formatierte Datum und die Uhrzeit oder null/ "Ungültiges Datum".
   * -------------------------------------------------------------------
   */
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null; // Wenn kein Datumsstring vorhanden ist
    try {
      // Formatiert das Datum und die Uhrzeit gemäß den deutschen Lokalisierungsregeln
      return new Date(dateString).toLocaleString("de-DE", {
        year: "numeric", // Vierstellige Jahreszahl
        month: "long", // Ausgeschriebener Monatsname
        day: "numeric", // Tag des Monats
        hour: "2-digit", // Stunde (zweistellig)
        minute: "2-digit", // Minute (zweistellig)
        second: "2-digit", // Sekunde (zweistellig)
      });
    } catch (e) {
      console.error(
        "Fehler beim Formatieren des Datums in ViewUserDetailsModal:",
        dateString,
        e
      );
      return "Ungültiges Datum";
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Hilfskomponente: Badge
   * Eine kleine Komponente zum Anzeigen von Status-Badges (z.B. Aktiv/Inaktiv, Ja/Nein)
   * mit verschiedenen Farboptionen.
   * -------------------------------------------------------------------
   */
  const Badge = ({
    children, // Der Inhalt des Badges (z.B. "Aktiv")
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
      neutral: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]",
    };
    return (
      <span className={`${baseClasses} ${colorClasses[color]}`}>
        {children}
      </span>
    );
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ViewUserDetailsModal-Komponente
  // Das Modal rendert je nach Lade-, Fehler- und Datenzustand unterschiedliche Inhalte.
  // -------------------------------------------------------------------
  return (
    <Modal
      isOpen={isOpen} // Steuert die Sichtbarkeit des Modals
      onClose={onClose} // Callback zum Schließen des Modals
      title={`Benutzerdetails: ${userData?.email || "Wird geladen..."}`} // Dynamischer Titel mit Benutzer-E-Mail oder Lade-Text
      size="3xl" // Größe des Modals (extra groß für Details)
    >
      {/* Ladeindikator: Wird angezeigt, wenn isLoading true ist */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
          {/* Spinner-Icon */}
          <p className="ml-3 text-[var(--color-text-secondary)]">
            Lade Benutzerdetails...
          </p>
        </div>
      )}
      {/* Fehlermeldung: Wird angezeigt, wenn ein Fehler auftritt und nicht geladen wird */}
      {error && !isLoading && (
        <div className="alert alert-danger my-4">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 mr-2" /> {/* Warn-Icon */}
            <p>{error}</p>
          </div>
        </div>
      )}
      {/* Benutzerdetails: Werden angezeigt, wenn keine Lade- oder Fehlermeldung aktiv ist und userData vorhanden ist */}
      {!isLoading && !error && userData && (
        <dl className="space-y-0">
          {" "}
          {/* Definitionsliste für die Details */}
          <DetailItem label="Benutzer-ID" value={userData.id} />
          <DetailItem label="E-Mail" value={userData.email} />
          <DetailItem label="Vorname" value={userData.firstName} />
          <DetailItem label="Nachname" value={userData.lastName} />
          <DetailItem
            label="Rolle"
            value={
              <span className="capitalize font-medium">{userData.role}</span> // Rolle mit Großbuchstaben am Anfang
            }
          />
          <DetailItem
            label="Anmeldeanbieter"
            value={<span className="capitalize">{userData.authProvider}</span>} // Anmeldeanbieter mit Großbuchstaben am Anfang
          />
          <DetailItem
            label="Status"
            value={
              <Badge color={userData.isActive ? "success" : "danger"}>
                {" "}
                {/* Badge für den Status (aktiv/inaktiv) */}
                {userData.isActive ? "Aktiv" : "Inaktiv"}
              </Badge>
            }
          />
          <DetailItem
            label="MFA aktiviert"
            value={
              <Badge color={userData.isMfaEnabled ? "success" : "neutral"}>
                {" "}
                {/* Badge für MFA-Status (Ja/Nein) */}
                {userData.isMfaEnabled ? "Ja" : "Nein"}
              </Badge>
            }
          />
          <DetailItem
            label="Beigetreten am"
            value={formatDate(userData.createdAt)} // Formatiertes Datum der Registrierung
          />
          <DetailItem
            label="Zuletzt aktualisiert am"
            value={formatDate(userData.updatedAt)} // Formatiertes Datum der letzten Aktualisierung
          />
          <DetailItem
            label="Letzter Login am"
            value={formatDate(userData.lastLoginAt)} // Formatiertes Datum des letzten Logins
          />
        </dl>
      )}
      {/* Fallback-Nachricht, wenn keine Benutzerdetails gefunden wurden */}
      {!isLoading && !error && !userData && isOpen && (
        <p className="text-[var(--color-text-secondary)] py-10 text-center">
          Kein Benutzer ausgewählt oder Details konnten nicht geladen werden.
        </p>
      )}
      {/* Schließen-Button */}
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">
          {" "}
          {/* Sekundärer Button-Stil */}
          Schließen
        </button>
      </div>
    </Modal>
  );
}
