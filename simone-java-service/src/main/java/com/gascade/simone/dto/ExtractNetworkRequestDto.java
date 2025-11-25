// // src/main/java/com/gascade/simone/dto/ExtractNetworkRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record ExtractNetworkRequestDto(
//     @NotBlank(message = "Archive file path cannot be blank")
//     String archiveFilePath,

//     @NotBlank(message = "Network name to extract cannot be blank")
//     String networkNameToExtract, // The name of the network *inside* the archive

//     String networkVersionTime,   // Optional: The specific version time string. If null/empty, extracts the newest.

//     String destinationNetworkName, // Optional: The name to save the extracted network as. If null/empty, uses original name.

//     String password,             // Optional: The password if the network is protected.

//     Integer flags                // Optional flags for the operation (reserved for future use per Javadoc)
// ) {
//     // The overwriteFlags for simone_extract_network_ex is not needed for this method
// }

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) für das Extrahieren eines Netzwerks aus einer SIMONE-Archivdatei.
 * Verwendet von Admin-Endpunkten zur Wiederherstellung archivierter Netzwerke.
 *
 * @param archiveFilePath         Pfad zur Archivdatei. Darf nicht leer sein.
 * @param networkNameToExtract    Name des zu extrahierenden Netzwerks innerhalb des Archivs. Darf nicht leer sein.
 * @param networkVersionTime      Optional: Version-Zeitstempel des zu extrahierenden Netzwerks. Wenn leer, wird die neueste Version verwendet.
 * @param destinationNetworkName  Optional: Zielname des extrahierten Netzwerks. Wenn leer, wird der Originalname verwendet.
 * @param password                Optional: Passwort für passwortgeschützte Netzwerke.
 * @param flags                   Optional: Zusätzliche Flags für die Extraktion (reserviert für zukünftige Nutzung).
 */
public record ExtractNetworkRequestDto(
    @NotBlank(message = "Pfad zur Archivdatei darf nicht leer sein.")
    String archiveFilePath,

    @NotBlank(message = "Name des zu extrahierenden Netzwerks darf nicht leer sein.")
    String networkNameToExtract,
    String networkVersionTime,
    String destinationNetworkName,
    String password,
    Integer flags
) {
    // Die overwriteFlags aus simone_extract_network_ex werden hier nicht benötigt.
}
