// // src/main/java/com/gascade/simone/dto/WriteDataExRequestDto.java
// package com.gascade.simone.dto;

// public record WriteDataExRequestDto(
//     // Required parameters
//     Integer timeValue,      // time_t (int for SIMONE API, Integer to allow null for "use current rtime")
//     int objId,
//     int extId,
//     // Value can be float or string. If valueStr is provided, value (float) is ignored by SIMONE.
//     Float value,            // Optional: float value to set.
//     String valueStr,        // Optional: string value to set. Provide null if using float 'value'.

//     // Optional parameters with defaults
//     Integer unitDescriptor, // Unit for the float 'value'. Defaults to SIMONE_UNIT_DEFAULT.
//     Integer condFlags,      // Condition flags. Defaults to SIMONE_NO_FLAG.
//     Integer condId,         // Condition ID. Defaults to 0 (no condition).
//     Integer funcId,         // Function ID. Defaults to 0 (no function).
//     Integer valueFlags,     // Value flags (e.g., SIMONE_FLAG_VALUE_INVALID). Defaults to SIMONE_NO_FLAG.
//     Integer srcId,          // Source ID. Defaults to 0.
//     String comment          // Comment for the entry. Defaults to null.
// ) {
//     // No-arg compact constructor or further validation can be added if needed.
//     // For example, ensuring that if valueStr is set, value (float) might be less relevant or should be 0.0f as per Javadoc.
// }

package com.gascade.simone.dto;

/**
 * Datenübertragungsobjekt (DTO) für den erweiterten Schreibzugriff in SIMONE (writeDataEx).
 * Unterstützt sowohl numerische als auch Zeichenkettenwerte und bietet zahlreiche optionale Parameter
 * zur Steuerung von Bedingungen, Funktionen und Metadaten der Datenquelle.
 *
 * @param timeValue       (Optional) Zeitwert als UNIX-Timestamp in Sekunden. Falls null, wird die aktuelle SIMONE-Zeit verwendet.
 * @param objId           Objekt-ID in SIMONE, für die der Wert geschrieben werden soll.
 * @param extId           Erweiterungs-ID der Variable (z. B. Druck, Temperatur, Durchflussrate).
 * @param value           (Optional) Gleitkommazahl-Wert zum Schreiben. Wird ignoriert, wenn {@code valueStr} gesetzt ist.
 * @param valueStr        (Optional) Zeichenkette als Wert. Hat Vorrang vor {@code value}, wenn gesetzt.
 * @param unitDescriptor  (Optional) Einheit (z. B. bar, °C). Standard ist {@code SIMONE_UNIT_DEFAULT}.
 * @param condFlags       (Optional) Konditions-Flags. Standard ist {@code SIMONE_NO_FLAG}.
 * @param condId          (Optional) ID für eine zugehörige Bedingung. Standard ist 0 (keine Bedingung).
 * @param funcId          (Optional) ID für eine Funktion, falls die Eingabe funktional erzeugt wurde. Standard ist 0.
 * @param valueFlags      (Optional) Wertbezogene Flags, z. B. {@code SIMONE_FLAG_VALUE_INVALID}. Standard ist {@code SIMONE_NO_FLAG}.
 * @param srcId           (Optional) ID der Quelle der Werteingabe (z. B. Benutzer, System). Standard ist 0.
 * @param comment         (Optional) Kommentar zur Änderung (z. B. „Initialwert gesetzt“). Kann null sein.
 */
public record WriteDataExRequestDto(
    Integer timeValue,
    int objId,
    int extId,
    Float value,
    String valueStr,
    Integer unitDescriptor,
    Integer condFlags,
    Integer condId,
    Integer funcId,
    Integer valueFlags,
    Integer srcId,
    String comment
) {}
