// // src/main/java/com/gascade/simone/service/SimoneArchiveService.java
// package com.gascade.simone.service;

// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.util.ArrayList;
// import java.util.Collections;
// import java.util.List;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired; // Import all our new DTOs
// import org.springframework.stereotype.Service;

// import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
// import com.gascade.simone.dto.ArchiveNetworkRequestDto;
// import com.gascade.simone.dto.ArchiveOperationResponseDto;
// import com.gascade.simone.dto.ArchivedNetworkItemDto;
// import com.gascade.simone.dto.DeleteArchivedNetworkRequestDto;
// import com.gascade.simone.dto.ExtractNetworkRequestDto;

// import de.liwacom.simone.SimInt;
// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst;


// @Service
// public class SimoneArchiveService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneArchiveService.class);
//     private final SimoneApi simoneApi;
//     private final boolean isSimoneApiInstantiated;
//     private final SimoneLifecycleService lifecycleService;
//     private final SimoneNetworkService networkService; // Dependency for getting current network

//      @Autowired
//     public SimoneArchiveService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
//         this.lifecycleService = lifecycleService;
//         this.networkService = networkService; // Assign the injected service
        
//         SimoneApi tempApi = null;
//         boolean instantiated = false;
//         try {
//             tempApi = SimoneApi.getInstance();
//             if (tempApi != null) {
//                 logger.info("SimoneArchiveService: SimoneAPI instance obtained successfully.");
//                 instantiated = true;
//             } else {
//                 logger.error("SimoneArchiveService: Failed to get SimoneAPI instance.");
//             }
//         } catch (Throwable t) {
//             logger.error("SimoneArchiveService: CRITICAL - Error obtaining SimoneAPI instance: {}", t.getMessage(), t);
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
    
//     // --- STUBS FOR UPCOMING METHODS ---


// // Replace the existing listArchivedNetworks method in SimoneAdminNetworkService.java

//     public List<ArchivedNetworkItemDto> listArchivedNetworks(String archiveFilePath, Integer requestedFlags) {
//         logger.info("Service: Listing networks in archive file: '{}'", archiveFilePath);
//         checkApiReady();

//         if (archiveFilePath == null || archiveFilePath.trim().isEmpty()) {
//             throw new IllegalArgumentException("Archive file path cannot be null or empty.");
//         }
        
//         // --- NEW LOGIC: Normalize path AND replace separators for Windows ---
//         Path path = Paths.get(archiveFilePath.trim()).toAbsolutePath();
//         String cleanAbsolutePath = path.toString();
//         // On Windows, Java might use backslashes, but let's be explicit.
//         if (System.getProperty("os.name").toLowerCase().contains("win")) {
//             cleanAbsolutePath = cleanAbsolutePath.replace("/", "\\");
//         }
//         logger.info("Using cleaned path with native separators for SIMONE API: {}", cleanAbsolutePath);
        
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         SimString archiveCommentOutput = new SimString();
//         List<ArchivedNetworkItemDto> results = new ArrayList<>();
        
//         try {
//             int startStatus = this.simoneApi.simone_net_archive_list_start(
//                 cleanAbsolutePath,
//                 archiveCommentOutput,
//                 flags
//             );
//             logger.info("simone_net_archive_list_start status: {}", startStatus);

//             if (startStatus != SimoneConst.simone_status_ok) {
//                  if (startStatus == SimoneConst.simone_status_not_found) {
//                     logger.info("No networks found in the archive '{}'.", archiveFilePath);
//                     return Collections.emptyList();
//                  }
//                 throw new RuntimeException("Failed to start archive listing. SIMONE Error: " + getSimoneError());
//             }

