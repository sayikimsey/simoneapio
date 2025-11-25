// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;

// /**
//  * Data Transfer Object for creating a new SIMONE scenario.
//  * Using a Java Record for immutability and conciseness. It also automatically
//  * provides implementations for equals(), hashCode(), and toString().
//  * Includes validation annotations to ensure data integrity at the controller level.
//  *
//  * @param scenarioName      The name for the new scenario. Must not be blank.
//  * @param runtype           The type of simulation (e.g., dynamic, static), corresponding to SimoneConst values. Must be provided.
//  * @param initialConditions The name of the initial conditions file (e.g., "INIT" or another scenario name). Must not be blank.
//  * @param comment           An optional descriptive comment for the scenario. Can be null.
//  * @param initTime          The start time of the simulation, as a Unix timestamp (seconds). Must be provided.
//  * @param termTime          The end time of the simulation, as a Unix timestamp (seconds). Must be provided.
//  */
// public record CreateScenarioRequestDto(
//     @NotBlank(message = "Scenario name must not be blank.")
//     String scenarioName,

//     @NotNull(message = "Run type must not be null.")
//     Integer runtype,

//     @NotBlank(message = "Initial conditions must not be blank.")
//     String initialConditions,

//     String comment,

//     @NotNull(message = "Initial time must not be null.")
//     Long initTime,

//     @NotNull(message = "Terminal time must not be null.")
//     Long termTime
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Daten-Transfer-Objekt (DTO) zur Erstellung eines neuen SIMONE-Szenarios.
 * Dieses Record stellt sicher, dass die Szenariodaten beim Empfang vollständig
 * und korrekt validiert werden.
 *
 * @param scenarioName      Der Name des neuen Szenarios. Darf nicht leer sein.
 * @param runtype           Der Simulationsmodus (z. B. statisch oder dynamisch),
 *                          entsprechend den Konstanten aus SimoneConst. Pflichtfeld.
 * @param initialConditions Der Name der Anfangsbedingungen (z. B. "INIT" oder ein anderes Szenario). Darf nicht leer sein.
 * @param comment           Optionaler Kommentar zum Szenario. Kann null sein.
 * @param initTime          Startzeit der Simulation als Unix-Zeitstempel (Sekunden seit 1970). Pflichtfeld.
 * @param termTime          Endzeit der Simulation als Unix-Zeitstempel. Pflichtfeld.
 */
public record CreateScenarioRequestDto(

    @NotBlank(message = "Der Szenarioname darf nicht leer sein.")
    String scenarioName,

    @NotNull(message = "Der Simulationstyp darf nicht null sein.")
    Integer runtype,

    @NotBlank(message = "Die Angabe der Anfangsbedingungen darf nicht leer sein.")
    String initialConditions,

    String comment,

    @NotNull(message = "Die Startzeit darf nicht null sein.")
    Long initTime,

    @NotNull(message = "Die Endzeit darf nicht null sein.")
    Long termTime
) {}
