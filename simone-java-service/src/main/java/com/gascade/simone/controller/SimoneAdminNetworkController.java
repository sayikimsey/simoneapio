// // src/main/java/com/gascade/simone/controller/SimoneAdminNetworkController.java
// package com.gascade.simone.controller;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
// import com.gascade.simone.dto.FilePathRequestDto;
// import com.gascade.simone.dto.FlagsRequestDto;
// import com.gascade.simone.dto.NetworkNameRequestDto;
// import com.gascade.simone.service.SimoneAdminNetworkService;

// import de.liwacom.simone.SimoneConst;
// import jakarta.validation.Valid;


// @RestController
// @RequestMapping("/simone-api-java/v1/admin/networks") // Base path for admin network operations
// public class SimoneAdminNetworkController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneAdminNetworkController.class);
//     private final SimoneAdminNetworkService simoneAdminNetworkService;

//     @Autowired
//     public SimoneAdminNetworkController(SimoneAdminNetworkService simoneAdminNetworkService) {
//         this.simoneAdminNetworkService = simoneAdminNetworkService;
//         logger.info("SimoneAdminNetworkController initialized.");
//     }

//     /**
//      * Endpoint to create a new, empty SIMONE network.
//      * Accessible only by users with admin role (enforced by Node.js backend proxying to this base path).
//      * @param request DTO containing the networkName and optional flags.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping
//     public ResponseEntity<AdminNetworkOperationResponseDto> createNetwork(@Valid @RequestBody NetworkNameRequestDto request) {
//         logger.info("Controller: POST /admin/networks (create) received for network: '{}'", request.networkName());
//         try {
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneAdminNetworkService.createNetwork(request.networkName(), request.flags());
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.status(HttpStatus.CREATED).body(responseDto); // Return 201 Created on success
//             } else {
//                 // Map SIMONE error statuses to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar) { // e.g., name already exists without replace flag
//                     return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 Conflict
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for creating network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to create network."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for creating network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Bad request to create network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error creating network: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }


// // Add this method to: src/main/java/com/gascade/simone/controller/SimoneAdminNetworkController.java

//     /**
//      * Endpoint to import a network description from a file.
//      * This is an admin-only operation.
//      * @param request DTO containing the file path and optional flags.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/import-description")
//     public ResponseEntity<AdminNetworkOperationResponseDto> importNetworkDescription(@Valid @RequestBody FilePathRequestDto request) {
//         logger.info("Controller: POST /admin/networks/import-description received for path: '{}'", request.path());
//         try {
//             AdminNetworkOperationResponseDto responseDto =
//                 simoneAdminNetworkService.importNetworkDescription(request.path(), request.flags());

