// // src/main/java/com/gascade/simone/service/SimoneTranslationService.java
// package com.gascade.simone.service;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.gascade.simone.dto.RunTypeDto;
// import com.gascade.simone.dto.VarIdBatchResponseDto;
// import com.gascade.simone.dto.VarIdResponseDto;

// import de.liwacom.simone.SimInt;
// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst;

// @Service
// public class SimoneTranslationService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneTranslationService.class);
//     private final SimoneApi simoneApi;
//     private final boolean isSimoneApiInstantiated;
//     private final SimoneLifecycleService lifecycleService; 
//     private final SimoneNetworkService networkService;     
//      private final Object nativeLock = new Object();

//     @Autowired
//     public SimoneTranslationService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
//         this.lifecycleService = lifecycleService;
//         this.networkService = networkService;
        
//         SimoneApi tempApi = null;
//         boolean instantiated = false;
//         try {
//             tempApi = SimoneApi.getInstance();
//             if (tempApi != null) {
//                 logger.info("SimoneTranslationService: SimoneAPI instance obtained successfully.");
//                 instantiated = true;
//             } else {
//                 logger.error("SimoneTranslationService: Failed to get SimoneAPI instance (getInstance returned null).");
//             }
//         } catch (Throwable t) {
//             logger.error("SimoneTranslationService: CRITICAL - Unexpected error obtaining SimoneAPI instance: {}", t.getMessage(), t);
//         }
//         this.simoneApi = tempApi;
//         this.isSimoneApiInstantiated = instantiated;
//     }

//     private void checkApiReady() {
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API native component not loaded.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE environment not initialized. Call /initialize first.");
//         }
//     }
// public VarIdBatchResponseDto getVariableIdsBatch(String networkName, List<String> variableNames) {
//     checkApiReady();

//     List<VarIdResponseDto> results = new ArrayList<>();

//     synchronized (nativeLock) {
//         int selectStatus = simoneApi.simone_select(networkName);
//         if (selectStatus != SimoneConst.simone_status_ok) {
//             String msg = "Service: Could not select network '" + networkName + "' for varid batch translation.";
//             logger.error(msg);
//             throw new IllegalStateException(msg);
//         }

//         logger.info("Service: Selected network '{}' for varid batch translation.", networkName);

//         for (String variableName : variableNames) {
//             SimInt objIdOutput = new SimInt();
//             SimInt extIdOutput = new SimInt();

//             int simoneStatus = simoneApi.simone_varid(variableName, objIdOutput, extIdOutput);

//             if (simoneStatus != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString();
//                 simoneApi.simone_last_error(errorMsg);
//                 String errorMessage = String.format(
//                     "Failed to translate variable name '%s'. Status: %d. SIMONE Error: %s",
//                     variableName, simoneStatus, errorMsg.getVal()
//                 );
//                 logger.warn(errorMessage);
//                 results.add(new VarIdResponseDto(variableName, -1, -1, simoneStatus, errorMessage));
//             } else {
//                 results.add(new VarIdResponseDto(
//                     variableName,
//                     objIdOutput.getVal(),
//                     extIdOutput.getVal(),
//                     simoneStatus,
//                     "Translation successful"
//                 ));
//             }
//         }
//     }

//     return new VarIdBatchResponseDto(results);
// }

//     public VarIdResponseDto getVariableIds(String networkName, String variableName) {
//         checkApiReady();

//         synchronized (nativeLock) {
//             int selectStatus = simoneApi.simone_select(networkName);
//             if (selectStatus != SimoneConst.simone_status_ok) {
//                 logger.error("Service: Could not select network '{}' for varid translation.", networkName);
//                 throw new IllegalStateException("Failed to select network for varid translation: " + networkName);
//             }
//             logger.info("Service: Selected network '{}' for varid translation.", networkName);

//             SimInt objIdOutput = new SimInt();
//             SimInt extIdOutput = new SimInt();

//             int simoneStatus = simoneApi.simone_varid(variableName, objIdOutput, extIdOutput);

//             if (simoneStatus != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString();
//                 simoneApi.simone_last_error(errorMsg);
//                 String errorMessage = String.format(
//                     "Failed to translate variable name '%s'. Status: %d. SIMONE Error: %s",
//                     variableName, simoneStatus, errorMsg.getVal()
//                 );
//                 logger.warn(errorMessage);
//                 return new VarIdResponseDto(variableName, -1, -1, simoneStatus, errorMessage);
//             }

