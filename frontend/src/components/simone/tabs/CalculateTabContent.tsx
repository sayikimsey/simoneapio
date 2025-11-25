// "use client";

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSimoneContext } from "@/contexts/SimoneContext";
// import { useTheme } from "@/contexts/ThemeContext";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import {
//   ScenarioListItemDto,
//   ScenarioCalculationStatusResponseDto,
// } from "@/types";
// import toast from "react-hot-toast";
// import { DataGrid, SelectColumn, type Column } from "react-data-grid";
// import "react-data-grid/lib/styles.css";
// import "@/app/styles/react-data-grid-dark.css";
// import {
//   FiCpu,
//   FiPlayCircle,
//   FiRefreshCw,
//   FiLoader,
//   FiAlertTriangle,
//   FiInfo,
//   FiMessageSquare,
//   FiCheckCircle,
// } from "react-icons/fi";
// import CalculationMessagesModal, {
//   CalculationMessage,
// } from "./CalculationMessagesModal";

// /**
//  * Defines the structure for a row in the scenario status table.
//  */
// interface ScenarioStatusRow {
//   id: string;
//   name: string;
//   status: "Unknown" | "Executing" | "Success" | "Failed" | "Pending";
//   details: string;
//   messagesCount: number;
// }

// interface ScenarioListResponse {
//   scenarios: ScenarioListItemDto[];
//   message: string;
// }

// /**
//  * A component for formatted display of the calculation status.
//  */
// const StatusFormatter = ({
//   status,
// }: {
//   status: ScenarioStatusRow["status"];
// }) => {
//   const getStatusClasses = () => {
//     const baseClasses =
//       "px-2.5 py-1 text-xs font-medium inline-flex items-center rounded-full";
//     switch (status) {
//       case "Executing":
//         return `${baseClasses} alert-info`;
//       case "Success":
//         return `${baseClasses} alert-success`;
//       case "Failed":
//         return `${baseClasses} alert-danger`;
//       case "Pending":
//         return `${baseClasses} alert-warning`;
//       default:
//         return `${baseClasses} bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]`;
//     }
//   };

//   const getIcon = () => {
//     switch (status) {
//       case "Executing":
//         return <FiLoader className="animate-spin mr-1.5" />;
//       case "Success":
//         return <FiCheckCircle className="mr-1.5" />;
//       case "Failed":
//         return <FiAlertTriangle className="mr-1.5" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <span className={getStatusClasses()}>
//       {getIcon()}
//       {status === "Executing"
//         ? "Wird ausgeführt"
//         : status === "Success"
//         ? "Erfolgreich"
//         : status === "Failed"
//         ? "Fehlgeschlagen"
//         : status === "Pending"
//         ? "Ausstehend"
//         : "Unbekannt"}
//     </span>
//   );
// };

// /**
//  * Main component for the "Calculate" tab.
//  * Displays a list of scenarios and allows for their execution and status monitoring.
//  */
// export default function CalculateTabContent() {
//   const { simoneState, setOpenScenario } = useSimoneContext();
//   const { theme } = useTheme();
//   const { activeNetwork } = simoneState;

//   const [scenarioRows, setScenarioRows] = useState<ScenarioStatusRow[]>([]);
//   const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
//     new Set()
//   );
//   const [isLoading, setIsLoading] = useState({
//     execute: false,
//     refresh: false,
//     grid: true,
//     messages: false,
//   });

//   const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
//   const [messages, setMessages] = useState<CalculationMessage[]>([]);
//   const [selectedScenarioForMessages, setSelectedScenarioForMessages] =
//     useState<string | null>(null);
//   const [messageError, setMessageError] = useState<string | null>(null);

//   const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   /**
//    * Maps the status text from the API to a predefined grid status.
//    * @param statusText - The status text returned by the API.
//    * @returns The mapped status for display.
//    */
//   const mapStatusTextToGridStatus = (
//     statusText: string | null
//   ): ScenarioStatusRow["status"] => {
//     if (!statusText) return "Unknown";
//     const upperStatus = statusText.toUpperCase();
//     if (upperStatus === "RUNOK") return "Success";
//     if (upperStatus.includes("CALCULATING") || upperStatus.includes("RUNNING"))
//       return "Executing";
//     if (upperStatus.includes("ERROR") || upperStatus.includes("FAILED"))
//       return "Failed";
//     return "Unknown";
//   };

//   /**
//    * Updates the status of selected or all scenarios.
//    * @param scenariosToCheck - Optional, an array of scenario names whose status should be checked.
//    */
//   const handleRefreshStatus = async (scenariosToCheck?: string[]) => {
//     setIsLoading((prev) => ({ ...prev, refresh: true }));
//     if (!scenariosToCheck) {
//       toast.loading("Aktualisiere alle Szenario-Status...", {
//         id: "refresh-toast",
//       });
//     }

//     const rowsToUpdate = scenariosToCheck
//       ? scenarioRows.filter((r) => scenariosToCheck.includes(r.name))
//       : scenarioRows;

//     const statusPromises = rowsToUpdate.map((row) =>
//       apiClient(`/simone/scenarios/${row.name}/status`) // FIX: Corrected endpoint
//         .then((response) => response.json())
//         .then((data: ScenarioCalculationStatusResponseDto) => ({
//           status: "fulfilled" as const,
//           value: data,
//           scenarioName: row.name,
//         }))
//         .catch((error: ApiError | Error) => ({
//           status: "rejected" as const,
//           reason: error,
//           scenarioName: row.name,
//         }))
//     );

//     const results = await Promise.all(statusPromises);

//     setScenarioRows((currentRows) => {
//       const newRows = [...currentRows];
//       results.forEach((result) => {
//         const rowIndex = newRows.findIndex(
//           (r) => r.name === result.scenarioName
//         );
//         if (rowIndex === -1) return;

