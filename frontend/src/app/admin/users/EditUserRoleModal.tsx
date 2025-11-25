// "use client";

// import React, { useEffect, useState, FormEvent } from "react";
// import Modal from "@/components/common/Modal";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import { UserData } from "@/types";
// import { FiLoader, FiAlertTriangle, FiSave } from "react-icons/fi";

// /**
//  * Defines the props for the EditUserRoleModal component.
//  */
// interface EditUserRoleModalProps {
//   user: UserData | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onRoleUpdated: () => void;
// }

// // Available user roles
// const availableRoles = ["user", "admin"];

// /**
//  * A modal component for editing a user's role.
//  */
// export default function EditUserRoleModal({
//   user,
//   isOpen,
//   onClose,
//   onRoleUpdated,
// }: EditUserRoleModalProps) {
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<{
//     [key: string]: string[] | undefined;
//   } | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Resets the state when the user or `isOpen` status changes.
//   useEffect(() => {
//     if (user && isOpen) {
//       setSelectedRole(user.role);
//       setError(null);
//       setFieldErrors(null);
//       setSuccessMessage(null);
//     } else if (!isOpen) {
//       // Clear state when modal is closed
//       setSelectedRole("");
//       setError(null);
//       setFieldErrors(null);
//       setSuccessMessage(null);
//       setIsLoading(false);
//     }
//   }, [user, isOpen]);

//   /**
//    * Handles the submission of the role update form.
//    * @param event - The form submit event.
//    */
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!user || !selectedRole) {
//       setError(
//         "Benutzerdaten oder neue Rolle fehlen. Bitte schließen und erneut versuchen."
//       );
//       return;
//     }
//     if (user.role === selectedRole) {
//       setError(
//         "Die neue Rolle ist dieselbe wie die aktuelle. Keine Änderung vorgenommen."
//       );
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);

//     try {
//       console.log(
//         `Versuche, die Rolle für Benutzer-ID zu aktualisieren: ${user.id} von '${user.role}' zu '${selectedRole}'`
//       );
//       const response = await apiClient(`/admin/users/${user.id}/role`, {
//         method: "PUT",
//         body: JSON.stringify({ newRole: selectedRole }),
//       });

//       const data = await response.json();

//       setSuccessMessage(
//         data.message || "Benutzerrolle erfolgreich aktualisiert!"
//       );
//       onRoleUpdated();