//             return new VarIdResponseDto(
//                 variableName,
//                 objIdOutput.getVal(),
//                 extIdOutput.getVal(),
//                 simoneStatus,
//                 "Translation successful"
//             );
//         }
//     }

//     /**
//      * Retrieves metadata for a given variable ID.
//      * Uses simone_varid_info().
//      * @param objId The object ID of the variable.
//      * @param extId The extension ID of the variable.
//      * @return A map containing object_type, data_type, and unit_type.
//      */
//     public Map<String, Integer> getVariableInfo(int objId, int extId) {
//         logger.info("Service: getVariableInfo called for objId: {}, extId: {}", objId, extId);
//         checkApiReady();
//         if (networkService.getCurrentNetwork() == null) {
//             throw new IllegalStateException("No network selected. Cannot get variable info.");
//         }

//         SimInt objectTypeOutput = new SimInt();
//         SimInt dataTypeOutput = new SimInt();
//         SimInt unitTypeOutput = new SimInt();

//         try {
//             int status = this.simoneApi.simone_varid_info(objId, extId, objectTypeOutput, dataTypeOutput, unitTypeOutput);

//             if (status == SimoneConst.simone_status_ok) {
//                 return Map.of(
//                     "objectType", objectTypeOutput.getVal(),
//                     "dataType", dataTypeOutput.getVal(),
//                     "unitType", unitTypeOutput.getVal()
//                 );
//             } else {
//                 logger.warn("simone_varid_info failed for objId: {}, extId: {}. Status: {}", objId, extId, status);
//                 return Map.of("errorStatus", status);
//             }
//         } catch (Throwable t) {
//             logger.error("Unexpected error in getVariableInfo: {}", t.getMessage(), t);
//             throw new RuntimeException("Unexpected error in getVariableInfo.", t);
//         }
//     }

//     /**
//      * Translates a SIMONE extension name (e.g., "P", "Q") into its internal extension ID.
//      * Uses the correct simone_extname2id() function.
//      * @param extensionName The extension name string.
//      * @param requestedFlags Optional flags (e.g., SIMONE_FLAG_NO_LOGS).
//      * @return The integer extension ID, or -1 if not found or an error occurs.
//      */
//     public int getExtensionId(String extensionName, Integer requestedFlags) {
//         logger.info("Service: getExtensionId called for extensionName: '{}'", extensionName);
//         checkApiReady();

//         if (extensionName == null || extensionName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Extension name cannot be null or empty.");
//         }

//         SimInt extIdOutput = new SimInt(); 
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;

//         try {
//             int simoneStatus = this.simoneApi.simone_extname2id(
//                 extensionName.trim(),
//                 extIdOutput,
//                 flags
//             );
//             logger.info("simone_extname2id for '{}' returned status: {}", extensionName, simoneStatus);

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 return extIdOutput.getVal(); 
//             } else {              
//                 logger.warn("Could not find extId for extension '{}'. SIMONE status: {}", extensionName, simoneStatus);
//                 return -1; 
//             }
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_extname2id call for '{}': {}", extensionName, t.getMessage(), t);
//             return -1;
//         }
//     }

    
//         /**
//      * Retrieves a list of available SIMONE run types.
//      * This list is used to populate selection dropdowns in the frontend.
//      *
//      * @return A list of {@link RunTypeDto} objects.
//      */
//     public List<RunTypeDto> getRunTypes() {
//         List<RunTypeDto> runTypes = new ArrayList<>();      
//         runTypes.add(new RunTypeDto(SimoneConst.SIMONE_RUNTYPE_DYN, "Dynamic Simulation (DYN)"));        
//         runTypes.add(new RunTypeDto(SimoneConst.SIMONE_RUNTYPE_STA, "Steady State (PF)"));
//         return runTypes;
//     }

// public List<String> getValidExtensions(String networkName, String objectName) {
//    checkApiReady();

//     int selectStatus = simoneApi.simone_select(networkName);
//     if (selectStatus != SimoneConst.simone_status_ok) {
//         logger.error("Service: Could not select network '{}'. Status: {}", networkName, selectStatus);    
//         throw new IllegalStateException("Failed to select network: " + networkName);
//     }

