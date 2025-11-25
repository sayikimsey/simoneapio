// // src/main/java/com/gascade/simone/service/SimoneAdminNetworkService.java
// package com.gascade.simone.service;

// // Add this import statement at the top of the file
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;

// import com.gascade.simone.dto.AdminNetworkOperationResponseDto;

// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst;

// @Service
// public class SimoneAdminNetworkService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneAdminNetworkService.class);
//     private final SimoneApi simoneApi;
//     private final boolean isSimoneApiInstantiated;
//     private final SimoneLifecycleService lifecycleService; // To check if SIMONE is initialized
//     // We might not need SimoneNetworkService here if these operations don't depend on a "current selected network" state from it.
//     // Add SimoneNetworkService as a field
//     private final SimoneNetworkService networkService;
//     // Add this field inside the SimoneAdminNetworkService class definition
//     @Value("${simone.default.network.directory}")
//     private String defaultNetworkDirectory;

//     @Autowired
//     public SimoneAdminNetworkService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
//         this.lifecycleService = lifecycleService;
//         this.networkService = networkService; // Assign the injected service
//         SimoneApi tempApi = null;
//         boolean instantiated = false;
//         try {
//             // Assuming simone_api_set_simone_path was called in SimoneLifecycleService constructor
//             tempApi = SimoneApi.getInstance();
//             if (tempApi != null) {
//                 logger.info("SimoneAdminNetworkService: SimoneAPI instance obtained successfully.");
//                 instantiated = true;
//             } else {
//                 logger.error("SimoneAdminNetworkService: Failed to get SimoneAPI instance (getInstance returned null).");
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("SimoneAdminNetworkService: CRITICAL - UnsatisfiedLinkError obtaining SimoneAPI. {}", ule.getMessage());
//         } catch (Throwable t) {
//             logger.error("SimoneAdminNetworkService: CRITICAL - Unexpected error obtaining SimoneAPI instance: {}", t.getMessage(), t);
//         }
//         this.simoneApi = tempApi;
//         this.isSimoneApiInstantiated = instantiated;
//     }

//     // Helper method for prerequisite checks
//     private void checkApiReady() {
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API native component not loaded.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE environment not initialized. Call /initialize first.");
//         }
//     }

// /**
//      * Creates a new, empty SIMONE network using simone_create_network.
//      *
//      * @param networkName The name for the new network.
//      * @param requestedFlags Optional flags, e.g., SimoneConst.SIMONE_FLAG_REPLACE to overwrite an existing network.
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      * @throws IllegalStateException if the SIMONE API is not initialized.
//      * @throws IllegalArgumentException if the network name is invalid.
//      * @throws RuntimeException for other unexpected SIMONE API errors.
//      */

//     public AdminNetworkOperationResponseDto createNetwork(String networkName, Integer requestedFlags) {
//         logger.info("Service: Attempting to create network '{}' with flags: {}", 
//             networkName, requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);
        
//         checkApiReady(); // This helper ensures API is instantiated and initialized

//         if (networkName == null || networkName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Network name cannot be null or empty.");
//         }

//         // Prepare parameters for the API call
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         // The SimString constructor does not take an int for size as per your Javadoc.
//         // Use the no-argument constructor for output parameters.
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_create_network(networkName: \"{}\", flags: {})...", networkName, flags);

//             // Corrected call based on your Javadoc: 
//             // public int simone_create_network(String network, int flags, SimString status_msg)
//             int simoneStatus = this.simoneApi.simone_create_network(
//                 networkName.trim(),
//                 flags,
//                 statusMsgOutput // The output parameter
//             );
//             logger.info("simone_create_network for '{}' returned status: {}", networkName, simoneStatus);

//             String simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
//             String serviceMessage;

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + networkName + "' created successfully.";
//                 logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//             } else {
//                 // If status is not OK, the simoneDetailedMessage from the output parameter is the most useful info
//                 serviceMessage = "Failed to create network '" + networkName + "'.";
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_create_network for '{}': {}", networkName, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error creating network: " + t.getMessage(), t);
//         }
//     }


// // Add this method to: src/main/java/com/gascade/simone/service/SimoneAdminNetworkService.java

