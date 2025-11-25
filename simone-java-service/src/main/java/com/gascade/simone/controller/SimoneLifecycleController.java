// // src/main/java/com/gascade/simone/controller/SimoneLifecycleController.java
// package com.gascade.simone.controller;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.HealthResponse;
// import com.gascade.simone.dto.InitializeRequestDto;
// import com.gascade.simone.dto.MessageResponseDto;
// import com.gascade.simone.service.SimoneLifecycleService;

// @RestController
// @RequestMapping("/simone-api-java/v1") 
// public class SimoneLifecycleController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleController.class);
//     private final SimoneLifecycleService simoneLifecycleService;

//     @Autowired
//     public SimoneLifecycleController(SimoneLifecycleService simoneLifecycleService) {
//         this.simoneLifecycleService = simoneLifecycleService;
//         logger.info("SimoneLifecycleController initialized.");
//     }

//     @GetMapping("/health")
//     public ResponseEntity<HealthResponse> getHealth() {
//         logger.info("Controller: GET /health endpoint hit.");
//         try {
//             String apiVersion = simoneLifecycleService.getSimoneApiVersionString();
//             if (apiVersion != null && !apiVersion.toLowerCase().contains("error")) {
//                 HealthResponse response = new HealthResponse("UP", "SIMONE Java Service is operational.", apiVersion);
//                 return ResponseEntity.ok(response);
//             } else {
//                 HealthResponse response = new HealthResponse("DEGRADED", "Service is running, but SIMONE API interaction for version failed.", apiVersion);
//                 return ResponseEntity.status(HttpStatus.OK).body(response); // Still 200 OK, but payload indicates issue
//             }
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error in /health endpoint: {}", e.getMessage(), e);
//             HealthResponse errorResponse = new HealthResponse("ERROR", "Unexpected error during health check: " + e.getMessage(), null);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//         }
//     }

//     @PostMapping("/initialize")
//     public ResponseEntity<MessageResponseDto> initializeSimone(@RequestBody(required = false) InitializeRequestDto requestDto) {
//         String configPath = (requestDto != null) ? requestDto.configFilePath() : null;
//         Boolean useTemp = (requestDto != null && requestDto.useTemporaryConfigCopy() != null) 
//                           ? requestDto.useTemporaryConfigCopy() 
//                           : Boolean.TRUE; // Default to true

//         logger.info("Controller: POST /initialize. ConfigPath: [{}], UseTempCopy: {}", 
//             configPath == null ? "default" : configPath, useTemp);
//         try {
//             String message = simoneLifecycleService.initializeSimone(configPath, useTemp);
//             if (message != null && message.toLowerCase().contains("failed")) {
//                  return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
//             }
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (Exception e) { // Catch broader exceptions if service throws them
//             logger.error("Controller: Error during SIMONE initialization: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                                  .body(new MessageResponseDto("Initialization failed due to unexpected error: " + e.getMessage()));
//         }
//     }

//     @PostMapping("/terminate")
//     public ResponseEntity<MessageResponseDto> terminateSimone() {
//         logger.info("Controller: POST /terminate endpoint hit.");
//          try {
//             String message = simoneLifecycleService.terminateSimone();
//             if (message != null && message.toLowerCase().contains("failed")) { // More robust check
//                  return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
//             }
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (Exception e) {
//             logger.error("Controller: Error during SIMONE termination: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                                  .body(new MessageResponseDto("Termination failed due to unexpected error: " + e.getMessage()));
//         }
//     }

       
    
// }

// src/main/java/com/gascade/simone/controller/SimoneLifecycleController.java
package com.gascade.simone.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.HealthResponse;
import com.gascade.simone.dto.InitializeRequestDto;
import com.gascade.simone.dto.MessageResponseDto;
import com.gascade.simone.service.SimoneLifecycleService;

/**
 * REST-Controller zur Verwaltung des Lebenszyklus der SIMONE-API.
 * Stellt Endpunkte zur Initialisierung, Terminierung und Statusabfrage bereit.
 */
@RestController
@RequestMapping("/v1")
public class SimoneLifecycleController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleController.class);
    private final SimoneLifecycleService simoneLifecycleService;

    /**
     * Konstruktor – injiziert den Lifecycle-Service.
     */
    @Autowired
    public SimoneLifecycleController(SimoneLifecycleService simoneLifecycleService) {
        this.simoneLifecycleService = simoneLifecycleService;
        logger.info("SimoneLifecycleController initialisiert.");
    }

    /**
     * Gesundheitsprüfung des SIMONE-Java-Services.
     * Liefert Informationen zur API-Verfügbarkeit und Version.
     *
     * @return HTTP 200 OK mit Statusinformationen oder Fehlerstatus bei Problemen
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        logger.info("Controller: GET /health-Endpunkt aufgerufen.");
        try {
            String apiVersion = simoneLifecycleService.getSimoneApiVersionString();

            if (apiVersion != null && !apiVersion.toLowerCase().contains("error")) {
                HealthResponse response = new HealthResponse("UP", "SIMONE Java-Dienst läuft einwandfrei.", apiVersion);
                return ResponseEntity.ok(response);
            } else {
                HealthResponse response = new HealthResponse("DEGRADIERT", "Dienst läuft, aber SIMONE API-Version konnte nicht gelesen werden.", apiVersion);
                return ResponseEntity.ok(response); // HTTP 200, aber payload signalisiert Problem
            }
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler im /health-Endpunkt: {}", e.getMessage(), e);
            HealthResponse errorResponse = new HealthResponse("FEHLER", "Unerwarteter Fehler beim Gesundheitscheck: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Initialisiert die SIMONE-API mit der übergebenen Konfigurationsdatei.
     * Optional kann eine temporäre Kopie verwendet werden.
     *
     * @param requestDto Optionales DTO mit Pfad zur Konfigurationsdatei und Kopier-Flag
     * @return Ergebnisnachricht zur Initialisierung
     */
    @PostMapping("/initialize")
    public ResponseEntity<MessageResponseDto> initializeSimone(@RequestBody(required = false) InitializeRequestDto requestDto) {
        String configPath = (requestDto != null) ? requestDto.configFilePath() : null;
        Boolean useTemp = (requestDto != null && requestDto.useTemporaryConfigCopy() != null)
                ? requestDto.useTemporaryConfigCopy()
                : Boolean.TRUE; // Standardmäßig true

        logger.info("Controller: POST /initialize. Konfigurationspfad: [{}], temporäre Kopie: {}", 
            configPath == null ? "Standardpfad" : configPath, useTemp);
        try {
            String message = simoneLifecycleService.initializeSimone(configPath, useTemp);
            if (message != null && message.toLowerCase().contains("failed")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Initialisierung von SIMONE: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Initialisierung fehlgeschlagen aufgrund eines unerwarteten Fehlers: " + e.getMessage()));
        }
    }

    /**
     * Terminierung der laufenden SIMONE-API-Sitzung.
     *
     * @return Ergebnisnachricht zur Beendigung
     */
    @PostMapping("/terminate")
    public ResponseEntity<MessageResponseDto> terminateSimone() {
        logger.info("Controller: POST /terminate-Endpunkt aufgerufen.");
        try {
            String message = simoneLifecycleService.terminateSimone();
            if (message != null && message.toLowerCase().contains("failed")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Beendigung von SIMONE: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Beendigung fehlgeschlagen aufgrund eines unerwarteten Fehlers: " + e.getMessage()));
        }
    }
}
