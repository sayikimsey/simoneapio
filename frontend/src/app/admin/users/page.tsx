// "use client";

// import React, { useEffect, useState, useMemo, Suspense } from "react";
// import { apiClient } from "@/lib/apiClient";
// import { UserData } from "@/types";
// import UsersTable from "@/app/admin/users/UsersTable";
// import CreateUserModal from "@/app/admin/users/CreateUserModal";
// import {
//   FiPlusCircle,
//   FiAlertCircle,
//   FiSearch,
//   FiLoader,
// } from "react-icons/fi";

// /**
//  * Loading component for the users page.
//  */
// const LoadingUsers = () => (
//   <div className="flex justify-center items-center py-20">
//     <div className="text-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
//       <p className="text-[var(--color-text-secondary)]">
//         Benutzer werden geladen...
//       </p>
//     </div>
//   </div>
// );

// /**
//  * Main component for the user management page.
//  * Manages fetching, filtering, and displaying user data.
//  */
// function UserManagementContent() {
//   const [allUsers, setAllUsers] = useState<UserData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("");

//   const availableRoles = ["user", "admin"];

//   /**
//    * Fetches the user list from the server.
//    */
//   const fetchUsers = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await apiClient("/admin/users", { method: "GET" });
//       const data = await response.json();
//       if (data.users && Array.isArray(data.users)) {
//         setAllUsers(data.users as UserData[]);
//       } else {
//         throw new Error(
//           "Die vom Server empfangenen Benutzerdaten haben nicht das erwartete Format."
//         );
//       }
//     } catch (err) {
//       console.error("🔥 Fehler beim Abrufen der Benutzer:", err);
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Benutzer konnten nicht abgerufen werden."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   /**
//    * Triggers a reload of the user list.
//    */
//   const handleUserListUpdate = () => {
//     console.log(
//       "Aktualisierung der Benutzerliste ausgelöst. Lade Benutzer erneut."
//     );
//     fetchUsers();
//   };

//   /**
//    * Filters the user list based on the current filter criteria.
//    */
//   const filteredUsers = useMemo(() => {
//     let usersToFilter = allUsers;

//     if (roleFilter) {
//       usersToFilter = usersToFilter.filter((user) => user.role === roleFilter);
//     }

//     if (statusFilter) {
//       const isActiveFilter = statusFilter === "active";
//       usersToFilter = usersToFilter.filter(
//         (user) => user.isActive === isActiveFilter
//       );
//     }