//     /**
//      * Imports a network description from a file. This function first sets the
//      * network directory context, which is a required prerequisite for the import operation.
//      * It uses the simone_import_network_description() function.
//      *
//      * @param importPath The full path to the network description file to be imported.
//      * @param requestedFlags Optional flags, e.g., SimoneConst.SIMONE_FLAG_REPLACE to overwrite an existing network.
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      */
//     public AdminNetworkOperationResponseDto importNetworkDescription(String importPath, Integer requestedFlags) {
//         logger.info("Service: Attempting to import network description from path '{}' with flags: {}",
//             importPath, requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);

//         // Step 1: Ensure API is initialized.
//         checkApiReady();

//         if (importPath == null || importPath.trim().isEmpty()) {
//             throw new IllegalArgumentException("Import file path cannot be null or empty.");
//         }

//         // Step 2: Set the network directory context before the import.
//         // This is the crucial step to resolve the "invalid sequence" error.
//         try {
//             logger.info("Setting network directory context to '{}' before import.", defaultNetworkDirectory);
//             int changeDirStatus = this.simoneApi.simone_change_network_dir(defaultNetworkDirectory, SimoneConst.SIMONE_FLAG_MAKE_NETWORK_DIR);
//             if (changeDirStatus != SimoneConst.simone_status_ok) {
//                 throw new IllegalStateException("Prerequisite failed: Could not set network directory context. SIMONE Error: " + getSimoneError());
//             }
//         } catch (Throwable t) {
//             logger.error("Unexpected error setting network directory context before import: {}", t.getMessage(), t);
//             throw new RuntimeException("Unexpected prerequisite error: " + t.getMessage(), t);
//         }

//         // Step 3: Proceed with the import into the now-set network directory.
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_import_network_description(importPath: \"{}\", flags: {})...", importPath, flags);

//             int simoneStatus = this.simoneApi.simone_import_network_description(
//                 importPath.trim(),
//                 flags,
//                 statusMsgOutput
//             );
//             logger.info("simone_import_network_description from '{}' returned status: {}", importPath, simoneStatus);

//             String simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
//             String serviceMessage;

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network description from '" + importPath + "' imported successfully.";
//                 logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//             } else {
//                 serviceMessage = "Failed to import network description from '" + importPath + "'.";
//                 if (simoneDetailedMessage.isEmpty()) {
//                     simoneDetailedMessage = getSimoneError();
//                 }
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_import_network_description for path '{}': {}", importPath, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error importing network description: " + t.getMessage(), t);
//         }
//     }
//     // The following methods would be implemented similarly, using the Simone API methods
//     // Part 19.3: Import Network Description
//     // public AdminNetworkOperationResponseDto importNetworkDescription(String importPath, Integer flags) { ... }
    


//     // Add this new method inside the SimoneAdminNetworkService class

// /**
//  * Activates the currently selected SIMONE network using simone_activate_network.
//  *
//  * @param requestedFlags Optional flags for the activation.
//  * @return AdminNetworkOperationResponseDto containing the status of the operation.
//  */
// public AdminNetworkOperationResponseDto activateCurrentNetwork(Integer requestedFlags) {
//     logger.info("Service: Attempting to activate current network with flags: {}", 
//         requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);

//     checkApiReady(); // Ensures API is initialized

//     // Check that a network is selected before trying to activate it
//     String currentNetwork = this.networkService.getCurrentNetwork();
//     if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
//         throw new IllegalStateException("No network selected to activate. Please select a network first.");
//     }
//     logger.info("Activating selected network: {}", currentNetwork);

//     int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//     SimString statusMsgOutput = new SimString();

//     try {
//         logger.debug("Calling simoneApi.simone_activate_network(flags: {})...", flags);

//         // From Extensions PDF, assuming Java wrapper signature is: 
//         // int simone_activate_network(int flags, SimString status_msg)
//         int simoneStatus = this.simoneApi.simone_activate_network(
//             flags,
//             statusMsgOutput
//         );
//         logger.info("simone_activate_network for '{}' returned status: {}", currentNetwork, simoneStatus);

//         String simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
//         String serviceMessage;

