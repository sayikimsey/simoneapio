// // src/main/java/com/gascade/simone/dto/ReadStringDataRequestDto.java
// package com.gascade.simone.dto;

// public record ReadStringDataRequestDto(
//     int objId,
//     int extId,
//     Integer unitDescriptor, // Optional: SIMONE_UNIT_DEFAULT will be used if null
//     Integer width,          // Optional: Max length for the output string, defaults in service
//     Integer precision       // Optional: Decimals for float formatting, defaults in service
// ) {
//     // No-arg constructor or validation can be added if needed
// }

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt für eine Leseanfrage eines Wertes im String-Format aus einem SIMONE-Objekt.
 * Dient zur Angabe der Objekt- und Attributkennung sowie optionaler Formatierungsparameter.
 *
 * @param objId           Die interne Objekt-ID im Netz.
 * @param extId           Die externe Attribut- oder Variablen-ID.
 * @param unitDescriptor  Optional: Einheit zur Darstellung (z. B. {@code SIMONE_UNIT_DEFAULT} wenn {@code null}).
 * @param width           Optional: Maximale Länge des formatierten Ausgabestrings. Wird im Service standardmäßig gesetzt, falls {@code null}.
 * @param precision       Optional: Anzahl der Nachkommastellen bei Fließkommazahlen. Wird im Service standardmäßig gesetzt, falls {@code null}.
 */
public record ReadStringDataRequestDto(
    int objId,
    int extId,
    Integer unitDescriptor,
    Integer width,
    Integer precision
) {}
