// // src/main/java/com/gascade/simone/SimoneJavaServiceApplication.java
// package com.gascade.simone;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication // This scans components in com.gascade.simone and its sub-packages
// public class SimoneJavaServiceApplication {
//     public static void main(String[] args) {
//         SpringApplication.run(SimoneJavaServiceApplication.class, args);
//         System.out.println("✅ Simone Java Service (with Lifecycle Controller) has started!");
//     }
// }

// src/main/java/com/gascade/simone/SimoneJavaServiceApplication.java
package com.gascade.simone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Einstiegspunkt für den Spring Boot-basierten SIMONE Java Service.
 * <p>
 * Die Annotation {@code @SpringBootApplication} aktiviert:
 * <ul>
 *   <li>Komponentenscanning für {@code com.gascade.simone} und alle Unterpakete</li>
 *   <li>Automatische Konfiguration basierend auf dem Klassenpfad und Bean-Definitionen</li>
 *   <li>Unterstützung für Spring Boot-spezifische Funktionen</li>
 * </ul>
 */
@SpringBootApplication
public class SimoneJavaServiceApplication {

    /**
     * Hauptmethode zum Starten des Spring Boot-Anwendungsservers.
     *
     * @param args Kommandozeilenargumente (werden an Spring Boot weitergegeben)
     */
    public static void main(String[] args) {
        SpringApplication.run(SimoneJavaServiceApplication.class, args);
        System.out.println("✅ SIMONE Java-Dienst (mit Lifecycle-Controller) wurde erfolgreich gestartet!");
    }
}
