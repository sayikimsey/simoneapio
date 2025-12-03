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
    
    // --- KORRIGIERTE KONSTANTE: ABSOLUTER PFAD OHNE ERWEITERUNG ---
    // Dies stellt sicher, dass der API Server die Datei findet.
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
            
            if (apiVersion != null && !apiVersion.toLowerCase().contains("fehler")) {
                HealthResponse response = new HealthResponse("UP", "SIMONE Remote API Java-Dienst läuft einwandfrei.", apiVersion);
                return ResponseEntity.ok(response);
            } else {
                HealthResponse response = new HealthResponse("DEGRADIERT", "Dienst läuft, aber SIMONE API-Version konnte nicht gelesen werden (Fehler im API-Client oder Remote-Verbindung).", apiVersion);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler im /health-Endpunkt: {}", e.getMessage(), e);
            HealthResponse errorResponse = new HealthResponse("FEHLER", "Unerwarteter Fehler beim Gesundheitscheck: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Initialisiert die SIMONE Remote API Verbindung.
     * KORREKTUR: Sendet den ABSOLUTEN PFAD ohne Endung und SIMONE_FLAG_TMP_CONFIG=TRUE.
     *
     * @param requestDto Optionales DTO mit Pfad zur Konfigurationsdatei und Kopier-Flag
     * @return Ergebnisnachricht zur Initialisierung
     */
    @PostMapping("/initialize")
    public ResponseEntity<MessageResponseDto> initializeSimone(@RequestBody(required = false) InitializeRequestDto requestDto) {
        
        // 1. Definiere den zu verwendenden Pfad (absolut, ohne Endung)
        final String configPath = CONFIG_FILE_PATH_WITHOUT_EXTENSION;
        
        // 2. Setze das Flag für die temporäre Kopie auf TRUE (SIMONE_FLAG_TMP_CONFIG)
        final Boolean useTemp = Boolean.TRUE; 
        
        logger.info("Controller: POST /initialize. Konfigurations-Pfad: [{}], temporäre Kopie: {}", configPath, useTemp);
        
        try {
            String message = simoneLifecycleService.initializeSimone(configPath, useTemp);
            
            if (message != null && message.toLowerCase().contains("fehlgeschlagen")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Initialisierung von SIMONE Remote API: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Initialisierung fehlgeschlagen aufgrund eines unerwarteten Fehlers: " + e.getMessage()));
        }
    }

    /**
     * Terminierung der laufenden SIMONE Remote API Sitzung.
     */
    @PostMapping("/terminate")
    public ResponseEntity<MessageResponseDto> terminateSimone() {
        logger.info("Controller: POST /terminate-Endpunkt aufgerufen (Schließt Remote-Sitzung).");
        try {
            String message = simoneLifecycleService.terminateSimone();
            if (message != null && message.toLowerCase().contains("fehlgeschlagen")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(message));
            }
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler bei der Beendigung von SIMONE Remote API: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Beendigung fehlgeschlagen aufgrund eines unerwarteten Fehlers: " + e.getMessage()));
        }
    }
}