//         if (simoneStatus == SimoneConst.simone_status_ok) {
//             serviceMessage = "Network '" + currentNetwork + "' activated successfully.";
//             logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//         } else {
//             serviceMessage = "Failed to activate network '" + currentNetwork + "'.";
//             if (simoneDetailedMessage.isEmpty()) {
//                 simoneDetailedMessage = getSimoneError();
//             }
//             logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//         }

//         return new AdminNetworkOperationResponseDto(
//             simoneStatus,
//             simoneDetailedMessage,
//             serviceMessage
//         );

//     } catch (Throwable t) {
//         logger.error("Unexpected error during simone_activate_network for '{}': {}", currentNetwork, t.getMessage(), t);
//         throw new RuntimeException("Unexpected error activating network: " + t.getMessage(), t);
//     }
// }

//     // Part 19.4: Activate Network
//     // This function (simone_activate_network) from the Extensions PDF takes (flags, status_msg, msg_len).
//     // It likely operates on the currently selected network, or one just created/imported.
//     // We'll need to manage which network is the target.
//     // public AdminNetworkOperationResponseDto activateCurrentNetwork(Integer flags) { ... }

//     /**
//      * Saves the currently selected SIMONE network under a new name using simone_save_network_as.
//      *
//      * @param destinationNetworkName The new name/path for the network.
//      * @param requestedFlags Optional flags, e.g., SimoneConst.SIMONE_FLAG_REPLACE to overwrite an existing network.
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      */
//     public AdminNetworkOperationResponseDto saveCurrentNetworkAs(String destinationNetworkName, Integer requestedFlags) {
//         logger.info("Service: Attempting to save current network as '{}' with flags: {}", 
//             destinationNetworkName, requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);
        
//         // Prerequisites: API must be initialized and a network must be selected to be saved.
//         checkApiReady();
//         String currentNetwork = this.networkService.getCurrentNetwork();
//         if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
//             throw new IllegalStateException("No network selected to save. Please select a network first.");
//         }
//         logger.info("Saving currently selected network '{}' to new name '{}'", currentNetwork, destinationNetworkName);
        
//         if (destinationNetworkName == null || destinationNetworkName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Destination network name cannot be null or empty.");
//         }

//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_save_network_as(destination: \"{}\", flags: {})...", destinationNetworkName, flags);

//             int simoneStatus = this.simoneApi.simone_save_network_as(
//                 destinationNetworkName.trim(),
//                 flags,
//                 statusMsgOutput
//             );
//             logger.info("simone_save_network_as for '{}' returned status: {}", destinationNetworkName, simoneStatus);

//             String simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
//             String serviceMessage;

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + currentNetwork + "' saved as '" + destinationNetworkName + "' successfully.";
//                 logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//             } else {
//                 serviceMessage = "Failed to save network as '" + destinationNetworkName + "'.";
//                 if (simoneDetailedMessage.isEmpty()) {
//                     simoneDetailedMessage = getSimoneError();
//                 }
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_save_network_as to '{}': {}", destinationNetworkName, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error saving network: " + t.getMessage(), t);
//         }
//     }

//     // Part 19.5: Save Network As
//     // public AdminNetworkOperationResponseDto saveCurrentNetworkAs(String destinationNetworkName, Integer flags) { ... }

//     // Part 19.6: Delete Network
//     // public AdminNetworkOperationResponseDto deleteNetwork(String networkName, Integer flags) { ... }


//      /**
//      * Deletes a SIMONE network from the currently configured network directory.
//      * Uses simone_delete_network().
//      *
//      * @param networkName The name of the network to delete.
//      * @param requestedFlags Optional flags (typically SIMONE_NO_FLAG).
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      */
//     public AdminNetworkOperationResponseDto deleteNetwork(String networkName, Integer requestedFlags) {
//         logger.info("Service: Attempting to delete network '{}' with flags: {}", 
//             networkName, requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);
        
//         checkApiReady(); // Ensures API is instantiated and initialized

//         if (networkName == null || networkName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Network name to delete cannot be null or empty.");
//         }
        
