// "use client";

// import {
//   ScenarioListItemDto,
//   CreateScenarioPayload,
//   DeleteScenarioPayload,
//   RunType,
// } from "@/types";
// import {
//   createScenario as apiCreateScenario,
//   deleteScenario as apiDeleteScenario,
//   getRunTypes as apiGetRunTypes,
//   apiClient, // apiClient wird für fetchScenarios benötigt
// } from "@/lib/apiClient";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useCallback,
// } from "react";
// import toast from "react-hot-toast";

// export interface VariableToRead {
//   variableName: string;
//   objId: number;
//   extId: number;
// }

// /**
//  * Defines the shape of the shared state for the SIMONE context.
//  */
// interface SimoneState {
//   isSimoneInitialized: boolean;
//   activeNetwork: string | null;
//   openScenario: string | null;
//   variablesToRead: VariableToRead[];
//   scenarios: ScenarioListItemDto[];
//   runTypes: RunType[];
//   isCreatingScenario: boolean;
//   isDeletingScenario: boolean;
// }

// /**
//  * Defines the shape of the context value provided by the Provider.
//  */
// interface SimoneContextValue {
//   simoneState: SimoneState;
//   setSimoneInitialized: (isInitialized: boolean) => void;
//   setActiveNetwork: (networkName: string | null) => void;
//   setOpenScenario: (scenarioName: string | null) => void;
//   setVariablesToRead: React.Dispatch<React.SetStateAction<VariableToRead[]>>;
//   fetchScenarios: () => Promise<void>;
//   fetchRunTypes: () => Promise<void>;
//   handleCreateScenario: (payload: CreateScenarioPayload) => Promise<void>;
//   handleDeleteScenario: (payload: DeleteScenarioPayload) => Promise<void>;
// }

// const SimoneContext = createContext<SimoneContextValue | undefined>(undefined);

// export const SimoneProvider = ({ children }: { children: ReactNode }) => {
//   const [simoneState, setSimoneState] = useState<SimoneState>({
//     isSimoneInitialized: false,
//     activeNetwork: null,
//     openScenario: null,
//     variablesToRead: [],
//     scenarios: [],
//     runTypes: [],
//     isCreatingScenario: false,
//     isDeletingScenario: false,
//   });

//   const setSimoneInitialized = useCallback((isInitialized: boolean) => {
//     setSimoneState((prevState) => ({
//         ...prevState,
//         isSimoneInitialized: isInitialized,
//     }));
//   }, []);

//   const setActiveNetwork = useCallback((networkName: string | null) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       activeNetwork: networkName,
//       openScenario: null, // Szenario zurücksetzen, wenn das Netzwerk wechselt
//       scenarios: [], // Szenarienliste leeren
//     }));
//   }, []);

//   const setOpenScenario = useCallback((scenarioName: string | null) => {
//     setSimoneState((prevState) => ({
//         ...prevState,
//         openScenario: scenarioName,
//     }));
//   }, []);

//   const setVariablesToRead = (
//     variables: React.SetStateAction<VariableToRead[]>
//   ) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       variablesToRead:
//         typeof variables === "function"
//           ? variables(prevState.variablesToRead)
//           : variables,
//     }));
//   };

//   // --- KORREKTUR: Echte Implementierung von fetchScenarios ---
//   const fetchScenarios = useCallback(async () => {
//     if (!simoneState.activeNetwork) return;

//     try {
//       const response = await apiClient(
//         `/simone/scenarios?networkName=${simoneState.activeNetwork}`
//       );
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Szenarien konnten nicht geladen werden.");

//       setSimoneState((prev) => ({ ...prev, scenarios: data.scenarios || [] }));

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Szenarien konnten nicht geladen werden.");
//       setSimoneState((prev) => ({ ...prev, scenarios: [] }));
//     }
//   }, [simoneState.activeNetwork]);

//   const fetchRunTypes = useCallback(async () => {
//     try {
//       const data = await apiGetRunTypes();
//       setSimoneState((prev) => ({ ...prev, runTypes: data.runTypes }));
//     } catch (error) {
//       console.error("Failed to fetch run types:", error);
//       toast.error("Laufzeittypen konnten nicht geladen werden.");
//     }
//   }, []);

