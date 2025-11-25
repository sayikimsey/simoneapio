// // src/main/java/com/gascade/simone/dto/CreateArchiveRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record CreateArchiveRequestDto(
//     @NotBlank(message = "Archive file path cannot be blank")
//     String archiveFilePath,

//     String comment, // The comment for the new archive, can be null

//     Integer flags   // Optional flags for the operation
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) für die Erstellung eines neuen SIMONE-Archivs.
 * Enthält Informationen über den Speicherpfad, einen optionalen Kommentar und optionale Flags.
 *
 * @param archiveFilePath Der vollständige Pfad zur Archivdatei (Pflichtfeld).
 * @param comment Optionaler Kommentar, der im Archiv gespeichert wird (kann null sein).
 * @param flags Optionale Flags zur Steuerung der Archiv-Erstellung (z. B. Überschreiben).
 */
public record CreateArchiveRequestDto(

    @NotBlank(message = "Der Archivpfad darf nicht leer sein.")
    String archiveFilePath,

    String comment,

    Integer flags
) {}
