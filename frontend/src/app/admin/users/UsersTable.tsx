// "use client";

// import React, { useState } from "react";
// import { UserData } from "@/types";
// import {
//   FiEdit,
//   FiEye,
//   FiCheckCircle,
//   FiXCircle,
//   FiLoader,
//   FiAlertCircle,
// } from "react-icons/fi";
// import ViewUserDetailsModal from "./ViewUserDetailsModal";
// import EditUserRoleModal from "./EditUserRoleModal";
// import ConfirmActionModal from "@/components/common/ConfirmActionModal";
// import { apiClient } from "@/lib/apiClient";

// /**
//  * Defines the props for the UsersTable component.
//  */
// interface UsersTableProps {
//   users: UserData[];
//   onUserUpdate: () => void;
// }

// /**
//  * A component to display a table of users with management actions.
//  */
// export default function UsersTable({ users, onUserUpdate }: UsersTableProps) {
//   const [selectedUserIdForView, setSelectedUserIdForView] = useState<
//     string | null
//   >(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);

//   const [userToEditRole, setUserToEditRole] = useState<UserData | null>(null);
//   const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

//   const [actionLoading, setActionLoading] = useState<{
//     [key: string]: boolean;
//   }>({});
//   const [actionError, setActionError] = useState<{
//     [key: string]: string | null;
//   }>({});

//   const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false);
//   const [userForStatusToggle, setUserForStatusToggle] =
//     useState<UserData | null>(null);

