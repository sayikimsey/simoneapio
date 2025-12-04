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
 */
@RestController
@RequestMapping("/v1")
public class SimoneLifecycleController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleController.class);
    private final SimoneLifecycleService simoneLifecycleService;
    
    // Pfad auf dem Windows Server (ohne .INI Endung)
    private static final String CONFIG_FILE_PATH_WITHOUT_EXTENSION = "C:\\Simone\\Simone-V6_37\\sys\\api_server"; 

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
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        logger.info("Controller: GET /health-Endpunkt aufgerufen.");
        try {
            String apiVersion = simoneLifecycleService.getSimoneApiVersionString();
            
            if (apiVersion != null && !apiVersion.toLowerCase().contains("fehler") && !apiVersion.toLowerCase().contains("exception")) {
                HealthResponse response = new HealthResponse("UP", "SIMONE Remote API Java-Dienst läuft.", apiVersion);
                return ResponseEntity.ok(response);
            } else {
                HealthResponse response = new HealthResponse("DEGRADIERT", "Dienst läuft, aber API meldet Fehler: " + apiVersion, apiVersion);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler im /health-Endpunkt: {}", e.getMessage(), e);
            HealthResponse errorResponse = new HealthResponse("FEHLER", "Unerwarteter Fehler: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Initialisiert die SIMONE Remote API Verbindung.
     */
    @PostMapping("/initialize")
    public ResponseEntity<MessageResponseDto> initializeSimone(@RequestBody(required = false) InitializeRequestDto requestDto) {
        
        final String configPath = CONFIG_FILE_PATH_WITHOUT_EXTENSION;
        final Boolean useTemp = Boolean.TRUE; 
        
        logger.info("Controller: POST /initialize. Pfad: [{}], Temp: {}", configPath, useTemp);
        
        try {
            String message = simoneLifecycleService.initializeSimone(configPath, useTemp);
            
            if (message != null && (message.toLowerCase().contains("fehler") || message.toLowerCase().contains("exception") || message.toLowerCase().contains("abgebrochen"))) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei Initialisierung: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Unerwarteter Fehler: " + e.getMessage()));
        }
    }

    /**
     * Terminierung der laufenden SIMONE Remote API Sitzung.
     */
    @PostMapping("/terminate")
    public ResponseEntity<MessageResponseDto> terminateSimone() {
        logger.info("Controller: POST /terminate.");
        try {
            String message = simoneLifecycleService.terminateSimone();
            if (message != null && message.toLowerCase().contains("fehler")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei Terminierung: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Unerwarteter Fehler: " + e.getMessage()));
        }
    }
}