//             // ... (rest of the looping logic for simone_net_archive_list_next remains the same) ...
//              SimString networkOut = new SimString();
//             SimString netTimeOut = new SimString();
//             SimString netCommentOut = new SimString();
//             SimInt archiveFlagsOut = new SimInt();
//             while (true) {
//                 int nextStatus = this.simoneApi.simone_net_archive_list_next(
//                     networkOut, netTimeOut, netCommentOut, archiveFlagsOut);
//                 if (nextStatus == SimoneConst.simone_status_ok) {
//                     Integer archiveTime = null;
//                     try {
//                         if (netTimeOut.getVal() != null && !netTimeOut.getVal().isEmpty()) {
//                             archiveTime = Integer.parseInt(netTimeOut.getVal());
//                         }
//                     } catch (NumberFormatException e) {
//                         logger.warn("Could not parse archive time string '{}' to integer.", netTimeOut.getVal());
//                     }
//                     results.add(new ArchivedNetworkItemDto(
//                         networkOut.getVal(), null, netCommentOut.getVal(), archiveTime, archiveFlagsOut.getVal()));
//                 } else if (nextStatus == SimoneConst.simone_status_not_found) {
//                     logger.info("Finished listing archived networks. Total found: {}", results.size());
//                     break;
//                 } else {
//                     logger.error("Error during archive listing (simone_net_archive_list_next). Status: {}", nextStatus);
//                     break; 
//                 }
//             }


//         } catch (Throwable t) {
//             logger.error("Unexpected error during archive network listing for file '{}': {}", archiveFilePath, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error listing archived networks: " + t.getMessage(), t);
//         }
//         return results;
//     }
//     /**
//      * Helper method to retrieve the last detailed error message from the SIMONE API.
//      * @return The last error string from SIMONE, or a default message if not available.
//      */
//     protected String getSimoneError() {
//         if (this.simoneApi != null) {
//             SimString errorMsg = new SimString();
//             // Call the simone_last_error function to populate the SimString object
//             this.simoneApi.simone_last_error(errorMsg);
//             String simoneError = errorMsg.getVal();
//             // Return the trimmed error message, or a default string if it's null/empty
//             return (simoneError != null && !simoneError.trim().isEmpty()) 
//                    ? simoneError.trim() 
//                    : "No specific error message was provided by SIMONE.";
//         }
//         return "SIMONE API instance was not available to fetch the last error.";
//     }
// // Replace the existing createArchive method in SimoneAdminNetworkService.java

//     /**
//      * Creates a new, empty SIMONE archive file using simone_archive_create.
//      *
//      * @param archiveFilePath The full, absolute path for the new archive file to be created.
//      * @param comment An optional comment to store with the new archive.
//      * @param requestedFlags Optional flags, e.g., SimoneConst.SIMONE_FLAG_REPLACE.
//      * @return ArchiveOperationResponseDto containing the status of the operation.
//      */
//     public ArchiveOperationResponseDto createArchive(String archiveFilePath, String comment, Integer requestedFlags) {
//         logger.info("Service: Attempting to create archive at '{}' with comment '{}'", 
//             archiveFilePath, comment == null ? "none" : comment);
        
//         checkApiReady();

//         if (archiveFilePath == null || archiveFilePath.trim().isEmpty()) {
//             throw new IllegalArgumentException("Archive file path cannot be null or empty.");
//         }
        
