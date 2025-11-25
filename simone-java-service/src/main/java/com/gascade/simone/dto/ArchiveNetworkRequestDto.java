// // src/main/java/com/gascade/simone/dto/ArchiveNetworkRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record ArchiveNetworkRequestDto(
//     @NotBlank(message = "Archive file path cannot be blank")
//     String archiveFilePath,

//     @NotBlank(message = "Network name to archive cannot be blank")
//     String networkName, 
//     String scenarioList, 
//     String comment,      
//     String password,     
//     Integer flags      
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt für das Archivieren eines Netzwerks in eine SIMONE-Archivdatei.
 * Wird vom Service {@code archiveNetwork()} und entsprechenden REST-Endpunkten verwendet.
 *
 * @param archiveFilePath Der vollständige Pfad zur Archivdatei, in die das Netzwerk gespeichert werden soll (Pflichtfeld).
 * @param networkName Der Name des zu archivierenden Netzwerks (Pflichtfeld).
 * @param scenarioList Optionale kommaseparierte Liste von Szenarien, die mitarchiviert werden sollen (z. B. "base,2023-07").
 * @param comment Optionaler Kommentar, der in der Archivdatei gespeichert wird.
 * @param password Optionales Passwort für die Verschlüsselung (je nach SIMONE-Konfiguration).
 * @param flags Optional gesetzte Flags, z. B. {@code SimoneConst.SIMONE_FLAG_REPLACE}, um ein vorhandenes Archiv zu überschreiben.
 */
public record ArchiveNetworkRequestDto(
    @NotBlank(message = "Der Pfad zur Archivdatei darf nicht leer sein.")
    String archiveFilePath,

    @NotBlank(message = "Der Name des zu archivierenden Netzwerks darf nicht leer sein.")
    String networkName,
    String scenarioList,  // Optional: Liste der Szenarien, die exportiert werden sollen
    String comment,       // Optionaler Kommentar
    String password,      // Optionales Passwort für verschlüsselte Archive
    Integer flags         // Optional: Flags für das Archivierungsverhalten
) {}