//     if (!searchTerm.trim()) {
//       return usersToFilter;
//     }
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return usersToFilter.filter((user) => {
//       const searchIn = [
//         user.id.toLowerCase(),
//         user.email.toLowerCase(),
//         user.firstName?.toLowerCase() || "",
//         user.lastName?.toLowerCase() || "",
//         user.role.toLowerCase(),
//         user.authProvider?.toLowerCase() || "",
//       ];
//       return searchIn.some((fieldContent) =>
//         fieldContent.includes(lowerCaseSearchTerm)
//       );
//     });
//   }, [allUsers, searchTerm, roleFilter, statusFilter]);

//   if (isLoading && allUsers.length === 0) {
//     return <LoadingUsers />;
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger m-6" role="alert">
//         <div className="flex">
//           <div className="py-1">
//             <FiAlertCircle className="h-6 w-6 mr-3" />
//           </div>
//           <div>
//             <p className="font-bold">Fehler beim Laden der Benutzer</p>
//             <p className="text-sm">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[var(--color-surface)] shadow-xl rounded-lg p-6 sm:p-8 border border-[var(--border-color)]">
//       <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//         <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
//           Benutzerverwaltung
//         </h1>
//         <button
//           onClick={() => setIsCreateUserModalOpen(true)}
//           className="btn-primary"
//         >
//           <FiPlusCircle className="h-5 w-5 mr-2" />
//           Neuen Benutzer hinzufügen
//         </button>
//       </div>

//       <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
//         <div className="sm:col-span-2 md:col-span-1">
//           <label
//             htmlFor="userSearch"
//             className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
//           >
//             Benutzer suchen
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch
//                 className="h-5 w-5 text-[var(--placeholder-color)]"
//                 aria-hidden="true"
//               />
//             </div>
//             <input
//               type="text"
//               name="userSearch"
//               id="userSearch"
//               className="pl-10"
//               placeholder="ID, E-Mail, Name, Rolle..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         <div>
//           <label
//             htmlFor="roleFilter"
//             className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
//           >
//             Nach Rolle filtern
//           </label>
//           <select
//             id="roleFilter"
//             name="roleFilter"
//             value={roleFilter}
//             onChange={(e) => setRoleFilter(e.target.value)}
//           >
//             <option value="">Alle Rollen</option>
//             {availableRoles.map((role) => (
//               <option key={role} value={role} className="capitalize">
//                 {role.charAt(0).toUpperCase() + role.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label
//             htmlFor="statusFilter"
//             className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
//           >
//             Nach Status filtern
//           </label>
//           <select
//             id="statusFilter"
//             name="statusFilter"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="">Alle Status</option>
//             <option value="active">Aktiv</option>
//             <option value="inactive">Inaktiv</option>
//           </select>
//         </div>
//       </div>

//       <UsersTable users={filteredUsers} onUserUpdate={handleUserListUpdate} />

//       <CreateUserModal
//         isOpen={isCreateUserModalOpen}
//         onClose={() => setIsCreateUserModalOpen(false)}
//         onUserCreated={() => {
//           setIsCreateUserModalOpen(false);
//           handleUserListUpdate();
//         }}
//       />
//     </div>
//   );
// }

// /**
//  * Exports the user management page, wrapped in a Suspense fallback.
//  */
// export default function UserManagementPage() {
//   return (
//     <Suspense fallback={<LoadingUsers />}>
//       <UserManagementContent />
//     </Suspense>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten
import UsersTable from "@/app/admin/users/UsersTable"; // Importiert die Tabelle zur Anzeige von Benutzern
import CreateUserModal from "@/app/admin/users/CreateUserModal"; // Importiert das Modal zum Erstellen neuer Benutzer
import {
  FiPlusCircle, // Icon für "Hinzufügen"
  FiAlertCircle, // Icon für "Warnung/Fehler"
  FiSearch, // Icon für "Suchen"
  FiLoader, // Icon für "Laden/Spinner"
} from "react-icons/fi"; // Importiert Icons aus 'react-icons'

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: LoadingUsers
 * Eine einfache Ladekomponente, die angezeigt wird, während Benutzerdaten
 * vom Server abgerufen werden.
 * -------------------------------------------------------------------
 */
const LoadingUsers = () => (
  <div className="flex justify-center items-center py-20">
    <div className="text-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />{" "}
      {/* Spinner-Icon */}
      <p className="text-[var(--color-text-secondary)]">
        Benutzer werden geladen...
      </p>
    </div>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: UserManagementContent
 * Die Hauptkomponente für die Benutzerverwaltungsseite.
 * Verantwortlich für das Abrufen, Filtern und Anzeigen von Benutzerdaten.
 * -------------------------------------------------------------------
 */
function UserManagementContent() {
  // Zustandsvariablen
  const [allUsers, setAllUsers] = useState<UserData[]>([]); // Speichert alle vom Server abgerufenen Benutzer
  const [isLoading, setIsLoading] = useState(true); // Zeigt an, ob Benutzerdaten geladen werden
  const [error, setError] = useState<string | null>(null); // Speichert Fehlermeldungen beim Laden von Benutzern
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false); // Steuert die Sichtbarkeit des "Benutzer erstellen"-Modals

  // Zustandsvariablen für Filter und Suchbegriff
  const [searchTerm, setSearchTerm] = useState(""); // Speichert den aktuellen Suchbegriff
  const [roleFilter, setRoleFilter] = useState<string>(""); // Speichert den Filter für die Rolle
  const [statusFilter, setStatusFilter] = useState<string>(""); // Speichert den Filter für den Aktivitätsstatus

  // Verfügbare Rollen (sollte mit Backend-Definitionen übereinstimmen)
  const availableRoles = ["user", "admin"];

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: fetchUsers
   * Ruft die Benutzerliste vom Backend-Server ab.
   * Aktualisiert die Zustände 'allUsers', 'isLoading' und 'error'.
   * -------------------------------------------------------------------
   */
  const fetchUsers = async () => {
    setIsLoading(true); // Setzt Ladezustand auf true
    setError(null); // Löscht vorherige Fehlermeldungen
    try {
      const response = await apiClient("/admin/users", { method: "GET" }); // Führt GET-Anfrage an /admin/users aus
      const data = await response.json(); // Parsed die JSON-Antwort

      // Prüft, ob die empfangenen Daten das erwartete Format haben (ein Array von Benutzern)
      if (data.users && Array.isArray(data.users)) {
        setAllUsers(data.users as UserData[]); // Aktualisiert den Zustand mit den abgerufenen Benutzern
      } else {
        throw new Error(
          "Die vom Server empfangenen Benutzerdaten haben nicht das erwartete Format."
        );
      }
    } catch (err) {
      console.error("🔥 Fehler beim Abrufen der Benutzer:", err); // Loggt den Fehler
      setError(
        // Setzt die Fehlermeldung, entweder aus dem Fehlerobjekt oder eine generische Nachricht
        err instanceof Error
          ? err.message
          : "Benutzer konnten nicht abgerufen werden."
      );
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false, unabhängig vom Ergebnis
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Benutzerliste beim Initialisieren der Komponente laden
   * Dieser Hook wird einmalig beim Mounten der Komponente ausgeführt, um die
   * initiale Benutzerliste abzurufen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    fetchUsers(); // Ruft die Funktion zum Laden der Benutzer auf
  }, []); // Leeres Abhängigkeitsarray bedeutet, dass der Effekt nur einmal läuft

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleUserListUpdate
   * Eine Callback-Funktion, die von untergeordneten Komponenten (z.B. Modal)
   * aufgerufen wird, um eine Aktualisierung der Benutzerliste auszulösen.
   * -------------------------------------------------------------------
   */
  const handleUserListUpdate = () => {
    console.log(
      "Aktualisierung der Benutzerliste ausgelöst. Lade Benutzer erneut."
    );
    fetchUsers(); // Ruft die Benutzerliste erneut ab
  };

  /**
   * -------------------------------------------------------------------
   * ✅ useMemo Hook: Gefilterte Benutzerliste
   * Dieser Hook optimiert die Filterlogik. Er berechnet die gefilterte Liste
   * nur neu, wenn sich 'allUsers', 'searchTerm', 'roleFilter' oder 'statusFilter' ändern.
   * -------------------------------------------------------------------
   */
  const filteredUsers = useMemo(() => {
    let usersToFilter = allUsers; // Startet mit allen Benutzern

    // Filter nach Rolle
    if (roleFilter) {
      usersToFilter = usersToFilter.filter((user) => user.role === roleFilter);
    }

    // Filter nach Status (aktiv/inaktiv)
    if (statusFilter) {
      const isActiveFilter = statusFilter === "active"; // Konvertiert "active" zu true, "inactive" zu false
      usersToFilter = usersToFilter.filter(
        (user) => user.isActive === isActiveFilter
      );
    }

    // Suchfunktion (nur wenn ein Suchbegriff vorhanden ist)
    if (!searchTerm.trim()) {
      return usersToFilter; // Wenn Suchfeld leer, die bereits gefilterte Liste zurückgeben
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Suchbegriff in Kleinbuchstaben für case-insensitive Suche

    return usersToFilter.filter((user) => {
      // Felder, in denen gesucht werden soll
      const searchIn = [
        user.id.toLowerCase(),
        user.email.toLowerCase(),
        user.firstName?.toLowerCase() || "", // Falls firstName null/undefined ist
        user.lastName?.toLowerCase() || "", // Falls lastName null/undefined ist
        user.role.toLowerCase(),
        user.authProvider?.toLowerCase() || "", // Falls authProvider null/undefined ist
      ];
      // Prüft, ob der Suchbegriff in einem der Felder enthalten ist
      return searchIn.some((fieldContent) =>
        fieldContent.includes(lowerCaseSearchTerm)
      );
    });
  }, [allUsers, searchTerm, roleFilter, statusFilter]); // Abhängigkeiten für useMemo

  // -------------------------------------------------------------------
  // ✅ Render-Logik basierend auf dem Lade- und Fehlerzustand
  // -------------------------------------------------------------------

  // Zeigt den Lade-Spinner, wenn Daten zum ersten Mal geladen werden
  if (isLoading && allUsers.length === 0) {
    return <LoadingUsers />;
  }

  // Zeigt eine Fehlermeldung an, wenn ein Fehler aufgetreten ist
  if (error) {
    return (
      <div className="alert alert-danger m-6" role="alert">
        <div className="flex">
          <div className="py-1">
            <FiAlertCircle className="h-6 w-6 mr-3" /> {/* Warn-Icon */}
          </div>
          <div>
            <p className="font-bold">Fehler beim Laden der Benutzer</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ Haupt-UI für die Benutzerverwaltung
  // Enthält Überschrift, "Benutzer hinzufügen"-Button, Filter- und Suchfelder
  // sowie die UsersTable-Komponente.
  // -------------------------------------------------------------------
  return (
    <div className="bg-[var(--color-surface)] shadow-xl rounded-lg p-6 sm:p-8 border border-[var(--border-color)]">
      {/* Kopfbereich mit Überschrift und "Benutzer hinzufügen"-Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
          Benutzerverwaltung
        </h1>
        <button
          onClick={() => setIsCreateUserModalOpen(true)} // Öffnet das "Benutzer erstellen"-Modal
          className="btn-primary" // Primärer Button-Stil
        >
          <FiPlusCircle className="h-5 w-5 mr-2" /> {/* Plus-Icon */}
          Neuen Benutzer hinzufügen
        </button>
      </div>

      {/* Filter- und Suchbereich */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
        {/* Suchfeld für Benutzer */}
        <div className="sm:col-span-2 md:col-span-1">
          <label
            htmlFor="userSearch"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
          >
            Benutzer suchen
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch
                className="h-5 w-5 text-[var(--placeholder-color)]"
                aria-hidden="true"
              />{" "}
              {/* Such-Icon */}
            </div>
            <input
              type="text"
              name="userSearch"
              id="userSearch"
              className="pl-10" // Padding links, um Platz für das Icon zu schaffen
              placeholder="ID, E-Mail, Name, Rolle..." // Platzhaltertext
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Aktualisiert den Suchbegriff-Zustand
            />
          </div>
        </div>

        {/* Rollenfilter-Dropdown */}
        <div>
          <label
            htmlFor="roleFilter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
          >
            Nach Rolle filtern
          </label>
          <select
            id="roleFilter"
            name="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)} // Aktualisiert den Rollenfilter-Zustand
          >
            <option value="">Alle Rollen</option> {/* Option "Alle Rollen" */}
            {availableRoles.map((role) => (
              <option key={role} value={role} className="capitalize">
                {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
                {/* Rollennamen formatieren */}
              </option>
            ))}
          </select>
        </div>

        {/* Statusfilter-Dropdown */}
        <div>
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
          >
            Nach Status filtern
          </label>
          <select
            id="statusFilter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)} // Aktualisiert den Statusfilter-Zustand
          >
            <option value="">Alle Status</option> {/* Option "Alle Status" */}
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </div>
      </div>

      {/* Benutzer-Tabelle: Zeigt die gefilterten Benutzer an */}
      <UsersTable users={filteredUsers} onUserUpdate={handleUserListUpdate} />

      {/* Modal zum Erstellen eines neuen Benutzers */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen} // Steuert die Sichtbarkeit des Modals
        onClose={() => setIsCreateUserModalOpen(false)} // Schließt das Modal
        onUserCreated={() => {
          setIsCreateUserModalOpen(false); // Schließt das Modal nach erfolgreicher Erstellung
          handleUserListUpdate(); // Aktualisiert die Benutzerliste
        }}
      />
    </div>
  );
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: UserManagementPage (Export)
 * Exportiert die Benutzerverwaltungsseite, eingehüllt in ein Suspense-Fallback.
 * Dies ermöglicht das Anzeigen eines Ladezustands auf Seitenebene, wenn die
 * 'UserManagementContent'-Komponente (oder ihre Daten) asynchron geladen wird.
 * -------------------------------------------------------------------
 */
export default function UserManagementPage() {
  return (
    <Suspense fallback={<LoadingUsers />}>
      {" "}
      {/* Zeigt 'LoadingUsers' an, während die Inhalte geladen werden */}
      <UserManagementContent /> {/* Die eigentliche Benutzerverwaltungslogik */}
    </Suspense>
  );
}
