// // src/main/java/com/gascade/simone/dto/ReadDataResponseItemDto.java
// package com.gascade.simone.dto;

// public record ReadDataResponseItemDto(
//     int objId,
//     int extId,
//     Float value,      // Use Float to allow for null if read fails for this item
//     int simoneStatus, // Status of the read operation for this specific item
//     String statusMessage
// ) {}

package com.gascade.simone.dto;

/**
 * Einzelnes Ergebnisobjekt für eine Datenleseanfrage in SIMONE.
 * Repräsentiert den Wert und Status einer gelesenen Variable für ein bestimmtes Objekt.
 *
 * @param objId          Die Objekt-ID innerhalb des Netzwerks.
 * @param extId          Die externe ID (z. B. Variablen- oder Attributkennung).
 * @param value          Der gelesene Wert. Kann null sein, wenn der Lesevorgang fehlgeschlagen ist.
 * @param simoneStatus   Statuscode des Lesevorgangs für dieses Element (z. B. erfolgreich, Fehler).
 * @param statusMessage  Detaillierte Statusnachricht zum Ergebnis dieses Lesepostens.
 */
public record ReadDataResponseItemDto(
    int objId,
    int extId,
    Float value,
    int simoneStatus,
    String statusMessage
) {}
