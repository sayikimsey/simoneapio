// // src/main/java/com/gascade/simone/controller/SimoneArchiveController.java
// package com.gascade.simone.controller;

// import java.util.Collections; // Import all our DTOs
// import java.util.List;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
// import com.gascade.simone.dto.ArchiveNetworkRequestDto;
// import com.gascade.simone.dto.ArchiveOperationResponseDto;
// import com.gascade.simone.dto.ArchiveRequestDto;
// import com.gascade.simone.dto.ArchivedNetworkItemDto;
// import com.gascade.simone.dto.ArchivedNetworkListResponseDto;
// import com.gascade.simone.dto.CreateArchiveRequestDto;
// import com.gascade.simone.dto.DeleteArchivedNetworkRequestDto;
// import com.gascade.simone.dto.ExtractNetworkRequestDto;
// import com.gascade.simone.service.SimoneArchiveService;

// import de.liwacom.simone.SimoneConst;
// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/simone-api-java/v1/admin/archives") // Base path for all archive operations
// public class SimoneArchiveController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneArchiveController.class);
//     private final SimoneArchiveService simoneArchiveService;

//     @Autowired
//     public SimoneArchiveController(SimoneArchiveService simoneArchiveService) {
//         this.simoneArchiveService = simoneArchiveService;
//         logger.info("SimoneArchiveController initialized.");
//     }

//     // --- STUBS FOR UPCOMING ENDPOINTS ---

// @PostMapping("/list")
//     public ResponseEntity<ArchivedNetworkListResponseDto> listArchivedNetworks(@Valid @RequestBody ArchiveRequestDto request) {
//         logger.info("Controller: POST /admin/archives/list received for path: '{}'", request.archiveFilePath());
//         try {
//             List<ArchivedNetworkItemDto> networks = simoneArchiveService.listArchivedNetworks(request.archiveFilePath(), request.flags());
//             if (networks.isEmpty()) {
//                 return ResponseEntity.ok(new ArchivedNetworkListResponseDto("No networks found in the specified archive.", Collections.emptyList()));
//             }
//             return ResponseEntity.ok(new ArchivedNetworkListResponseDto("Archived networks retrieved successfully.", networks));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for listing archived networks - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ArchivedNetworkListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (IllegalArgumentException e) {
//             logger.warn("Controller: Invalid argument for listing archived networks - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new ArchivedNetworkListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: SIMONE API error listing archived networks: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ArchivedNetworkListResponseDto("Failed to list archived networks: " + e.getMessage(), Collections.emptyList()));
//         }
//     }

