// // src/main/java/com/gascade/simone/dto/ReadStringDataResponseDto.java
// package com.gascade.simone.dto;

// public record ReadStringDataResponseDto(
//     int objId,
//     int extId,
//     String value,        // The string value read from SIMONE (can be null if read fails)
//     int simoneStatus,   // Status of the read operation for this specific item
//     String statusMessage
// ) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt zur Rückgabe eines gelesenen Wertes im String-Format aus der SIMONE-API.
 * Enthält Informationen über das gelesene Objekt, das Attribut sowie den Status der Operation.
 *
 * @param objId          Die interne Objekt-ID im Netzmodell.
 * @param extId          Die externe Attribut- oder Variablen-ID.
 * @param value          Der gelesene Wert als Zeichenkette. Kann {@code null} sein, falls das Lesen fehlgeschlagen ist.
 * @param simoneStatus   Der Statuscode der SIMONE-API für diesen Lesevorgang (z. B. {@code simone_status_ok}, {@code simone_status_badpar}).
 * @param statusMessage  Eine erläuternde Statusmeldung zur Operation, entweder von SIMONE oder vom Dienst erzeugt.
 */
public record ReadStringDataResponseDto(
    int objId,
    int extId,
    String value,
    int simoneStatus,
    String statusMessage
) {}
