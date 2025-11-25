// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// /**
//  * DTO for the 'Save Scenario As' (copy) operation.
//  *
//  * @param sourceScenarioName The name of the existing scenario to copy.
//  * @param newScenarioName    The name for the new copied scenario.
//  */
// public record CopyScenarioRequestDto(
//     @NotBlank(message = "Source scenario name must not be blank.")
//     String sourceScenarioName,

//     @NotBlank(message = "New scenario name must not be blank.")
//     String newScenarioName
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) für die „Szenario kopieren“-Operation.
 * Wird verwendet, um ein bestehendes Szenario unter einem neuen Namen zu speichern.
 *
 * @param sourceScenarioName Name des vorhandenen Szenarios, das kopiert werden soll.
 * @param newScenarioName    Neuer Name für das zu erstellende (kopierte) Szenario.
 */
public record CopyScenarioRequestDto(

    @NotBlank(message = "Der Name des Quellszenarios darf nicht leer sein.")
    String sourceScenarioName,

    @NotBlank(message = "Der Name des neuen Szenarios darf nicht leer sein.")
    String newScenarioName
) {}
