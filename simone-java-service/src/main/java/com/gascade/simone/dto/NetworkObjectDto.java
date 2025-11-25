// // src/main/java/com/gascade/simone/dto/NetworkObjectDto.java
// package com.gascade.simone.dto;

// public record NetworkObjectDto(
//     int objId,
//     String objName,
//     int objectTypeCode,    // The integer type code from SIMONE
//     String objectTypeName, // Human-readable type name
//     String subsystemName
// ) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt zur Repräsentation eines Objekts innerhalb eines SIMONE-Netzwerks.
 *
 * @param objId           Die eindeutige ID des Objekts (von SIMONE vergeben).
 * @param objName         Der Name des Objekts.
 * @param objectTypeCode  Der numerische Objekttyp-Code laut SIMONE.
 * @param objectTypeName  Der menschenlesbare Name des Objekttyps (z. B. "Ventil", "Knoten").
 * @param subsystemName   Der Name des Subsystems, zu dem das Objekt gehört (z. B. „GAS“, „ELEKTRISCH“).
 */
public record NetworkObjectDto(
    int objId,
    String objName,
    int objectTypeCode,
    String objectTypeName,
    String subsystemName
) {}
