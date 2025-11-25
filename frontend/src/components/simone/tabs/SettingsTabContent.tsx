// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   ChangeEvent,
//   FormEvent,
// } from "react";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import {
//   FiPower,
//   FiCheckCircle,
//   FiXCircle,
//   FiLoader,
//   FiRefreshCw,
//   FiAlertTriangle,
//   FiList,
//   FiCheckSquare,
//   FiFolder,
// } from "react-icons/fi";
// import { Tooltip } from "react-tooltip";
// import "react-tooltip/dist/react-tooltip.css";
// import toast from "react-hot-toast";
// import { useSimoneContext } from "@/contexts/SimoneContext";

// type SimoneDisplayStatus =
//   | "unknown"
//   | "loading"
//   | "initialized"
//   | "terminated"
//   | "error";

// const StatusBadge = ({
//   status,
//   message,
// }: {
//   status: SimoneDisplayStatus;
//   message: string;
// }) => {
//   const getBadgeClasses = () => {
//     const baseClass =
//       "px-3 py-1 text-xs font-medium inline-flex items-center rounded-full";
//     switch (status) {
//       case "initialized":
//         return `${baseClass} alert-success`;
//       case "terminated":
//         return `${baseClass} bg-[var(--color-surface-2)] text-[var(--color-text-primary)]`;
//       case "loading":
//         return `${baseClass} alert-info`;
//       case "error":
//         return `${baseClass} alert-danger`;
//       default:
//         return `${baseClass} bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]`;
//     }
//   };

//   const getIcon = () => {
//     switch (status) {
//       case "initialized":
//         return <FiCheckCircle className="mr-1.5 h-4 w-4" />;
//       case "terminated":
//         return <FiXCircle className="mr-1.5 h-4 w-4" />;
//       case "loading":
//         return <FiLoader className="animate-spin mr-1.5 h-4 w-4" />;
//       case "error":
//         return <FiAlertTriangle className="mr-1.5 h-4 w-4" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={getBadgeClasses()}>
//       {getIcon()}
//       {message}
//     </div>
//   );
// };

// const FormInput = ({
//   label,
//   id,
//   value,
//   onChange,
//   placeholder,
// }: {
//   label: string;
//   id: string;
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
//       {/* ✅ KORRIGIERT: Zusätzliche Klasse für Autofill-Hintergrund */}
//       <input
//         type="text"
//         name={id}
//         id={id}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         className="input-text w-full autofill-fix"
//       />
//     </div>
//   </div>
// );

// export default function SettingsTabContent() {
//   const { simoneState, setSimoneInitialized, setActiveNetwork } =
//     useSimoneContext();

//   const [apiVersion, setApiVersion] = useState<string | null>(null);
//   const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
//   const [selectedNetworkInDropdown, setSelectedNetworkInDropdown] =
//     useState<string>("");
  
//   const [userNetworkPath, setUserNetworkPath] = useState<string>("");
//   const [activeNetworkDirectory, setActiveNetworkDirectory] = useState<string>("");
//   const [isPrepared, setIsPrepared] = useState<boolean>(false);

//   const [isLoading, setIsLoading] = useState({
//     healthCheck: true,
//     initialize: false,
//     terminate: false,
//     listNetworks: false,
//     selectNetwork: false,
//   });

//   const handleHealthCheck = useCallback(async () => {
//     setIsLoading((prev) => ({ ...prev, healthCheck: true }));
//     try {
//       const response = await apiClient("/simone/health");
//       const data = await response.json();
//       setApiVersion(data.simoneApiVersion || "N/A");

//       if (data.serviceStatus === "UP" || data.serviceStatus === "DEGRADED") {
//         try {
//           const currentNetResponse = await apiClient(
//             "/simone/networks/current"
//           );
//           const currentNetData = await currentNetResponse.json();
//           setActiveNetwork(currentNetData.currentNetworkName);
//           setSimoneInitialized(!!currentNetData.currentNetworkName);
//         } catch (e) {
//           setActiveNetwork(null);
//           setSimoneInitialized(false);
//         }
//       } else {
//         setSimoneInitialized(false);
//         setActiveNetwork(null);
//       }
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Verbindung zum Backend-Proxy fehlgeschlagen.";
//       toast.error(msg);
//       setSimoneInitialized(false);
//       setActiveNetwork(null);
//     } finally {
//       setIsLoading((prev) => ({ ...prev, healthCheck: false }));
//     }
//   }, [setActiveNetwork, setSimoneInitialized]);