//         String cleanAbsolutePath = Paths.get(archiveFilePath.trim()).normalize().toString();
        
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_archive_create(path: \"{}\", comment: \"{}\", flags: {})...", 
//                 cleanAbsolutePath, comment, flags);

//             int simoneStatus = this.simoneApi.simone_archive_create(
//                 cleanAbsolutePath,
//                 comment, 
//                 flags
//             );
//             logger.info("simone_archive_create for '{}' returned status: {}", cleanAbsolutePath, simoneStatus);

//             String serviceMessage;
//             String simoneDetailedMessage = ""; 

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Archive '" + cleanAbsolutePath + "' created successfully.";
//                 simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "Success (no detailed message).";
//                 logger.info(serviceMessage + " SIMONE Message: '{}'", simoneDetailedMessage);
//             } else {
//                 serviceMessage = "Failed to create archive '" + cleanAbsolutePath + "'.";
//                 simoneDetailedMessage = getSimoneError(); // Use helper to call simone_last_error()
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             // CORRECTED: Return the correct DTO type
//             return new ArchiveOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_archive_create for '{}': {}", archiveFilePath, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error creating archive: " + t.getMessage(), t);
//         }
//     }
// /**
//      * Archives the currently selected SIMONE network into a specified archive file.
//      * Uses simone_archive_network().
//      *
//      * @param requestDto DTO containing all parameters for the operation.
//      * @return ArchiveOperationResponseDto containing the status of the operation.
//      */
//     public ArchiveOperationResponseDto archiveNetwork(ArchiveNetworkRequestDto requestDto) {
//         String networkNameToArchive = requestDto.networkName();
//         String archiveFilePath = requestDto.archiveFilePath();
//         logger.info("Service: Attempting to archive network '{}' into archive '{}'", 
//             networkNameToArchive, archiveFilePath);

//         // This operation requires the API to be initialized and a network to be selected.
//         checkApiReady();
//         String currentSelectedNetwork = this.networkService.getCurrentNetwork();
//         if (currentSelectedNetwork == null) {
//             throw new IllegalStateException("No network is currently selected to be archived.");
//         }

//         // Sanity check: ensure the user thinks they are archiving the network that is actually selected.
//         if (!currentSelectedNetwork.equalsIgnoreCase(networkNameToArchive.trim())) {
//             throw new IllegalArgumentException(
//                 "Conflict: The requested network to archive '" + networkNameToArchive + 
//                 "' does not match the currently selected network '" + currentSelectedNetwork + "'."
//             );
//         }

//         // Prepare parameters for the API call
//         int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;
//         String scenarioList = requestDto.scenarioList();
//         String comment = requestDto.comment();
//         String password = requestDto.password();
//         SimString statusMsgOutput = new SimString();

//         try {
//             logger.debug("Calling simoneApi.simone_archive_network(archive: \"{}\", network: \"{}\", scenarios: \"{}\", flags: {})...", 
//                 archiveFilePath, networkNameToArchive, scenarioList, flags);

//             // From Javadoc: public int simone_archive_network(String archive_path, String scenario_list, 
//             //                                                 String comment, int flags, String password)
//             // Note: This function operates on the currently selected network, so 'networkNameToArchive' is for confirmation/logging.
//             int simoneStatus = this.simoneApi.simone_archive_network(
//                 archiveFilePath.trim(),
//                 scenarioList,
//                 comment,
//                 flags,
//                 password
//             );
//             logger.info("simone_archive_network for '{}' returned status: {}", networkNameToArchive, simoneStatus);
            
//             // This function does not seem to have a SimString status_msg output based on your Javadoc.
//             // We will rely on simone_last_error if the status is not OK.
//             String simoneDetailedMessage = "";
//             String serviceMessage;

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + networkNameToArchive + "' archived successfully into '" + archiveFilePath + "'.";
//                 logger.info(serviceMessage);
//             } else {
//                 serviceMessage = "Failed to archive network '" + networkNameToArchive + "'.";
//                 simoneDetailedMessage = getSimoneError(); // Use helper to call simone_last_error()
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             // The DTO for response needs to be defined. Let's use ArchiveOperationResponseDto for now.
//             return new ArchiveOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_archive_network for '{}': {}", networkNameToArchive, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error archiving network: " + t.getMessage(), t);
//         }
//     }
  
    
//     /**
//      * Extracts a network from a SIMONE archive file to the current network directory.
//      * Uses simone_extract_network().
//      *
//      * @param requestDto DTO containing all parameters for the operation.
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      */
//     public AdminNetworkOperationResponseDto extractNetwork(ExtractNetworkRequestDto requestDto) {
//         logger.info("Service: Attempting to extract network '{}' from archive '{}'", 
//             requestDto.networkNameToExtract(), requestDto.archiveFilePath());
        
//         checkApiReady();

//         // Parameter validation
//         if (requestDto.archiveFilePath() == null || requestDto.archiveFilePath().trim().isEmpty() ||
//             requestDto.networkNameToExtract() == null || requestDto.networkNameToExtract().trim().isEmpty()) {
//             throw new IllegalArgumentException("Archive file path and network name to extract cannot be null or empty.");
//         }
        
//         String cleanArchivePath = Paths.get(requestDto.archiveFilePath().trim()).normalize().toString();
        
//         // Use the source network name as the destination name if not provided
//         String destinationNetwork = (requestDto.destinationNetworkName() != null && !requestDto.destinationNetworkName().trim().isEmpty()) 
//                                     ? requestDto.destinationNetworkName().trim() 
//                                     : requestDto.networkNameToExtract().trim();
        
//         // Prepare optional parameters
//         String networkVersionTime = requestDto.networkVersionTime(); // Can be null
//         String password = requestDto.password(); // Can be null
//         int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;

//         try {
//             logger.debug("Calling simoneApi.simone_extract_network(archive: \"{}\", network: \"{}\", time: \"{}\", destination: \"{}\", flags: {})...",
//                 cleanArchivePath, requestDto.networkNameToExtract(), networkVersionTime, destinationNetwork, flags);

//             int simoneStatus = this.simoneApi.simone_extract_network(
//                 cleanArchivePath,
//                 requestDto.networkNameToExtract().trim(),
//                 networkVersionTime,
//                 destinationNetwork,
//                 flags,
//                 password
//             );
//             logger.info("simone_extract_network for '{}' returned status: {}", requestDto.networkNameToExtract(), simoneStatus);

//             String serviceMessage;
//             String simoneDetailedMessage = "";

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + requestDto.networkNameToExtract() + "' extracted successfully to '" + destinationNetwork + "'.";
//                 logger.info(serviceMessage);
//             } else {
//                 serviceMessage = "Failed to extract network '" + requestDto.networkNameToExtract() + "'.";
//                 simoneDetailedMessage = getSimoneError();
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_extract_network for '{}': {}", requestDto.networkNameToExtract(), t.getMessage(), t);
//             throw new RuntimeException("Unexpected error extracting network: " + t.getMessage(), t);
//         }
//     }

// /**
//      * Deletes a specific network version from within a SIMONE archive file.
//      * Uses simone_net_archive_delete().
//      *
//      * @param requestDto DTO containing all parameters for the operation.
//      * @return AdminNetworkOperationResponseDto containing the status of the operation.
//      */
//     public AdminNetworkOperationResponseDto deleteArchivedNetwork(DeleteArchivedNetworkRequestDto requestDto) {
//         logger.info("Service: Attempting to delete network '{}' from archive '{}'", 
//             requestDto.networkNameToDelete(), requestDto.archiveFilePath());
        
//         checkApiReady();

//         // Parameter validation
//         if (requestDto.archiveFilePath() == null || requestDto.archiveFilePath().trim().isEmpty() ||
//             requestDto.networkNameToDelete() == null || requestDto.networkNameToDelete().trim().isEmpty()) {
//             throw new IllegalArgumentException("Archive file path and network name to delete cannot be null or empty.");
//         }
        
//         String cleanArchivePath = Paths.get(requestDto.archiveFilePath().trim()).normalize().toString();
        
//         // Prepare optional parameters
//         String networkVersionTime = requestDto.networkVersionTime(); // Can be null, which means DELETE OLDEST
//         int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;

//         try {
//             logger.debug("Calling simoneApi.simone_net_archive_delete(archive: \"{}\", network: \"{}\", time: \"{}\", flags: {})...",
//                 cleanArchivePath, requestDto.networkNameToDelete(), networkVersionTime, flags);

//             // From Javadoc: public int simone_net_archive_delete(String archive_path, String network, String net_time, int flags)
//             int simoneStatus = this.simoneApi.simone_net_archive_delete(
//                 cleanArchivePath,
//                 requestDto.networkNameToDelete().trim(),
//                 networkVersionTime,
//                 flags
//             );
//             logger.info("simone_net_archive_delete for '{}' in '{}' returned status: {}", 
//                 requestDto.networkNameToDelete(), cleanArchivePath, simoneStatus);

//             String serviceMessage;
//             String simoneDetailedMessage = "";

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Network '" + requestDto.networkNameToDelete() + "' deleted from archive successfully.";
//                 logger.info(serviceMessage);
//             } else {
//                 serviceMessage = "Failed to delete network '" + requestDto.networkNameToDelete() + "' from archive.";
//                 simoneDetailedMessage = getSimoneError();
//                 logger.error("{}. SIMONE Status: {}, SIMONE Message: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
//             }

//             return new AdminNetworkOperationResponseDto(
//                 simoneStatus,
//                 simoneDetailedMessage,
//                 serviceMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_net_archive_delete for network '{}': {}", 
//                 requestDto.networkNameToDelete(), t.getMessage(), t);
//             throw new RuntimeException("Unexpected error deleting archived network: " + t.getMessage(), t);
//         }
//     }
// }



// src/main/java/com/gascade/simone/service/SimoneArchiveService.java
package com.gascade.simone.service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; // Import all our new DTOs
import org.springframework.stereotype.Service;

import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
import com.gascade.simone.dto.ArchiveNetworkRequestDto;
import com.gascade.simone.dto.ArchiveOperationResponseDto;
import com.gascade.simone.dto.ArchivedNetworkItemDto;
import com.gascade.simone.dto.DeleteArchivedNetworkRequestDto;
import com.gascade.simone.dto.ExtractNetworkRequestDto;

import de.liwacom.simone.SimInt;
import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;


/**
 * Serviceklasse für Archivoperationen in der SIMONE-API.
 * Unterstützt das Erstellen und Auflisten von Netzarchiven.
 */
@Service
public class SimoneArchiveService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneArchiveService.class);

    private final SimoneApi simoneApi;
    private final boolean isSimoneApiInstantiated;
    private final SimoneLifecycleService lifecycleService;
    private final SimoneNetworkService networkService;

    /**
     * Konstruktor – Initialisiert die Simone-API-Instanz und injiziert Abhängigkeiten.
     */
    @Autowired
    public SimoneArchiveService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
        this.lifecycleService = lifecycleService;
        this.networkService = networkService;

        SimoneApi tempApi = null;
        boolean instantiated = false;
        try {
            tempApi = SimoneApi.getInstance();
            if (tempApi != null) {
                logger.info("SimoneArchiveService: SimoneAPI-Instanz erfolgreich geladen.");
                instantiated = true;
            } else {
                logger.error("SimoneArchiveService: Fehler beim Abrufen der SimoneAPI-Instanz (null zurückgegeben).");
            }
        } catch (Throwable t) {
            logger.error("SimoneArchiveService: KRITISCH – Fehler beim Laden der SimoneAPI-Instanz: {}", t.getMessage(), t);
        }

        this.simoneApi = tempApi;
        this.isSimoneApiInstantiated = instantiated;
    }

    /**
     * Prüft, ob die API bereit ist.
     * Wird vor jeder Operation aufgerufen.
     */
    private void checkApiReady() {
        if (!isSimoneApiInstantiated || this.simoneApi == null) {
            throw new IllegalStateException("SIMONE-API-Komponente nicht geladen.");
        }
        if (!lifecycleService.isSimoneEnvironmentInitialized()) {
            throw new IllegalStateException("SIMONE-Umgebung nicht initialisiert. /initialize muss vorher aufgerufen werden.");
        }
    }

    /**
     * Listet alle Netzwerke auf, die in einer gegebenen Archivdatei gespeichert sind.
     *
     * @param archiveFilePath Pfad zur Archivdatei
     * @param requestedFlags Optional gesetzte Flags (z. B. NONE, REPLACE, ...)
     * @return Liste der gefundenen Netzwerke
     */
    public List<ArchivedNetworkItemDto> listArchivedNetworks(String archiveFilePath, Integer requestedFlags) {
        logger.info("Service: Auflisten der Netzwerke im Archiv: '{}'", archiveFilePath);
        checkApiReady();

        if (archiveFilePath == null || archiveFilePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Pfad zur Archivdatei darf nicht leer sein.");
        }

        Path path = Paths.get(archiveFilePath.trim()).toAbsolutePath();
        String cleanAbsolutePath = path.toString();

        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            cleanAbsolutePath = cleanAbsolutePath.replace("/", "\\");
        }
        logger.info("Bereinigter Pfad für SIMONE: {}", cleanAbsolutePath);

        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
        SimString archiveCommentOutput = new SimString();
        List<ArchivedNetworkItemDto> results = new ArrayList<>();

        try {
            int startStatus = this.simoneApi.simone_net_archive_list_start(
                cleanAbsolutePath,
                archiveCommentOutput,
                flags
            );
            logger.info("Status von simone_net_archive_list_start: {}", startStatus);

            if (startStatus != SimoneConst.simone_status_ok) {
                if (startStatus == SimoneConst.simone_status_not_found) {
                    logger.info("Keine Netzwerke im Archiv '{}' gefunden.", archiveFilePath);
                    return Collections.emptyList();
                }
                throw new RuntimeException("Fehler beim Starten der Archivauflistung: " + getSimoneError());
            }

            SimString networkOut = new SimString();
            SimString netTimeOut = new SimString();
            SimString netCommentOut = new SimString();
            SimInt archiveFlagsOut = new SimInt();

            while (true) {
                int nextStatus = this.simoneApi.simone_net_archive_list_next(
                    networkOut, netTimeOut, netCommentOut, archiveFlagsOut);
                if (nextStatus == SimoneConst.simone_status_ok) {
                    Integer archiveTime = null;
                    try {
                        if (netTimeOut.getVal() != null && !netTimeOut.getVal().isEmpty()) {
                            archiveTime = Integer.parseInt(netTimeOut.getVal());
                        }
                    } catch (NumberFormatException e) {
                        logger.warn("Konnte Archivzeit '{}' nicht als Integer parsen.", netTimeOut.getVal());
                    }

                    results.add(new ArchivedNetworkItemDto(
                        networkOut.getVal(),
                        null,
                        netCommentOut.getVal(),
                        archiveTime,
                        archiveFlagsOut.getVal()));
                } else if (nextStatus == SimoneConst.simone_status_not_found) {
                    logger.info("Archivnetzwerk-Auflistung abgeschlossen. Gefundene Einträge: {}", results.size());
                    break;
                } else {
                    logger.error("Fehler bei simone_net_archive_list_next. Status: {}", nextStatus);
                    break;
                }
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler beim Auflisten archivierter Netzwerke: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler beim Auflisten archivierter Netzwerke: " + t.getMessage(), t);
        }

        return results;
    }

    /**
     * Erstellt eine neue Archivdatei mit optionalem Kommentar.
     *
     * @param archiveFilePath Absoluter Pfad der zu erstellenden Archivdatei
     * @param comment Optionaler Kommentar
     * @param requestedFlags Optional gesetzte Flags (z. B. REPLACE)
     * @return Antwortobjekt mit Status und Meldung
     */
    public ArchiveOperationResponseDto createArchive(String archiveFilePath, String comment, Integer requestedFlags) {
        logger.info("Service: Versuche Archiv zu erstellen unter '{}'. Kommentar: '{}'", 
            archiveFilePath, comment == null ? "kein Kommentar" : comment);

        checkApiReady();

        if (archiveFilePath == null || archiveFilePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Pfad zur Archivdatei darf nicht leer sein.");
        }

        String cleanAbsolutePath = Paths.get(archiveFilePath.trim()).normalize().toString();
        int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;
        SimString statusMsgOutput = new SimString();

        try {
            logger.debug("Aufruf: simone_archive_create(\"{}\", \"{}\", {})", cleanAbsolutePath, comment, flags);

            int simoneStatus = this.simoneApi.simone_archive_create(
                cleanAbsolutePath,
                comment,
                flags
            );
            logger.info("simone_archive_create gab Status {} zurück.", simoneStatus);

            String serviceMessage;
            String simoneDetailedMessage;

            if (simoneStatus == SimoneConst.simone_status_ok) {
                serviceMessage = "Archiv '" + cleanAbsolutePath + "' wurde erfolgreich erstellt.";
                simoneDetailedMessage = (statusMsgOutput.getVal() != null) ? statusMsgOutput.getVal().trim() : "Erfolg (keine Detailnachricht).";
                logger.info(serviceMessage + " SIMONE: '{}'", simoneDetailedMessage);
            } else {
                serviceMessage = "Archiv '" + cleanAbsolutePath + "' konnte nicht erstellt werden.";
                simoneDetailedMessage = getSimoneError();
                logger.error("{}. Status: {}, SIMONE: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
            }

            return new ArchiveOperationResponseDto(
                simoneStatus,
                simoneDetailedMessage,
                serviceMessage
            );

        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei simone_archive_create für '{}': {}", archiveFilePath, t.getMessage(), t);
            throw new RuntimeException("Fehler beim Erstellen des Archivs: " + t.getMessage(), t);
        }
    }

    /**
     * Hilfsmethode zur Abfrage der letzten Fehlermeldung von SIMONE.
     *
     * @return Detail-Fehlermeldung oder Standardmeldung
     */
    protected String getSimoneError() {
        if (this.simoneApi != null) {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String simoneError = errorMsg.getVal();
            return (simoneError != null && !simoneError.trim().isEmpty())
                    ? simoneError.trim()
                    : "SIMONE hat keine spezifische Fehlermeldung geliefert.";
        }
        return "SIMONE API war nicht verfügbar zur Fehlerabfrage.";
    }
/**
 * Archiviert das aktuell ausgewählte Netzwerk in die angegebene Archivdatei.
 *
 * @param requestDto Übergabeobjekt mit Netzwerkname, Archivpfad, Kommentar, Szenarien, Flags usw.
 * @return Ergebnisobjekt mit Status, detaillierter Fehlermeldung und Benutzertext
 */
public ArchiveOperationResponseDto archiveNetwork(ArchiveNetworkRequestDto requestDto) {
    String networkNameToArchive = requestDto.networkName();
    String archiveFilePath = requestDto.archiveFilePath();
    logger.info("Service: Archivieren des Netzwerks '{}' in Archiv '{}'", networkNameToArchive, archiveFilePath);

    checkApiReady();
    String currentSelectedNetwork = this.networkService.getCurrentNetwork();

    if (currentSelectedNetwork == null) {
        throw new IllegalStateException("Kein Netzwerk ausgewählt, das archiviert werden kann.");
    }

    if (!currentSelectedNetwork.equalsIgnoreCase(networkNameToArchive.trim())) {
        throw new IllegalArgumentException("Konflikt: Netzwerk '" + networkNameToArchive + 
            "' stimmt nicht mit dem aktuell ausgewählten Netzwerk '" + currentSelectedNetwork + "' überein.");
    }

    int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;
    String scenarioList = requestDto.scenarioList();
    String comment = requestDto.comment();
    String password = requestDto.password();

    try {
        logger.debug("Aufruf: simone_archive_network(\"{}\", \"{}\", \"{}\", {}, <passwort>)",
            archiveFilePath, scenarioList, comment, flags);

        int simoneStatus = this.simoneApi.simone_archive_network(
            archiveFilePath.trim(),
            scenarioList,
            comment,
            flags,
            password
        );
        logger.info("simone_archive_network für '{}' lieferte Status: {}", networkNameToArchive, simoneStatus);

        String serviceMessage;
        String simoneDetailedMessage = "";

        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Netzwerk '" + networkNameToArchive + "' wurde erfolgreich archiviert.";
            logger.info(serviceMessage);
        } else {
            serviceMessage = "Archivierung von Netzwerk '" + networkNameToArchive + "' fehlgeschlagen.";
            simoneDetailedMessage = getSimoneError();
            logger.error("{}. SIMONE-Status: {}, Nachricht: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
        }

        return new ArchiveOperationResponseDto(simoneStatus, simoneDetailedMessage, serviceMessage);

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler beim Archivieren von Netzwerk '{}': {}", networkNameToArchive, t.getMessage(), t);
        throw new RuntimeException("Fehler beim Archivieren: " + t.getMessage(), t);
    }
}

/**
 * Extrahiert ein Netzwerk aus einer Archivdatei und speichert es im aktuellen Netzverzeichnis.
 *
 * @param requestDto DTO mit Pfad zur Archivdatei, Netzwerkname, Zielname, Version, Flags usw.
 * @return Antwortobjekt mit Status und Detailinformationen
 */
public AdminNetworkOperationResponseDto extractNetwork(ExtractNetworkRequestDto requestDto) {
    logger.info("Service: Extrahiere Netzwerk '{}' aus Archiv '{}'",
        requestDto.networkNameToExtract(), requestDto.archiveFilePath());

    checkApiReady();

    if (requestDto.archiveFilePath() == null || requestDto.archiveFilePath().trim().isEmpty() ||
        requestDto.networkNameToExtract() == null || requestDto.networkNameToExtract().trim().isEmpty()) {
        throw new IllegalArgumentException("Pfad und Netzwerkname dürfen nicht leer sein.");
    }

    String cleanArchivePath = Paths.get(requestDto.archiveFilePath().trim()).normalize().toString();
    String destinationNetwork = (requestDto.destinationNetworkName() != null && !requestDto.destinationNetworkName().trim().isEmpty())
        ? requestDto.destinationNetworkName().trim()
        : requestDto.networkNameToExtract().trim();

    String versionTime = requestDto.networkVersionTime();
    String password = requestDto.password();
    int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;

    try {
        logger.debug("Aufruf: simone_extract_network(\"{}\", \"{}\", \"{}\", \"{}\", {}, <passwort>)",
            cleanArchivePath, requestDto.networkNameToExtract(), versionTime, destinationNetwork, flags);

        int simoneStatus = this.simoneApi.simone_extract_network(
            cleanArchivePath,
            requestDto.networkNameToExtract().trim(),
            versionTime,
            destinationNetwork,
            flags,
            password
        );
        logger.info("simone_extract_network lieferte Status: {}", simoneStatus);

        String serviceMessage;
        String simoneDetailedMessage = "";

        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Netzwerk '" + requestDto.networkNameToExtract() + "' erfolgreich extrahiert.";
            logger.info(serviceMessage);
        } else {
            serviceMessage = "Extraktion von Netzwerk '" + requestDto.networkNameToExtract() + "' fehlgeschlagen.";
            simoneDetailedMessage = getSimoneError();
            logger.error("{}. SIMONE-Status: {}, Nachricht: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
        }

        return new AdminNetworkOperationResponseDto(simoneStatus, simoneDetailedMessage, serviceMessage);

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei der Extraktion von Netzwerk '{}': {}", 
            requestDto.networkNameToExtract(), t.getMessage(), t);
        throw new RuntimeException("Fehler bei der Extraktion: " + t.getMessage(), t);
    }
}

