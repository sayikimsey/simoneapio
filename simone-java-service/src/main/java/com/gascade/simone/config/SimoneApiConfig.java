// package com.gascade.simone.config;

// import de.liwacom.simone.SimoneApi;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.context.annotation.Scope;

// @Configuration
// public class SimoneApiConfig {

//     /**
//      * Creates and provides a singleton instance of the SimoneApi.
//      * * By defining this as a Spring @Bean with the default singleton scope, we ensure that
//      * the entire application uses the exact same instance of the SimoneApi wrapper. This is
//      * crucial for managing the state of the underlying non-thread-safe native library and
//      * allows synchronized methods and blocks across different services to work correctly
//      * on a single, shared resource.
//      *
//      * @return A singleton instance of SimoneApi.
//      */
//     @Bean
//     @Scope("singleton")
//     public SimoneApi simoneApi() {
//         // Here we can also set the path if needed before getting the instance
//         // SimoneApi.simone_api_set_simone_path("C:/Simone/Simone-V6_34/exe");
//         return SimoneApi.getInstance();
//     }
// }



package com.gascade.simone.config;

import de.liwacom.simone.SimoneApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/**
 * Konfigurationsklasse zur Bereitstellung einer Singleton-Instanz der SimoneApi.
 *
 * <p>Die Instanz wird als Singleton verwaltet, damit die gesamte Anwendung
 * dieselbe Instanz des Wrappers verwendet. Dies ist essenziell, da die native
 * SIMONE-Bibliothek nicht thread-sicher ist und zentral gesteuert werden muss.
 */
@Configuration
public class SimoneApiConfig {

    /**
     * Erzeugt und stellt eine Singleton-Instanz der {@link SimoneApi} zur Verfügung.
     *
     * @return Eine Singleton-Instanz der {@link SimoneApi}.
     */
    @Bean
    @Scope("singleton")
    public SimoneApi simoneApi() {
        // Falls notwendig, kann hier vorher der SIMONE-Pfad gesetzt werden:
        // SimoneApi.simone_api_set_simone_path("C:/Simone/Simone-V6_37/exe");
        return SimoneApi.getInstance();
    }
}


// package com.gascade.simone.config;

// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst; // Ensure SimoneConst is imported for status codes
// import de.liwacom.simone.SimString;   // Ensure SimString is imported for error messages
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Lazy;

// import jakarta.annotation.PostConstruct;

// /**
//  * Konfigurationsklasse für die SIMONE API im Java Backend.
//  * Verwaltet die Initialisierung der SIMONE API basierend auf den Anwendungseinstellungen.
//  */
// @Configuration
// public class SimoneApiConfig {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneApiConfig.class);

//     @Value("${simone.installation.path}")
//     private String simoneInstallationPath;

//     @Value("${simone.default.config.file.path}")
//     private String simoneDefaultConfigFilePath;

//     // ✅ Hinzugefügt: Injektion der Lizenzserver-Details aus application.properties
//     @Value("${simone.license.server.host:localhost}")
//     private String licenseServerHost;

//     @Value("${simone.license.server.port:6611}")
//     private int licenseServerPort;

//     private SimoneApi simoneApi;

//     @PostConstruct
//     public void initializeSimoneApi() {
//         logger.info("Starte Initialisierung der SIMONE API...");
//         try {
//             SimoneApi.simone_api_set_simone_path(simoneInstallationPath);
//             logger.info("SIMONE Installationspfad gesetzt auf: {}", simoneInstallationPath);

//             // ✅ KORRIGIERT: Verwende getRemoteApiInstance(), da api.ini eine Remote-Lizenz konfiguriert.
//             simoneApi = SimoneApi.getRemoteApiInstance();
//             logger.info("SIMONE API Instanz erfolgreich erhalten (Remote Modus).");

//             // ✅ NEU/KORRIGIERT: Remote-Verbindungsinformationen setzen.
//             // Die simone_set_remote_connection Methode wird nur aufgerufen,
//             // wenn simoneApi ein gültiges RemoteApiInstance-Objekt ist.
//             int setRemoteStatus = simoneApi.simone_set_remote_connection(licenseServerHost, licenseServerPort);
//             if (setRemoteStatus != SimoneConst.simone_status_ok) { // Verwende SimoneConst für Statuscodes
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg); // Fehlertext in SimString abrufen
//                 // ✅ KORRIGIERT: Rufe getVal() auf dem SimString-Objekt auf
//                 logger.error("Fehler beim Setzen der Remote-Verbindung zur SIMONE API. Status: {}, Details: {}", setRemoteStatus, errorMsg.getVal());
//                 throw new IllegalStateException("Fehler beim Setzen der Remote-Verbindung zur SIMONE API.");
//             }
//             logger.info("Remote-Verbindung zur SIMONE API gesetzt auf {}:{}", licenseServerHost, licenseServerPort);


//             int initStatus = simoneApi.simone_init_ex(simoneDefaultConfigFilePath, SimoneConst.SIMONE_FLAG_TMP_CONFIG);

//             if (initStatus == SimoneConst.simone_status_ok) {
//                 logger.info("SIMONE API erfolgreich initialisiert mit Konfiguration: {}", simoneDefaultConfigFilePath);
//             } else {
//                 SimString errorMsg = new SimString(); // Erstelle ein SimString Objekt
//                 this.simoneApi.simone_last_error(errorMsg); // Rufe den letzten Fehler ab und fülle das SimString Objekt
//                 // ✅ KORRIGIERT: Rufe getVal() auf dem SimString-Objekt auf
//                 logger.error("Fehler bei Initialisierung: Status: {}, SIMONE-Fehler: {}", initStatus, errorMsg.getVal());
//                 throw new IllegalStateException("SIMONE API Initialisierung fehlgeschlagen.");
//             }

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("Fehler beim Laden der SIMONE API Native-Bibliothek. Prüfen Sie simoneInstallationPath und System-PATH. Details: {}", ule.getMessage(), ule);
//             throw new IllegalStateException("SIMONE API Native-Bibliothek nicht gefunden/geladen.", ule);
//         } catch (Exception e) {
//             logger.error("Unerwarteter Fehler bei der SIMONE API Initialisierung: {}", e.getMessage(), e);
//             throw new IllegalStateException("Unerwarteter Fehler bei SIMONE API Initialisierung.", e);
//         }
//     }

//     @Bean
//     @Lazy
//     public SimoneApi simoneApiInstance() {
//         if (simoneApi == null) {
//             throw new IllegalStateException("SimoneApi wurde nicht erfolgreich initialisiert.");
//         }
//         return simoneApi;
//     }
// }