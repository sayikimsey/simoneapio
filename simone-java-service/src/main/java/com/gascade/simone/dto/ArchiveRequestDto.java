// // src/main/java/com/gascade/simone/dto/ArchiveRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record ArchiveRequestDto(
//     @NotBlank(message = "Archive file path cannot be blank")
//     String archiveFilePath,
//     Integer flags
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt für Anfragen zur Arbeit mit einem bestehenden SIMONE-Archiv.
 * Wird z. B. für das Auflisten archivierter Netzwerke verwendet.
 *
 * @param archiveFilePath Vollständiger Pfad zur Archivdatei (darf nicht leer sein).
 * @param flags Optional gesetzte Flags zur Steuerung des Verhaltens der Operation (z. B. {@code SIMONE_NO_FLAG}).
 */
public record ArchiveRequestDto(
    @NotBlank(message = "Der Pfad zur Archivdatei darf nicht leer sein.")
    String archiveFilePath,
    
    Integer flags
) {}
