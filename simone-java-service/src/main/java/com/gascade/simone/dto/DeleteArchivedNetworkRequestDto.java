// // src/main/java/com/gascade/simone/dto/DeleteArchivedNetworkRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record DeleteArchivedNetworkRequestDto(
//     @NotBlank(message = "Archive file path cannot be blank")
//     String archiveFilePath,

//     @NotBlank(message = "Network name to delete cannot be blank")
//     String networkNameToDelete, // The name of the network *inside* the archive

//     String networkVersionTime,  // Optional: The specific version time string. If null/empty, deletes the OLDEST.

//     Integer flags               // Optional flags for the operation (reserved for future use per Javadoc)
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) für das Löschen eines Netzwerks aus einer SIMONE-Archivdatei.
 *
 * @param archiveFilePath       Pfad zur Archivdatei, aus der das Netzwerk gelöscht werden soll. Darf nicht leer sein.
 * @param networkNameToDelete   Name des zu löschenden Netzwerks innerhalb des Archivs. Darf nicht leer sein.
 * @param networkVersionTime    (Optional) Zeitstempel der Netzwerkversion, die gelöscht werden soll. Wenn leer, wird die älteste Version gelöscht.
 * @param flags                 (Optional) Zusätzliche Flags für die Operation – derzeit reserviert für zukünftige Erweiterungen.
 */
public record DeleteArchivedNetworkRequestDto(
    @NotBlank(message = "Pfad zur Archivdatei darf nicht leer sein.")
    String archiveFilePath,

    @NotBlank(message = "Name des zu löschenden Netzwerks darf nicht leer sein.")
    String networkNameToDelete,

    String networkVersionTime,

    Integer flags
) {}
