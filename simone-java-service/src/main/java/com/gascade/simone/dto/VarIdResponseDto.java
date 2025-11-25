// // src/main/java/com/gascade/simone/dto/VarIdResponseDto.java
// package com.gascade.simone.dto;

// public record VarIdResponseDto(
//     String originalName,
//     int objId,
//     int extId,
//     int simoneStatus, // The status returned by the simone_varid call
//     String statusMessage // A human-readable message
// ) {}

package com.gascade.simone.dto;

/**
 * Antwort-DTO für die Übersetzung eines Variablennamens in die zugehörigen SIMONE-IDs.
 * Enthält sowohl technische Informationen (IDs, Status) als auch eine menschenlesbare Nachricht.
 *
 * @param originalName    Ursprünglich angefragter Variablenname (z. B. "LINE.FLOW").
 * @param objId           Objekt-ID, die von der SIMONE-API zurückgegeben wurde.
 * @param extId           Externe ID, die von der SIMONE-API zurückgegeben wurde.
 * @param simoneStatus    Statuscode der SIMONE-API (z. B. 0 = OK, != 0 = Fehler).
 * @param statusMessage   Menschenlesbare Nachricht zur Erklärung des Status (z. B. „Variable nicht gefunden“).
 */
public record VarIdResponseDto(
    String originalName,
    int objId,
    int extId,
    int simoneStatus,
    String statusMessage
) {}