//         if (result.status === "fulfilled") {
//           const data = result.value;
//           newRows[rowIndex] = {
//             ...newRows[rowIndex],
//             status: mapStatusTextToGridStatus(data.calculationStatusText),
//             details:
//               data.serviceMessage ||
//               data.calculationStatusText ||
//               "Status aktualisiert.",
//           };
//         } else {
//           newRows[rowIndex] = {
//             ...newRows[rowIndex],
//             status: "Failed",
//             details: result.reason.message,
//           };
//         }
//       });
//       return newRows;
//     });

//     setIsLoading((prev) => ({ ...prev, refresh: false }));
//     if (!scenariosToCheck) {
//       toast.dismiss("refresh-toast");
//       toast.success("Alle Status aktualisiert.");
//     }
//   };

//   // Starts and stops polling for ongoing calculations.
//   useEffect(() => {
//     const pollStatuses = () => {
//       const executingScenarios = scenarioRows
//         .filter((r) => r.status === "Executing")
//         .map((r) => r.name);
//       if (executingScenarios.length > 0) {
//         handleRefreshStatus(executingScenarios);
//       }
//     };

//     if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
//     pollingIntervalRef.current = setInterval(pollStatuses, 7000);

//     return () => {
//       if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
//     };
//   }, [scenarioRows, handleRefreshStatus]);

//   // Fetches the list of scenarios when the active network changes.
//   useEffect(() => {
//     const fetchAndSetScenarios = async () => {
//       if (!activeNetwork) {
//         setScenarioRows([]);
//         setIsLoading((p) => ({ ...p, grid: false }));
//         return;
//       }
//       setIsLoading((p) => ({ ...p, grid: true }));
//       try {
//         const response = await apiClient("/simone/scenarios");
//         const data: ScenarioListResponse = await response.json();
//         const newRows: ScenarioStatusRow[] = (data.scenarios || []).map(
//           (s) => ({
//             id: s.name,
//             name: s.name,
//             status: "Unknown",
//             details: "Wartet auf Aktion.",
//             messagesCount: 0,
//           })
//         );
//         setScenarioRows(newRows);
//       } catch (err) {
//         toast.error(
//           err instanceof ApiError
//             ? err.message
//             : "Szenarien konnten nicht abgerufen werden."
//         );
//       } finally {
//         setIsLoading((p) => ({ ...p, grid: false }));
//       }
//     };
//     fetchAndSetScenarios();
//   }, [activeNetwork]);

//   /**
//    * Executes the selected scenarios.
//    */
//   const handleExecute = async () => {
//     setIsLoading((p) => ({ ...p, execute: true }));
//     const scenariosToExecute = Array.from(selectedRows);

//     setScenarioRows((rows) =>
//       rows.map((r) =>
//         scenariosToExecute.includes(r.id)
//           ? {
//               ...r,
//               status: "Pending",
//               details: "In Warteschlange für Ausführung...",
//             }
//           : r
//       )
//     );

//     for (const scenarioName of scenariosToExecute) {
//       let execError: ApiError | null = null;

//       try {
//         // --- FIX: Added networkName to the request body ---
//         await apiClient("/simone/scenarios/open", {
//           method: "POST",
//           body: JSON.stringify({
//             scenarioName,
//             networkName: activeNetwork,
//             mode: "WRITE",
//           }),
//         });

//         setScenarioRows((rows) =>
//           rows.map((r) =>
//             r.name === scenarioName
//               ? {
//                   ...r,
//                   status: "Executing",
//                   details: "Szenario wird ausgeführt...",
//                 }
//               : r
//           )
//         );

//         // --- FIX: Corrected the endpoint path ---
//         await apiClient("/simone/scenarios/execute", {
//           method: "POST",
//           body: JSON.stringify({ flags: 0 }),
//         });

//         // --- FIX: Removed body from close request ---
//         await apiClient("/simone/scenarios/close", {
//           method: "POST",
//         });
//         setOpenScenario(null);
//       } catch (err) {
//         execError = err instanceof ApiError ? err : new ApiError(String(err));
//         toast.error(
//           `Ausführung für "${scenarioName}" fehlgeschlagen: ${execError.message}`
//         );
//         try {
//           // --- FIX: Removed body from close request ---
//           await apiClient("/simone/scenarios/close", { method: "POST" });
//           setOpenScenario(null);
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         } catch (_) {}
//       } finally {
//         await handleRefreshStatus([scenarioName]);
//       }
//     }

//     setIsLoading((p) => ({ ...p, execute: false }));
//   };
//   /**
//    * Displays the calculation messages for a specific scenario.
//    * @param scenarioName - The name of the scenario.
//    */
//   const handleViewMessages = async (scenarioName: string) => {
//     setSelectedScenarioForMessages(scenarioName);
//     setIsMessagesModalOpen(true);
//     setIsLoading((p) => ({ ...p, messages: true }));
//     setMessageError(null);

//     try {
//       // Step 1: Open the scenario in READ mode.
//       await apiClient("/simone/scenarios/open", {
//         method: "POST",
//         body: JSON.stringify({
//           scenarioName,
//           networkName: activeNetwork,
//           mode: "READ",
//         }),
//       });

