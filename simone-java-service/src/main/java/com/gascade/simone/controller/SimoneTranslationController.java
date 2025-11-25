// // src/main/java/com/gascade/simone/controller/SimoneTranslationController.java
// package com.gascade.simone.controller;

// import java.util.Collections;
// import java.util.List;
// import java.util.Map;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.RunTypeDto;
// import com.gascade.simone.dto.RunTypeListResponseDto;
// import com.gascade.simone.dto.ValidExtensionsDto;
// import com.gascade.simone.dto.VarIdBatchRequestDto;
// import com.gascade.simone.dto.VarIdBatchResponseDto;
// import com.gascade.simone.dto.VarIdRequestDto;
// import com.gascade.simone.dto.VarIdResponseDto;
// import com.gascade.simone.service.SimoneTranslationService;

// import de.liwacom.simone.SimoneConst;

// @RestController
// @RequestMapping("/simone-api-java/v1/translate")
// public class SimoneTranslationController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneTranslationController.class);
//     private final SimoneTranslationService simoneTranslationService;

//     @Autowired
//     public SimoneTranslationController(SimoneTranslationService simoneTranslationService) {
//         this.simoneTranslationService = simoneTranslationService;
//         logger.info("SimoneTranslationController initialized.");
//     }

//     // In src/main/java/com/gascade/simone/controller/SimoneTranslationController.java

// // In src/main/java/com/gascade/simone/controller/SimoneTranslationController.java

// @PostMapping("/varid")
// public ResponseEntity<VarIdResponseDto> translateVariableNameToIds(@RequestBody VarIdRequestDto requestDto) {
//     logger.info("Controller: POST /translate/varid received for variableName: '{}' in network '{}'",
//         requestDto.getVariableName(), requestDto.getNetworkName());
//     try {
//         VarIdResponseDto responseDto = simoneTranslationService.getVariableIds(requestDto.getNetworkName(), requestDto.getVariableName());
        
//         if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//             return ResponseEntity.ok(responseDto);
//         } else {
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//         }
//     } catch (Exception e) {
//         logger.error("Controller: Error translating varid for '{}': {}", requestDto.getVariableName(), e.getMessage());
        
