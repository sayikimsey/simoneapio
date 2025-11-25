// // src/main/java/com/gascade/simone/dto/VarIdRequestDto.java
// package com.gascade.simone.dto;

// import com.fasterxml.jackson.annotation.JsonCreator;
// import com.fasterxml.jackson.annotation.JsonProperty;

// /**
//  * DTO for requesting the translation of a variable name to its corresponding IDs.
//  * This now includes the network name to ensure the translation is performed
//  * in the correct context.
//  */
// public class VarIdRequestDto {

//     private final String variableName;
//     private final String networkName;

//     @JsonCreator
//     public VarIdRequestDto(
//             @JsonProperty("variableName") String variableName,
//             @JsonProperty("networkName") String networkName) {
//         if (variableName == null || variableName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Variable name cannot be null or empty.");
//         }
//         if (networkName == null || networkName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Network name cannot be null or empty.");
//         }
//         this.variableName = variableName;
//         this.networkName = networkName;
//     }

//     public String getVariableName() {
//         return variableName;
//     }

//     public String getNetworkName() {
//         return networkName;
//     }
// }

package com.gascade.simone.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO für die Anfrage zur Übersetzung eines Variablennamens in die zugehörigen SIMONE-IDs (Objekt-ID und Externe-ID).
 * Enthält zusätzlich den Netzwerknamen, um die Anfrage im richtigen Kontext auszuführen.
 */
public class VarIdRequestDto {

    private final String variableName;
    private final String networkName;

    /**
     * Konstruktor mit Validierung für Netzwerk- und Variablennamen.
     *
     * @param variableName  Der Name der zu übersetzenden Variable (z. B. "LINE.FLOW").
     * @param networkName   Der Name des Netzwerks, in dem die Übersetzung erfolgen soll.
     * @throws IllegalArgumentException wenn einer der Parameter null oder leer ist.
     */
    @JsonCreator
    public VarIdRequestDto(
            @JsonProperty("variableName") String variableName,
            @JsonProperty("networkName") String networkName) {
        if (variableName == null || variableName.trim().isEmpty()) {
            throw new IllegalArgumentException("Variablenname darf nicht null oder leer sein.");
        }
        if (networkName == null || networkName.trim().isEmpty()) {
            throw new IllegalArgumentException("Netzwerkname darf nicht null oder leer sein.");
        }
        this.variableName = variableName;
        this.networkName = networkName;
    }

    /**
     * Gibt den Variablennamen zurück, der übersetzt werden soll.
     *
     * @return Variablenname als String.
     */
    public String getVariableName() {
        return variableName;
    }

    /**
     * Gibt den Namen des Netzwerks zurück, in dem die Variable übersetzt werden soll.
     *
     * @return Netzwerkname als String.
     */
    public String getNetworkName() {
        return networkName;
    }
}