//     logger.info("Service: Successfully selected network '{}' to find extensions for object '{}'", networkName, objectName);

//         // List of potential extensions to check, based on the provided table
//         String[] potentialExtensions = {
//             "D", "L", "RR", "COR_LAM", "GT", "HTC", "M", "PD", "PR", "V", "RHO", 
//             "ANM3", "GWH", "ED", "HFR", "DTDP", "DTHE", "DTHF", "Q", "PSET", 
//             "PSETDP", "MAXQP", "Qualität", "T", "RUPT", "RUPTQO", "PM", "PMDP", 
//             "SIGMA", "PDPR", "TDPR", "Q.Qualität", "Q.T", "Q.PDPR", "Q.TDPR", 
//             "H", "P", "QP", "TDP", "THE", "ON", "OFF", "BP", "BPDIAM", "BPDP", 
//             "RE", "REPD", "MODE", "SM", "SPO", "SPI", "MMAX", "SQVOL", "SCVO", 
//             "SR", "VMAX", "RIN", "RINPD", "ROUT", "ROUTPD", "PIMIN", "POMAX", 
//             "POMIN", "PDMIN", "CVPMAX", "CVTO", "MM", "POWER", "OPEN", "MEA", 
//             "CONF", "TAMB", "OPER", "PRMAX", "QVOLMAX", "POWERMAX", "EFFCS", 
//             "EFFDRIVE", "CONR", "SUCC", "COMB", "TI", "TO", "MCF", "QCORR", 
//             "ACCU", "ASUPP", "AOFF", "APMIN", "APMAX", "AVMAX", "AIPMIN", 
//             "AIPMAX", "AIVMAX", "AHFR", "ADTDP", "ADTHE", "ADTHF", "DT", "TW", 
//             "QT", "HD", "JTEP", "ZET", "LAMBDA", "TA", "TQ", "SB", "SBDT", 
//             "STOP", "THETAEQ", "THETACOR", "KAPPA", "RECYC", "HF", "IT", "WCC"
//         };
//     List<String> validExtensions = new ArrayList<>();

//     for (String extName : potentialExtensions) {
//         SimInt extId = new SimInt();
//         SimInt objType = new SimInt();
//         int validationStatus = simoneApi.simone_varid_ex(objectName + "." + extName, new SimInt(), extId, objType, 0);

//         if (validationStatus == SimoneConst.simone_status_ok) {
//             validExtensions.add(extName);
//         }
//     }
//     return validExtensions;
// }
// }

package com.gascade.simone.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gascade.simone.dto.RunTypeDto;
import com.gascade.simone.dto.VarIdBatchResponseDto;
import com.gascade.simone.dto.VarIdResponseDto;

import de.liwacom.simone.SimInt;
import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;

/**
 * Service-Klasse für Übersetzungsoperationen innerhalb der SIMONE-API.
 * Diese Klasse kümmert sich um die Umwandlung von menschenlesbaren Namen
 * (wie Variablen- oder Extension-Namen) in die internen IDs von SIMONE und umgekehrt.
 */
