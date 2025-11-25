"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent, // Typ für Change-Ereignisse von Input-Elementen.
  FormEvent, // Typ für Formular-Submit-Ereignisse.
} from "react";
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import { FiSettings, FiSave, FiLoader } from "react-icons/fi"; // Importiert Icons (Einstellungen, Speichern, Lade-Spinner).
import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ConfigPaths
 * Definiert die Struktur für die Konfigurationspfade, die vom SIMONE-Dienst
 * benötigt und vom Backend verwaltet werden.
 * -------------------------------------------------------------------
 */
interface ConfigPaths {
  simoneInstallationPath: string; // Der Pfad zur SIMONE-Installation.
  defaultNetworkDirectory: string; // Das Standardverzeichnis für Netzwerke.
  defaultConfigFilePath: string; // Der Pfad zur Standard-SIMONE-Konfigurationsdatei.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: FormInput
 * Eine wiederverwendbare Hilfskomponente für ein Formular-Eingabefeld.
 * Vereinfacht das Rendern von beschrifteten Textfeldern.
 * -------------------------------------------------------------------
 */
const FormInput = ({
  label, // Die Beschriftung des Eingabefeldes.
  id, // Die ID des Eingabefeldes (muss mit einem Schlüssel in `ConfigPaths` übereinstimmen).
  value, // Der aktuelle Wert des Eingabefeldes.
  onChange, // Der Change-Handler für das Eingabefeld.
  placeholder, // Der Platzhaltertext des Eingabefeldes.
}: {
  label: string;
  id: keyof ConfigPaths; // Typisiert die ID, um sicherzustellen, dass sie zu `ConfigPaths` passt.
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-[var(--color-text-secondary)]"
    >
      {label}
    </label>
    <div className="mt-1">
      <input
        type="text"
        name={id} // Der Name muss mit der ID übereinstimmen, um den Zustand korrekt zu aktualisieren.
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-text w-full" // Standard-Styling für Text-Inputs.
      />
    </div>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: SystemparameterTabContent
 * Die Hauptkomponente für den "Systemparameter"-Tab.
 * Sie verwaltet die Konfiguration der Dateipfade für den SIMONE-Dienst.
 * Benutzer können die Pfade abrufen, bearbeiten und speichern.
 * -------------------------------------------------------------------
 */
export default function SystemparameterTabContent() {
  // Zustandsvariable für die Konfigurationspfade.
  const [configPaths, setConfigPaths] = useState<ConfigPaths>({
    simoneInstallationPath: "",
    defaultNetworkDirectory: "",
    defaultConfigFilePath: "",
  });

  // Zustandsvariablen für Ladeindikatoren.
  const [isLoading, setIsLoading] = useState({
    fetchConfig: true, // Zeigt an, ob die Konfiguration abgerufen wird (startet im Ladezustand).
    saveConfig: false, // Zeigt an, ob die Konfiguration gespeichert wird.
  });

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: fetchConfigPaths
   * Ruft die Konfigurationspfade vom Backend-Server ab.
   * Aktualisiert den 'configPaths'-Zustand oder zeigt einen Fehler an.
   * Verwendet `useCallback` zur Optimierung.
   * -------------------------------------------------------------------
   */
  const fetchConfigPaths = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, fetchConfig: true })); // Setzt Ladezustand für Abruf auf true.
    try {
      const response = await apiClient("/config/simone"); // API-Aufruf zum Abrufen der SIMONE-Konfiguration.
      const data = await response.json(); // Parsed die JSON-Antwort.
      setConfigPaths(data); // Aktualisiert den Zustand mit den abgerufenen Pfaden.
    } catch (error) {
      // Fehlerbehandlung beim Abrufen der Konfiguration.
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Fehler beim Abrufen der Pfadkonfiguration."
      ); // Zeigt eine Toast-Benachrichtigung an.
    } finally {
      setIsLoading((prev) => ({ ...prev, fetchConfig: false })); // Beendet Ladezustand für Abruf.
    }
  }, []); // Leeres Abhängigkeitsarray, da diese Funktion keine externen Abhängigkeiten hat.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Konfigurationspfade beim Komponentenladevorgang laden
   * Dieser Hook führt den initialen Abruf der Konfigurationspfade aus,
   * sobald die Komponente geladen wird.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    fetchConfigPaths(); // Ruft die Funktion zum Abrufen der Konfigurationspfade auf.
  }, [fetchConfigPaths]); // Abhängigkeit: Effekt wird bei Änderungen von `fetchConfigPaths` ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleConfigInputChange
   * Behandelt Änderungen in den Eingabefeldern der Pfadkonfiguration.
   * Aktualisiert den 'configPaths'-Zustand.
   * -------------------------------------------------------------------
   */
  const handleConfigInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Typsicherung für 'name' und 'value' aus dem Event-Target.
    const { name, value } = e.target as {
      name: keyof ConfigPaths;
      value: string;
    };
    setConfigPaths((prev) => ({ ...prev, [name]: value })); // Aktualisiert den Zustand des jeweiligen Pfades.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleSaveConfig
   * Speichert die aktualisierte Pfadkonfiguration auf dem Server.
   * @param e - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite bei Formularübermittlung.
    setIsLoading((prev) => ({ ...prev, saveConfig: true })); // Setzt Ladezustand für Speichern auf true.
    const toastId = toast.loading("Speichere Einstellungen..."); // Zeigt einen Lade-Toast an.
    try {
      // Sendet die POST-Anfrage zur Aktualisierung der Konfiguration.
      const response = await apiClient("/config/simone", {
        method: "POST",
        body: JSON.stringify(configPaths), // Sendet das gesamte Konfigurationsobjekt.
      });
      const data = await response.json(); // Parsed die JSON-Antwort.
      toast.success(data.message || "Konfiguration gespeichert!", {
        id: toastId,
      }); // Erfolgs-Toast.
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Fehler beim Speichern der Konfiguration.";
      toast.error(msg, { id: toastId }); // Fehler-Toast.
    } finally {
      setIsLoading((prev) => ({ ...prev, saveConfig: false })); // Beendet Ladezustand für Speichern.
    }
  };

  return (
    <div className="space-y-12">
      {/* Abschnitt für die Pfadkonfiguration */}
      <section aria-labelledby="path-config-heading">
        <h3
          id="path-config-heading"
          className="text-lg font-semibold leading-6 text-[var(--color-text-primary)] flex items-center"
        >
          <FiSettings className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />{" "}
          {/* Einstellungen-Icon. */}
          Pfadkonfiguration
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Legen Sie die Dateipfade fest, die der SIMONE-Dienst verwendet.
        </p>
        <form
          onSubmit={handleSaveConfig} // Formular-Submit-Handler.
          className="mt-6 space-y-6 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]"
        >
          {isLoading.fetchConfig ? (
            // Ladeanzeige, wenn die Konfiguration abgerufen wird.
            <div className="flex items-center justify-center h-48">
              <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
              {/* Spinner. */}
            </div>
          ) : (
            // Formularfelder, wenn die Konfiguration geladen wurde.
            <>
              <FormInput
                label="SIMONE-Installationspfad"
                id="simoneInstallationPath"
                value={configPaths.simoneInstallationPath}
                onChange={handleConfigInputChange}
                placeholder="z.B. C:/Simone/Simone-V6_34"
              />
              <FormInput
                label="Standard-Netzwerkverzeichnis"
                id="defaultNetworkDirectory"
                value={configPaths.defaultNetworkDirectory}
                onChange={handleConfigInputChange}
                placeholder="z.B. C:/Simone/Simone-V6_34/Nets"
              />
              <FormInput
                label="Standard-SIMONE-Konfigurationsdatei"
                id="defaultConfigFilePath"
                value={configPaths.defaultConfigFilePath}
                onChange={handleConfigInputChange}
                placeholder="z.B. C:/Simone/Simone-V6_34/sys/api.ini"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading.saveConfig} // Deaktiviert, wenn Speichervorgang läuft.
                  className="btn-primary w-full sm:w-auto disabled:opacity-50" // Primärer Button-Stil.
                >
                  {isLoading.saveConfig ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : (
                    <FiSave className="mr-2" />
                  )}{" "}
                  Pfadeinstellungen speichern
                </button>
              </div>
            </>
          )}
        </form>
      </section>
    </div>
  );
}