//   /**
//    * Formats a date string into a local date format.
//    * @param dateString - The ISO date string to format.
//    * @returns The formatted date or "N/A".
//    */
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString("de-DE", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch (e) {
//       console.error("Fehler beim Formatieren des Datums:", dateString, e);
//       return "Ungültiges Datum";
//     }
//   };

//   /**
//    * Opens the modal to view user details.
//    * @param userId - The ID of the user to view.
//    */
//   const handleViewUser = (userId: string) => {
//     setSelectedUserIdForView(userId);
//     setIsViewModalOpen(true);
//   };
//   const handleCloseViewModal = () => {
//     setIsViewModalOpen(false);
//     setSelectedUserIdForView(null);
//   };

//   /**
//    * Opens the modal to edit the user's role.
//    * @param user - The user object to edit.
//    */
//   const handleOpenEditRoleModal = (user: UserData) => {
//     const roleActionKey = `${user.id}-role`;
//     setActionError((prev) => ({ ...prev, [roleActionKey]: null }));
//     setUserToEditRole(user);
//     setIsEditRoleModalOpen(true);
//   };
//   const handleCloseEditRoleModal = () => {
//     setIsEditRoleModalOpen(false);
//     setUserToEditRole(null);
//   };
//   const handleRoleSuccessfullyUpdated = () => {
//     handleCloseEditRoleModal();
//     onUserUpdate();
//   };

//   /**
//    * Initiates the user status toggle process.
//    * @param user - The user object whose status is to be toggled.
//    */
//   const initiateToggleUserStatus = (user: UserData) => {
//     setUserForStatusToggle(user);
//     setShowConfirmStatusModal(true);
//     const actionKey = `${user.id}-status`;
//     setActionError((prev) => ({ ...prev, [actionKey]: null }));
//   };

//   /**
//    * Confirms and executes the user status toggle.
//    */
//   const confirmToggleUserStatus = async () => {
//     if (!userForStatusToggle) return;

//     const user = userForStatusToggle;
//     const action = user.isActive ? "Deaktivieren" : "Aktivieren";
//     const actionKey = `${user.id}-status`;

//     setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
//     setActionError((prev) => ({ ...prev, [actionKey]: null }));

//     try {
//       await apiClient(`/admin/users/${user.id}/status`, {
//         method: "PUT",
//         body: JSON.stringify({ isActive: !user.isActive }),
//       });
//       console.log(
//         `Benutzer ${user.email} erfolgreich ${action.toLowerCase()}t.`
//       );
//       onUserUpdate();
//       setShowConfirmStatusModal(false);
//       setUserForStatusToggle(null);
//     } catch (err) {
//       console.error(
//         `🔥 Fehler beim ${action.toLowerCase()} des Benutzers ${user.id}:`,
//         err
//       );
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : `Fehler beim ${action.toLowerCase()} des Benutzers.`;
//       setActionError((prev) => ({ ...prev, [actionKey]: errorMessage }));
//     } finally {
//       setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
//     }
//   };

//   if (!users || users.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <FiAlertCircle className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" />
//         <h3 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
//           Keine Benutzer gefunden
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Derzeit sind keine Benutzer im System registriert.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="relative overflow-x-auto shadow-lg rounded-lg border border-[var(--border-color)]">
//         <table className="w-full text-sm text-left text-[var(--color-text-secondary)]">
//           <thead className="text-xs uppercase bg-[var(--color-surface-2)] text-[var(--color-text-primary)]">
//             <tr>
//               <th scope="col" className="px-6 py-4">
//                 Name
//               </th>
//               <th scope="col" className="px-6 py-4">
//                 E-Mail
//               </th>
//               <th scope="col" className="px-6 py-4">
//                 Rolle
//               </th>
//               <th scope="col" className="px-6 py-4">
//                 Status
//               </th>
//               <th scope="col" className="px-6 py-4">
//                 Beigetreten am
//               </th>
//               <th scope="col" className="px-6 py-4 text-right min-w-[150px]">
//                 Aktionen
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user) => {
//               const statusActionKey = `${user.id}-status`;
//               const isLoadingThisAction =
//                 actionLoading[statusActionKey] || false;
//               const errorForThisAction = actionError[statusActionKey];

//               return (
//                 <tr
//                   key={user.id}
//                   className="bg-[var(--color-surface)] border-b border-[var(--border-color)] hover:bg-[var(--color-surface-2)] transition-colors duration-150"
//                 >
//                   <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
//                     {user.firstName || ""} {user.lastName || ""}
//                     {!user.firstName && !user.lastName && (
//                       <span className="italic text-[var(--color-text-secondary)]">
//                         N/A
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
//                         user.role === "admin"
//                           ? "bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]"
//                           : "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]"
//                       }`}
//                     >
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
//                         user.isActive
//                           ? "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]"
//                           : "bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]"
//                       }`}
//                     >
//                       {user.isActive ? (
//                         <FiCheckCircle className="mr-1.5 h-3.5 w-3.5" />
//                       ) : (
//                         <FiXCircle className="mr-1.5 h-3.5 w-3.5" />
//                       )}
//                       {user.isActive ? "Aktiv" : "Inaktiv"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {formatDate(user.createdAt)}
//                   </td>
//                   <td className="px-6 py-4 text-right whitespace-nowrap">
//                     <div className="flex items-center justify-end space-x-1">
//                       <button
//                         onClick={() => handleViewUser(user.id)}
//                         className="btn-icon"
//                         title="Benutzerdetails anzeigen"
//                         disabled={isLoadingThisAction}
//                       >
//                         <FiEye className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => handleOpenEditRoleModal(user)}
//                         className="btn-icon"
//                         title="Benutzerrolle bearbeiten"
//                         disabled={isLoadingThisAction}
//                       >
//                         <FiEdit className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => initiateToggleUserStatus(user)}
//                         disabled={isLoadingThisAction}
//                         className={`btn-icon disabled:opacity-50 ${
//                           isLoadingThisAction
//                             ? "cursor-not-allowed"
//                             : user.isActive
//                             ? "text-[var(--color-danger)]"
//                             : "text-[var(--color-success)]"
//                         }`}
//                         title={
//                           user.isActive
//                             ? "Benutzer deaktivieren"
//                             : "Benutzer aktivieren"
//                         }
//                       >
//                         {isLoadingThisAction ? (
//                           <FiLoader className="w-5 h-5 animate-spin" />
//                         ) : user.isActive ? (
//                           <FiXCircle className="w-5 h-5" />
//                         ) : (
//                           <FiCheckCircle className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>
//                     {errorForThisAction && (
//                       <p className="text-xs text-[var(--color-danger)] mt-1 text-right flex items-center justify-end">
//                         <FiAlertCircle className="w-3 h-3 mr-1" />{" "}
//                         {errorForThisAction}
//                       </p>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {selectedUserIdForView && isViewModalOpen && (
//         <ViewUserDetailsModal
//           userId={selectedUserIdForView}
//           isOpen={isViewModalOpen}
//           onClose={handleCloseViewModal}
//         />
//       )}

//       {userToEditRole && isEditRoleModalOpen && (
//         <EditUserRoleModal
//           user={userToEditRole}
//           isOpen={isEditRoleModalOpen}
//           onClose={handleCloseEditRoleModal}
//           onRoleUpdated={handleRoleSuccessfullyUpdated}
//         />
//       )}

//       {userForStatusToggle && (
//         <ConfirmActionModal
//           isOpen={showConfirmStatusModal}
//           onClose={() => {
//             setShowConfirmStatusModal(false);
//             setUserForStatusToggle(null);
//           }}
//           onConfirm={confirmToggleUserStatus}
//           title={`Benutzer ${
//             userForStatusToggle.isActive ? "deaktivieren" : "aktivieren"
//           }`}
//           message={
//             <p className="text-[var(--color-text-secondary)]">
//               Sind Sie sicher, dass Sie den Benutzer{" "}
//               <strong>{userForStatusToggle.email}</strong>
//               {userForStatusToggle.isActive
//                 ? " deaktivieren"
//                 : " aktivieren"}{" "}
//               möchten?
//             </p>
//           }
//           confirmButtonText={
//             userForStatusToggle.isActive ? "Ja, deaktivieren" : "Ja, aktivieren"
//           }
//           actionType={userForStatusToggle.isActive ? "danger" : "primary"}
//         />
//       )}
//     </>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useState } from "react";
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten
import {
  FiEdit, // Icon für "Bearbeiten"
  FiEye, // Icon für "Anzeigen"
  FiCheckCircle, // Icon für "Aktiv / Erfolgreich"
  FiXCircle, // Icon für "Inaktiv / Fehler"
  FiLoader, // Icon für "Laden / Spinner"
  FiAlertCircle, // Icon für "Warnung / Fehler"
} from "react-icons/fi"; // Importiert Icons aus 'react-icons'
import ViewUserDetailsModal from "./ViewUserDetailsModal"; // Importiert das Modal zum Anzeigen von Benutzerdetails
import EditUserRoleModal from "./EditUserRoleModal"; // Importiert das Modal zum Bearbeiten der Benutzerrolle
import ConfirmActionModal from "@/components/common/ConfirmActionModal"; // Importiert das allgemeine Bestätigungs-Modal
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen

/**
 * -------------------------------------------------------------------
 * ✅ Interface: UsersTableProps
 * Definiert die Props (Eigenschaften), die an die UsersTable-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface UsersTableProps {
  users: UserData[]; // Ein Array von Benutzerdaten, die in der Tabelle angezeigt werden sollen
  onUserUpdate: () => void; // Callback-Funktion, die aufgerufen wird, nachdem eine Benutzeraktualisierung stattgefunden hat
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: UsersTable
 * Eine Komponente zur Anzeige einer Tabelle von Benutzern mit Verwaltungsaktionen
 * wie Details anzeigen, Rolle bearbeiten und Status umschalten.
 * -------------------------------------------------------------------
 */
export default function UsersTable({ users, onUserUpdate }: UsersTableProps) {
  // Zustandsvariablen für Modale und Aktionen
  const [selectedUserIdForView, setSelectedUserIdForView] = useState<
    string | null // Speichert die ID des Benutzers, dessen Details angezeigt werden sollen
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Steuert die Sichtbarkeit des "Details anzeigen"-Modals

  const [userToEditRole, setUserToEditRole] = useState<UserData | null>(null); // Speichert das Benutzerobjekt, dessen Rolle bearbeitet werden soll
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false); // Steuert die Sichtbarkeit des "Rolle bearbeiten"-Modals

  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean; // Speichert den Ladezustand für spezifische Aktionen (z.B. user-id-status: true)
  }>({});
  const [actionError, setActionError] = useState<{
    [key: string]: string | null; // Speichert Fehlermeldungen für spezifische Aktionen
  }>({});

  const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false); // Steuert die Sichtbarkeit des Statusbestätigungs-Modals
  const [userForStatusToggle, setUserForStatusToggle] =
    useState<UserData | null>(null); // Speichert das Benutzerobjekt für den Statuswechsel

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: formatDate
   * Formatiert einen Datumsstring in ein lokales, lesbares Datumsformat.
   * @param dateString - Der ISO-Datumsstring, der formatiert werden soll. Kann undefined sein.
   * @returns Das formatierte Datum (z.B. "17. Juli 2025") oder "N/A" / "Ungültiges Datum".
   * -------------------------------------------------------------------
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"; // Wenn kein Datumsstring vorhanden ist
    try {
      // Versucht, das Datum im deutschen Format zu lokalisieren
      return new Date(dateString).toLocaleDateString("de-DE", {
        year: "numeric", // Vierstellige Jahreszahl
        month: "short", // Kurzer Monatsname (z.B. "Jul")
        day: "numeric", // Tag des Monats
      });
    } catch (e) {
      console.error("Fehler beim Formatieren des Datums:", dateString, e); // Loggt Fehler bei ungültigem Datum
      return "Ungültiges Datum";
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktionen zur Anzeige von Benutzerdetails
   * -------------------------------------------------------------------
   */
  const handleViewUser = (userId: string) => {
    setSelectedUserIdForView(userId); // Setzt die ID des Benutzers für die Ansicht
    setIsViewModalOpen(true); // Öffnet das Modal zum Anzeigen der Details
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false); // Schließt das Modal
    setSelectedUserIdForView(null); // Setzt die ausgewählte ID zurück
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktionen zur Bearbeitung der Benutzerrolle
   * -------------------------------------------------------------------
   */
  const handleOpenEditRoleModal = (user: UserData) => {
    const roleActionKey = `${user.id}-role`; // Eindeutiger Schlüssel für diese Aktion
    setActionError((prev) => ({ ...prev, [roleActionKey]: null })); // Löscht vorherige Fehler für diese Aktion
    setUserToEditRole(user); // Setzt das Benutzerobjekt, das bearbeitet werden soll
    setIsEditRoleModalOpen(true); // Öffnet das Modal zur Rollenbearbeitung
  };
  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false); // Schließt das Modal
    setUserToEditRole(null); // Setzt das Benutzerobjekt zurück
  };
  const handleRoleSuccessfullyUpdated = () => {
    handleCloseEditRoleModal(); // Schließt das Modal nach erfolgreicher Aktualisierung
    onUserUpdate(); // Ruft den Callback auf, um die Benutzerliste zu aktualisieren
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktionen zum Umschalten des Benutzerstatus (Aktiv/Inaktiv)
   * -------------------------------------------------------------------
   */
  const initiateToggleUserStatus = (user: UserData) => {
    setUserForStatusToggle(user); // Speichert den Benutzer für die Statusänderung
    setShowConfirmStatusModal(true); // Öffnet das Bestätigungs-Modal
    const actionKey = `${user.id}-status`; // Eindeutiger Schlüssel für diese Aktion
    setActionError((prev) => ({ ...prev, [actionKey]: null })); // Löscht vorherige Fehler für diese Aktion
  };

  const confirmToggleUserStatus = async () => {
    if (!userForStatusToggle) return; // Beendet, wenn kein Benutzer ausgewählt ist

    const user = userForStatusToggle;
    // Bestimmt die Aktion ("Deaktivieren" oder "Aktivieren") basierend auf dem aktuellen Status
    const action = user.isActive ? "Deaktivieren" : "Aktivieren";
    const actionKey = `${user.id}-status`; // Eindeutiger Schlüssel für den Lade-/Fehlerstatus

    setActionLoading((prev) => ({ ...prev, [actionKey]: true })); // Setzt Ladezustand für diese Aktion auf true
    setActionError((prev) => ({ ...prev, [actionKey]: null })); // Löscht Fehler für diese Aktion

    try {
      // Sendet die PUT-Anfrage an die API, um den Benutzerstatus zu ändern
      await apiClient(`/admin/users/${user.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !user.isActive }), // Wechselt den isActive-Status
      });
      console.log(
        `Benutzer ${user.email} erfolgreich ${action.toLowerCase()}t.`
      );
      onUserUpdate(); // Aktualisiert die Benutzerliste nach erfolgreicher Änderung
      setShowConfirmStatusModal(false); // Schließt das Bestätigungs-Modal
      setUserForStatusToggle(null); // Setzt den Benutzer für den Statuswechsel zurück
    } catch (err) {
      console.error(
        `🔥 Fehler beim ${action.toLowerCase()} des Benutzers ${user.id}:`,
        err
      );
      // Erstellt eine spezifische Fehlermeldung
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Fehler beim ${action.toLowerCase()} des Benutzers.`;
      setActionError((prev) => ({ ...prev, [actionKey]: errorMessage })); // Setzt den Fehler für diese Aktion
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false })); // Setzt den Ladezustand für diese Aktion auf false
    }
  };

  // -------------------------------------------------------------------
  // ✅ Fallback-Anzeige, wenn keine Benutzer vorhanden sind
  // -------------------------------------------------------------------
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-10">
        <FiAlertCircle className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" />{" "}
        {/* Warn-Icon */}
        <h3 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Keine Benutzer gefunden
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Derzeit sind keine Benutzer im System registriert.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der UsersTable-Komponente
  // Die Komponente rendert eine responsive Tabelle mit Benutzerdaten und Aktionen.
  // -------------------------------------------------------------------
  return (
    <>
      <div className="relative overflow-x-auto shadow-lg rounded-lg border border-[var(--border-color)]">
        <table className="w-full text-sm text-left text-[var(--color-text-secondary)]">
          {/* Tabellenkopf */}
          <thead className="text-xs uppercase bg-[var(--color-surface-2)] text-[var(--color-text-primary)]">
            <tr>
              <th scope="col" className="px-6 py-4">
                Name
              </th>
              <th scope="col" className="px-6 py-4">
                E-Mail
              </th>
              <th scope="col" className="px-6 py-4">
                Rolle
              </th>
              <th scope="col" className="px-6 py-4">
                Status
              </th>
              <th scope="col" className="px-6 py-4">
                Beigetreten am
              </th>
              <th scope="col" className="px-6 py-4 text-right min-w-[150px]">
                Aktionen
              </th>
            </tr>
          </thead>
          {/* Tabellenkörper */}
          <tbody>
            {users.map((user) => {
              const statusActionKey = `${user.id}-status`; // Eindeutiger Schlüssel für den Statuswechsel-Lade/Fehlerstatus
              const isLoadingThisAction =
                actionLoading[statusActionKey] || false; // Prüft, ob diese spezielle Aktion lädt
              const errorForThisAction = actionError[statusActionKey]; // Ruft Fehler für diese Aktion ab

              return (
                <tr
                  key={user.id} // Eindeutiger Schlüssel für jede Zeile
                  className="bg-[var(--color-surface)] border-b border-[var(--border-color)] hover:bg-[var(--color-surface-2)] transition-colors duration-150"
                >
                  {/* Name des Benutzers */}
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                    {user.firstName || ""} {user.lastName || ""}{" "}
                    {/* Zeigt Vor- und Nachname */}
                    {!user.firstName && !user.lastName && (
                      <span className="italic text-[var(--color-text-secondary)]">
                        N/A {/* Wenn kein Name vorhanden ist */}
                      </span>
                    )}
                  </td>
                  {/* E-Mail des Benutzers */}
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  {/* Rolle des Benutzers mit Styling */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === "admin"
                          ? "bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]" // Admin-Rolle
                          : "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]" // Standard-Benutzerrolle
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  {/* Status des Benutzers (Aktiv/Inaktiv) mit Icons und Styling */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]" // Aktiver Status
                          : "bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]" // Inaktiver Status
                      }`}
                    >
                      {user.isActive ? (
                        <FiCheckCircle className="mr-1.5 h-3.5 w-3.5" /> // Aktiv-Icon
                      ) : (
                        <FiXCircle className="mr-1.5 h-3.5 w-3.5" /> // Inaktiv-Icon
                      )}
                      {user.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  {/* Beitrittsdatum des Benutzers */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  {/* Aktionen-Spalte mit Buttons */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Button: Benutzerdetails anzeigen */}
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="btn-icon" // Icon-Button-Stil
                        title="Benutzerdetails anzeigen"
                        disabled={isLoadingThisAction} // Deaktiviert, wenn eine Aktion für diesen Benutzer lädt
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      {/* Button: Benutzerrolle bearbeiten */}
                      <button
                        onClick={() => handleOpenEditRoleModal(user)}
                        className="btn-icon"
                        title="Benutzerrolle bearbeiten"
                        disabled={isLoadingThisAction}
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      {/* Button: Benutzerstatus umschalten (Aktivieren/Deaktivieren) */}
                      <button
                        onClick={() => initiateToggleUserStatus(user)}
                        disabled={isLoadingThisAction}
                        className={`btn-icon disabled:opacity-50 ${
                          isLoadingThisAction
                            ? "cursor-not-allowed"
                            : user.isActive // Farbliche Anpassung basierend auf dem Status
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-success)]"
                        }`}
                        title={
                          user.isActive
                            ? "Benutzer deaktivieren"
                            : "Benutzer aktivieren"
                        }
                      >
                        {isLoadingThisAction ? (
                          <FiLoader className="w-5 h-5 animate-spin" /> // Spinner, wenn Aktion lädt
                        ) : user.isActive ? (
                          <FiXCircle className="w-5 h-5" /> // X-Icon, wenn aktiv (zum Deaktivieren)
                        ) : (
                          <FiCheckCircle className="w-5 h-5" /> // Haken-Icon, wenn inaktiv (zum Aktivieren)
                        )}
                      </button>
                    </div>
                    {/* Fehlermeldung für die Status-Aktion */}
                    {errorForThisAction && (
                      <p className="text-xs text-[var(--color-danger)] mt-1 text-right flex items-center justify-end">
                        <FiAlertCircle className="w-3 h-3 mr-1" />{" "}
                        {errorForThisAction}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modale Komponenten (werden nur gerendert, wenn isOpen true ist) */}
      {/* Modal zum Anzeigen von Benutzerdetails */}
      {selectedUserIdForView && isViewModalOpen && (
        <ViewUserDetailsModal
          userId={selectedUserIdForView}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />
      )}

      {/* Modal zum Bearbeiten der Benutzerrolle */}
      {userToEditRole && isEditRoleModalOpen && (
        <EditUserRoleModal
          user={userToEditRole}
          isOpen={isEditRoleModalOpen}
          onClose={handleCloseEditRoleModal}
          onRoleUpdated={handleRoleSuccessfullyUpdated}
        />
      )}

      {/* Bestätigungs-Modal für den Statuswechsel */}
      {userForStatusToggle && (
        <ConfirmActionModal
          isOpen={showConfirmStatusModal}
          onClose={() => {
            setShowConfirmStatusModal(false); // Schließt das Modal
            setUserForStatusToggle(null); // Setzt den Benutzer zurück
          }}
          onConfirm={confirmToggleUserStatus} // Callback für Bestätigung
          title={`Benutzer ${
            // Dynamischer Titel (aktivieren/deaktivieren)
            userForStatusToggle.isActive ? "deaktivieren" : "aktivieren"
          }`}
          message={
            // Bestätigungsnachricht
            <p className="text-[var(--color-text-secondary)]">
              Sind Sie sicher, dass Sie den Benutzer{" "}
              <strong>{userForStatusToggle.email}</strong>
              {userForStatusToggle.isActive
                ? " deaktivieren"
                : " aktivieren"}{" "}
              möchten?
            </p>
          }
          confirmButtonText={
            // Text für den Bestätigungsbutton
            userForStatusToggle.isActive ? "Ja, deaktivieren" : "Ja, aktivieren"
          }
          actionType={userForStatusToggle.isActive ? "danger" : "primary"} // Button-Stil (rot/primär)
        />
      )}
    </>
  );
}