//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto); // Return 200 OK on success
//             } else {
//                 // Map specific SIMONE errors to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto); // 404 if import file not found
//                 }
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_badseq) {
//                     return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 for sequence errors
//                 }
//                 // For other errors like bad parameters, topology errors, or "no rights"
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for importing network description - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to import network description."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for importing network description - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Bad request to import network description."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error importing network description: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

//     // TODO: Part 19.3: Import Network Description
//     // @PostMapping("/import-description")
//     // public ResponseEntity<AdminNetworkOperationResponseDto> importNetworkDescription(@RequestBody FilePathRequestDto request) { ... }




//     // Part 19.4: Activate Network
//     // @PostMapping("/current/activate") // Assuming it activates the currently selected network
//     // public ResponseEntity<AdminNetworkOperationResponseDto> activateCurrentNetwork(@RequestBody(required = false) FlagsRequestDto request) { ... } 
//     // We might need a simple FlagsRequestDto { Integer flags; } or just take flags as @RequestParam
//     /**
//      * Endpoint to activate the currently selected SIMONE network.
//      * This is an admin-only operation.
//      * @param request Optional DTO containing flags for the activation.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/current/activate")
//     public ResponseEntity<AdminNetworkOperationResponseDto> activateCurrentNetwork(@RequestBody(required = false) FlagsRequestDto request) {
//         logger.info("Controller: POST /admin/networks/current/activate received.");
//         try {
//             Integer flags = (request != null) ? request.flags() : null;
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneAdminNetworkService.activateCurrentNetwork(flags);
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // Map specific errors if needed, otherwise use a general error status
//                 logger.warn("Controller: activateCurrentNetwork failed with SIMONE status: {}. Message: {}", 
//                             responseDto.simoneStatus(), responseDto.simoneDetailedMessage());
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for activating network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to activate network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error activating network: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

    
//     // Part 19.5: Save Network As
//     // @PostMapping("/current/save-as")
//     // public ResponseEntity<AdminNetworkOperationResponseDto> saveCurrentNetworkAs(@RequestBody SaveNetworkAsRequestDto request) { ... }

//     /**
//      * Endpoint to save the currently selected network under a new name.
//      * This is an admin-only operation.
//      * @param request DTO containing the new networkName and optional flags.
//      * @return ResponseEntity with the operation status.
//      */
//     @PostMapping("/current/save-as")
//     public ResponseEntity<AdminNetworkOperationResponseDto> saveCurrentNetworkAs(@Valid @RequestBody NetworkNameRequestDto request) {
//         logger.info("Controller: POST /admin/networks/current/save-as received to save as: '{}'", request.networkName());
//         try {
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneAdminNetworkService.saveCurrentNetworkAs(request.networkName(), request.flags());
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.status(HttpStatus.CREATED).body(responseDto); // 201 Created is appropriate for a new resource
//             } else {
//                 // Map SIMONE error statuses to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar) { // e.g., destination name exists without replace flag
//                     return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 Conflict
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for save-as - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to save network."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for save-as - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Bad request to save network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error during save-as: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }


//     // Part 19.6: Delete Network
//     // @DeleteMapping("/{networkName}")
//     // public ResponseEntity<AdminNetworkOperationResponseDto> deleteNetwork(@PathVariable String networkName, @RequestParam(required = false) Integer flags) { ... }

//     /**
//      * Endpoint to delete a SIMONE network.
//      * This is an admin-only operation.
//      * @param networkName The name of the network to delete (from URL path).
//      * @param flags Optional flags for the delete operation.
//      * @return ResponseEntity with the operation status.
//      */
//     @DeleteMapping("/{networkName}")
//     public ResponseEntity<AdminNetworkOperationResponseDto> deleteNetwork(
//             @PathVariable String networkName,
//             @RequestParam(required = false) Integer flags) {
        
//         logger.info("Controller: DELETE /admin/networks/{} received.", networkName);
        
//         try {
//             AdminNetworkOperationResponseDto responseDto = 
//                 simoneAdminNetworkService.deleteNetwork(networkName, flags);
            
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto); // 200 OK is fine for a successful delete
//             } else {
//                 // Map SIMONE error statuses to appropriate HTTP statuses
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto); // 404 if network to delete doesn't exist
//                 }
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_locked) {
//                      return ResponseEntity.status(HttpStatus.CONFLICT).body(responseDto); // 409 if locked by another process
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for deleting network - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Precondition failed to delete network."));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error deleting network '{}': {}", networkName, e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "An unexpected error occurred."));
//         }
//     }

//     // Example of how a generic error handler might look in the controller for these operations
//     private ResponseEntity<AdminNetworkOperationResponseDto> handleAdminNetworkOperationException(Exception e, String operationName, String targetName) {
//         logger.error("Controller: Error during admin network operation '{}' for target '{}': {}", operationName, targetName, e.getMessage(), e);
//         String message = "Failed to " + operationName + (targetName != null ? " for '" + targetName + "'" : "") + ": ";
//         int status = -1; // Default error status

//         if (e instanceof IllegalStateException) {
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new AdminNetworkOperationResponseDto(status, e.getMessage(), message + e.getMessage()));
//         } else if (e instanceof IllegalArgumentException) {
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new AdminNetworkOperationResponseDto(status, e.getMessage(), message + e.getMessage()));
//         } else if (e instanceof RuntimeException && e.getMessage().contains("SIMONE Error:")) {
//             // Assuming service layer's RuntimeExceptions for SIMONE errors contain "SIMONE Error:"
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // Or BAD_GATEWAY if it's purely SIMONE's fault
//                 .body(new AdminNetworkOperationResponseDto(status, e.getMessage(), message + "SIMONE API failure."));
//         }
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .body(new AdminNetworkOperationResponseDto(status, e.getMessage(), message + "An unexpected error occurred."));
//     }
// }

// src/main/java/com/gascade/simone/controller/SimoneAdminNetworkController.java
package com.gascade.simone.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.AdminNetworkOperationResponseDto;
import com.gascade.simone.dto.FilePathRequestDto;
import com.gascade.simone.dto.FlagsRequestDto;
import com.gascade.simone.dto.NetworkNameRequestDto;
import com.gascade.simone.service.SimoneAdminNetworkService;