/**
 * Löscht eine spezifische Netzwerkversion aus einer Archivdatei.
 *
 * @param requestDto DTO mit Pfad, Netzwerkname, Version und optionalen Flags
 * @return Antwortobjekt mit Status und Ergebnisnachricht
 */
public AdminNetworkOperationResponseDto deleteArchivedNetwork(DeleteArchivedNetworkRequestDto requestDto) {
    logger.info("Service: Lösche Netzwerk '{}' aus Archiv '{}'",
        requestDto.networkNameToDelete(), requestDto.archiveFilePath());

    checkApiReady();

    if (requestDto.archiveFilePath() == null || requestDto.archiveFilePath().trim().isEmpty() ||
        requestDto.networkNameToDelete() == null || requestDto.networkNameToDelete().trim().isEmpty()) {
        throw new IllegalArgumentException("Pfad und Netzwerkname dürfen nicht leer sein.");
    }

    String cleanArchivePath = Paths.get(requestDto.archiveFilePath().trim()).normalize().toString();
    String versionTime = requestDto.networkVersionTime();
    int flags = (requestDto.flags() != null) ? requestDto.flags() : SimoneConst.SIMONE_NO_FLAG;

    try {
        logger.debug("Aufruf: simone_net_archive_delete(\"{}\", \"{}\", \"{}\", {})",
            cleanArchivePath, requestDto.networkNameToDelete(), versionTime, flags);

        int simoneStatus = this.simoneApi.simone_net_archive_delete(
            cleanArchivePath,
            requestDto.networkNameToDelete().trim(),
            versionTime,
            flags
        );
        logger.info("simone_net_archive_delete lieferte Status: {}", simoneStatus);

        String serviceMessage;
        String simoneDetailedMessage = "";

        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Netzwerk '" + requestDto.networkNameToDelete() + "' wurde erfolgreich gelöscht.";
            logger.info(serviceMessage);
        } else {
            serviceMessage = "Löschen von Netzwerk '" + requestDto.networkNameToDelete() + "' fehlgeschlagen.";
            simoneDetailedMessage = getSimoneError();
            logger.error("{}. SIMONE-Status: {}, Nachricht: '{}'", serviceMessage, simoneStatus, simoneDetailedMessage);
        }

        return new AdminNetworkOperationResponseDto(simoneStatus, simoneDetailedMessage, serviceMessage);

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler beim Löschen von Netzwerk '{}': {}", 
            requestDto.networkNameToDelete(), t.getMessage(), t);
        throw new RuntimeException("Fehler beim Löschen: " + t.getMessage(), t);
    }
    }
}