//   const handleCreateScenario = useCallback(
//     async (payload: CreateScenarioPayload) => {
//       setSimoneState((prev) => ({ ...prev, isCreatingScenario: true }));
//       try {
//         await apiCreateScenario(payload);
//         toast.success("Szenario erfolgreich erstellt.");
//         await fetchScenarios(); // Liste aktualisieren
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (error: any) {
//         console.error("Fehler beim Erstellen des Szenarios:", error);
//         toast.error(error.message || "Fehler beim Erstellen des Szenarios.");
//       } finally {
//         setSimoneState((prev) => ({ ...prev, isCreatingScenario: false }));
//       }
//     },
//     [fetchScenarios]
//   );

//   // --- KORREKTUR: Vereinfachte und robuste Logik zum Löschen ---
//   const handleDeleteScenario = useCallback(
//     async (payload: DeleteScenarioPayload) => {
//       const { scenarioName } = payload;
//       setSimoneState((prev) => ({ ...prev, isDeletingScenario: true }));

//       try {
//         await apiDeleteScenario(payload);
//         toast.success("Szenario erfolgreich gelöscht.");

//         // Nach dem Löschen den Zustand bereinigen und die Liste neu laden
//         if (simoneState.openScenario === scenarioName) {
//            setSimoneState((prev) => ({ ...prev, openScenario: null }));
//         }

//         await fetchScenarios(); // Liste neu laden, um die UI zu synchronisieren

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (error: any) {
//         console.error("Fehler beim Löschen des Szenarios:", error);
//         toast.error(error.message || "Fehler beim Löschen des Szenarios.");
//         // Im Fehlerfall trotzdem die Liste neu laden, um den Zustand zu korrigieren
//         await fetchScenarios();
//       } finally {
//         setSimoneState((prev) => ({ ...prev, isDeletingScenario: false }));
//       }
//     },
//     [simoneState.openScenario, fetchScenarios]
//   );

//   const value: SimoneContextValue = {
//     simoneState,
//     setSimoneInitialized,
//     setActiveNetwork,
//     setOpenScenario,
//     setVariablesToRead,
//     fetchScenarios,
//     fetchRunTypes,
//     handleCreateScenario,
//     handleDeleteScenario,
//   };

//   return (
//     <SimoneContext.Provider value={value}>{children}</SimoneContext.Provider>
//   );
// };

// export const useSimoneContext = () => {
//   const context = useContext(SimoneContext);
//   if (context === undefined) {
//     throw new Error("useSimoneContext must be used within a SimoneProvider.");
//   }
//   return context;
// };





// "use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

// import {
//   ScenarioListItemDto, // Typ für einzelne Szenario-Listeneinträge.
//   CreateScenarioPayload, // Typ für die Payload zum Erstellen eines Szenarios.
//   DeleteScenarioPayload, // Typ für die Payload zum Löschen eines Szenarios.
//   RunType, // Typ für Lauftypen.
// } from "@/types"; // Allgemeine Typdefinitionen.
// import {
//   createScenario as apiCreateScenario, // API-Funktion zum Erstellen eines Szenarios.
//   deleteScenario as apiDeleteScenario, // API-Funktion zum Löschen eines Szenarios.
//   getRunTypes as apiGetRunTypes, // API-Funktion zum Abrufen von Lauftypen.
//   apiClient, // Der allgemeine API-Client für weitere Aufrufe (z.B. fetchScenarios).
// } from "@/lib/apiClient"; // Importiert die API-Client-Funktionen.
// import React, {
//   createContext, // Zum Erstellen eines Context-Objekts.
//   useContext, // Zum Konsumieren des Contexts.
//   useState, // Für lokalen Komponentenzustand.
//   ReactNode, // Typ für React-Kindelemente.
//   useCallback, // Zum Memoizen von Funktionen.
// } from "react";
// import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.

// // -------------------------------------------------------------------
// // ✅ Interface: VariableToRead
// // Definiert die Struktur einer Variablen, die aus SIMONE gelesen/geschrieben werden soll.
// // -------------------------------------------------------------------
// export interface VariableToRead {
//   variableName: string; // Der vollständige Name der Variable (z.B. "Objekt.Parameter").
//   objId: number; // Die interne Objekt-ID in SIMONE.
//   extId: number; // Die interne Erweiterungs-ID in SIMONE.
// }

// /**
//  * -------------------------------------------------------------------
//  * ✅ Interface: SimoneState
//  * Definiert die Form des gemeinsam genutzten Zustands für den SIMONE-Kontext.
//  * Dieser Zustand wird von allen Komponenten konsumiert, die den Context verwenden.
//  * -------------------------------------------------------------------
//  */
// interface SimoneState {
//   isSimoneInitialized: boolean; // Zeigt an, ob die SIMONE-API initialisiert ist.
//   activeNetwork: string | null; // Der Name des aktuell aktiven Netzwerks.
//   openScenario: string | null; // Der Name des aktuell geöffneten Szenarios.
//   variablesToRead: VariableToRead[]; // Die Liste der Variablen, die für Datenleseoperationen ausgewählt wurden.
//   scenarios: ScenarioListItemDto[]; // Die Liste der Szenarien im aktiven Netzwerk.
//   runTypes: RunType[]; // Die verfügbaren Lauftypen für Szenarien.
//   isCreatingScenario: boolean; // Ladezustand für die Szenarioerstellung.
//   isDeletingScenario: boolean; // Ladezustand für das Szenariolöschen.
// }

// /**
//  * -------------------------------------------------------------------
//  * ✅ Interface: SimoneContextValue
//  * Definiert die Form des Kontextwerts, der vom Provider bereitgestellt wird.
//  * Enthält den Zustand (`simoneState`) und alle Setter-Funktionen/Aktionen.
//  * -------------------------------------------------------------------
//  */
// interface SimoneContextValue {
//   simoneState: SimoneState; // Der aktuelle Zustand.
//   setSimoneInitialized: (isInitialized: boolean) => void; // Setzt den Initialisierungsstatus.
//   setActiveNetwork: (networkName: string | null) => void; // Setzt das aktive Netzwerk.
//   setOpenScenario: (scenarioName: string | null) => void; // Setzt das aktuell geöffnete Szenario.
//   setVariablesToRead: React.Dispatch<React.SetStateAction<VariableToRead[]>>; // Setter für die zu lesenden Variablen.
//   fetchScenarios: () => Promise<void>; // Funktion zum Abrufen der Szenarien.
//   fetchRunTypes: () => Promise<void>; // Funktion zum Abrufen der Lauftypen.
//   handleCreateScenario: (payload: CreateScenarioPayload) => Promise<void>; // Funktion zum Erstellen eines Szenarios.
//   handleDeleteScenario: (payload: DeleteScenarioPayload) => Promise<void>; // Funktion zum Löschen eines Szenarios.
// }

// // Erstellt das Context-Objekt. Der Initialwert ist 'undefined' und wird später vom Provider überschrieben.
// const SimoneContext = createContext<SimoneContextValue | undefined>(undefined);

// /**
//  * -------------------------------------------------------------------
//  * ✅ Komponente: SimoneProvider
//  * Dies ist die Provider-Komponente für den SimoneContext.
//  * Sie hält den globalen Zustand und bietet Funktionen an, um diesen Zustand
//  * zu manipulieren und mit der SIMONE-API zu interagieren.
//  * Alle Kindelemente, die innerhalb dieses Providers gerendert werden,
//  * können auf den Context zugreifen.
//  * -------------------------------------------------------------------
//  */
// export const SimoneProvider = ({ children }: { children: ReactNode }) => {
//   // Initialisiert den Zustand mit Standardwerten.
//   const [simoneState, setSimoneState] = useState<SimoneState>({
//     isSimoneInitialized: false,
//     activeNetwork: null,
//     openScenario: null,
//     variablesToRead: [],
//     scenarios: [],
//     runTypes: [],
//     isCreatingScenario: false,
//     isDeletingScenario: false,
//   });

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: setSimoneInitialized
//    * Setzt den Initialisierungsstatus der SIMONE-API.
//    * Verwendet `useCallback` zur Memoizierung, um unnötige Rerenderings zu vermeiden.
//    * -------------------------------------------------------------------
//    */
//   const setSimoneInitialized = useCallback((isInitialized: boolean) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       isSimoneInitialized: isInitialized,
//     }));
//   }, []);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: setActiveNetwork
//    * Setzt das aktive Netzwerk. Wenn das Netzwerk wechselt, werden auch
//    * das geöffnete Szenario und die Szenarienliste zurückgesetzt.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const setActiveNetwork = useCallback((networkName: string | null) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       activeNetwork: networkName,
//       openScenario: null, // Szenario zurücksetzen, wenn das Netzwerk wechselt.
//       scenarios: [], // Szenarienliste leeren.
//     }));
//   }, []);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: setOpenScenario
//    * Setzt den Namen des aktuell geöffneten Szenarios.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const setOpenScenario = useCallback((scenarioName: string | null) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       openScenario: scenarioName,
//     }));
//   }, []);

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: setVariablesToRead
//    * Setzt die Liste der Variablen, die gelesen werden sollen.
//    * Ermöglicht die Übergabe eines direkten Wertes oder einer Update-Funktion.
//    * -------------------------------------------------------------------
//    */
//   const setVariablesToRead = (
//     variables: React.SetStateAction<VariableToRead[]>
//   ) => {
//     setSimoneState((prevState) => ({
//       ...prevState,
//       variablesToRead:
//         typeof variables === "function" // Prüft, ob 'variables' eine Funktion ist.
//           ? variables(prevState.variablesToRead) // Führt die Funktion aus, wenn ja.
//           : variables, // Setzt den Wert direkt, wenn es keine Funktion ist.
//     }));
//   };

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: fetchScenarios (KORRIGIERTE IMPLEMENTIERUNG)
//    * Ruft die Liste der Szenarien für das aktuell aktive Netzwerk ab.
//    * Aktualisiert den 'scenarios'-Zustand.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const fetchScenarios = useCallback(async () => {
//     if (!simoneState.activeNetwork) {
//       // Wenn kein aktives Netzwerk ausgewählt ist, leere die Szenarienliste.
//       setSimoneState((prev) => ({ ...prev, scenarios: [] }));
//       return;
//     }

//     try {
//       // API-Aufruf zum Abrufen der Szenarien für das aktive Netzwerk.
//       const response = await apiClient(
//         `/simone/scenarios?networkName=${simoneState.activeNetwork}`
//       );
//       const data = await response.json();
//       if (!response.ok)
//         throw new Error(
//           data.message || "Szenarien konnten nicht geladen werden."
//         );

//       setSimoneState((prev) => ({ ...prev, scenarios: data.scenarios || [] })); // Aktualisiert die Szenarienliste im Zustand.

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       console.error("Fehler beim Laden der Szenarien:", err);
//       toast.error(err.message || "Szenarien konnten nicht geladen werden.");
//       setSimoneState((prev) => ({ ...prev, scenarios: [] })); // Leert die Liste im Fehlerfall.
//     }
//   }, [simoneState.activeNetwork]); // Abhängigkeit: Wird bei Änderungen des aktiven Netzwerks neu erstellt.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: fetchRunTypes
//    * Ruft die verfügbaren Lauftypen vom Backend ab.
//    * Aktualisiert den 'runTypes'-Zustand.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const fetchRunTypes = useCallback(async () => {
//     try {
//       const data = await apiGetRunTypes(); // API-Aufruf zum Abrufen der Lauftypen.
//       setSimoneState((prev) => ({ ...prev, runTypes: data.runTypes })); // Aktualisiert die Lauftypen im Zustand.
//     } catch (error) {
//       console.error("Failed to fetch run types:", error);
//       toast.error("Laufzeittypen konnten nicht geladen werden.");
//     }
//   }, []); // Leeres Abhängigkeitsarray: Wird nur einmal beim Mounten erstellt.

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleCreateScenario
//    * Sendet eine Anfrage an das Backend, um ein neues Szenario zu erstellen.
//    * Aktualisiert den Ladezustand und die Szenarienliste nach Erfolg/Fehler.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const handleCreateScenario = useCallback(
//     async (payload: CreateScenarioPayload) => {
//       setSimoneState((prev) => ({ ...prev, isCreatingScenario: true })); // Setzt Ladezustand für Erstellung.
//       try {
//         await apiCreateScenario(payload); // API-Aufruf zum Erstellen des Szenarios.
//         toast.success("Szenario erfolgreich erstellt."); // Erfolgs-Toast.
//         await fetchScenarios(); // Aktualisiert die Szenarienliste.
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (error: any) {
//         console.error("Fehler beim Erstellen des Szenarios:", error);
//         toast.error(error.message || "Fehler beim Erstellen des Szenarios.");
//       } finally {
//         setSimoneState((prev) => ({ ...prev, isCreatingScenario: false })); // Beendet Ladezustand.
//       }
//     },
//     [fetchScenarios] // Abhängigkeit: Wird neu erstellt, wenn `fetchScenarios` sich ändert.
//   );

//   /**
//    * -------------------------------------------------------------------
//    * ✅ Funktion: handleDeleteScenario (KORRIGIERTE UND ROBUSTE LOGIK)
//    * Löscht ein Szenario über die API.
//    * Bereinigt den Zustand und lädt die Szenarienliste neu,
//    * auch im Fehlerfall, um Konsistenz zu gewährleisten.
//    * Verwendet `useCallback` zur Memoizierung.
//    * -------------------------------------------------------------------
//    */
//   const handleDeleteScenario = useCallback(
//     async (payload: DeleteScenarioPayload) => {
//       const { scenarioName } = payload;
//       setSimoneState((prev) => ({ ...prev, isDeletingScenario: true })); // Setzt Ladezustand für Löschen.

//       try {
//         await apiDeleteScenario(payload); // API-Aufruf zum Löschen des Szenarios.
//         toast.success("Szenario erfolgreich gelöscht."); // Erfolgs-Toast.

//         // Nach dem Löschen den Zustand bereinigen (geöffnetes Szenario zurücksetzen, wenn es das gelöschte war).
//         if (simoneState.openScenario === scenarioName) {
//           setSimoneState((prev) => ({ ...prev, openScenario: null }));
//         }

//         await fetchScenarios(); // Szenarienliste neu laden, um die UI zu synchronisieren.

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (error: any) {
//         console.error("Fehler beim Löschen des Szenarios:", error);
//         toast.error(error.message || "Fehler beim Löschen des Szenarios.");
//         // Im Fehlerfall trotzdem die Liste neu laden, um den Zustand zu korrigieren, falls das Backend die Löschung unvollständig verarbeitet hat.
//         await fetchScenarios();
//       } finally {
//         setSimoneState((prev) => ({ ...prev, isDeletingScenario: false })); // Beendet Ladezustand.
//       }
//     },
//     [simoneState.openScenario, fetchScenarios] // Abhängigkeiten für `useCallback`.
//   );

//   // Der Kontextwert, der an alle Konsumenten des SimoneContext bereitgestellt wird.
//   const value: SimoneContextValue = {
//     simoneState, // Der aktuelle Zustand.
//     setSimoneInitialized,
//     setActiveNetwork,
//     setOpenScenario,
//     setVariablesToRead,
//     fetchScenarios,
//     fetchRunTypes,
//     handleCreateScenario,
//     handleDeleteScenario,
//   };

//   return (
//     // Der Context Provider umschließt die Kindelemente und stellt den 'value' bereit.
//     <SimoneContext.Provider value={value}>{children}</SimoneContext.Provider>
//   );
// };

// /**
//  * -------------------------------------------------------------------
//  * ✅ Hook: useSimoneContext
//  * Ein benutzerdefinierter Hook, um den SimoneContext einfach in jeder
//  * untergeordneten Komponente zu konsumieren.
//  * Stellt sicher, dass der Hook nur innerhalb eines SimoneProviders verwendet wird.
//  * -------------------------------------------------------------------
//  */
// export const useSimoneContext = () => {
//   const context = useContext(SimoneContext); // Konsumiert den Context.
//   if (context === undefined) {
//     // Fehler werfen, wenn der Hook außerhalb des Providers verwendet wird.
//     throw new Error(
//       "useSimoneContext muss innerhalb eines SimoneProviders verwendet werden."
//     );
//   }
//   return context; // Gibt den Kontextwert zurück.
// };


"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import {
  ScenarioListItemDto,
  CreateScenarioPayload,
  DeleteScenarioPayload,
  RunType,
} from "@/types";
import {
  createScenario as apiCreateScenario,
  deleteScenario as apiDeleteScenario,
  getRunTypes as apiGetRunTypes,
  apiClient,
} from "@/lib/apiClient";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import toast from "react-hot-toast";

// -------------------------------------------------------------------
// ✅ Interface: VariableToRead
// Definiert die Struktur einer Variablen, die aus SIMONE gelesen/geschrieben werden soll.
// -------------------------------------------------------------------
export interface VariableToRead {
  variableName: string;
  objId: number;
  extId: number;
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: SimoneState
 * Definiert die Form des gemeinsam genutzten Zustands für den SIMONE-Kontext.
 * Dieser Zustand wird von allen Komponenten konsumiert, die den Context verwenden.
 * -------------------------------------------------------------------
 */
interface SimoneState {
  isSimoneInitialized: boolean;
  activeNetwork: string | null;
  activeNetworkDirectory: string | null; // ✅ NEU: Aktives Netzwerkverzeichnis zum globalen Zustand hinzugefügt
  openScenario: string | null;
  variablesToRead: VariableToRead[];
  scenarios: ScenarioListItemDto[];
  runTypes: RunType[];
  isCreatingScenario: boolean;
  isDeletingScenario: boolean;
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: SimoneContextValue
 * Definiert die Form des Kontextwerts, der vom Provider bereitgestellt wird.
 * Enthält den Zustand (`simoneState`) und alle Setter-Funktionen/Aktionen.
 * -------------------------------------------------------------------
 */
interface SimoneContextValue {
  simoneState: SimoneState;
  setSimoneInitialized: Dispatch<SetStateAction<boolean>>;
  setActiveNetwork: (networkName: string | null) => void;
  setOpenScenario: (scenarioName: string | null) => void;
  setVariablesToRead: Dispatch<SetStateAction<VariableToRead[]>>;
  fetchScenarios: () => Promise<void>;
  fetchRunTypes: () => Promise<void>;
  handleCreateScenario: (payload: CreateScenarioPayload) => Promise<void>;
  handleDeleteScenario: (payload: DeleteScenarioPayload) => Promise<void>;
  setActiveNetworkDirectory: Dispatch<SetStateAction<string | null>>; // ✅ NEU: Funktion zum Setzen des Verzeichnisses
}

// Erstellt das Context-Objekt. Der Initialwert ist 'undefined' und wird später vom Provider überschrieben.
const SimoneContext = createContext<SimoneContextValue | undefined>(undefined);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: SimoneProvider
 * Dies ist die Provider-Komponente für den SimoneContext.
 * Sie hält den globalen Zustand und bietet Funktionen an, um diesen Zustand
 * zu manipulieren und mit der SIMONE-API zu interagieren.
 * Alle Kindelemente, die innerhalb dieses Providers gerendert werden,
 * können auf den Context zugreifen.
 * -------------------------------------------------------------------
 */
export const SimoneProvider = ({ children }: { children: ReactNode }) => {
  // Initialisiert den Zustand mit Standardwerten.
  const [isSimoneInitialized, setSimoneInitialized] = useState<boolean>(false);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const [activeNetworkDirectory, setActiveNetworkDirectory] =
    useState<string | null>(null); // ✅ NEU: Lokaler Zustand für das Verzeichnis im Provider
  const [openScenario, setOpenScenario] = useState<string | null>(null);
  const [variablesToRead, setVariablesToRead] = useState<VariableToRead[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioListItemDto[]>([]);
  const [runTypes, setRunTypes] = useState<RunType[]>([]);
  const [isCreatingScenario, setIsCreatingScenario] = useState<boolean>(false);
  const [isDeletingScenario, setIsDeletingScenario] = useState<boolean>(false);

  const simoneState: SimoneState = {
    isSimoneInitialized,
    activeNetwork,
    activeNetworkDirectory,
    openScenario,
    variablesToRead,
    scenarios,
    runTypes,
    isCreatingScenario,
    isDeletingScenario,
  };

  const setSimoneInitializedCallback = useCallback(
    (isInitialized: SetStateAction<boolean>) => {
      setSimoneInitialized(isInitialized);
    },
    []
  );

  const setActiveNetworkCallback = useCallback((networkName: string | null) => {
    setActiveNetwork(networkName);
    setOpenScenario(null);
    setScenarios([]);
  }, []);

  const setOpenScenarioCallback = useCallback((scenarioName: string | null) => {
    setOpenScenario(scenarioName);
  }, []);

  const setVariablesToReadCallback = useCallback(
    (variables: SetStateAction<VariableToRead[]>) => {
      setVariablesToRead(variables);
    },
    []
  );

  const fetchScenarios = useCallback(async () => {
    if (!activeNetwork) {
      setScenarios([]);
      return;
    }
    try {
      const response = await apiClient(
        `/simone/scenarios?networkName=${activeNetwork}`
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Szenarien konnten nicht geladen werden.");
      setScenarios(data.scenarios || []);
    } catch (err: any) {
      console.error("Fehler beim Laden der Szenarien:", err);
      toast.error(err.message || "Szenarien konnten nicht geladen werden.");
      setScenarios([]);
    }
  }, [activeNetwork]);

  const fetchRunTypes = useCallback(async () => {
    try {
      const data = await apiGetRunTypes();
      setRunTypes(data.runTypes);
    } catch (error) {
      console.error("Failed to fetch run types:", error);
      toast.error("Laufzeittypen konnten nicht geladen werden.");
    }
  }, []);

  const handleCreateScenario = useCallback(
    async (payload: CreateScenarioPayload) => {
      setIsCreatingScenario(true);
      try {
        await apiCreateScenario(payload);
        toast.success("Szenario erfolgreich erstellt.");
        await fetchScenarios();
      } catch (error: any) {
        console.error("Fehler beim Erstellen des Szenarios:", error);
        toast.error(error.message || "Fehler beim Erstellen des Szenarios.");
      } finally {
        setIsCreatingScenario(false);
      }
    },
    [fetchScenarios]
  );

  const handleDeleteScenario = useCallback(
    async (payload: DeleteScenarioPayload) => {
      const { scenarioName } = payload;
      setIsDeletingScenario(true);
      try {
        await apiDeleteScenario(payload);
        toast.success("Szenario erfolgreich gelöscht.");
        if (openScenario === scenarioName) {
          setOpenScenario(null);
        }
        await fetchScenarios();
      } catch (error: any) {
        console.error("Fehler beim Löschen des Szenarios:", error);
        toast.error(error.message || "Fehler beim Löschen des Szenarios.");
        await fetchScenarios();
      } finally {
        setIsDeletingScenario(false);
      }
    },
    [openScenario, fetchScenarios]
  );
  
  const setActiveNetworkDirectoryCallback = useCallback(
    (directoryPath: SetStateAction<string | null>) => {
      setActiveNetworkDirectory(directoryPath);
    },
    []
  );

  const value: SimoneContextValue = {
    simoneState,
    setSimoneInitialized: setSimoneInitializedCallback,
    setActiveNetwork: setActiveNetworkCallback,
    setOpenScenario: setOpenScenarioCallback,
    setVariablesToRead: setVariablesToReadCallback,
    fetchScenarios,
    fetchRunTypes,
    handleCreateScenario,
    handleDeleteScenario,
    setActiveNetworkDirectory: setActiveNetworkDirectoryCallback,
  };

  return (
    <SimoneContext.Provider value={value}>{children}</SimoneContext.Provider>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Hook: useSimoneContext
 * Ein benutzerdefinierter Hook, um den SimoneContext einfach in jeder
 * untergeordneten Komponente zu konsumieren.
 * Stellt sicher, dass der Hook nur innerhalb eines SimoneProviders verwendet wird.
 * -------------------------------------------------------------------
 */
export const useSimoneContext = () => {
  const context = useContext(SimoneContext);
  if (context === undefined) {
    throw new Error("useSimoneContext must be used within a SimoneProvider");
  }
  return context;
};