// // frontend/src/components/simone/tabs/SystemparameterTabContent.tsx
// "use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   ChangeEvent, // Typ für Change-Ereignisse von Input-Elementen.
//   FormEvent, // Typ für Formular-Submit-Ereignisse.
// } from "react";
// import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
// import { FiSettings, FiSave, FiFolder, FiLoader } from "react-icons/fi"; // Importiert Icons (Einstellungen, Speichern, Ordner, Lade-Spinner).
// import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.

// /**
//  * -------------------------------------------------------------------
//  * ✅ Interface: ConfigPaths
//  * Definiert die Struktur für die Konfigurationspfade, die vom SIMONE-Dienst
//  * benötigt und vom Backend verwaltet werden.
//  * -------------------------------------------------------------------
//  */
// interface ConfigPaths {
//   simoneInstallationPath: string; // Der Pfad zur SIMONE-Installation auf dem Server.
//   defaultNetworkDirectory: string; // Das Standardverzeichnis für Netzwerke auf dem Server.
//   defaultConfigFilePath: string; // Der Pfad zur Standard-SIMONE-Konfigurationsdatei auf dem Server.
// }

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: FormInput
//  * Eine wiederverwendbare Hilfskomponente für ein Formular-Eingabefeld.
//  * Vereinfacht das Rendern von beschrifteten Textfeldern.
//  * -------------------------------------------------------------------
//  */
// const FormInput = ({
//   label, // Die Beschriftung des Eingabefeldes.
//   id, // Die ID des Eingabefeldes.
//   value, // Der aktuelle Wert des Eingabefeldes.
//   onChange, // Der Change-Handler für das Eingabefeld.
//   placeholder, // Der Platzhaltertext des Eingabefeldes.
// }: {
//   label: string;
//   id: string; // Generischer String für IDs
//   value: string;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   placeholder: string;
// }) => (
//   <div>
//     <label
//       htmlFor={id}
//       className="block text-sm font-medium text-[var(--color-text-secondary)]"
//     >
//       {label}
//     </label>
//     <div className="mt-1">
//       <input
//         type="text"
//         name={id}
//         id={id}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         className="input-text w-full" // Standard-Styling für Text-Inputs.
//       />
//     </div>
//   </div>
// );

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: SystemparameterTabContent
//  * Die Hauptkomponente für den "Systemparameter"-Tab.
//  * Sie verwaltet die Konfiguration der Dateipfade für den SIMONE-Dienst
//  * auf dem Server und ermöglicht es Benutzern, ihr individuelles
//  * Netzwerkverzeichnis festzulegen.
//  * -------------------------------------------------------------------
//  */
// export default function SystemparameterTabContent() {
//   // Zustandsvariable für die Konfigurationspfade des Servers.
//   const [configPaths, setConfigPaths] = useState<ConfigPaths>({
//     simoneInstallationPath: "",
//     defaultNetworkDirectory: "",
//     defaultConfigFilePath: "",
//   });

