// // src/main/java/com/gascade/simone/dto/ReadDataRequestItemDto.java
// package com.gascade.simone.dto;

// public record ReadDataRequestItemDto(
//     int objId,
//     int extId,
//     Integer unitDescriptor, // Optional: SIMONE_UNIT_DEFAULT will be used if null
//     Integer width,          // <<<< ADD THIS - Optional: Max length for the output string
//     Integer precision       // <<<< ADD THIS - Optional: Decimals for float formatting
// ) {}

package com.gascade.simone.dto;

/**
 * Datenübertragungsobjekt (DTO) für eine einzelne Leseanfrage einer Variablen aus SIMONE.
 * Diese Struktur beschreibt, welches Objekt und welche Variable gelesen werden sollen sowie
 * optionale Formatierungsinformationen für die Ausgabe.
 *
 * @param objId           Die eindeutige Objekt-ID innerhalb des SIMONE-Netzwerks.
 * @param extId           Die externe ID der Variable innerhalb des Objekts.
 * @param unitDescriptor  Optional: Einheit für die Ausgabe. Wenn null, wird SIMONE_UNIT_DEFAULT verwendet.
 * @param width           Optional: Maximale Zeichenlänge des Ausgabewerts als String.
 * @param precision       Optional: Anzahl der Nachkommastellen bei Fließkommazahlen.
 */
public record ReadDataRequestItemDto(
    int objId,
    int extId,
    Integer unitDescriptor,
    Integer width,
    Integer precision
) {}