//   useEffect(() => {
//     handleHealthCheck();
//   }, [handleHealthCheck]);

//   const handleInitializeAndSetPath = async () => {
//     setIsLoading((prev) => ({ ...prev, initialize: true }));
//     const toastId = toast.loading("Initialisiere SIMONE API...");
//     try {
//       // Schritt 1: Initialisierung des SIMONE-Dienstes mit der Standard-Konfigurationsdatei.
//       const initResponse = await apiClient("/simone/initialize", {
//         method: "POST",
//         // Es wird kein configFilePath gesendet, damit der Proxy den Standardpfad verwendet.
//         body: JSON.stringify({ useTemporaryConfigCopy: true }),
//       });
//       const initData = await initResponse.json();
//       toast.success(initData.message, { id: toastId });

//       // Schritt 2: Setzen des vom Benutzer angegebenen Netzwerkverzeichnisses.
//       const setPathResponse = await apiClient("/simone/set-network-directory", {
//         method: "POST",
//         body: JSON.stringify({ networkPath: userNetworkPath }),
//       });
//       const setPathData = await setPathResponse.json();
//       toast.success(setPathData.message, { id: toastId });

//       setActiveNetworkDirectory(userNetworkPath);
//       setIsPrepared(true);

//       await handleHealthCheck();
//       await handleListNetworks();
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Initialisierung oder Festlegen des Pfades fehlgeschlagen.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, initialize: false }));
//     }
//   };

//   const handleTerminate = async () => {
//     setIsLoading((prev) => ({ ...prev, terminate: true }));
//     const toastId = toast.loading("Beende SIMONE...");
//     try {
//       await apiClient("/simone/terminate", { method: "POST" });
//       toast.success(
//         "Beendigungsbefehl erfolgreich gesendet! Status wird aktualisiert...",
//         { id: toastId }
//       );
//       await handleHealthCheck();
//       setAvailableNetworks([]);
//       setSelectedNetworkInDropdown("");
//       setActiveNetworkDirectory("");
//       setIsPrepared(false);
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Beendigung fehlgeschlagen.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, terminate: false }));
//     }
//   };

//   const handleListNetworks = async () => {
//     setIsLoading((prev) => ({ ...prev, listNetworks: true }));
//     const toastId = toast.loading("Liste Netzwerke...");
//     try {
//       const response = await apiClient(`/simone/networks?directoryPath=${encodeURIComponent(userNetworkPath)}`, {
//         method: "GET",
//       });
//       const data = await response.json();
//       if (data.networks && Array.isArray(data.networks)) {
//         setAvailableNetworks(data.networks);
//         if (data.networks.length > 0) {
//           setSelectedNetworkInDropdown(data.networks[0]);
//           toast.success(`${data.networks.length} Netzwerk(e) gefunden.`, {
//             id: toastId,
//           });
//         } else {
//           toast.success("Keine Netzwerke gefunden.", { id: toastId });
//         }
//       }
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Netzwerke konnten nicht aufgelistet werden.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, listNetworks: false }));
//     }
//   };

//   const handleSelectNetwork = async () => {
//     if (!selectedNetworkInDropdown) {
//       toast.error("Bitte wählen Sie ein Netzwerk aus.");
//       return;
//     }
//     setIsLoading((prev) => ({ ...prev, selectNetwork: true }));
//     const toastId = toast.loading(
//       `Wähle '${selectedNetworkInDropdown}' aus...`
//     );
//     try {
//       const response = await apiClient("/simone/networks/select", {
//         method: "POST",
//         body: JSON.stringify({ networkName: selectedNetworkInDropdown }),
//       });
//       const data = await response.json();
//       await handleHealthCheck();
//       toast.success(data.message, { id: toastId });
//     } catch (error) {
//       const msg =
//         error instanceof ApiError
//           ? error.message
//           : "Netzwerkauswahl fehlgeschlagen.";
//       toast.error(msg, { id: toastId });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, selectNetwork: false }));
//     }
//   };