//   // ✅ NEU: Zustandsvariable für das individuelle Netzwerkverzeichnis des Benutzers.
//   const [userNetworkPath, setUserNetworkPath] = useState<string>("");

//   // Zustandsvariablen für Ladeindikatoren.
//   const [isLoading, setIsLoading] = useState({
//     fetchConfig: true, // Zeigt an, ob die Server-Konfiguration abgerufen wird.
//     saveConfig: false, // Zeigt an, ob die Server-Konfiguration gespeichert wird.
//     setUserPath: false, // ✅ NEU: Zeigt an, ob das Benutzer-Netzwerkverzeichnis gesetzt wird.
//   });

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: fetchConfigPaths
//    * Ruft die Konfigurationspfade vom Backend-Server ab.
//    * Aktualisiert den 'configPaths'-Zustand oder zeigt einen Fehler an.
//    * -------------------------------------------------------------------
//    */
//   const fetchConfigPaths = useCallback(async () => {
//     setIsLoading((prev) => ({ ...prev, fetchConfig: true }));
//     try {
//       const response = await apiClient("/config/simone");
//       const data = await response.json();
//       setConfigPaths(data);
//     } catch (error) {
//       toast.error(
//         error instanceof ApiError
//           ? error.message
//           : "Fehler beim Abrufen der Pfadkonfiguration."
//       );
//     } finally {
//       setIsLoading((prev) => ({ ...prev, fetchConfig: false }));
//     }
//   }, []);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ useEffect Hook: Konfigurationspfade beim Komponentenladevorgang laden
//    * Dieser Hook führt den initialen Abruf der Konfigurationspfade aus.
//    * -------------------------------------------------------------------
//    */
//   useEffect(() => {
//     fetchConfigPaths();
//   }, [fetchConfigPaths]);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleConfigInputChange
//    * Behandelt Änderungen in den Eingabefeldern der Server-Pfadkonfiguration.
//    * Aktualisiert den 'configPaths'-Zustand.
//    * -------------------------------------------------------------------
//    */
//   const handleConfigInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setConfigPaths((prev) => ({ ...prev, [name as keyof ConfigPaths]: value }));
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ NEU: Funktion: handleUserNetworkPathChange
//    * Behandelt Änderungen im Eingabefeld für das individuelle Netzwerkverzeichnis.
//    * -------------------------------------------------------------------
//    */
//   const handleUserNetworkPathChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setUserNetworkPath(e.target.value);
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleSaveConfig
//    * Speichert die aktualisierte Server-Pfadkonfiguration auf dem Server.
//    * @param e - Das Formular-Submit-Ereignis.
//    * -------------------------------------------------------------------
//    */
//   const handleSaveConfig = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsLoading((prev) => ({ ...prev, saveConfig: true }));
//     const toastId = toast.loading("Speichere Server-Einstellungen...");
//     try {
//       const response = await apiClient("/config/simone", {
//         method: "POST",
//         body: JSON.stringify(configPaths),
//       });
//       const data = await response.json();
//       toast.success(data.message || "Server-Konfiguration gespeichert!", {
//         id: toastId,
//       });
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Fehler beim Speichern der Server-Konfiguration.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, saveConfig: false }));
//     }
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ NEU: Funktion: handleSetUserNetworkPath
//    * Sendet das individuelle Netzwerkverzeichnis des Benutzers an den Backend-Server.
//    * @param e - Das Formular-Submit-Ereignis.
//    * -------------------------------------------------------------------
//    */
//   const handleSetUserNetworkPath = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsLoading((prev) => ({ ...prev, setUserPath: true }));
//     const toastId = toast.loading("Setze individuelles Netzwerkverzeichnis...");
//     try {
//       if (!userNetworkPath.trim()) {
//         throw new Error("Netzwerkverzeichnis darf nicht leer sein.");
//       }