//         // Before deleting, check if it's the currently selected network.
//         // If so, we must deselect it first in our other service's cache.
//         String currentNetwork = this.networkService.getCurrentNetwork();
//         if (networkName.trim().equalsIgnoreCase(currentNetwork)) {
//             logger.warn("Attempting to delete the currently selected network ('{}'). Deselecting it first locally.", currentNetwork);
//             // Calling the deselect method from the other service will clear the cache.
//             this.networkService.deselectNetwork(); 
//         }

//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_delete_network(networkName: \"{}\", flags: {})...", networkName, flags);

//             // From Extensions PDF, assuming Java wrapper signature is: 
//             // int simone_delete_network(String network, int flags, SimString status_msg)
//             int simoneStatus = this.simoneApi.simone_delete_network(
//                 networkName.trim(),
//                 flags,
//                 statusMsgOutput
//             );
//             logger.info("simone_delete_network for '{}' returned status: {}", networkName, simoneStatus);

//             String simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
//             String serviceMessage;

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + networkName + "' deleted successfully.";
//                 logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//             } else {
//                 serviceMessage = "Failed to delete network '" + networkName + "'.";
//                 if (simoneDetailedMessage.isEmpty()) {
//                     simoneDetailedMessage = getSimoneError();
//                 }
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_delete_network for '{}': {}", networkName, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error deleting network: " + t.getMessage(), t);
//         }
//     }

//     // Helper to get error message from SIMONE
//     protected String getSimoneError() {
//         if (this.simoneApi != null) {
//             SimString errorMsg = new SimString();
//             this.simoneApi.simone_last_error(errorMsg);
//             String simoneError = errorMsg.getVal();
//             return (simoneError != null) ? simoneError.trim() : "No specific error message from SIMONE.";
//         }
//         return "SIMONE API instance not available to fetch error.";
//     }
// }

// src/main/java/com/gascade/simone/service/SimoneAdminNetworkService.java
package com.gascade.simone.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gascade.simone.dto.AdminNetworkOperationResponseDto;

import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;

/**
 * Serviceklasse für administrative Netzwerkoperationen innerhalb von SIMONE.
 * Beinhaltet das Erstellen, Importieren und Aktivieren von Netzwerken.
 */
