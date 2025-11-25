// // src/main/java/com/gascade/simone/dto/WriteDataResponseItemDto.java
// package com.gascade.simone.dto;

// public record WriteDataResponseItemDto(
//     int objId,
//     int extId,
//     int simoneStatus,   // Status of the write operation for this specific item
//     String statusMessage // Human-readable status/error for this item
// ) {}

package com.gascade.simone.dto;

/**
 * Datenübertragungsobjekt (DTO) für das Ergebnis einer einzelnen Schreiboperation
 * im Rahmen einer Batch-Schreibanfrage an das SIMONE-System.
 *
 * @param objId Die Objekt-ID, auf die geschrieben wurde.
 * @param extId Die externe Variablen-ID innerhalb des Objekts.
 * @param simoneStatus Der Rückgabestatus der SIMONE-API für diese einzelne Schreiboperation.
 * @param statusMessage Eine menschenlesbare Status- oder Fehlermeldung für diese Operation.
 */
public record WriteDataResponseItemDto(
    int objId,
    int extId,
    int simoneStatus,
    String statusMessage
) {}