//       // Step 2: Fetch all messages from the now-open scenario.
//       const response = await apiClient("/simone/scenarios/messages/all");
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new ApiError(
//           errorData.message || "Failed to fetch messages from API"
//         );
//       }

//       const messagesData: CalculationMessage[] = await response.json();
//       setMessages(messagesData);

//       // Update the row with the count of messages found.
//       setScenarioRows((rows) =>
//         rows.map((r) =>
//           r.name === scenarioName
//             ? { ...r, messagesCount: messagesData.length }
//             : r
//         )
//       );
//     } catch (err) {
//       const errorMessage =
//         err instanceof ApiError
//           ? err.message
//           : "Meldungen konnten nicht geladen werden.";
//       setMessageError(errorMessage);
//       setMessages([]);
//     } finally {
//       // Step 3: This `finally` block ensures the scenario is ALWAYS closed,
//       // but only AFTER the `try` or `catch` block has completely finished.
//       setIsLoading((p) => ({ ...p, messages: false }));
//       try {
//         await apiClient("/simone/scenarios/close", { method: "POST" });
//       } catch (closeError) {
//         console.error(
//           "Failed to close scenario after fetching messages:",
//           closeError
//         );
//         // This error is less critical, so we just log it.
//       }
//     }
//   };

//   const columns = useMemo(
//     (): readonly Column<ScenarioStatusRow>[] => [
//       {
//         ...SelectColumn,
//         resizable: true,
//         headerCellClass: "text-center",
//       },
//       {
//         key: "name",
//         name: "Szenarioname",
//         resizable: true,
//         sortable: true,
//         headerCellClass: "text-center",
//         renderCell: ({ row }) => <div className="pl-2">{row.name}</div>,
//       },
//       {
//         key: "status",
//         name: "Status",
//         width: 240,
//         resizable: true,
//         headerCellClass: "text-center",
//         renderCell: ({ row }) => (
//           <div className="pl-2">
//             <StatusFormatter status={row.status} />
//           </div>
//         ),
//       },
//       {
//         key: "details",
//         name: "Details",
//         resizable: true,
//         headerCellClass: "text-center",
//         renderCell: ({ row }) => <div className="pl-2">{row.details}</div>,
//       },
//       {
//         key: "messages",
//         name: "Meldungen",
//         width: 120,
//         resizable: true,
//         headerCellClass: "text-center",
//         renderCell: ({ row }) => (
//           <div className="flex items-center justify-center h-full">
//             <button
//               onClick={() => handleViewMessages(row.name)}
//               disabled={row.status === "Pending" || row.status === "Executing"}
//               className="btn-icon-ghost flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Berechnungsmeldungen anzeigen"
//             >
//               <FiMessageSquare />({row.messagesCount})
//             </button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   if (!activeNetwork) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-lg text-center h-64">
//         <FiInfo className="h-12 w-12 text-[var(--color-text-secondary)] mb-4" />
//         <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
//           Kein Netzwerk ausgewählt
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Bitte wählen Sie ein Netzwerk im Reiter Einstellungen.
//         </p>
//       </div>
//     );
//   }

//   const headerRowHeight = 45;
//   const rowHeight = 40;
//   // Calculates the total height required for the grid.
//   // We add 2px for the top and bottom borders.
//   const gridHeight = headerRowHeight + scenarioRows.length * rowHeight + 2;

//   return (
//     <>
//       {/* --- THIS IS THE CORRECTED STYLE BLOCK --- */}
//       <style>{`
//         :root {
//           --rdg-grid-border-color: color-mix(in srgb, var(--border-color) 70%, transparent);
//         }

//         /* Disable the default row background color to prevent it from covering cell borders */
//         .rdg {
//           --rdg-selected-row-background-color: transparent;
//         }

//         .rdg {
//           border: 1px solid var(--rdg-grid-border-color);
//         }

//         .rdg-cell {
//           border-right: 1px solid var(--rdg-grid-border-color);
//           border-bottom: 1px solid var(--rdg-grid-border-color);
//         }

//           .rdg-row[aria-selected='true'] > .rdg-cell {
//             background-color: rgba(130, 180, 255, 0.15);
//         }
//         .rdg-row[aria-selected='true']:hover > .rdg-cell {
//             background-color: rgba(130, 180, 255, 0.25);
//         }

//         .rdg-header-row .rdg-cell {
//           text-align: center;
//         }

//         .rdg-checkbox-label {
//           border-right: 1px solid var(--rdg-grid-border-color);
//         }
//       `}</style>

//       <CalculationMessagesModal
//         isOpen={isMessagesModalOpen}
//         onClose={() => setIsMessagesModalOpen(false)}
//         scenarioName={selectedScenarioForMessages || ""}
//         messages={messages}
//         isLoading={isLoading.messages}
//         error={messageError}
//       />

//       <div className="space-y-6">
//         <header>
//           <h3 className="text-xl font-semibold flex items-center gap-2 text-[var(--color-text-primary)]">
//             <FiCpu className="text-[var(--color-accent)]" /> Szenarioberechnung
//             & Status
//           </h3>
//           <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//             Wählen Sie Szenarien zur Ausführung aus und überwachen Sie deren
//             Live-Status. Sehen Sie sich Berechnungsmeldungen für abgeschlossene
//             Läufe an.
//           </p>
//         </header>

//         <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--border-color)]">
//           <button
//             onClick={handleExecute}
//             disabled={selectedRows.size === 0 || isLoading.execute}
//             className="btn-primary flex items-center gap-2 disabled:opacity-50"
//           >
//             {isLoading.execute ? (
//               <FiLoader className="animate-spin" />
//             ) : (
//               <FiPlayCircle />
//             )}
//             <span>Ausführen ({selectedRows.size})</span>
//           </button>
//           <button
//             onClick={() => handleRefreshStatus()}
//             disabled={isLoading.refresh}
//             className="flex items-center gap-2 disabled:opacity-50"
//           >
//             {isLoading.refresh ? (
//               <FiLoader className="animate-spin" />
//             ) : (
//               <FiRefreshCw />
//             )}
//             <span>Alle Status aktualisieren</span>
//           </button>
//         </div>

//         <div
//           style={{ height: `${gridHeight}px` }}
//           className="w-full transition-height duration-300 ease-in-out"
//         >
//           {isLoading.grid ? (
//             <div className="flex items-center justify-center h-full">
//               <FiLoader className="h-10 w-10 animate-spin text-[var(--color-accent)]" />
//             </div>
//           ) : scenarioRows.length > 0 ? (
//             <DataGrid
//               className={theme === "dark" ? "rdg-dark" : "rdg-light"}
//               columns={columns}
//               rows={scenarioRows}
//               rowKeyGetter={(row) => row.id}
//               selectedRows={selectedRows}
//               onSelectedRowsChange={setSelectedRows}
//               rowHeight={rowHeight}
//               headerRowHeight={headerRowHeight}
//               style={{ height: "100%" }}
//             />
//           ) : (
//             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] h-full">
//               <FiAlertTriangle className="h-12 w-12 text-[var(--color-warning)] mb-4" />
//               <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
//                 Keine Szenarien gefunden
//               </h3>
//               <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//                 Das Netzwerk {activeNetwork} enthält keine Szenarien.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, useEffect, useMemo, useRef } from "react"; // React Hooks für Zustand, Lebenszyklus, Memo und Referenzen.
import { useSimoneContext } from "@/contexts/SimoneContext"; // Importiert den Kontext für SIMONE-spezifischen Zustand.
import { useTheme } from "@/contexts/ThemeContext"; // Importiert den Theme-Kontext für Theme-Anpassungen der UI.
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import {
  ScenarioListItemDto, // Typ für Szenario-Listen-Einträge.
  ScenarioCalculationStatusResponseDto, // Typ für die Antwort des Szenario-Berechnungsstatus.
} from "@/types"; // Allgemeine Typdefinitionen.
import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.
import { DataGrid, SelectColumn, type Column } from "react-data-grid"; // Komponenten für ein leistungsstarkes Datengitter.
import "react-data-grid/lib/styles.css"; // Standard-CSS für react-data-grid.
import "@/app/styles/react-data-grid-dark.css"; // Angepasstes CSS für das dunkle Theme des Datengitters.
import {
  FiCpu, // Icon für CPU/Berechnung.
  FiPlayCircle, // Icon für "Abspielen/Ausführen".
  FiRefreshCw, // Icon für "Aktualisieren".
  FiLoader, // Icon für "Laden/Spinner".
  FiAlertTriangle, // Icon für "Warnung/Fehler".
  FiInfo, // Icon für "Information".
  FiMessageSquare, // Icon für "Nachrichten".
  FiCheckCircle, // Icon für "Erfolg".
} from "react-icons/fi"; // Importiert Icons von Feather Icons.
import CalculationMessagesModal, {
  CalculationMessage, // Typ für einzelne Berechnungsmeldungen.
} from "./CalculationMessagesModal"; // Modal zur Anzeige von Berechnungsmeldungen.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ScenarioStatusRow
 * Definiert die Struktur für eine Zeile in der Szenario-Status-Tabelle
 * von `react-data-grid`.
 * -------------------------------------------------------------------
 */
interface ScenarioStatusRow {
  id: string; // Eindeutige ID für die Zeile (hier der Szenarioname).
  name: string; // Der Name des Szenarios.
  status: "Unknown" | "Executing" | "Success" | "Failed" | "Pending"; // Der aktuelle Berechnungsstatus.
  details: string; // Zusätzliche Details zum Status oder zur letzten Aktion.
  messagesCount: number; // Anzahl der verfügbaren Berechnungsmeldungen.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ScenarioListResponse
 * Definiert die erwartete Struktur der API-Antwort beim Abrufen
 * einer Liste von Szenarien.
 * -------------------------------------------------------------------
 */
interface ScenarioListResponse {
  scenarios: ScenarioListItemDto[]; // Array von Szenarien.
  message: string; // Eine Nachricht vom Server.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: StatusFormatter
 * Eine kleine Komponente zur formatierten Anzeige des Berechnungsstatus
 * in der Datentabelle. Zeigt farbige Badges und entsprechende Icons an.
 * -------------------------------------------------------------------
 */
const StatusFormatter = ({
  status, // Der anzuzeigende Status.
}: {
  status: ScenarioStatusRow["status"];
}) => {
  /**
   * Bestimmt die CSS-Klassen für den Status-Badge basierend auf dem Status.
   */
  const getStatusClasses = () => {
    const baseClasses =
      "px-2.5 py-1 text-xs font-medium inline-flex items-center rounded-full"; // Grundlegende Styling-Klassen.
    switch (status) {
      case "Executing":
        return `${baseClasses} alert-info`; // Blau für "Wird ausgeführt".
      case "Success":
        return `${baseClasses} alert-success`; // Grün für "Erfolgreich".
      case "Failed":
        return `${baseClasses} alert-danger`; // Rot für "Fehlgeschlagen".
      case "Pending":
        return `${baseClasses} alert-warning`; // Gelb für "Ausstehend".
      default:
        return `${baseClasses} bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]`; // Standardfarbe für "Unbekannt".
    }
  };

  /**
   * Bestimmt das anzuzeigende Icon basierend auf dem Status.
   */
  const getIcon = () => {
    switch (status) {
      case "Executing":
        return <FiLoader className="animate-spin mr-1.5" />; // Spinner für "Wird ausgeführt".
      case "Success":
        return <FiCheckCircle className="mr-1.5" />; // Haken für "Erfolgreich".
      case "Failed":
        return <FiAlertTriangle className="mr-1.5" />; // Warndreieck für "Fehlgeschlagen".
      default:
        return null; // Kein Icon für andere Status.
    }
  };

  return (
    <span className={getStatusClasses()}>
      {getIcon()} {/* Rendert das Icon. */}
      {/* Angepasster Text für jeden Status. */}
      {status === "Executing"
        ? "Wird ausgeführt"
        : status === "Success"
        ? "Erfolgreich"
        : status === "Failed"
        ? "Fehlgeschlagen"
        : status === "Pending"
        ? "Ausstehend"
        : "Unbekannt"}
    </span>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: CalculateTabContent
 * Die Hauptkomponente für den "Berechnen"-Tab der SIMONE-Station.
 * Zeigt eine Liste von Szenarien an, ermöglicht deren Ausführung
 * und überwacht ihren Status. Bietet auch Funktionen zum Anzeigen
 * von Berechnungsmeldungen.
 * -------------------------------------------------------------------
 */
export default function CalculateTabContent() {
  const { simoneState, setOpenScenario } = useSimoneContext(); // Holt den SIMONE-Zustand und Setter-Funktionen aus dem Kontext.
  const { theme } = useTheme(); // Holt das aktuelle Theme für Styling-Anpassungen.
  const { activeNetwork } = simoneState; // Holt das aktuell aktive Netzwerk aus dem SIMONE-Zustand.

  // Zustandsvariablen für die Szenario-Tabelle und Auswahl.
  const [scenarioRows, setScenarioRows] = useState<ScenarioStatusRow[]>([]); // Die Daten für die Datentabelle.
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    new Set()
  ); // Die aktuell ausgewählten Zeilen-IDs.

  // Zustandsvariablen für Ladeindikatoren spezifischer Aktionen.
  const [isLoading, setIsLoading] = useState({
    execute: false, // Zeigt an, ob die Szenario-Ausführung läuft.
    refresh: false, // Zeigt an, ob die Statusaktualisierung läuft.
    grid: true, // Zeigt an, ob die Szenarien-Liste geladen wird.
    messages: false, // Zeigt an, ob Berechnungsmeldungen geladen werden.
  });

  // Zustandsvariablen für das Nachrichten-Modal.
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false); // Steuert die Sichtbarkeit des Nachrichten-Modals.
  const [messages, setMessages] = useState<CalculationMessage[]>([]); // Die abgerufenen Berechnungsmeldungen.
  const [selectedScenarioForMessages, setSelectedScenarioForMessages] =
    useState<string | null>(null); // Das Szenario, dessen Meldungen angezeigt werden sollen.
  const [messageError, setMessageError] = useState<string | null>(null); // Fehler beim Laden von Meldungen.

  // Ref für das Polling-Interval, um es bei Bedarf zu löschen.
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: mapStatusTextToGridStatus
   * Übersetzt den Status-Text, der von der SIMONE API kommt,
   * in einen standardisierten Status für die Anzeige im Datengitter.
   * -------------------------------------------------------------------
   */
  const mapStatusTextToGridStatus = (
    statusText: string | null
  ): ScenarioStatusRow["status"] => {
    if (!statusText) return "Unknown"; // Unbekannt, wenn kein Text vorhanden.
    const upperStatus = statusText.toUpperCase(); // Text in Großbuchstaben konvertieren.
    if (upperStatus === "RUNOK") return "Success"; // API "RUNOK" -> "Success".
    if (upperStatus.includes("CALCULATING") || upperStatus.includes("RUNNING"))
      return "Executing"; // Wenn Text "CALCULATING" oder "RUNNING" enthält -> "Executing".
    if (upperStatus.includes("ERROR") || upperStatus.includes("FAILED"))
      return "Failed"; // Wenn Text "ERROR" oder "FAILED" enthält -> "Failed".
    return "Unknown"; // Standardmäßig "Unknown".
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleRefreshStatus
   * Aktualisiert den Status ausgewählter oder aller Szenarien
   * durch Abfrage des SIMONE Java-Dienstes.
   * Startet oder stoppt das Polling für laufende Berechnungen.
   * -------------------------------------------------------------------
   */
  const handleRefreshStatus = async (scenariosToCheck?: string[]) => {
    setIsLoading((prev) => ({ ...prev, refresh: true })); // Setzt den Refresh-Ladezustand.
    if (!scenariosToCheck) {
      // Wenn alle Szenarien aktualisiert werden, zeige einen Toast.
      toast.loading("Aktualisiere alle Szenario-Status...", {
        id: "refresh-toast",
      });
    }

    // Filtert die Zeilen, die aktualisiert werden sollen.
    const rowsToUpdate = scenariosToCheck
      ? scenarioRows.filter((r) => scenariosToCheck.includes(r.name))
      : scenarioRows;

    // Erstellt ein Array von Promises, um den Status für jede Zeile abzurufen.
    const statusPromises = rowsToUpdate.map((row) =>
      apiClient(`/simone/scenarios/${row.name}/status`) // API-Aufruf zum Abrufen des Szenario-Status.
        .then((response) => response.json())
        .then((data: ScenarioCalculationStatusResponseDto) => ({
          status: "fulfilled" as const, // Promise wurde erfüllt.
          value: data, // Die empfangenen Daten.
          scenarioName: row.name, // Der Szenarioname zur Zuordnung.
        }))
        .catch((error: ApiError | Error) => ({
          status: "rejected" as const, // Promise wurde abgelehnt.
          reason: error, // Der Fehlergrund.
          scenarioName: row.name,
        }))
    );

    const results = await Promise.all(statusPromises); // Wartet auf alle Promise-Ergebnisse.

    // Aktualisiert die 'scenarioRows' basierend auf den erhaltenen Status.
    setScenarioRows((currentRows) => {
      const newRows = [...currentRows]; // Kopiert die aktuellen Zeilen.
      results.forEach((result) => {
        const rowIndex = newRows.findIndex(
          (r) => r.name === result.scenarioName
        );
        if (rowIndex === -1) return; // Wenn die Zeile nicht gefunden wird, überspringen.

        if (result.status === "fulfilled") {
          // Wenn der Status erfolgreich abgerufen wurde.
          const data = result.value;
          newRows[rowIndex] = {
            ...newRows[rowIndex],
            status: mapStatusTextToGridStatus(data.calculationStatusText), // Mappt den API-Status.
            details:
              data.serviceMessage ||
              data.calculationStatusText ||
              "Status aktualisiert.", // Zeigt die Servicemeldung oder den Status-Text an.
          };
        } else {
          // Wenn der Status nicht abgerufen werden konnte (Fehler).
          newRows[rowIndex] = {
            ...newRows[rowIndex],
            status: "Failed", // Setzt den Status auf "Failed".
            details: result.reason.message, // Zeigt die Fehlermeldung an.
          };
        }
      });
      return newRows; // Gibt die aktualisierten Zeilen zurück.
    });

    setIsLoading((prev) => ({ ...prev, refresh: false })); // Setzt den Refresh-Ladezustand zurück.
    if (!scenariosToCheck) {
      // Wenn alle Szenarien aktualisiert wurden, schließe den Toast und zeige Erfolg an.
      toast.dismiss("refresh-toast");
      toast.success("Alle Status aktualisiert.");
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Polling für laufende Berechnungen
   * Dieser Hook startet ein Polling-Interval, um den Status von
   * Szenarien, die sich im Zustand "Executing" befinden, regelmäßig
   * zu aktualisieren.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const pollStatuses = () => {
      // Filtert Szenarien, die sich im Zustand "Executing" befinden.
      const executingScenarios = scenarioRows
        .filter((r) => r.status === "Executing")
        .map((r) => r.name);
      if (executingScenarios.length > 0) {
        // Wenn es laufende Szenarien gibt, aktualisiere deren Status.
        handleRefreshStatus(executingScenarios);
      }
    };

    // Löscht ein existierendes Polling-Interval, bevor ein neues gestartet wird.
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    // Startet ein neues Polling-Interval, das alle 7 Sekunden ausgeführt wird.
    pollingIntervalRef.current = setInterval(pollStatuses, 7000);

    // Cleanup-Funktion: Löscht das Interval, wenn die Komponente unmounted wird.
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [scenarioRows, handleRefreshStatus]); // Abhängigkeiten: wird bei Änderungen der Szenario-Zeilen oder des Refresh-Handlers ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Szenarien laden, wenn sich das aktive Netzwerk ändert
   * Dieser Hook ruft die Liste der Szenarien vom Server ab,
   * wenn das aktuell aktive Netzwerk im SimoneContext wechselt.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const fetchAndSetScenarios = async () => {
      if (!activeNetwork) {
        // Wenn kein aktives Netzwerk ausgewählt ist, leere die Szenarien und beende den Ladezustand.
        setScenarioRows([]);
        setIsLoading((p) => ({ ...p, grid: false }));
        return;
      }
      setIsLoading((p) => ({ ...p, grid: true })); // Setzt den Ladezustand für das Gitter auf true.
      try {
        const response = await apiClient("/simone/scenarios"); // API-Aufruf zum Abrufen der Szenarien-Liste.
        const data: ScenarioListResponse = await response.json();
        // Konvertiert die empfangenen Szenarien in das 'ScenarioStatusRow'-Format.
        const newRows: ScenarioStatusRow[] = (data.scenarios || []).map(
          (s) => ({
            id: s.name,
            name: s.name,
            status: "Unknown", // Initialer Status.
            details: "Wartet auf Aktion.", // Initialer Detailtext.
            messagesCount: 0, // Initial keine Meldungen.
          })
        );
        setScenarioRows(newRows); // Aktualisiert die Szenario-Zeilen.
      } catch (err) {
        // Fehlerbehandlung beim Abrufen der Szenarien.
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Szenarien konnten nicht abgerufen werden."
        );
      } finally {
        setIsLoading((p) => ({ ...p, grid: false })); // Beendet den Ladezustand für das Gitter.
      }
    };
    fetchAndSetScenarios(); // Führt die Funktion aus.
  }, [activeNetwork]); // Abhängigkeit: Effekt wird bei Änderungen des 'activeNetwork' ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleExecute
   * Führt die aktuell ausgewählten Szenarien aus.
   * Öffnet jedes Szenario im Schreibmodus, führt es aus und schließt es dann.
   * Aktualisiert den Status in der Tabelle während des Prozesses.
   * -------------------------------------------------------------------
   */
  const handleExecute = async () => {
    setIsLoading((p) => ({ ...p, execute: true })); // Setzt den Ausführungs-Ladezustand.
    const scenariosToExecute = Array.from(selectedRows); // Holt die Namen der ausgewählten Szenarien.

    // Aktualisiert den Status der ausgewählten Szenarien auf "Pending".
    setScenarioRows((rows) =>
      rows.map((r) =>
        scenariosToExecute.includes(r.id)
          ? {
              ...r,
              status: "Pending",
              details: "In Warteschlange für Ausführung...",
            }
          : r
      )
    );

    // Schleife durch jedes Szenario zur Ausführung.
    for (const scenarioName of scenariosToExecute) {
      let execError: ApiError | null = null; // Speichert Fehler für die aktuelle Ausführung.

      try {
        // Schritt 1: Szenario im Schreibmodus öffnen.
        await apiClient("/simone/scenarios/open", {
          method: "POST",
          body: JSON.stringify({
            scenarioName,
            networkName: activeNetwork, // WICHTIG: Netzwerkname muss hier übergeben werden.
            mode: "WRITE", // Szenario im Schreibmodus öffnen.
          }),
        });

        // Aktualisiert den Status in der Tabelle auf "Executing".
        setScenarioRows((rows) =>
          rows.map((r) =>
            r.name === scenarioName
              ? {
                  ...r,
                  status: "Executing",
                  details: "Szenario wird ausgeführt...",
                }
              : r
          )
        );

        // Schritt 2: Szenario ausführen.
        await apiClient("/simone/scenarios/execute", {
          method: "POST",
          body: JSON.stringify({ flags: 0 }), // Flags für die Ausführung (hier 0 für Standard).
        });

        // Schritt 3: Szenario schließen.
        await apiClient("/simone/scenarios/close", {
          method: "POST",
          // Körper für Close-Anfrage entfernt, falls nicht benötigt.
        });
        setOpenScenario(null); // Setzt das geöffnete Szenario im Kontext zurück.
      } catch (err) {
        // Fehlerbehandlung für die Ausführung.
        execError = err instanceof ApiError ? err : new ApiError(String(err));
        toast.error(
          `Ausführung für "${scenarioName}" fehlgeschlagen: ${execError.message}`
        );
        try {
          // Versucht das Szenario auch im Fehlerfall zu schließen.
          await apiClient("/simone/scenarios/close", { method: "POST" });
          setOpenScenario(null);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          // Fehler beim Schließen im Fehlerfall ignorieren.
        }
      } finally {
        // Aktualisiert den Status des einzelnen Szenarios nach Abschluss (Erfolg oder Fehler).
        await handleRefreshStatus([scenarioName]);
      }
    }

    setIsLoading((p) => ({ ...p, execute: false })); // Beendet den Ausführungs-Ladezustand.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleViewMessages
   * Zeigt die Berechnungsmeldungen für ein bestimmtes Szenario an.
   * Öffnet das Szenario im Lesemodus, ruft die Meldungen ab und schließt es wieder.
   * -------------------------------------------------------------------
   */
  const handleViewMessages = async (scenarioName: string) => {
    setSelectedScenarioForMessages(scenarioName); // Setzt das Szenario für die Meldungsanzeige.
    setIsMessagesModalOpen(true); // Öffnet das Nachrichten-Modal.
    setIsLoading((p) => ({ ...p, messages: true })); // Setzt Ladezustand für Nachrichten.
    setMessageError(null); // Löscht vorherige Fehler.

    try {
      // Schritt 1: Szenario im LESEN-Modus öffnen.
      await apiClient("/simone/scenarios/open", {
        method: "POST",
        body: JSON.stringify({
          scenarioName,
          networkName: activeNetwork,
          mode: "READ", // Szenario im Lesemodus öffnen.
        }),
      });

      // Schritt 2: Alle Meldungen vom jetzt geöffneten Szenario abrufen.
      const response = await apiClient("/simone/scenarios/messages/all");
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.message ||
            "Meldungen konnten nicht von der API abgerufen werden."
        );
      }

      const messagesData: CalculationMessage[] = await response.json();
      setMessages(messagesData); // Speichert die abgerufenen Meldungen.

      // Aktualisiert die Zeile mit der Anzahl der gefundenen Meldungen.
      setScenarioRows((rows) =>
        rows.map((r) =>
          r.name === scenarioName
            ? { ...r, messagesCount: messagesData.length }
            : r
        )
      );
    } catch (err) {
      // Fehlerbehandlung beim Abrufen von Meldungen.
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Meldungen konnten nicht geladen werden.";
      setMessageError(errorMessage);
      setMessages([]); // Leert die Meldungen bei Fehler.
    } finally {
      // Schritt 3: Dieser `finally`-Block stellt sicher, dass das Szenario IMMER geschlossen wird,
      // und zwar NACHDEM der `try`- oder `catch`-Block vollständig abgeschlossen wurde.
      setIsLoading((p) => ({ ...p, messages: false })); // Beendet den Ladezustand für Nachrichten.
      try {
        await apiClient("/simone/scenarios/close", { method: "POST" }); // Schließt das Szenario.
      } catch (closeError) {
        console.error(
          "Fehler beim Schließen des Szenarios nach dem Abrufen von Meldungen:",
          closeError
        );
        // Dieser Fehler ist weniger kritisch, wird daher nur protokolliert.
      }
    }
  };

  // -------------------------------------------------------------------
  // ✅ Definition der Spalten für das `react-data-grid`.
  // `useMemo` wird verwendet, um die Spaltendefinition nur einmal zu erstellen
  // oder nur neu zu erstellen, wenn sich Abhängigkeiten ändern (hier keine).
  // -------------------------------------------------------------------
  const columns = useMemo(
    (): readonly Column<ScenarioStatusRow>[] => [
      {
        ...SelectColumn, // Fügt die Standardauswahl-Checkbox-Spalte hinzu.
        resizable: true, // Ermöglicht Größenänderung der Spalte.
        headerCellClass: "text-center", // Zentriert den Header-Text.
      },
      {
        key: "name",
        name: "Szenarioname",
        resizable: true,
        sortable: true, // Ermöglicht das Sortieren nach dieser Spalte.
        headerCellClass: "text-center",
        renderCell: ({ row }) => <div className="pl-2">{row.name}</div>, // Rendert den Szenarionamen mit etwas Padding.
      },
      {
        key: "status",
        name: "Status",
        width: 240, // Feste Breite für die Statusspalte.
        resizable: true,
        headerCellClass: "text-center",
        renderCell: ({ row }) => (
          <div className="pl-2">
            <StatusFormatter status={row.status} />{" "}
            {/* Verwendet den StatusFormatter. */}
          </div>
        ),
      },
      {
        key: "details",
        name: "Details",
        resizable: true,
        headerCellClass: "text-center",
        renderCell: ({ row }) => <div className="pl-2">{row.details}</div>,
      },
      {
        key: "messages",
        name: "Meldungen",
        width: 120, // Feste Breite für die Meldungsspalte.
        resizable: true,
        headerCellClass: "text-center",
        renderCell: ({ row }) => (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleViewMessages(row.name)} // Button zum Anzeigen der Meldungen.
              // Deaktiviert, wenn Szenario "Pending" oder "Executing" ist.
              disabled={row.status === "Pending" || row.status === "Executing"}
              className="btn-icon-ghost flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Berechnungsmeldungen anzeigen"
            >
              <FiMessageSquare /> {/* Icon für Nachrichten. */}(
              {row.messagesCount}) {/* Anzahl der Meldungen. */}
            </button>
          </div>
        ),
      },
    ],
    [] // Leeres Abhängigkeitsarray: Spalten werden nur einmal initialisiert.
  );

  // -------------------------------------------------------------------
  // ✅ Bedingtes Rendering basierend auf aktivem Netzwerk
  // Wenn kein Netzwerk ausgewählt ist, wird eine Informationsmeldung angezeigt.
  // -------------------------------------------------------------------
  if (!activeNetwork) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-lg text-center h-64">
        <FiInfo className="h-12 w-12 text-[var(--color-text-secondary)] mb-4" />{" "}
        {/* Info-Icon. */}
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Kein Netzwerk ausgewählt
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Bitte wählen Sie ein Netzwerk im Reiter Einstellungen.
        </p>
      </div>
    );
  }

  // Berechnung der Tabellenhöhe basierend auf der Anzahl der Zeilen.
  const headerRowHeight = 45; // Höhe der Kopfzeile.
  const rowHeight = 40; // Höhe jeder Datenzeile.
  // Berechnet die Gesamthöhe des Gitters (Header + Zeilen + Ränder).
  const gridHeight = headerRowHeight + scenarioRows.length * rowHeight + 2;

  return (
    <>
      {/* --- DIES IST DER KORRIGIERTE STYLE BLOCK ---
        Dieser Style-Block enthält CSS-Regeln zur Anpassung des react-data-grid.
        Es werden CSS-Variablen aus dem Haupt-Theme verwendet, um das Styling
        konsistent zu halten und auf Theme-Wechsel zu reagieren.
      */}
      <style>{`
        /* Definiert eine spezifische Randfarbe für das Gitter, die auf der allgemeinen Randfarbe basiert. */
        :root {
          --rdg-grid-border-color: color-mix(in srgb, var(--border-color) 70%, transparent);
        }

        /* Deaktiviert die Standard-Hintergrundfarbe der Zeilen, um zu verhindern,
           dass sie die Zellränder überdeckt, wenn Zellen eigene Ränder haben. */
        .rdg {
          --rdg-selected-row-background-color: transparent; /* Macht den Hintergrund ausgewählter Zeilen transparent, um die individuelle Zellfärbung durchscheinen zu lassen. */
          border: 1px solid var(--rdg-grid-border-color); /* Setzt einen Rahmen für das gesamte Gitter. */
        }

        .rdg-cell {
          border-right: 1px solid var(--rdg-grid-border-color); /* Vertikale Ränder zwischen den Zellen. */
          border-bottom: 1px solid var(--rdg-grid-border-color); /* Horizontale Ränder zwischen den Zellen. */
        }

        /* Spezielles Styling für ausgewählte Zeilen, um eine visuelle Hervorhebung zu ermöglichen. */
        .rdg-row[aria-selected='true'] > .rdg-cell {
            background-color: rgba(130, 180, 255, 0.15); /* Leichter blauer Hintergrund für ausgewählte Zellen. */
        }
        .rdg-row[aria-selected='true']:hover > .rdg-cell {
            background-color: rgba(130, 180, 255, 0.25); /* Dunklerer blauer Hintergrund beim Hover über ausgewählten Zellen. */
        }

        /* Zentriert den Text in den Kopfzeilen-Zellen. */
        .rdg-header-row .rdg-cell {
          text-align: center;
        }

        /* Fügt einen rechten Rahmen zur Checkbox-Spalte hinzu, um die Trennlinie zu vervollständigen. */
        .rdg-checkbox-label {
          border-right: 1px solid var(--rdg-grid-border-color);
        }
      `}</style>

      {/* Modal zur Anzeige von Berechnungsmeldungen */}
      <CalculationMessagesModal
        isOpen={isMessagesModalOpen} // Steuert die Sichtbarkeit des Modals.
        onClose={() => setIsMessagesModalOpen(false)} // Schließt das Modal.
        scenarioName={selectedScenarioForMessages || ""} // Name des Szenarios, dessen Meldungen angezeigt werden.
        messages={messages} // Die anzuzeigenden Meldungen.
        isLoading={isLoading.messages} // Ladezustand der Meldungen.
        error={messageError} // Fehlermeldung beim Laden der Meldungen.
      />

      {/* Hauptinhaltsbereich des Tabs */}
      <div className="space-y-6">
        <header>
          <h3 className="text-xl font-semibold flex items-center gap-2 text-[var(--color-text-primary)]">
            <FiCpu className="text-[var(--color-accent)]" /> Szenarioberechnung
            & Status
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Wählen Sie Szenarien zur Ausführung aus und überwachen Sie deren
            Live-Status. Sehen Sie sich Berechnungsmeldungen für abgeschlossene
            Läufe an.
          </p>
        </header>

        {/* Aktionsleiste: Buttons zum Ausführen und Aktualisieren */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--border-color)]">
          <button
            onClick={handleExecute} // Klick-Handler zum Ausführen.
            disabled={selectedRows.size === 0 || isLoading.execute} // Deaktiviert, wenn keine Zeilen ausgewählt sind oder Ausführung läuft.
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading.execute ? (
              <FiLoader className="animate-spin" /> // Spinner während der Ausführung.
            ) : (
              <FiPlayCircle /> // Play-Icon.
            )}
            <span>Ausführen ({selectedRows.size})</span>{" "}
            {/* Zeigt Anzahl der ausgewählten Szenarien an. */}
          </button>
          <button
            onClick={() => handleRefreshStatus()} // Klick-Handler zum Aktualisieren.
            disabled={isLoading.refresh} // Deaktiviert, wenn Aktualisierung läuft.
            className="flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading.refresh ? (
              <FiLoader className="animate-spin" /> // Spinner während der Aktualisierung.
            ) : (
              <FiRefreshCw /> // Refresh-Icon.
            )}
            <span>Alle Status aktualisieren</span>
          </button>
        </div>

        {/* Datengitter-Container */}
        <div
          style={{ height: `${gridHeight}px` }} // Dynamische Höhe des Gitters.
          className="w-full transition-height duration-300 ease-in-out"
        >
          {isLoading.grid ? (
            // Lade-Spinner für das Gitter.
            <div className="flex items-center justify-center h-full">
              <FiLoader className="h-10 w-10 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : scenarioRows.length > 0 ? (
            // Rendert das Datengitter, wenn Szenarien vorhanden sind.
            <DataGrid
              className={theme === "dark" ? "rdg-dark" : "rdg-light"} // Theme-Klasse für das Gitter.
              columns={columns} // Spaltendefinitionen.
              rows={scenarioRows} // Datenzeilen.
              rowKeyGetter={(row) => row.id} // Funktion zum Abrufen des eindeutigen Zeilenschlüssels.
              selectedRows={selectedRows} // Aktuell ausgewählte Zeilen.
              onSelectedRowsChange={setSelectedRows} // Callback bei Auswahländerung.
              rowHeight={rowHeight} // Höhe der Datenzeilen.
              headerRowHeight={headerRowHeight} // Höhe der Kopfzeile.
              style={{ height: "100%" }} // Gitter füllt den Container aus.
            />
          ) : (
            // Nachricht, wenn keine Szenarien gefunden wurden.
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] h-full">
              <FiAlertTriangle className="h-12 w-12 text-[var(--color-warning)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Keine Szenarien gefunden
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Das Netzwerk {activeNetwork} enthält keine Szenarien.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