@Service
public class SimoneAdminNetworkService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneAdminNetworkService.class);

    private final SimoneApi simoneApi;
    private final boolean isSimoneApiInstantiated;

    private final SimoneLifecycleService lifecycleService;
    private final SimoneNetworkService networkService;

    @Value("${simone.default.network.directory}")
    private String defaultNetworkDirectory;

    @Autowired
    public SimoneAdminNetworkService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
        this.lifecycleService = lifecycleService;
        this.networkService = networkService;

        SimoneApi tempApi = null;
        boolean instantiated = false;

        try {
            tempApi = SimoneApi.getInstance();
            if (tempApi != null) {
                logger.info("SimoneAdminNetworkService: SimoneAPI-Instanz erfolgreich geladen.");
                instantiated = true;
            } else {
                logger.error("SimoneAdminNetworkService: Fehler beim Laden der SimoneAPI-Instanz (null zurückgegeben).");
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("SimoneAdminNetworkService: Kritischer Fehler beim Laden der SimoneAPI (LinkError): {}", ule.getMessage());
        } catch (Throwable t) {
            logger.error("SimoneAdminNetworkService: Unerwarteter Fehler beim Laden der SimoneAPI: {}", t.getMessage(), t);
        }

        this.simoneApi = tempApi;
        this.isSimoneApiInstantiated = instantiated;
    }

    /**
     * Prüft, ob die SimoneAPI geladen und initialisiert wurde.
     * Wirft eine Exception, falls dies nicht der Fall ist.
     */
    private void checkApiReady() {
        if (!isSimoneApiInstantiated || this.simoneApi == null) {
            throw new IllegalStateException("Die SIMONE API ist nicht geladen.");
        }
        if (!lifecycleService.isSimoneEnvironmentInitialized()) {
            throw new IllegalStateException("Die SIMONE-Umgebung ist nicht initialisiert. Bitte zuerst /initialize aufrufen.");
        }
    }

    /**
     * Erstellt ein neues, leeres SIMONE-Netzwerk mit einem gegebenen Namen.
     *
     * @param networkName     Name des zu erstellenden Netzwerks.
     * @param requestedFlags  Optionale Flags, z. B. zum Überschreiben.
     * @return Antwortobjekt mit Statusinformationen.
     */
    public AdminNetworkOperationResponseDto createNetwork(String networkName, Integer requestedFlags) {
        logger.info("Service: Erstelle Netzwerk '{}' mit Flags: {}", networkName, requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);
        checkApiReady();

        if (networkName == null || networkName.trim().isEmpty()) {
            throw new IllegalArgumentException("Netzwerkname darf nicht leer sein.");
        }

        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
        SimString statusMsgOutput = new SimString();

        try {
            logger.debug("Rufe simone_create_network auf mit Name '{}' und Flags: {}", networkName, flags);
            int simoneStatus = this.simoneApi.simone_create_network(networkName.trim(), flags, statusMsgOutput);
            logger.info("simone_create_network für '{}' Rückgabestatus: {}", networkName, simoneStatus);

            String simoneMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
            String message = simoneStatus == SimoneConst.simone_status_ok
                    ? "Netzwerk '" + networkName + "' wurde erfolgreich erstellt."
                    : "Fehler beim Erstellen des Netzwerks '" + networkName + "'.";

            if (simoneStatus == SimoneConst.simone_status_ok) {
                logger.info("{} SIMONE-Nachricht: '{}'", message, simoneMessage);
            } else {
                logger.error("{} SIMONE-Status: {}, Nachricht: '{}'", message, simoneStatus, simoneMessage);
            }

            return new AdminNetworkOperationResponseDto(simoneStatus, simoneMessage, message);

        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler beim Erstellen des Netzwerks '{}': {}", networkName, t.getMessage(), t);
            throw new RuntimeException("Fehler beim Erstellen des Netzwerks: " + t.getMessage(), t);
        }
    }

    /**
     * Importiert eine Netzbeschreibung aus einer Datei.
     * Vor dem Import wird das Standardnetzwerkverzeichnis gesetzt.
     *
     * @param importPath      Pfad zur Importdatei.
     * @param requestedFlags  Optionale Flags für den Import.
     * @return Antwortobjekt mit Statusinformationen.
     */
    public AdminNetworkOperationResponseDto importNetworkDescription(String importPath, Integer requestedFlags) {
        logger.info("Service: Importiere Netzbeschreibung von '{}' mit Flags: {}", importPath, requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);
        checkApiReady();

        if (importPath == null || importPath.trim().isEmpty()) {
            throw new IllegalArgumentException("Importpfad darf nicht leer sein.");
        }

        // Arbeitsverzeichnis setzen
        try {
            logger.info("Setze Netzwerkverzeichnis auf '{}'", defaultNetworkDirectory);
            int changeStatus = this.simoneApi.simone_change_network_dir(defaultNetworkDirectory, SimoneConst.SIMONE_FLAG_MAKE_NETWORK_DIR);
            if (changeStatus != SimoneConst.simone_status_ok) {
                throw new IllegalStateException("Voraussetzung fehlgeschlagen: Netzwerkverzeichnis konnte nicht gesetzt werden. Fehler: " + getSimoneError());
            }
        } catch (Throwable t) {
            logger.error("Fehler beim Setzen des Netzwerkverzeichnisses: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler vor dem Import: " + t.getMessage(), t);
        }

        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
        SimString statusMsgOutput = new SimString();

        try {
            logger.debug("Rufe simone_import_network_description auf für '{}'", importPath);
            int simoneStatus = this.simoneApi.simone_import_network_description(importPath.trim(), flags, statusMsgOutput);
            logger.info("simone_import_network_description Rückgabestatus: {}", simoneStatus);

            String simoneMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
            String message = simoneStatus == SimoneConst.simone_status_ok
                    ? "Netzbeschreibung aus '" + importPath + "' erfolgreich importiert."
                    : "Fehler beim Importieren der Netzbeschreibung aus '" + importPath + "'.";

            if (simoneStatus == SimoneConst.simone_status_ok) {
                logger.info(message + " SIMONE-Nachricht: '{}'", simoneMessage);
            } else {
                if (simoneMessage.isEmpty()) {
                    simoneMessage = getSimoneError();
                }
                logger.error("{} SIMONE-Status: {}, Nachricht: '{}'", message, simoneStatus, simoneMessage);
            }

            return new AdminNetworkOperationResponseDto(simoneStatus, simoneMessage, message);

        } catch (Throwable t) {
            logger.error("Fehler beim Importieren der Netzbeschreibung von '{}': {}", importPath, t.getMessage(), t);
            throw new RuntimeException("Fehler beim Import: " + t.getMessage(), t);
        }
    }

    /**
     * Aktiviert das aktuell ausgewählte Netzwerk.
     *
     * @param requestedFlags Optionale Flags für die Aktivierung.
     * @return Antwortobjekt mit dem Ergebnis der Aktivierung.
     */
    public AdminNetworkOperationResponseDto activateCurrentNetwork(Integer requestedFlags) {
        logger.info("Service: Aktiviere aktuelles Netzwerk mit Flags: {}", requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);
        checkApiReady();

        String currentNetwork = this.networkService.getCurrentNetwork();
        if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
            throw new IllegalStateException("Kein Netzwerk ausgewählt. Bitte zuerst ein Netzwerk auswählen.");
        }

        logger.info("Aktiviere Netzwerk: '{}'", currentNetwork);
        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
        SimString statusMsgOutput = new SimString();

        try {
            logger.debug("Rufe simone_activate_network auf mit Flags: {}", flags);
            int simoneStatus = this.simoneApi.simone_activate_network(flags, statusMsgOutput);
            logger.info("simone_activate_network für '{}' Rückgabestatus: {}", currentNetwork, simoneStatus);

            String simoneMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
            String message = simoneStatus == SimoneConst.simone_status_ok
                    ? "Netzwerk '" + currentNetwork + "' wurde erfolgreich aktiviert."
                    : "Fehler beim Aktivieren des Netzwerks '" + currentNetwork + "'.";

            if (simoneStatus != SimoneConst.simone_status_ok && simoneMessage.isEmpty()) {
                simoneMessage = getSimoneError();
            }

            if (simoneStatus == SimoneConst.simone_status_ok) {
                logger.info(message + " SIMONE-Nachricht: '{}'", simoneMessage);
            } else {
                logger.error("{} SIMONE-Status: {}, Nachricht: '{}'", message, simoneStatus, simoneMessage);
            }

            return new AdminNetworkOperationResponseDto(simoneStatus, simoneMessage, message);

        } catch (Throwable t) {
            logger.error("Fehler beim Aktivieren des Netzwerks '{}': {}", currentNetwork, t.getMessage(), t);
            throw new RuntimeException("Fehler bei der Aktivierung: " + t.getMessage(), t);
        }
    }

    /**
     * Gibt die letzte detaillierte Fehlermeldung der SIMONE API zurück.
     *
     * @return Fehlermeldung als String.
     */
    protected String getSimoneError() {
        if (this.simoneApi != null) {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String msg = errorMsg.getVal();
            return (msg != null && !msg.trim().isEmpty()) ? msg.trim() : "Keine spezifische Fehlermeldung von SIMONE.";
        }
        return "SIMONE API-Instanz war nicht verfügbar, um den Fehler abzurufen.";
    }
	
	/**
 * Speichert das aktuell ausgewählte SIMONE-Netzwerk unter einem neuen Namen.
 * Verwendet die Funktion {@code simone_save_network_as()}.
 *
 * @param destinationNetworkName Der neue Netzwerkname oder Pfad.
 * @param requestedFlags Optionale Flags, z. B. {@code SIMONE_FLAG_REPLACE}.
 * @return Antwortobjekt mit dem Status der Operation.
 */