//   const handleUserNetworkPathChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setUserNetworkPath(e.target.value);
//   };

//   const getDisplayStatus = (): {
//     status: SimoneDisplayStatus;
//     message: string;
//   } => {
//     if (isLoading.healthCheck || isLoading.initialize || isLoading.terminate) {
//       return { status: "loading", message: "Wird verarbeitet..." };
//     }
//     if (simoneState.isSimoneInitialized) {
//       return { status: "initialized", message: "Initialisiert" };
//     }
//     // ✅ KORRIGIERT: Statusmeldung ändert sich, wenn die Vorbereitung abgeschlossen ist.
//     if (isPrepared) {
//       return { status: "unknown", message: "Initialisierung vorbereitet. Bitte Netzwerk auswählen." };
//     }
//     return { status: "terminated", message: "Bereit zum Initialisieren" };
//   };

//   const currentDisplayStatus = getDisplayStatus();

//   return (
//     <div className="space-y-12">
//       {/* Abschnitt: Individuelles Netzwerkverzeichnis */}
//       <section aria-labelledby="user-network-path-heading">
//         <h3
//           id="user-network-path-heading"
//           className="text-lg font-semibold leading-6 text-[var(--color-text-primary)] flex items-center"
//         >
//           <FiFolder className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />{" "}
//           Individuelles Netzwerkverzeichnis
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Geben Sie den Pfad zu Ihrem persönlichen SIMONE-Netzwerkordner an.
//         </p>
//         <div
//           className="mt-6 space-y-6 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]"
//         >
//           <FormInput
//             label="Netzwerkordner-Pfad"
//             id="userNetworkPath"
//             value={userNetworkPath}
//             onChange={handleUserNetworkPathChange}
//             placeholder="z.B. X:/SimoneUsers/max_mustermann/Nets"
//           />
//         </div>
//         {activeNetworkDirectory && (
//           <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
//             Ausgewähltes Netzwerkverzeichnis:{" "}
//             <span className="font-semibold text-[var(--color-text-primary)]">{activeNetworkDirectory}</span>
//           </div>
//         )}
//       </section>

//       {/* Abschnitt: API-Verbindung */}
//       <section aria-labelledby="api-connection-heading">
//         <h3
//           id="api-connection-heading"
//           className="text-lg font-semibold leading-6 text-[var(--color-text-primary)]"
//         >
//           API-Verbindung
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Verwalten Sie die Verbindung zum zugrunde liegenden SIMONE-API-Dienst.
//         </p>
//         <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]">
//           <div className="flex-shrink-0">
//             <StatusBadge
//               status={currentDisplayStatus.status}
//               message={currentDisplayStatus.message}
//             />
//           </div>
//           <div className="flex-grow text-sm text-[var(--color-text-secondary)]">
//             <strong>SIMONE API-Version:</strong> {apiVersion ?? "..."}
//           </div>
//           <button
//             onClick={() => handleHealthCheck()}
//             disabled={isLoading.healthCheck}
//             data-tooltip-id="refresh-tooltip"
//             data-tooltip-content="Status aktualisieren"
//             className="btn-icon"
//           >
//             {isLoading.healthCheck ? (
//               <FiLoader className="h-5 w-5 animate-spin" />
//             ) : (
//               <FiRefreshCw className="h-5 w-5" />
//             )}
//           </button>
//         </div>
//         <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
//           <button
//             onClick={handleInitializeAndSetPath}
//             // ✅ KORRIGIERT: Deaktiviert, wenn bereits vorbereitet, initialisiert wird oder initialisiert ist.
//             disabled={isLoading.initialize || simoneState.isSimoneInitialized || !userNetworkPath || isPrepared}
//             className="btn-primary bg-green-600 hover:bg-green-700 w-full sm:w-auto disabled:opacity-50"
//           >
//             {isLoading.initialize ? (
//               <FiLoader className="animate-spin mr-2" />
//             ) : (
//               <FiPower className="mr-2" />
//             )}{" "}
//             SIMONE Initialisierung vorbereiten
//           </button>
//           <button
//             onClick={handleTerminate}
//             disabled={isLoading.terminate || !simoneState.isSimoneInitialized}
//             className="btn-danger w-full sm:w-auto disabled:opacity-50"
//           >
//             {isLoading.terminate ? (
//               <FiLoader className="animate-spin mr-2" />
//             ) : (
//               <FiPower className="mr-2" />
//             )}{" "}
//             SIMONE beenden
//           </button>
//         </div>
//       </section>

