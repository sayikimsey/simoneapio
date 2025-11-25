// // src/main/java/com/gascade/simone/dto/WriteDataExResponseDto.java
// package com.gascade.simone.dto;

// public record WriteDataExResponseDto(
//     int objId,
//     int extId,
//     int simoneStatus,       // Status returned by simone_write_ex
//     String simoneMessage,   // Detailed status message from simone_write_ex's output parameter
//     String overallMessage  // A general message from our service
// ) {}

package com.gascade.simone.dto;

/**
 * Datenübertragungsobjekt (DTO) für die Antwort auf eine erweiterte Schreiboperation
 * in SIMONE über {@code simone_write_ex}.
 *
 * @param objId           Die Objekt-ID, für die der Wert geschrieben wurde.
 * @param extId           Die Erweiterungs-ID der geschriebenen Variablen.
 * @param simoneStatus    Der Statuscode, der von {@code simone_write_ex} zurückgegeben wurde.
 * @param simoneMessage   Detailierte Statusmeldung direkt von SIMONE (aus dem Ausgabewert von {@code simone_write_ex}).
 * @param overallMessage  Allgemeine Nachricht aus unserem Java-Service zur Benutzerinformation.
 */
public record WriteDataExResponseDto(
    int objId,
    int extId,
    int simoneStatus,
    String simoneMessage,
    String overallMessage
) {}