//         // --- KORREKTUR: Der letzte Parameter (networkName) wurde entfernt, um dem DTO-Konstruktor zu entsprechen ---
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .body(new VarIdResponseDto(
//                 requestDto.getVariableName(), 
//                 -1, 
//                 -1, 
//                 SimoneConst.simone_status_exception, // Verwenden Sie einen passenden Fehlerstatus
//                 e.getMessage()
//             ));
//     }
// }

//     @GetMapping("/extid")
//     // CORRECTED RETURN TYPE: Changed to ResponseEntity<Map<String, Object>> to support error messages
//     public ResponseEntity<Map<String, Object>> getExtensionId(
//             @RequestParam(name = "name") String extensionName,
//             @RequestParam(required = false) Integer flags) {
                
//         logger.info("Controller: GET /translate/extid received for extensionName: '{}'", extensionName);
//         try {
//             int extId = simoneTranslationService.getExtensionId(extensionName, flags);
            
//             if (extId >= 0) { // Valid IDs are 0 or greater
//                 // This creates a Map<String, Integer>, which is compatible with Map<String, Object>
//                 return ResponseEntity.ok(Map.of("extId", extId));
//             } else {
//                 // This creates a Map<String, Object> because values have different types (int, String)
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                                      .body(Map.of("extId", -1, "error", "Extension name not found or invalid."));
//             }
//         } catch (Exception e) {
//             logger.error("Controller: Error getting extension ID for '{}': {}", extensionName, e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                                  .body(Map.of("extId", -1, "error", "An internal server error occurred."));
//         }
//     }
//     /**
//      * GET /v1/translations/runtypes
//      * Endpoint to fetch the available SIMONE run types for scenario creation.
//      *
//      * @return A ResponseEntity containing the list of run types.
//      */
//     @GetMapping("/runtypes")
//     public ResponseEntity<RunTypeListResponseDto> getRunTypes() {
//         List<RunTypeDto> runTypes = simoneTranslationService.getRunTypes();
//         return ResponseEntity.ok(new RunTypeListResponseDto(runTypes));
//     }

//     @PostMapping("/varids")
// public ResponseEntity<VarIdBatchResponseDto> translateVarIds(@RequestBody VarIdBatchRequestDto request) {
//     logger.info("Controller: POST /translate/varids received for network '{}' with {} variables.",
//         request.getNetworkName(), request.getVariableNames().size());

//     VarIdBatchResponseDto response = simoneTranslationService.getVariableIdsBatch(
//         request.getNetworkName(),
//         request.getVariableNames()
//     );
//     return ResponseEntity.ok(response);
// }


//  /**
//      * Retrieves a list of valid extensions for a given SIMONE object within a specific network.
//      * @param networkName The name of the network to select.
//      * @param objectName The name of the object to check.
//      * @return A DTO containing the list of valid extensions.
//      */
//     @GetMapping("/networks/{networkName}/extensions/{objectName}") // This line is corrected
//     public ResponseEntity<ValidExtensionsDto> getValidExtensions(
//         @PathVariable String networkName,
//         @PathVariable String objectName) {
        
//         try {
//             List<String> extensions = simoneTranslationService.getValidExtensions(networkName, objectName);
//             return ResponseEntity.ok(new ValidExtensionsDto(extensions));
//         } catch (IllegalStateException e) {
//             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ValidExtensionsDto(Collections.emptyList()));
//         }
//     }
// }
package com.gascade.simone.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.RunTypeDto;
import com.gascade.simone.dto.RunTypeListResponseDto;
import com.gascade.simone.dto.ValidExtensionsDto;
import com.gascade.simone.dto.VarIdBatchRequestDto;
import com.gascade.simone.dto.VarIdBatchResponseDto;
import com.gascade.simone.dto.VarIdRequestDto;
import com.gascade.simone.dto.VarIdResponseDto;
import com.gascade.simone.service.SimoneTranslationService;

import de.liwacom.simone.SimoneConst;
import jakarta.validation.Valid;

/**
 * REST-Controller für Übersetzungs-Endpunkte der SIMONE-API.
 * Stellt Funktionalitäten zur Umwandlung von Namen in IDs und zum Abruf von Metadaten bereit.
 */
@RestController
@RequestMapping("/v1/translate")
public class SimoneTranslationController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneTranslationController.class);
    private final SimoneTranslationService simoneTranslationService;

    @Autowired
    public SimoneTranslationController(SimoneTranslationService simoneTranslationService) {
        this.simoneTranslationService = simoneTranslationService;
        logger.info("SimoneTranslationController initialisiert.");
    }

    /**
     * Endpunkt zur Übersetzung eines einzelnen Variablennamens in seine Objekt- und Extension-IDs.
     *
     * @param requestDto DTO mit dem zu übersetzenden Variablennamen und dem Netzwerknamen.
     * @return Eine {@link ResponseEntity} mit dem {@link VarIdResponseDto}, das die IDs oder Fehlerinformationen enthält.
     */
    @PostMapping("/varid")
    public ResponseEntity<VarIdResponseDto> translateVariableNameToIds(@Valid @RequestBody VarIdRequestDto requestDto) {
        logger.info("Controller: POST /translate/varid erhalten für Variablenname: '{}' im Netzwerk '{}'",
                requestDto.getVariableName(), requestDto.getNetworkName());
        try {
            VarIdResponseDto responseDto = simoneTranslationService.getVariableIds(requestDto.getNetworkName(), requestDto.getVariableName());

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Übersetzung von varid für '{}': {}", requestDto.getVariableName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new VarIdResponseDto(
                            requestDto.getVariableName(),
                            -1,
                            -1,
                            SimoneConst.simone_status_exception,
                            e.getMessage()
                    ));
        }
    }

    /**
     * Endpunkt zur Übersetzung mehrerer Variablennamen in ihre IDs (Stapelverarbeitung).
     *
     * @param request DTO mit dem Netzwerknamen und einer Liste von Variablennamen.
     * @return Eine {@link ResponseEntity} mit dem {@link VarIdBatchResponseDto}, das die Ergebnisse der Stapelverarbeitung enthält.
     */
    @PostMapping("/varids")
    public ResponseEntity<VarIdBatchResponseDto> translateVarIds(@Valid @RequestBody VarIdBatchRequestDto request) {
        logger.info("Controller: POST /translate/varids erhalten für Netzwerk '{}' mit {} Variablen.",
                request.getNetworkName(), request.getVariableNames().size());
        try {
            VarIdBatchResponseDto response = simoneTranslationService.getVariableIdsBatch(
                    request.getNetworkName(),
                    request.getVariableNames()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Stapelübersetzung von varid: {}", e.getMessage(), e);
            // Best Practice: Im Fehlerfall ein leeres DTO mit einer Fehlermeldung zurückgeben.
            VarIdBatchResponseDto errorResponse = new VarIdBatchResponseDto(Collections.emptyList());
            // Hier könnte eine allgemeine Fehlermeldung hinzugefügt werden, falls das DTO dies unterstützt.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpunkt zur Abfrage von Metadaten (Objekttyp, Datentyp, Einheitentyp) für eine gegebene Variablen-ID.
     *
     * @param objId Die Objekt-ID der Variable.
     * @param extId Die Extension-ID der Variable.
     * @return Eine {@link ResponseEntity} mit einer Map der Metadaten oder einer Fehlermeldung.
     */
    @GetMapping("/varid-info")
    public ResponseEntity<Map<String, Integer>> getVariableInfo(
            @RequestParam int objId,
            @RequestParam int extId) {
        logger.info("Controller: GET /varid-info erhalten für objId: {}, extId: {}", objId, extId);
        try {
            Map<String, Integer> info = simoneTranslationService.getVariableInfo(objId, extId);
            if (info.containsKey("errorStatus")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(info);
            }
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("Controller: Fehler beim Abrufen der Variablen-Info für objId: {}, extId: {}: {}", objId, extId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("errorStatus", -1));
        }
    }

    /**
     * Endpunkt zur Übersetzung eines Extension-Namens in seine numerische ID.
     *
     * @param extensionName Der Name der Extension (z.B. "P", "Q").
     * @param flags         Optionale Flags für den API-Aufruf.
     * @return Eine {@link ResponseEntity} mit einer Map, die die `extId` oder eine Fehlermeldung enthält.
     */
    @GetMapping("/extid")
    public ResponseEntity<Map<String, Object>> getExtensionId(
            @RequestParam(name = "name") String extensionName,
            @RequestParam(required = false) Integer flags) {

        logger.info("Controller: GET /translate/extid erhalten für extensionName: '{}'", extensionName);
        try {
            int extId = simoneTranslationService.getExtensionId(extensionName, flags);

            if (extId >= 0) { // Gültige IDs sind 0 oder größer
                return ResponseEntity.ok(Map.of("extId", extId));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("extId", -1, "error", "Extension-Name nicht gefunden oder ungültig."));
            }
        } catch (Exception e) {
            logger.error("Controller: Fehler beim Abrufen der Extension-ID für '{}': {}", extensionName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("extId", -1, "error", "Ein interner Serverfehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Abrufen der verfügbaren SIMONE-Laufzeittypen für die Szenarioerstellung.
     *
     * @return Eine {@link ResponseEntity} mit der Liste der Laufzeittypen.
     */
    @GetMapping("/runtypes")
    public ResponseEntity<RunTypeListResponseDto> getRunTypes() {
        logger.info("Controller: GET /runtypes aufgerufen.");
        try {
            List<RunTypeDto> runTypes = simoneTranslationService.getRunTypes();
            return ResponseEntity.ok(new RunTypeListResponseDto(runTypes));
        } catch (Exception e) {
            logger.error("Controller: Fehler beim Abrufen der Laufzeittypen.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new RunTypeListResponseDto(Collections.emptyList()));
        }
    }

    /**
     * Ruft eine Liste gültiger Extensions für ein gegebenes SIMONE-Objekt innerhalb eines bestimmten Netzwerks ab.
     *
     * @param networkName Der Name des auszuwählenden Netzwerks.
     * @param objectName  Der Name des zu prüfenden Objekts.
     * @return Ein DTO, das die Liste der gültigen Extensions enthält.
     */
    @GetMapping("/networks/{networkName}/extensions/{objectName}")
    public ResponseEntity<ValidExtensionsDto> getValidExtensions(
            @PathVariable String networkName,
            @PathVariable String objectName) {
        logger.info("Controller: GET /networks/{}/extensions/{} aufgerufen.", networkName, objectName);
        try {
            List<String> extensions = simoneTranslationService.getValidExtensions(networkName, objectName);
            return ResponseEntity.ok(new ValidExtensionsDto(extensions));
        } catch (IllegalStateException e) {
            logger.error("Controller: Fehler beim Abrufen der Extensions für Objekt '{}' im Netzwerk '{}': {}", objectName, networkName, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ValidExtensionsDto(Collections.emptyList()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Abrufen der Extensions.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ValidExtensionsDto(Collections.emptyList()));
        }
    }
}