//       const response = await apiClient("/simone/set-network-directory", {
//         method: "POST",
//         body: JSON.stringify({ networkPath: userNetworkPath }),
//       });
//       const data = await response.json();
//       toast.success(data.message || "Individuelles Netzwerkverzeichnis gesetzt!", {
//         id: toastId,
//       });
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Fehler beim Setzen des individuellen Netzwerkverzeichnisses.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, setUserPath: false }));
//     }
//   };

//   return (
//     <div className="space-y-12">
//       {/* Abschnitt für die Server-Pfadkonfiguration */}
//       <section aria-labelledby="server-path-config-heading">
//         <h3
//           id="server-path-config-heading"
//           className="text-lg font-semibold leading-6 text-[var(--color-text-primary)] flex items-center"
//         >
//           <FiSettings className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />{" "}
//           Server-Pfadkonfiguration
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Legen Sie die Dateipfade fest, die der SIMONE-Dienst auf dem Server verwendet.
//         </p>
//         <form
//           onSubmit={handleSaveConfig}
//           className="mt-6 space-y-6 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]"
//         >
//           {isLoading.fetchConfig ? (
//             <div className="flex items-center justify-center h-48">
//               <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
//             </div>
//           ) : (
//             <>
//               <FormInput
//                 label="SIMONE-Installationspfad (Server)"
//                 id="simoneInstallationPath"
//                 value={configPaths.simoneInstallationPath}
//                 onChange={handleConfigInputChange}
//                 placeholder="z.B. C:/Simone/Simone-V6_37"
//               />
//               <FormInput
//                 label="Standard-Netzwerkverzeichnis (Server)"
//                 id="defaultNetworkDirectory"
//                 value={configPaths.defaultNetworkDirectory}
//                 onChange={handleConfigInputChange}
//                 placeholder="z.B. C:/Simone/Simone-V6_37/Nets"
//               />
//               <FormInput
//                 label="Standard-SIMONE-Konfigurationsdatei (Server)"
//                 id="defaultConfigFilePath"
//                 value={configPaths.defaultConfigFilePath}
//                 onChange={handleConfigInputChange}
//                 placeholder="z.B. C:/Simone/Simone-V6_37/sys/api.ini"
//               />
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={isLoading.saveConfig}
//                   className="btn-primary w-full sm:w-auto disabled:opacity-50"
//                 >
//                   {isLoading.saveConfig ? (
//                     <FiLoader className="animate-spin mr-2" />
//                   ) : (
//                     <FiSave className="mr-2" />
//                   )}{" "}
//                   Server-Pfadeinstellungen speichern
//                 </button>
//               </div>
//             </>
//           )}
//         </form>
//       </section>