public AdminNetworkOperationResponseDto saveCurrentNetworkAs(String destinationNetworkName, Integer requestedFlags) {
    logger.info("Service: Versuche, aktuelles Netzwerk unter dem Namen '{}' zu speichern. Flags: {}", 
        destinationNetworkName, requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);

    checkApiReady();

    String currentNetwork = this.networkService.getCurrentNetwork();
    if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
        throw new IllegalStateException("Es ist kein Netzwerk ausgewählt. Bitte wählen Sie zuerst ein Netzwerk aus.");
    }

    if (destinationNetworkName == null || destinationNetworkName.trim().isEmpty()) {
        throw new IllegalArgumentException("Der Zielnetzwerkname darf nicht leer sein.");
    }

    logger.info("Speichere Netzwerk '{}' als '{}'", currentNetwork, destinationNetworkName);

    int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
    SimString statusMsgOutput = new SimString();

    try {
        logger.debug("Rufe simone_save_network_as auf mit Zielnetzwerk '{}' und Flags: {}", destinationNetworkName, flags);

        int simoneStatus = this.simoneApi.simone_save_network_as(
            destinationNetworkName.trim(),
            flags,
            statusMsgOutput
        );

        logger.info("simone_save_network_as für '{}' Rückgabestatus: {}", destinationNetworkName, simoneStatus);

        String simoneMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
        String serviceMessage;

        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Netzwerk '" + currentNetwork + "' wurde erfolgreich unter dem Namen '" + destinationNetworkName + "' gespeichert.";
            logger.info("{} SIMONE-Nachricht: '{}'", serviceMessage, simoneMessage);
        } else {
            serviceMessage = "Fehler beim Speichern des Netzwerks unter dem Namen '" + destinationNetworkName + "'.";
            if (simoneMessage.isEmpty()) {
                simoneMessage = getSimoneError();
            }
            logger.error("{} SIMONE-Status: {}, Nachricht: '{}'", serviceMessage, simoneStatus, simoneMessage);
        }

        return new AdminNetworkOperationResponseDto(simoneStatus, simoneMessage, serviceMessage);

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler beim Speichern des Netzwerks unter '{}': {}", destinationNetworkName, t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler beim Speichern des Netzwerks: " + t.getMessage(), t);
    }
}
/**
 * Löscht ein SIMONE-Netzwerk aus dem aktuellen Netzwerkverzeichnis.
 * Verwendet die Funktion {@code simone_delete_network()}.
 *
 * @param networkName Name des Netzwerks, das gelöscht werden soll.
 * @param requestedFlags Optionale Flags (z. B. {@code SIMONE_NO_FLAG}).
 * @return Antwortobjekt mit dem Status der Operation.
 */