//       {/* Abschnitt: Netzwerkverwaltung */}
//       <section aria-labelledby="network-management-heading">
//         <h3
//           id="network-management-heading"
//           className="text-lg font-semibold leading-6 text-[var(--color-text-primary)]"
//         >
//           Netzwerkverwaltung
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Hinweis: Die finale Initialisierung erfolgt erst mit Auswahl eines
//           Netzwerks. Bitte Verfügbare Netzwerke auflisten und das aktive
//           Netzwerk für alle Szenario-Operationen auswählen.
//         </p>
//         <div className="mt-4 text-sm">
//           <span className="font-semibold text-[var(--color-text-primary)]">
//             Aktives Netzwerk:{" "}
//           </span>
//           {simoneState.activeNetwork ? (
//             <span className="font-bold text-[var(--color-accent)]">
//               {simoneState.activeNetwork}
//             </span>
//           ) : (
//             <span className="italic text-[var(--color-text-secondary)]">
//               Keines ausgewählt
//             </span>
//           )}
//         </div>
//         <div className="mt-4 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]">
//           <div className="flex flex-col sm:flex-row items-center gap-4">
//             <button
//               onClick={() => handleListNetworks()}
//               disabled={
//                 isLoading.listNetworks || !simoneState.isSimoneInitialized
//               }
//               className="w-full sm:w-auto flex items-center justify-center disabled:opacity-50"
//             >
//               {isLoading.listNetworks ? (
//                 <FiLoader className="animate-spin mr-2" />
//               ) : (
//                 <FiList className="mr-2" />
//               )}{" "}
//               Netzwerke auflisten
//             </button>
//             <select
//               id="network-select"
//               value={selectedNetworkInDropdown}
//               onChange={(e) => setSelectedNetworkInDropdown(e.target.value)}
//               disabled={
//                 availableNetworks.length === 0 || isLoading.selectNetwork
//               }
//               className="input-select w-full sm:w-64"
//             >
//               <option value="" disabled>
//                 {availableNetworks.length > 0
//                   ? "Netzwerk auswählen..."
//                   : "Keine Netzwerke aufgelistet"}
//               </option>
//               {availableNetworks.map((net) => (
//                 <option key={net} value={net}>
//                   {net}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleSelectNetwork}
//               disabled={
//                 !selectedNetworkInDropdown ||
//                 isLoading.selectNetwork ||
//                 simoneState.activeNetwork === selectedNetworkInDropdown
//               }
//               className="btn-primary w-full sm:w-auto disabled:opacity-50"
//             >
//               {isLoading.selectNetwork ? (
//                 <FiLoader className="animate-spin mr-2" />
//               ) : (
//                 <FiCheckSquare className="mr-2" />
//               )}{" "}
//               Netzwerk auswählen
//             </button>
//           </div>
//         </div>
//       </section>
//       <Tooltip id="refresh-tooltip" />
//     </div>
//   );
// }