//       {/* ✅ NEU: Abschnitt für das individuelle Netzwerkverzeichnis des Benutzers */}
//       <section aria-labelledby="user-network-path-heading">
//         <h3
//           id="user-network-path-heading"
//           className="text-lg font-semibold leading-6 text-[var(--color-text-primary)] flex items-center"
//         >
//           <FiFolder className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />{" "}
//           Individuelles Netzwerkverzeichnis
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Geben Sie den Pfad zu Ihrem persönlichen SIMONE-Netzwerkordner an, der auf einem Netzlaufwerk liegt.
//           <br />
//           Beispiel: `\\Ihr-Dateiserver\SimoneUsers\IhrName\Nets`
//         </p>
//         <form
//           onSubmit={handleSetUserNetworkPath} // Neuer Submit-Handler für diesen Abschnitt
//           className="mt-6 space-y-6 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]"
//         >
//           <FormInput
//             label="Netzwerkordner-Pfad"
//             id="userNetworkPath" // Eindeutige ID für dieses Feld
//             value={userNetworkPath}
//             onChange={handleUserNetworkPathChange}
//             placeholder="z.B. \\Ihr-Dateiserver\SimoneUsers\IhrName\Nets"
//           />
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={isLoading.setUserPath} // Deaktiviert, wenn Speichervorgang läuft.
//               className="btn-primary w-full sm:w-auto disabled:opacity-50"
//             >
//               {isLoading.setUserPath ? (
//                 <FiLoader className="animate-spin mr-2" />
//               ) : (
//                 <FiSave className="mr-2" />
//               )}{" "}
//               Netzwerkordner setzen
//             </button>
//           </div>
//         </form>
//       </section>
//     </div>
//   );
// }