public AdminNetworkOperationResponseDto deleteNetwork(String networkName, Integer requestedFlags) {
    logger.info("Service: Versuche, Netzwerk '{}' zu löschen. Flags: {}", 
        networkName, requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);

    checkApiReady();

    if (networkName == null || networkName.trim().isEmpty()) {
        throw new IllegalArgumentException("Der Netzwerkname zum Löschen darf nicht leer sein.");
    }

    String currentNetwork = this.networkService.getCurrentNetwork();
    if (networkName.trim().equalsIgnoreCase(currentNetwork)) {
        logger.warn("Das zu löschende Netzwerk '{}' ist aktuell ausgewählt. Es wird zuerst abgewählt.", currentNetwork);
        this.networkService.deselectNetwork();
    }

    int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
    SimString statusMsgOutput = new SimString();

    try {
        logger.debug("Rufe simone_delete_network auf mit Netzwerk '{}' und Flags: {}", networkName, flags);

        int simoneStatus = this.simoneApi.simone_delete_network(
            networkName.trim(),
            flags,
            statusMsgOutput
        );

        logger.info("simone_delete_network für '{}' Rückgabestatus: {}", networkName, simoneStatus);

        String simoneMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "";
        String serviceMessage;

        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Netzwerk '" + networkName + "' wurde erfolgreich gelöscht.";
            logger.info("{} SIMONE-Nachricht: '{}'", serviceMessage, simoneMessage);
        } else {
            serviceMessage = "Fehler beim Löschen des Netzwerks '" + networkName + "'.";
            if (simoneMessage.isEmpty()) {
                simoneMessage = getSimoneError();
            }
            logger.error("{} SIMONE-Status: {}, Nachricht: '{}'", serviceMessage, simoneStatus, simoneMessage);
        }

        return new AdminNetworkOperationResponseDto(simoneStatus, simoneMessage, serviceMessage);

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler beim Löschen des Netzwerks '{}': {}", networkName, t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler beim Löschen des Netzwerks: " + t.getMessage(), t);
    }
}

	
}

