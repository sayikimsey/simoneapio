// // src/main/java/com/gascade/simone/dto/WriteDataRequestItemDto.java
// package com.gascade.simone.dto;

// public record WriteDataRequestItemDto(
//     int objId,
//     int extId,
//     float value,      // The float value to be written
//     Integer unitDescriptor // Optional: Unit for the value being written. SIMONE_UNIT_DEFAULT if null.
// ) {}

package com.gascade.simone.dto;

/**
 * Datenübertragungsobjekt (DTO) zur Darstellung eines einzelnen Schreibvorgangs
 * für ein bestimmtes SIMONE-Objekt und eine bestimmte Erweiterungs-ID (extId).
 *
 * @param objId           Die Objekt-ID in SIMONE, auf die der Wert geschrieben wird.
 * @param extId           Die Erweiterungs-ID (z. B. Attribut oder Kennwert).
 * @param value           Der zu schreibende Gleitkommawert (float).
 * @param unitDescriptor  Optional: Die Einheit für den Wert. Wenn {@code null}, wird
 *                        {@code SIMONE_UNIT_DEFAULT} verwendet.
 */
public record WriteDataRequestItemDto(
    int objId,
    int extId,
    float value,
    Integer unitDescriptor
) {}