@Service
public class SimoneTranslationService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneTranslationService.class);
    private final SimoneApi simoneApi;
    private final boolean isSimoneApiInstantiated;
    private final SimoneLifecycleService lifecycleService;
    private final SimoneNetworkService networkService;
    private final Object nativeLock = new Object();

    /**
     * Konstruktor für den SimoneTranslationService.
     * Initialisiert die SIMONE-API-Instanz und Abhängigkeiten zu anderen Diensten.
     *
     * @param lifecycleService Service zur Verwaltung des SIMONE-Lebenszyklus.
     * @param networkService   Service zur Verwaltung von SIMONE-Netzwerken.
     */
    @Autowired
    public SimoneTranslationService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
        this.lifecycleService = lifecycleService;
        this.networkService = networkService;

        SimoneApi tempApi = null;
        boolean instantiated = false;
        try {
            tempApi = SimoneApi.getInstance();
            if (tempApi != null) {
                logger.info("SimoneTranslationService: SimoneAPI-Instanz erfolgreich erhalten.");
                instantiated = true;
            } else {
                logger.error("SimoneTranslationService: Fehler beim Abrufen der SimoneAPI-Instanz (getInstance gab null zurück).");
            }
        } catch (Throwable t) {
            logger.error("SimoneTranslationService: KRITISCH - Unerwarteter Fehler beim Abrufen der SimoneAPI-Instanz: {}", t.getMessage(), t);
        }
        this.simoneApi = tempApi;
        this.isSimoneApiInstantiated = instantiated;
    }

    /**
     * Überprüft, ob die SIMONE-API-Komponente geladen und die Umgebung initialisiert ist.
     * Wirft eine {@link IllegalStateException}, wenn die Voraussetzungen nicht erfüllt sind.
     */
    private void checkApiReady() {
        if (!isSimoneApiInstantiated || this.simoneApi == null) {
            throw new IllegalStateException("SIMONE API native Komponente nicht geladen.");
        }
        if (!lifecycleService.isSimoneEnvironmentInitialized()) {
            throw new IllegalStateException("SIMONE-Umgebung nicht initialisiert. Rufen Sie zuerst /initialize auf.");
        }
    }

    /**
     * Übersetzt eine Liste von Variablennamen in ihre jeweiligen Objekt- und Extension-IDs.
     * Diese Methode ist für die Stapelverarbeitung optimiert.
     *
     * @param networkName   Der Name des Netzwerks, in dem die Übersetzung stattfinden soll.
     * @param variableNames Eine Liste von zu übersetzenden Variablennamen.
     * @return Ein {@link VarIdBatchResponseDto} mit den Ergebnissen für jede Variable.
     */
    public VarIdBatchResponseDto getVariableIdsBatch(String networkName, List<String> variableNames) {
        checkApiReady();

        List<VarIdResponseDto> results = new ArrayList<>();

        synchronized (nativeLock) {
            int selectStatus = simoneApi.simone_select(networkName);
            if (selectStatus != SimoneConst.simone_status_ok) {
                String msg = "Service: Netzwerk '" + networkName + "' konnte für die Stapelübersetzung von varid nicht ausgewählt werden.";
                logger.error(msg);
                throw new IllegalStateException(msg);
            }

            logger.info("Service: Netzwerk '{}' für die Stapelübersetzung von varid ausgewählt.", networkName);

            for (String variableName : variableNames) {
                SimInt objIdOutput = new SimInt();
                SimInt extIdOutput = new SimInt();

                int simoneStatus = simoneApi.simone_varid(variableName, objIdOutput, extIdOutput);

                if (simoneStatus != SimoneConst.simone_status_ok) {
                    SimString errorMsg = new SimString();
                    simoneApi.simone_last_error(errorMsg);
                    String errorMessage = String.format(
                            "Fehler beim Übersetzen des Variablennamens '%s'. Status: %d. SIMONE-Fehler: %s",
                            variableName, simoneStatus, errorMsg.getVal()
                    );
                    logger.warn(errorMessage);
                    results.add(new VarIdResponseDto(variableName, -1, -1, simoneStatus, errorMessage));
                } else {
                    results.add(new VarIdResponseDto(
                            variableName,
                            objIdOutput.getVal(),
                            extIdOutput.getVal(),
                            simoneStatus,
                            "Übersetzung erfolgreich"
                    ));
                }
            }
        }

        return new VarIdBatchResponseDto(results);
    }

    /**
     * Übersetzt einen einzelnen Variablennamen in seine Objekt- und Extension-ID.
     *
     * @param networkName  Der Name des Netzwerks, in dem die Übersetzung stattfinden soll.
     * @param variableName Der zu übersetzende Variablenname.
     * @return Ein {@link VarIdResponseDto} mit dem Ergebnis.
     */
    public VarIdResponseDto getVariableIds(String networkName, String variableName) {
        checkApiReady();

        synchronized (nativeLock) {
            int selectStatus = simoneApi.simone_select(networkName);
            if (selectStatus != SimoneConst.simone_status_ok) {
                logger.error("Service: Netzwerk '{}' konnte für die varid-Übersetzung nicht ausgewählt werden.", networkName);
                throw new IllegalStateException("Fehler bei der Auswahl des Netzwerks für die varid-Übersetzung: " + networkName);
            }
            logger.info("Service: Netzwerk '{}' für die varid-Übersetzung ausgewählt.", networkName);

            SimInt objIdOutput = new SimInt();
            SimInt extIdOutput = new SimInt();

            int simoneStatus = simoneApi.simone_varid(variableName, objIdOutput, extIdOutput);

            if (simoneStatus != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                simoneApi.simone_last_error(errorMsg);
                String errorMessage = String.format(
                        "Fehler beim Übersetzen des Variablennamens '%s'. Status: %d. SIMONE-Fehler: %s",
                        variableName, simoneStatus, errorMsg.getVal()
                );
                logger.warn(errorMessage);
                return new VarIdResponseDto(variableName, -1, -1, simoneStatus, errorMessage);
            }

            return new VarIdResponseDto(
                    variableName,
                    objIdOutput.getVal(),
                    extIdOutput.getVal(),
                    simoneStatus,
                    "Übersetzung erfolgreich"
            );
        }
    }

    /**
     * Ruft Metadaten für eine gegebene Variablen-ID ab.
     * Verwendet simone_varid_info().
     *
     * @param objId Die Objekt-ID der Variable.
     * @param extId Die Extension-ID der Variable.
     * @return Eine Map mit object_type, data_type und unit_type.
     */
    public Map<String, Integer> getVariableInfo(int objId, int extId) {
        logger.info("Service: getVariableInfo aufgerufen für objId: {}, extId: {}", objId, extId);
        checkApiReady();
        if (networkService.getCurrentNetwork() == null) {
            throw new IllegalStateException("Kein Netzwerk ausgewählt. Variableninfo kann nicht abgerufen werden.");
        }

        SimInt objectTypeOutput = new SimInt();
        SimInt dataTypeOutput = new SimInt();
        SimInt unitTypeOutput = new SimInt();

        try {
            int status = this.simoneApi.simone_varid_info(objId, extId, objectTypeOutput, dataTypeOutput, unitTypeOutput);

            if (status == SimoneConst.simone_status_ok) {
                return Map.of(
                        "objectType", objectTypeOutput.getVal(),
                        "dataType", dataTypeOutput.getVal(),
                        "unitType", unitTypeOutput.getVal()
                );
            } else {
                logger.warn("simone_varid_info fehlgeschlagen für objId: {}, extId: {}. Status: {}", objId, extId, status);
                return Map.of("errorStatus", status);
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler in getVariableInfo: {}", t.getMessage(), t);
            throw new RuntimeException("Unerwarteter Fehler in getVariableInfo.", t);
        }
    }

    /**
     * Übersetzt einen SIMONE-Extension-Namen (z.B. "P", "Q") in seine interne Extension-ID.
     * Verwendet die Funktion simone_extname2id().
     *
     * @param extensionName Der Name der Extension als String.
     * @param requestedFlags Optionale Flags (z.B. SIMONE_FLAG_NO_LOGS).
     * @return Die Extension-ID als Integer, oder -1, wenn sie nicht gefunden wurde oder ein Fehler auftrat.
     */
    public int getExtensionId(String extensionName, Integer requestedFlags) {
        logger.info("Service: getExtensionId aufgerufen für extensionName: '{}'", extensionName);
        checkApiReady();

        if (extensionName == null || extensionName.trim().isEmpty()) {
            throw new IllegalArgumentException("Der Name der Extension darf nicht null oder leer sein.");
        }

        SimInt extIdOutput = new SimInt();
        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;

        try {
            int simoneStatus = this.simoneApi.simone_extname2id(
                    extensionName.trim(),
                    extIdOutput,
                    flags
            );
            logger.info("simone_extname2id für '{}' lieferte Status: {}", extensionName, simoneStatus);

            if (simoneStatus == SimoneConst.simone_status_ok) {
                return extIdOutput.getVal();
            } else {
                logger.warn("extId für Extension '{}' konnte nicht gefunden werden. SIMONE-Status: {}", extensionName, simoneStatus);
                return -1;
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler beim Aufruf von simone_extname2id für '{}': {}", extensionName, t.getMessage(), t);
            return -1;
        }
    }

    /**
     * Ruft eine Liste der verfügbaren SIMONE-Laufzeittypen ab.
     * Diese Liste wird verwendet, um Auswahl-Dropdowns im Frontend zu füllen.
     *
     * @return Eine Liste von {@link RunTypeDto} Objekten.
     */
    public List<RunTypeDto> getRunTypes() {
        // Best Practice: Diese Methode könnte erweitert werden, um die Typen dynamisch
        // aus einer Konfigurationsdatei oder einer anderen Quelle zu laden,
        // anstatt sie fest zu codieren. Für den aktuellen Zweck ist dies jedoch ausreichend.
        List<RunTypeDto> runTypes = new ArrayList<>();
        runTypes.add(new RunTypeDto(SimoneConst.SIMONE_RUNTYPE_DYN, "Dynamische Simulation (DYN)"));
        runTypes.add(new RunTypeDto(SimoneConst.SIMONE_RUNTYPE_STA, "Stationär (PF)"));
        return runTypes;
    }

    /**
     * Ermittelt eine Liste gültiger Extensions für einen gegebenen Objektnamen in einem bestimmten Netzwerk.
     *
     * @param networkName Der Name des Netzwerks, das für die Prüfung ausgewählt werden soll.
     * @param objectName  Der Name des Objekts, für das die gültigen Extensions gefunden werden sollen.
     * @return Eine Liste von Strings, die die gültigen Extension-Namen repräsentieren.
     * @throws IllegalStateException wenn das angegebene Netzwerk nicht ausgewählt werden kann.
     */
    public List<String> getValidExtensions(String networkName, String objectName) {
        checkApiReady();

        int selectStatus = simoneApi.simone_select(networkName);
        if (selectStatus != SimoneConst.simone_status_ok) {
            logger.error("Service: Konnte Netzwerk '{}' nicht auswählen. Status: {}", networkName, selectStatus);
            throw new IllegalStateException("Auswahl des Netzwerks fehlgeschlagen: " + networkName);
        }

        logger.info("Service: Netzwerk '{}' erfolgreich ausgewählt, um Extensions für Objekt '{}' zu finden", networkName, objectName);

        // Best Practice: Diese Liste von potenziellen Extensions könnte in eine externe
        // Konfigurationsdatei ausgelagert werden, um sie leichter pflegbar zu machen.
        String[] potentialExtensions = {
                "D", "L", "RR", "COR_LAM", "GT", "HTC", "M", "PD", "PR", "V", "RHO",
                "ANM3", "GWH", "ED", "HFR", "DTDP", "DTHE", "DTHF", "Q", "PSET",
                "PSETDP", "MAXQP", "Qualität", "T", "RUPT", "RUPTQO", "PM", "PMDP",
                "SIGMA", "PDPR", "TDPR", "Q.Qualität", "Q.T", "Q.PDPR", "Q.TDPR",
                "H", "P", "QP", "TDP", "THE", "ON", "OFF", "BP", "BPDIAM", "BPDP",
                "RE", "REPD", "MODE", "SM", "SPO", "SPI", "MMAX", "SQVOL", "SCVO",
                "SR", "VMAX", "RIN", "RINPD", "ROUT", "ROUTPD", "PIMIN", "POMAX",
                "POMIN", "PDMIN", "CVPMAX", "CVTO", "MM", "POWER", "OPEN", "MEA",
                "CONF", "TAMB", "OPER", "PRMAX", "QVOLMAX", "POWERMAX", "EFFCS",
                "EFFDRIVE", "CONR", "SUCC", "COMB", "TI", "TO", "MCF", "QCORR",
                "ACCU", "ASUPP", "AOFF", "APMIN", "APMAX", "AVMAX", "AIPMIN",
                "AIPMAX", "AIVMAX", "AHFR", "ADTDP", "ADTHE", "ADTHF", "DT", "TW",
                "QT", "HD", "JTEP", "ZET", "LAMBDA", "TA", "TQ", "SB", "SBDT",
                "STOP", "THETAEQ", "THETACOR", "KAPPA", "RECYC", "HF", "IT", "WCC"
        };
        List<String> validExtensions = new ArrayList<>();

        for (String extName : potentialExtensions) {
            SimInt extId = new SimInt();
            SimInt objType = new SimInt();
            // simone_varid_ex wird verwendet, um zu prüfen, ob die Kombination aus Objekt und Extension gültig ist.
            int validationStatus = simoneApi.simone_varid_ex(objectName + "." + extName, new SimInt(), extId, objType, 0);

            if (validationStatus == SimoneConst.simone_status_ok) {
                validExtensions.add(extName);
            }
        }
        logger.info("{} gültige Extensions für das Objekt '{}' gefunden.", validExtensions.size(), objectName);
        return validExtensions;
    }
}
