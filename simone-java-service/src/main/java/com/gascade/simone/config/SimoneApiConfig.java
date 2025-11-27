package com.gascade.simone.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.liwacom.simone.SimoneApi;
import jakarta.annotation.PostConstruct;

/**
 * Konfigurationsklasse für die SIMONE API.
 * Verwaltet das Laden der nativen Remote API Bibliothek und stellt die SimoneApi-Instanz als Spring Bean bereit.
 */
@Configuration
public class SimoneApiConfig {

    private static final Logger log = LoggerFactory.getLogger(SimoneApiConfig.class);

    /**
     * Pfad zur nativen SIMONE Remote API Bibliothek (.so Datei) auf der Linux VM.
     * Dieser Wert wird aus der Eigenschaft simone.api.library.path in application.properties geladen.
     */
    @Value("${simone.api.library.path}")
    private String simoneApiLibraryPath;

    /**
     * Stellt die Singleton-Instanz der SimoneApi-Klasse als Spring Bean bereit.
     * Diese Instanz wird zur Interaktion mit der SIMONE-Simulationssoftware verwendet.
     *
     * @return Die Singleton-Instanz der SimoneApi.
     */
    @Bean
    public SimoneApi simoneApi() {
        return SimoneApi.getInstance();
    }

    /**
     * Wird nach der Konstruktion der Bean aufgerufen.
     * Lädt die native SIMONE Remote API Bibliothek über den absoluten Pfad.
     * Dies ist notwendig, um von der lokalen API-Nutzung zur Remote-API-Nutzung zu wechseln.
     */
    @PostConstruct
    public void loadSimoneApiNativeLibrary() {
        log.info("Starte Ladevorgang der nativen SIMONE Remote API Bibliothek von Pfad: {}", simoneApiLibraryPath);

        try {
            // Schritt 5: Laden der Remote API Bibliothek über den absoluten Pfad (System.load).
            // Die geladene Bibliothek (libSimoneRemoteApiJava64.so) fungiert nun als Client 
            // und baut die TCP/IP-Verbindung zum simone_api_server.exe auf dem Windows Server auf.
            System.load(simoneApiLibraryPath);
            log.info("SIMONE Remote API Bibliothek erfolgreich geladen. Die Anwendung ist nun bereit, über TCP/IP mit dem SIMONE API Server zu kommunizieren.");
        } catch (UnsatisfiedLinkError e) {
            log.error("FEHLER: Konnte die SIMONE Remote API Bibliothek nicht laden von {}.", simoneApiLibraryPath);
            log.error("Stellen Sie sicher, dass die Datei libSimoneRemoteApiJava64.so unter dem angegebenen Pfad existiert, die Lese- und Ausführungsrechte korrekt gesetzt sind und die erforderlichen nativen Abhängigkeiten auf der Linux VM erfüllt sind.");
            log.error("Ursache: {}", e.getMessage());
            // Das Nichtladen der API ist ein kritischer Fehler.
            throw new RuntimeException("Kritischer Fehler: SIMONE Remote API Bibliothek konnte nicht geladen werden.", e);
        }
    }
}
