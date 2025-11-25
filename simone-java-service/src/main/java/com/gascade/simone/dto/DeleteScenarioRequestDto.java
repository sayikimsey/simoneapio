// package com.gascade.simone.dto;

// public class DeleteScenarioRequestDto {
//     private String scenarioName;

//     public String getScenarioName() {
//         return scenarioName;
//     }

//     public void setScenarioName(String scenarioName) {
//         this.scenarioName = scenarioName;
//     }
// }

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) für das Löschen eines SIMONE-Szenarios.
 * Enthält den Namen des zu löschenden Szenarios.
 */
public class DeleteScenarioRequestDto {

    @NotBlank(message = "Szenariename darf nicht leer sein.")
    private String scenarioName;

    /**
     * Gibt den Namen des zu löschenden Szenarios zurück.
     *
     * @return Szenariename
     */
    public String getScenarioName() {
        return scenarioName;
    }

    /**
     * Setzt den Namen des zu löschenden Szenarios.
     *
     * @param scenarioName Szenariename
     */
    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }
}
