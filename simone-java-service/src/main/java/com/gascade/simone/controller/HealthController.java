package com.gascade.simone.controller;

import java.util.Collections;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController stellt einen einfachen Endpunkt zur Verfügung,
 * um den Betriebszustand des Java-SIMONE-Dienstes zu überprüfen.
 */
@RestController
@RequestMapping("/java-simone/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    /**
     * Gibt den Gesundheitsstatus des Dienstes zurück.
     *
     * @return Eine Map mit dem Schlüssel "status" und dem Wert "UP", wenn der Dienst läuft.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getHealth() {
        logger.info("GET /java-simone/health wurde aufgerufen.");
        return ResponseEntity.ok(Collections.singletonMap("status", "UP"));
    }
}