import de.liwacom.simone.SimoneConst;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/v1/admin/networks")
public class SimoneAdminNetworkController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneAdminNetworkController.class);
    private final SimoneAdminNetworkService simoneAdminNetworkService;

    @Autowired
    public SimoneAdminNetworkController(SimoneAdminNetworkService simoneAdminNetworkService) {
        this.simoneAdminNetworkService = simoneAdminNetworkService;
        logger.info("SimoneAdminNetworkController initialisiert.");
    }

    /**
     * Erstellt ein neues, leeres SIMONE-Netzwerk.
     *
     * @param request Netzwerkname und optionale Flags.
     * @return Antwort mit dem Status der Erstellung.
     */
    @PostMapping
    public ResponseEntity<AdminNetworkOperationResponseDto> createNetwork(@Valid @RequestBody NetworkNameRequestDto request) {
        logger.info("Controller: POST /admin/networks empfangen. Netzwerk: '{}'", request.networkName());
        try {
            AdminNetworkOperationResponseDto response = simoneAdminNetworkService.createNetwork(request.networkName(), request.flags());

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_badpar) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IllegalStateException e) {
            logger.warn("Vorbedingung zum Erstellen des Netzwerks nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Vorbedingung zum Erstellen des Netzwerks nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültiger Parameter beim Erstellen des Netzwerks: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Ungültige Eingabe."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Erstellen des Netzwerks: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler beim Erstellen des Netzwerks."));
        }
    }

    /**
     * Importiert eine Netzbeschreibung aus einer Datei.
     *
     * @param request Pfad zur Importdatei und optionale Flags.
     * @return Antwort mit dem Status der Operation.
     */
    @PostMapping("/import-description")
    public ResponseEntity<AdminNetworkOperationResponseDto> importNetworkDescription(@Valid @RequestBody FilePathRequestDto request) {
        logger.info("Controller: POST /admin/networks/import-description empfangen. Pfad: '{}'", request.path());
        try {
            AdminNetworkOperationResponseDto response = simoneAdminNetworkService.importNetworkDescription(request.path(), request.flags());

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_nofile) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_badseq) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Vorbedingung für Import nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Vorbedingung für Import nicht erfüllt."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültiger Pfad beim Importieren: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Ungültiger Pfad."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Importieren der Netzbeschreibung: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler beim Import."));
        }
    }

    /**
     * Aktiviert das aktuell ausgewählte Netzwerk.
     *
     * @param request Optional: Flags für die Aktivierung.
     * @return Antwort mit dem Status der Operation.
     */
    @PostMapping("/current/activate")
    public ResponseEntity<AdminNetworkOperationResponseDto> activateCurrentNetwork(@RequestBody(required = false) FlagsRequestDto request) {
        logger.info("Controller: POST /admin/networks/current/activate empfangen.");
        try {
            Integer flags = (request != null) ? request.flags() : null;
            AdminNetworkOperationResponseDto response = simoneAdminNetworkService.activateCurrentNetwork(flags);

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(response);
            }
            logger.warn("Aktivierung fehlgeschlagen. SIMONE-Status: {} Nachricht: {}", response.simoneStatus(), response.simoneDetailedMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Vorbedingung für Aktivierung nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Aktivierung fehlgeschlagen."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler bei der Aktivierung: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler bei der Aktivierung."));
        }
    }

    /**
     * Speichert das aktuell ausgewählte Netzwerk unter einem neuen Namen.
     *
     * @param request Neuer Netzwerkname und optionale Flags.
     * @return Antwort mit dem Status der Operation.
     */
    @PostMapping("/current/save-as")
    public ResponseEntity<AdminNetworkOperationResponseDto> saveCurrentNetworkAs(@Valid @RequestBody NetworkNameRequestDto request) {
        logger.info("Controller: POST /admin/networks/current/save-as empfangen. Neuer Name: '{}'", request.networkName());
        try {
            AdminNetworkOperationResponseDto response = simoneAdminNetworkService.saveCurrentNetworkAs(request.networkName(), request.flags());

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_badpar) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Vorbedingung für Speichern unter neuem Namen nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Netzwerk konnte nicht gespeichert werden."));
        } catch (IllegalArgumentException e) {
            logger.warn("Ungültige Eingabe beim Speichern unter neuem Namen: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Ungültiger Netzwerkname."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Speichern unter neuem Namen: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler beim Speichern."));
        }
    }

    /**
     * Löscht ein vorhandenes SIMONE-Netzwerk.
     *
     * @param networkName Name des Netzwerks (Pfadvariable).
     * @param flags Optional: Flags für das Löschen.
     * @return Antwort mit dem Status der Operation.
     */
    @DeleteMapping("/{networkName}")
    public ResponseEntity<AdminNetworkOperationResponseDto> deleteNetwork(
            @PathVariable String networkName,
            @RequestParam(required = false) Integer flags) {

        logger.info("Controller: DELETE /admin/networks/{} empfangen.", networkName);
        try {
            AdminNetworkOperationResponseDto response = simoneAdminNetworkService.deleteNetwork(networkName, flags);

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_nofile) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_locked) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Vorbedingung für Löschen nicht erfüllt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Netzwerk konnte nicht gelöscht werden."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Löschen von Netzwerk '{}': {}", networkName, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AdminNetworkOperationResponseDto(-1, e.getMessage(), "Unerwarteter Fehler beim Löschen."));
        }
    }
}