//  /**
//      * Endpoint to create a new, empty SIMONE archive file.
//      * This is an admin-only operation.
//      * @param request DTO containing the archiveFilePath, optional comment, and optional flags.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/create")
//     public ResponseEntity<ArchiveOperationResponseDto> createArchive(@Valid @RequestBody CreateArchiveRequestDto request) {
//         logger.info("Controller: POST /admin/archives/create received for path: '{}'", request.archiveFilePath());
//         try {
//             // Corrected to use the injected 'simoneArchiveService' instance
//             ArchiveOperationResponseDto responseDto = 
//                 simoneArchiveService.createArchive(request.archiveFilePath(), request.comment(), request.flags());
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.status(HttpStatus.CREATED).body(responseDto); // 201 Created is appropriate
//             } else {
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar) {
//                     // This status can mean the path/name already exists without the REPLACE flag
//                     return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 Conflict
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for creating archive - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Precondition failed to create archive."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for creating archive - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Bad request to create archive."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error creating archive: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

// // --- IMPLEMENTATION for Part 20.3 ---
//     @PostMapping("/add-network")
//     public ResponseEntity<ArchiveOperationResponseDto> archiveNetwork(@Valid @RequestBody ArchiveNetworkRequestDto request) {
//         logger.info("Controller: POST /admin/archives/add-network received for network: '{}' into archive: '{}'", 
//             request.networkName(), request.archiveFilePath());
//         try {
//             ArchiveOperationResponseDto responseDto = simoneArchiveService.archiveNetwork(request);
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // Map specific SIMONE errors to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for archiving network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Precondition failed to archive network."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for archiving network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Bad request to archive network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error archiving network: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

// /**
//      * Endpoint to extract a network from a SIMONE archive file.
//      * This is an admin-only operation.
//      * @param request DTO containing archive path, network to extract, and other options.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/extract-network")
//     public ResponseEntity<AdminNetworkOperationResponseDto> extractNetwork(@Valid @RequestBody ExtractNetworkRequestDto request) {
//         logger.info("Controller: POST /admin/archives/extract-network received for network: '{}' from archive: '{}'", 
//             request.networkNameToExtract(), request.archiveFilePath());
//         try {
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneArchiveService.extractNetwork(request);
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // Map specific SIMONE errors to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto); // Archive or network in archive not found
//                 }
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar && 
//                     responseDto.simoneDetailedMessage().contains("already exists")) {
//                     return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 if destination network exists
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for extracting network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to extract network."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for extracting network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Bad request to extract network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error extracting network: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

// /**
//      * Endpoint to delete a specific network version from within an archive file.
//      * This is an admin-only operation.
//      * Note: Using POST instead of DELETE to pass a complex request body easily.
//      * @param request DTO containing archive path, network to delete, and other options.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/delete-network")
//     public ResponseEntity<AdminNetworkOperationResponseDto> deleteArchivedNetwork(@Valid @RequestBody DeleteArchivedNetworkRequestDto request) {
//         logger.info("Controller: POST /admin/archives/delete-network received for network: '{}' from archive: '{}'", 
//             request.networkNameToDelete(), request.archiveFilePath());
//         try {
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneArchiveService.deleteArchivedNetwork(request);
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // Map specific SIMONE errors to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto); // Archive or network in archive not found
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for deleting archived network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to delete archived network."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for deleting archived network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Bad request to delete archived network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error deleting archived network: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }
// }

// src/main/java/com/gascade/simone/controller/SimoneArchiveController.java
package com.gascade.simone.controller;

import java.util.Collections; // Import all our DTOs
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
import com.gascade.simone.dto.ArchiveNetworkRequestDto;
import com.gascade.simone.dto.ArchiveOperationResponseDto;
import com.gascade.simone.dto.ArchiveRequestDto;
import com.gascade.simone.dto.ArchivedNetworkItemDto;
import com.gascade.simone.dto.ArchivedNetworkListResponseDto;
import com.gascade.simone.dto.CreateArchiveRequestDto;
import com.gascade.simone.dto.DeleteArchivedNetworkRequestDto;
import com.gascade.simone.dto.ExtractNetworkRequestDto;
import com.gascade.simone.service.SimoneArchiveService;

import de.liwacom.simone.SimoneConst;
import jakarta.validation.Valid;

/**
 * REST-Controller zur Verwaltung von SIMONE-Archivdateien.
 * Beinhaltet Endpunkte zum Erstellen, Auflisten, Archivieren, Extrahieren und Löschen von Netzwerken.
 */
@RestController
@RequestMapping("/v1/admin/archives")
public class SimoneArchiveController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneArchiveController.class);
    private final SimoneArchiveService simoneArchiveService;

    @Autowired
    public SimoneArchiveController(SimoneArchiveService simoneArchiveService) {
        this.simoneArchiveService = simoneArchiveService;
        logger.info("SimoneArchiveController wurde initialisiert.");
    }

    /**
     * Gibt eine Liste aller archivierten Netzwerke in einer angegebenen Archivdatei zurück.
     *
     * @param request Anfrage mit Pfad zur Archivdatei und optionalen Flags.
     * @return Liste der gefundenen Netzwerke oder entsprechende Fehlermeldung.
     */
    @PostMapping("/list")
    public ResponseEntity<ArchivedNetworkListResponseDto> listArchivedNetworks(@Valid @RequestBody ArchiveRequestDto request) {
        logger.info("Controller: POST /admin/archives/list empfangen für Pfad: '{}'", request.archiveFilePath());
        try {
            List<ArchivedNetworkItemDto> networks = simoneArchiveService.listArchivedNetworks(request.archiveFilePath(), request.flags());
            if (networks.isEmpty()) {
                return ResponseEntity.ok(new ArchivedNetworkListResponseDto("Keine Netzwerke im Archiv gefunden.", Collections.emptyList()));
            }
            return ResponseEntity.ok(new ArchivedNetworkListResponseDto("Archivierte Netzwerke erfolgreich geladen.", networks));
        } catch (IllegalStateException e) {
            logger.warn("Voraussetzung zum Auflisten nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ArchivedNetworkListResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültige Anfrage zum Auflisten: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ArchivedNetworkListResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (RuntimeException e) {
            logger.error("Fehler beim Auflisten der archivierten Netzwerke: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArchivedNetworkListResponseDto("Fehler beim Abrufen der archivierten Netzwerke: " + e.getMessage(), Collections.emptyList()));
        }
    }

    /**
     * Erstellt eine neue, leere SIMONE-Archivdatei.
     *
     * @param request Anfrage mit Archivpfad, optionalem Kommentar und optionalen Flags.
     * @return Status der Archiv-Erstellung.
     */
    @PostMapping("/create")
    public ResponseEntity<ArchiveOperationResponseDto> createArchive(@Valid @RequestBody CreateArchiveRequestDto request) {
        logger.info("Controller: POST /admin/archives/create empfangen für Pfad: '{}'", request.archiveFilePath());
        try {
            ArchiveOperationResponseDto responseDto =
                    simoneArchiveService.createArchive(request.archiveFilePath(), request.comment(), request.flags());

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // Pfad existiert evtl. schon
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Voraussetzung zur Erstellung nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Voraussetzung zur Erstellung des Archivs nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültiger Parameter zur Archiv-Erstellung: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Ungültige Anfrage zur Archiv-Erstellung."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler bei der Archiv-Erstellung: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler bei der Archiv-Erstellung."));
        }
    }

    /**
     * Archiviert das aktuell ausgewählte Netzwerk in das angegebene Archiv.
     *
     * @param request Anfrage mit Netzwerkname, Archivpfad, Kommentar, Szenarien usw.
     * @return Status der Archivierung.
     */
    @PostMapping("/add-network")
    public ResponseEntity<ArchiveOperationResponseDto> archiveNetwork(@Valid @RequestBody ArchiveNetworkRequestDto request) {
        logger.info("Controller: POST /admin/archives/add-network empfangen für Netzwerk '{}' in Archiv '{}'",
                request.networkName(), request.archiveFilePath());
        try {
            ArchiveOperationResponseDto responseDto = simoneArchiveService.archiveNetwork(request);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Voraussetzung zur Archivierung nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Voraussetzung zur Archivierung nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültige Anfrage zur Archivierung: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Ungültige Anfrage zur Archivierung."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler bei der Archivierung: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArchiveOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler bei der Archivierung."));
        }
    }

    /**
     * Extrahiert ein Netzwerk aus einer Archivdatei in das aktuelle Netzverzeichnis.
     *
     * @param request Anfrage mit Archivpfad, Netzwerkname, Zielname, Version usw.
     * @return Status der Extraktion.
     */
    @PostMapping("/extract-network")
    public ResponseEntity<AdminNetworkOperationResponseDto> extractNetwork(@Valid @RequestBody ExtractNetworkRequestDto request) {
        logger.info("Controller: POST /admin/archives/extract-network empfangen für Netzwerk '{}' aus Archiv '{}'",
                request.networkNameToExtract(), request.archiveFilePath());
        try {
            AdminNetworkOperationResponseDto responseDto = simoneArchiveService.extractNetwork(request);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar &&
                    responseDto.simoneDetailedMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Voraussetzung zur Extraktion nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Voraussetzung zur Extraktion nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültige Anfrage zur Extraktion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Ungültige Anfrage zur Extraktion."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler bei der Extraktion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler bei der Extraktion."));
        }
    }

    /**
     * Löscht eine bestimmte Version eines Netzwerks aus einer Archivdatei.
     *
     * @param request Anfrage mit Pfad zur Archivdatei, Netzwerkname und optionaler Version.
     * @return Status der Löschoperation.
     */
    @PostMapping("/delete-network")
    public ResponseEntity<AdminNetworkOperationResponseDto> deleteArchivedNetwork(@Valid @RequestBody DeleteArchivedNetworkRequestDto request) {
        logger.info("Controller: POST /admin/archives/delete-network empfangen für Netzwerk '{}' aus Archiv '{}'",
                request.networkNameToDelete(), request.archiveFilePath());
        try {
            AdminNetworkOperationResponseDto responseDto = simoneArchiveService.deleteArchivedNetwork(request);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Voraussetzung zum Löschen nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Voraussetzung zum Löschen nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültige Anfrage zum Löschen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Ungültige Anfrage zum Löschen."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Löschen: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler beim Löschen des Netzwerks."));
        }
    }
}