//       // Closes the modal after a short delay
//       setTimeout(() => {
//         onClose();
//       }, 1500);
//     } catch (err) {
//       console.error(
//         `🔥 Fehler beim Aktualisieren der Rolle für Benutzer ${user.id}:`,
//         err
//       );
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) {
//           setFieldErrors(err.fieldErrors);
//           setError("Bitte korrigieren Sie die unten markierten Fehler.");
//         }
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(
//           "Ein unerwarteter Fehler ist beim Aktualisieren der Benutzerrolle aufgetreten."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fallback if user data is missing
//   if (!user && isOpen) {
//     return (
//       <Modal isOpen={isOpen} onClose={onClose} title="Fehler" size="sm">
//         <div className="p-4 text-[var(--color-danger)]">
//           Benutzerdaten fehlen. Bitte schließen und erneut versuchen.
//         </div>
//         <div className="mt-4 flex justify-end">
//           <button type="button" onClick={onClose}>
//             Schließen
//           </button>
//         </div>
//       </Modal>
//     );
//   }
//   if (!user) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={`Rolle bearbeiten für: ${user.email}`}
//       size="md"
//     >
//       {/* Loading indicator */}
//       {isLoading && (
//         <div className="absolute inset-0 bg-[var(--color-surface)]/70 backdrop-blur-sm flex justify-center items-center z-50 rounded-2xl">
//           <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />
//         </div>
//       )}

//       {/* Success and error messages */}
//       {!isLoading && successMessage && (
//         <div className="alert alert-success my-4">
//           <p>{successMessage}</p>
//         </div>
//       )}

//       {!isLoading && error && !fieldErrors && !successMessage && (
//         <div className="alert alert-danger my-4">
//           <div className="flex items-center">
//             <FiAlertTriangle className="h-5 w-5 mr-2" /> <p>{error}</p>
//           </div>
//         </div>
//       )}

//       {/* Role editing form */}
//       {!isLoading && !successMessage && (
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && fieldErrors && (
//             <div className="alert alert-danger p-3 mb-4">
//               <p className="text-sm font-medium">{error}</p>
//             </div>
//           )}

//           <div>
//             <p className="text-sm text-[var(--color-text-secondary)]">
//               Benutzer:{" "}
//               <span className="font-semibold text-[var(--color-text-primary)]">
//                 {user.firstName} {user.lastName} ({user.email})
//               </span>
//             </p>
//             <p className="text-sm text-[var(--color-text-secondary)] mt-1">
//               Aktuelle Rolle:{" "}
//               <span className="font-semibold capitalize text-[var(--color-text-primary)]">
//                 {user.role}
//               </span>
//             </p>
//           </div>

//           <div>
//             <label
//               htmlFor="newRoleEdit"
//               className="block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Neue Rolle zuweisen:{" "}
//               <span className="text-[var(--color-danger)]">*</span>
//             </label>
//             <select
//               id="newRoleEdit"
//               name="newRole"
//               value={selectedRole}
//               onChange={(e) => setSelectedRole(e.target.value)}
//               required
//               className="mt-1"
//             >
//               {availableRoles.map((role) => (
//                 <option key={role} value={role} className="capitalize">
//                   {role.charAt(0).toUpperCase() + role.slice(1)}
//                 </option>
//               ))}
//             </select>
//             {fieldErrors?.newRole && (
//               <p className="mt-1 text-xs text-[var(--color-danger)]">
//                 {fieldErrors.newRole.join(", ")}
//               </p>
//             )}
//           </div>

//           <div className="mt-8 flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isLoading}
//               className="disabled:opacity-50"
//             >
//               Abbrechen
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading || user.role === selectedRole}
//               className="btn-primary disabled:opacity-50"
//             >
//               <FiSave className="inline-block h-4 w-4 mr-1.5 -ml-1" />
//               {isLoading ? "Rolle wird gespeichert..." : "Rolle speichern"}
//             </button>
//           </div>
//         </form>
//       )}
//     </Modal>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState, FormEvent } from "react";
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten
import { FiLoader, FiAlertTriangle, FiSave } from "react-icons/fi"; // Importiert Icons aus 'react-icons'

/**
 * -------------------------------------------------------------------
 * ✅ Interface: EditUserRoleModalProps
 * Definiert die Props (Eigenschaften), die an die EditUserRoleModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface EditUserRoleModalProps {
  user: UserData | null; // Das Benutzerobjekt, dessen Rolle bearbeitet werden soll. Null, wenn kein Benutzer ausgewählt ist.
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
  onRoleUpdated: () => void; // Callback-Funktion, die aufgerufen wird, nachdem die Rolle erfolgreich aktualisiert wurde.
}

// Verfügbare Benutzerrollen, die im Dropdown-Menü angezeigt werden sollen.
const availableRoles = ["user", "admin"];

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: EditUserRoleModal
 * Eine modale Komponente zum Bearbeiten der Rolle eines Benutzers.
 * Zeigt die aktuellen Benutzerinformationen an und erlaubt die Auswahl einer neuen Rolle.
 * -------------------------------------------------------------------
 */
export default function EditUserRoleModal({
  user,
  isOpen,
  onClose,
  onRoleUpdated,
}: EditUserRoleModalProps) {
  // Zustandsvariablen für das Formular und den UI-Status
  const [selectedRole, setSelectedRole] = useState<string>(""); // Speichert die vom Benutzer ausgewählte neue Rolle.
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob die Anfrage läuft (Ladezustand).
  const [error, setError] = useState<string | null>(null); // Speichert allgemeine Fehlermeldungen (z.B. vom Server).
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined; // Speichert feldspezifische Fehlermeldungen (z.B. "newRole" ist ungültig).
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Speichert Erfolgsmeldungen.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Zustand zurücksetzen und initialisieren
   * Dieser Hook wird ausgelöst, wenn sich das 'user'-Objekt oder der 'isOpen'-Status ändert.
   * Er initialisiert die 'selectedRole' mit der aktuellen Rolle des Benutzers,
   * wenn das Modal geöffnet wird, und setzt alle Statusmeldungen zurück.
   * Wenn das Modal geschlossen wird, werden alle Zustände geleert.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (user && isOpen) {
      // Wenn ein Benutzerobjekt vorhanden ist und das Modal geöffnet wird:
      setSelectedRole(user.role); // Setzt die vorausgewählte Rolle auf die aktuelle Rolle des Benutzers.
      setError(null); // Löscht vorherige allgemeine Fehlermeldungen.
      setFieldErrors(null); // Löscht vorherige feldspezifische Fehlermeldungen.
      setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen.
    } else if (!isOpen) {
      // Wenn das Modal geschlossen wird:
      setSelectedRole(""); // Leert die ausgewählte Rolle.
      setError(null); // Leert allgemeine Fehlermeldungen.
      setFieldErrors(null); // Leert feldspezifische Fehlermeldungen.
      setSuccessMessage(null); // Leert Erfolgsmeldungen.
      setIsLoading(false); // Setzt den Ladezustand zurück (falls noch aktiv).
    }
  }, [user, isOpen]); // Abhängigkeiten: Effekt wird bei Änderungen von 'user' oder 'isOpen' ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ handleSubmit
   * Behandelt die Formularübermittlung zum Aktualisieren der Benutzerrolle.
   * Führt grundlegende Validierungen durch und sendet die Daten an die API.
   * @param event - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite bei Formularübermittlung.

    // Grundlegende Validierung: Prüfen, ob Benutzerdaten und eine Rolle ausgewählt sind.
    if (!user || !selectedRole) {
      setError(
        "Benutzerdaten oder neue Rolle fehlen. Bitte schließen und erneut versuchen."
      );
      return; // Beendet die Funktion frühzeitig.
    }
    // Prüfen, ob die ausgewählte Rolle identisch mit der aktuellen Rolle ist.
    if (user.role === selectedRole) {
      setError(
        "Die neue Rolle ist dieselbe wie die aktuelle. Keine Änderung vorgenommen."
      );
      return; // Beendet die Funktion frühzeitig.
    }

    setIsLoading(true); // Setzt den Ladezustand auf true.
    setError(null); // Löscht vorherige Fehler.
    setFieldErrors(null); // Löscht vorherige Feldfeldher.
    setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen.

    try {
      console.log(
        `Versuche, die Rolle für Benutzer-ID zu aktualisieren: ${user.id} von '${user.role}' zu '${selectedRole}'`
      );
      // Führt den API-Aufruf zum Aktualisieren der Rolle durch (PUT-Anfrage an /admin/users/:id/role).
      const response = await apiClient(`/admin/users/${user.id}/role`, {
        method: "PUT", // HTTP PUT-Methode für Aktualisierung
        body: JSON.stringify({ newRole: selectedRole }), // Sendet die neue Rolle im Request-Body.
      });

      const data = await response.json(); // Parsed die JSON-Antwort vom Server.

      setSuccessMessage(
        data.message || "Benutzerrolle erfolgreich aktualisiert!"
      ); // Setzt die Erfolgsmeldung.
      onRoleUpdated(); // Ruft den Callback auf, um z.B. die Benutzerliste im übergeordneten Element zu aktualisieren.

      // Schließt das Modal nach einer kurzen Verzögerung, um die Erfolgsmeldung anzuzeigen.
      setTimeout(() => {
        onClose();
      }, 1500); // 1,5 Sekunden Verzögerung.
    } catch (err) {
      // Fehlerbehandlung bei API-Aufruf.
      console.error(
        `🔥 Fehler beim Aktualisieren der Rolle für Benutzer ${user.id}:`,
        err
      );
      if (err instanceof ApiError) {
        // Wenn es sich um einen benutzerdefinierten API-Fehler handelt.
        setError(err.message); // Setzt die allgemeine Fehlermeldung.
        if (err.fieldErrors) {
          // Wenn feldspezifische Fehler vom Backend zurückgegeben wurden.
          setFieldErrors(err.fieldErrors); // Setzt die feldspezifischen Fehler.
          setError("Bitte korrigieren Sie die unten markierten Fehler."); // Aktualisiert die Hauptfehlermeldung mit Hinweis auf Feldfehler.
        }
      } else if (err instanceof Error) {
        // Wenn es sich um einen allgemeinen JavaScript-Fehler handelt.
        setError(err.message);
      } else {
        // Für alle anderen unerwarteten Fehlertypen.
        setError(
          "Ein unerwarteter Fehler ist beim Aktualisieren der Benutzerrolle aufgetreten."
        );
      }
    } finally {
      setIsLoading(false); // Setzt den Ladezustand auf false, unabhängig vom Ergebnis.
    }
  };

  // -------------------------------------------------------------------
  // ✅ Fallback-Anzeige, wenn Benutzerdaten fehlen
  // Dies wird gerendert, wenn das Modal geöffnet ist, aber kein Benutzerobjekt vorhanden ist.
  // Es zeigt eine Fehlermeldung innerhalb des Modals an.
  // -------------------------------------------------------------------
  if (!user && isOpen) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Fehler" size="sm">
        <div className="p-4 text-[var(--color-danger)]">
          Benutzerdaten fehlen. Bitte schließen und erneut versuchen.
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            {" "}
            {/* Schaltfläche zum Schließen des Modals */}
            Schließen
          </button>
        </div>
      </Modal>
    );
  }
  // Wenn das Modal nicht geöffnet ist oder kein Benutzerobjekt vorhanden ist,
  // wird nichts gerendert.
  if (!user) return null;

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der EditUserRoleModal-Komponente
  // Das Modal enthält den Ladeindikator, Erfolgs-/Fehlermeldungen und das Rollenbearbeitungsformular.
  // -------------------------------------------------------------------
  return (
    <Modal
      isOpen={isOpen} // Steuert die Sichtbarkeit des Modals
      onClose={onClose} // Callback zum Schließen des Modals
      title={`Rolle bearbeiten für: ${user.email}`} // Dynamischer Titel mit der E-Mail des Benutzers
      size="md" // Größe des Modals (mittel)
    >
      {/* Ladeindikator: Wird absolut positioniert über dem Inhalt angezeigt, wenn isLoading true ist */}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--color-surface)]/70 backdrop-blur-sm flex justify-center items-center z-50 rounded-2xl">
          <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
          {/* Spinner-Icon */}
        </div>
      )}

      {/* Erfolgsmeldung: Wird angezeigt, wenn isLoading false und successMessage aktiv ist */}
      {!isLoading && successMessage && (
        <div className="alert alert-success my-4">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Allgemeine Fehlermeldung: Wird angezeigt, wenn isLoading false, error aktiv, aber keine feldspezifischen Fehler oder Erfolgsmeldung vorhanden sind */}
      {!isLoading && error && !fieldErrors && !successMessage && (
        <div className="alert alert-danger my-4">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 mr-2" /> <p>{error}</p>{" "}
            {/* Warn-Icon und Fehlermeldung */}
          </div>
        </div>
      )}

      {/* Rollenbearbeitungsformular: Wird angezeigt, wenn nicht geladen wird und keine Erfolgsmeldung aktiv ist */}
      {!isLoading && !successMessage && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Allgemeine Fehlermeldung, wenn auch feldspezifische Fehler vorhanden sind */}
          {error && fieldErrors && (
            <div className="alert alert-danger p-3 mb-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Anzeige der Benutzerinformationen */}
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Benutzer:{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {user.firstName} {user.lastName} ({user.email}){" "}
                {/* Zeigt Vorname, Nachname und E-Mail des Benutzers an */}
              </span>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Aktuelle Rolle:{" "}
              <span className="font-semibold capitalize text-[var(--color-text-primary)]">
                {user.role}{" "}
                {/* Zeigt die aktuelle Rolle an (erste Buchstabe groß) */}
              </span>
            </p>
          </div>

          {/* Auswahl der neuen Rolle */}
          <div>
            <label
              htmlFor="newRoleEdit"
              className="block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Neue Rolle zuweisen:{" "}
              <span className="text-[var(--color-danger)]">*</span>{" "}
              {/* Pflichtfeld-Indikator */}
            </label>
            <select
              id="newRoleEdit"
              name="newRole"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)} // Aktualisiert den Zustand bei Auswahländerung
              required // HTML5-Pflichtfeld
              className="mt-1"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role} className="capitalize">
                  {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
                  {/* Rollennamen formatieren (z.B. "admin" zu "Admin") */}
                </option>
              ))}
            </select>
            {/* Zeigt feldspezifische Fehlermeldungen für das Feld 'newRole' an */}
            {fieldErrors?.newRole && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {fieldErrors.newRole.join(", ")}
              </p>
            )}
          </div>

          {/* Aktionsbuttons (Abbrechen und Rolle speichern) */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading} // Deaktiviert den Button während des Ladens
              className="btn-secondary disabled:opacity-50" // Sekundärer Button-Stil, opaker wenn deaktiviert
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || user.role === selectedRole} // Deaktiviert den Button während des Ladens oder wenn keine Änderung vorgenommen wurde
              className="btn-primary disabled:opacity-50" // Primärer Button-Stil, opaker wenn deaktiviert
            >
              <FiSave className="inline-block h-4 w-4 mr-1.5 -ml-1" />{" "}
              {/* Speichern-Icon */}
              {isLoading ? "Rolle wird gespeichert..." : "Rolle speichern"}{" "}
              {/* Text ändert sich während des Ladens */}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