// frontend/src/components/simone/tabs/SettingsTabContent.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { apiClient, ApiError } from "@/lib/apiClient";
import {
  FiPower,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiRefreshCw,
  FiAlertTriangle,
  FiList,
  FiCheckSquare,
  FiFolder,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import toast from "react-hot-toast";
import { useSimoneContext } from "@/contexts/SimoneContext";

type SimoneDisplayStatus =
  | "unknown"
  | "loading"
  | "initialized"
  | "terminated"
  | "error";

const StatusBadge = ({
  status,
  message,
}: {
  status: SimoneDisplayStatus;
  message: string;
}) => {
  const getBadgeClasses = () => {
    const baseClass =
      "px-3 py-1 text-xs font-medium inline-flex items-center rounded-full";
    switch (status) {
      case "initialized":
        return `${baseClass} alert-success`;
      case "terminated":
        return `${baseClass} bg-[var(--color-surface-2)] text-[var(--color-text-primary)]`;
      case "loading":
        return `${baseClass} alert-info`;
      case "error":
        return `${baseClass} alert-danger`;
      default:
        return `${baseClass} bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]`;
    }
  };

  const getIcon = () => {
    switch (status) {
      case "initialized":
        return <FiCheckCircle className="mr-1.5 h-4 w-4" />;
      case "terminated":
        return <FiXCircle className="mr-1.5 h-4 w-4" />;
      case "loading":
        return <FiLoader className="animate-spin mr-1.5 h-4 w-4" />;
      case "error":
        return <FiAlertTriangle className="mr-1.5 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={getBadgeClasses()}>
      {getIcon()}
      {message}
    </div>
  );
};

const FormInput = ({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
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
      {/* ✅ KORRIGIERT: Zusätzliche Klasse für Autofill-Hintergrund */}
      <input
        type="text"
        name={id}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-text w-full autofill-fix"
      />
    </div>
  </div>
);

export default function SettingsTabContent() {
  const { 
    simoneState, 
    setSimoneInitialized, 
    setActiveNetwork,
    setActiveNetworkDirectory
  } = useSimoneContext();

  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const [selectedNetworkInDropdown, setSelectedNetworkInDropdown] =
    useState<string>("");
  
  const [userNetworkPath, setUserNetworkPath] = useState<string>("");
  const [isInitializedWithDirectory, setIsInitializedWithDirectory] = useState(false);


  const [isLoading, setIsLoading] = useState({
    healthCheck: true,
    initialize: false,
    terminate: false,
    listNetworks: false,
    selectNetwork: false,
  });

  const handleHealthCheck = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, healthCheck: true }));
    try {
      const response = await apiClient("/simone/health");
      const data = await response.json();
      setApiVersion(data.simoneApiVersion || "N/A");

      if (data.serviceStatus === "UP" || data.serviceStatus === "DEGRADED") {
        try {
          const currentNetResponse = await apiClient(
            "/simone/networks/current"
          );
          const currentNetData = await currentNetResponse.json();
          setActiveNetwork(currentNetData.currentNetworkName);
          setSimoneInitialized(!!currentNetData.currentNetworkName);
        } catch (e) {
          setActiveNetwork(null);
          setSimoneInitialized(false);
        }
      } else {
        setSimoneInitialized(false);
        setActiveNetwork(null);
      }
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Verbindung zum Backend-Proxy fehlgeschlagen.";
      toast.error(msg);
      setSimoneInitialized(false);
      setActiveNetwork(null);
    } finally {
      setIsLoading((prev) => ({ ...prev, healthCheck: false }));
    }
  }, [setActiveNetwork, setSimoneInitialized]);

  useEffect(() => {
    handleHealthCheck();
  }, [handleHealthCheck]);

  const handleInitializeAndSetPath = async () => {
    setIsLoading((prev) => ({ ...prev, initialize: true }));
    const toastId = toast.loading("Initialisiere SIMONE API...");
    try {
      const initResponse = await apiClient("/simone/initialize", {
        method: "POST",
        body: JSON.stringify({ useTemporaryConfigCopy: true }),
      });
      const initData = await initResponse.json();
      toast.success(initData.message, { id: toastId });

      const setPathResponse = await apiClient("/simone/set-network-directory", {
        method: "POST",
        body: JSON.stringify({ networkPath: userNetworkPath }),
      });
      const setPathData = await setPathResponse.json();
      toast.success(setPathData.message, { id: toastId });
      setActiveNetworkDirectory(userNetworkPath);
      setIsInitializedWithDirectory(true);

      await handleHealthCheck();
      await handleListNetworks();
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Initialisierung oder Festlegen des Pfades fehlgeschlagen.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading((prev) => ({ ...prev, initialize: false }));
    }
  };

  const handleTerminate = async () => {
    setIsLoading((prev) => ({ ...prev, terminate: true }));
    const toastId = toast.loading("Beende SIMONE...");
    try {
      await apiClient("/simone/terminate", { method: "POST" });
      toast.success(
        "Beendigungsbefehl erfolgreich gesendet! Status wird aktualisiert...",
        { id: toastId }
      );
      await handleHealthCheck();
      setAvailableNetworks([]);
      setSelectedNetworkInDropdown("");
      setActiveNetworkDirectory(null);
      setIsInitializedWithDirectory(false);
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Beendigung fehlgeschlagen.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading((prev) => ({ ...prev, terminate: false }));
    }
  };

  const handleListNetworks = async () => {
    setIsLoading((prev) => ({ ...prev, listNetworks: true }));
    const toastId = toast.loading("Liste Netzwerke...");
    try {
      const directoryPath = simoneState.activeNetworkDirectory || userNetworkPath;
      const response = await apiClient(`/simone/networks?directoryPath=${encodeURIComponent(directoryPath)}`, {
        method: "GET",
      });
      const data = await response.json();
      if (data.networks && Array.isArray(data.networks)) {
        setAvailableNetworks(data.networks);
        if (data.networks.length > 0) {
          setSelectedNetworkInDropdown(data.networks[0]);
          toast.success(`${data.networks.length} Netzwerk(e) gefunden.`, {
            id: toastId,
          });
        } else {
          toast.success("Keine Netzwerke gefunden.", { id: toastId });
        }
      }
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Netzwerke konnten nicht aufgelistet werden.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading((prev) => ({ ...prev, listNetworks: false }));
    }
  };

  const handleSelectNetwork = async () => {
    if (!selectedNetworkInDropdown) {
      toast.error("Bitte wählen Sie ein Netzwerk aus.");
      return;
    }
    setIsLoading((prev) => ({ ...prev, selectNetwork: true }));
    const toastId = toast.loading(
      `Wähle '${selectedNetworkInDropdown}' aus...`
    );
    try {
      const response = await apiClient("/simone/networks/select", {
        method: "POST",
        body: JSON.stringify({ networkName: selectedNetworkInDropdown }),
      });
      const data = await response.json();
      await handleHealthCheck();
      toast.success(data.message, { id: toastId });
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Netzwerkauswahl fehlgeschlagen.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading((prev) => ({ ...prev, selectNetwork: false }));
    }
  };

  const handleUserNetworkPathChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserNetworkPath(e.target.value);
  };

  const getDisplayStatus = (): {
    status: SimoneDisplayStatus;
    message: string;
  } => {
    if (isLoading.healthCheck || isLoading.initialize || isLoading.terminate) {
      return { status: "loading", message: "Wird verarbeitet..." };
    }
    if (simoneState.isSimoneInitialized) {
      return { status: "initialized", message: "Initialisiert" };
    }
    if (isInitializedWithDirectory) {
      return { status: "unknown", message: "Initialisierung vorbereitet. Bitte Netzwerk auswählen." };
    }
    return { status: "terminated", message: "Bereit zum Initialisieren" };
  };

  const currentDisplayStatus = getDisplayStatus();

  return (
    <div className="space-y-12">
      {/* Abschnitt: Individuelles Netzwerkverzeichnis */}
      <section aria-labelledby="user-network-path-heading">
        <h3
          id="user-network-path-heading"
          className="text-lg font-semibold leading-6 text-[var(--color-text-primary)] flex items-center"
        >
          <FiFolder className="mr-2 h-5 w-5 text-[var(--color-text-secondary)]" />{" "}
          Individuelles Netzwerkverzeichnis
        </h3>
<p className="mt-1 text-sm text-[var(--color-text-secondary)]">
  Geben Sie den Pfad zu Ihrem persönlichen SIMONE-Netzwerkordner im UNC-Format an (z.&nbsp;B. <code>\\gascadead.gascade.de\DFS\Gruppen\SIMONEUsers\Max_Mustermann\Nets</code>).
</p>

        <div
          className="mt-6 space-y-6 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]"
        >
          <FormInput
            label="Netzwerkordner-Pfad"
            id="userNetworkPath"
            value={userNetworkPath}
            onChange={handleUserNetworkPathChange}
            placeholder="z.B. \\gascadead.gascade.de\DFS\Gruppen\SIMONEUsers\Max_Mustermann\Nets"
          />
        </div>
        {simoneState.activeNetworkDirectory && (
          <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Ausgewähltes Netzwerkverzeichnis:{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">{simoneState.activeNetworkDirectory}</span>
          </div>
        )}
      </section>

      {/* Abschnitt: API-Verbindung */}
      <section aria-labelledby="api-connection-heading">
        <h3
          id="api-connection-heading"
          className="text-lg font-semibold leading-6 text-[var(--color-text-primary)]"
        >
          API-Verbindung
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Verwalten Sie die Verbindung zum zugrunde liegenden SIMONE-API-Dienst.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]">
          <div className="flex-shrink-0">
            <StatusBadge
              status={currentDisplayStatus.status}
              message={currentDisplayStatus.message}
            />
          </div>
          <div className="flex-grow text-sm text-[var(--color-text-secondary)]">
            <strong>SIMONE API-Version:</strong> {apiVersion ?? "..."}
          </div>
          <button
            onClick={() => handleHealthCheck()}
            disabled={isLoading.healthCheck}
            data-tooltip-id="refresh-tooltip"
            data-tooltip-content="Status aktualisieren"
            className="btn-icon"
          >
            {isLoading.healthCheck ? (
              <FiLoader className="h-5 w-5 animate-spin" />
            ) : (
              <FiRefreshCw className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleInitializeAndSetPath}
            disabled={isLoading.initialize || simoneState.isSimoneInitialized || !userNetworkPath || isInitializedWithDirectory}
            className="btn-primary bg-green-600 hover:bg-green-700 w-full sm:w-auto disabled:opacity-50"
          >
            {isLoading.initialize ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiPower className="mr-2" />
            )}{" "}
            SIMONE Initialisierung vorbereiten
          </button>
          <button
            onClick={handleTerminate}
            disabled={isLoading.terminate || !simoneState.isSimoneInitialized}
            className="btn-danger w-full sm:w-auto disabled:opacity-50"
          >
            {isLoading.terminate ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiPower className="mr-2" />
            )}{" "}
            SIMONE beenden
          </button>
        </div>
      </section>

      {/* Abschnitt: Netzwerkverwaltung */}
      <section aria-labelledby="network-management-heading">
        <h3
          id="network-management-heading"
          className="text-lg font-semibold leading-6 text-[var(--color-text-primary)]"
        >
          Netzwerkverwaltung
        </h3>
        <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Hinweis: Die finale Initialisierung erfolgt erst mit Auswahl eines
          Netzwerks. Bitte Verfügbare Netzwerke auflisten und das aktive
          Netzwerk für alle Szenario-Operationen auswählen.
        </p>
        <div className="mt-4 text-sm">
          <span className="font-semibold text-[var(--color-text-primary)]">
            Aktives Netzwerk:{" "}
          </span>
          {simoneState.activeNetwork ? (
            <span className="font-bold text-[var(--color-accent)]">
              {simoneState.activeNetwork}
            </span>
          ) : (
            <span className="italic text-[var(--color-text-secondary)]">
              Keines ausgewählt
            </span>
          )}
        </div>
        <div className="mt-4 p-4 border rounded-lg bg-[var(--color-surface)] border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => handleListNetworks()}
              disabled={
                isLoading.listNetworks || !simoneState.isSimoneInitialized
              }
              className="w-full sm:w-auto flex items-center justify-center disabled:opacity-50"
            >
              {isLoading.listNetworks ? (
                <FiLoader className="animate-spin mr-2" />
              ) : (
                <FiList className="mr-2" />
              )}{" "}
              Netzwerke auflisten
            </button>
            <select
              id="network-select"
              value={selectedNetworkInDropdown}
              onChange={(e) => setSelectedNetworkInDropdown(e.target.value)}
              disabled={
                availableNetworks.length === 0 || isLoading.selectNetwork
              }
              className="input-select w-full sm:w-64"
            >
              <option value="" disabled>
                {availableNetworks.length > 0
                  ? "Netzwerk auswählen..."
                  : "Keine Netzwerke aufgelistet"}
              </option>
              {availableNetworks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
            <button
              onClick={handleSelectNetwork}
              disabled={
                !selectedNetworkInDropdown ||
                isLoading.selectNetwork ||
                simoneState.activeNetwork === selectedNetworkInDropdown
              }
              className="btn-primary w-full sm:w-auto disabled:opacity-50"
            >
              {isLoading.selectNetwork ? (
                <FiLoader className="animate-spin mr-2" />
              ) : (
                <FiCheckSquare className="mr-2" />
              )}{" "}
              Netzwerk auswählen
            </button>
          </div>
        </div>
      </section>
      <Tooltip id="refresh-tooltip" />
    </div>
  );
}
