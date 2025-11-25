// package com.gascade.simone.dto;

// import java.util.List;

// public class VarIdBatchRequestDto {
//     private String networkName;
//     private List<String> variableNames;

//     public VarIdBatchRequestDto() {}

//     public VarIdBatchRequestDto(String networkName, List<String> variableNames) {
//         this.networkName = networkName;
//         this.variableNames = variableNames;
//     }

//     public String getNetworkName() {
//         return networkName;
//     }

//     public void setNetworkName(String networkName) {
//         this.networkName = networkName;
//     }

//     public List<String> getVariableNames() {
//         return variableNames;
//     }

//     public void setVariableNames(List<String> variableNames) {
//         this.variableNames = variableNames;
//     }
// }

package com.gascade.simone.dto;

import java.util.List;

/**
 * DTO für die Anforderung einer Liste von Variablen-IDs basierend auf ihrem Namen und dem zugehörigen Netzwerknamen.
 * Wird z. B. verwendet, um mehrere Variablen-IDs in einem Schritt abzurufen.
 */
public class VarIdBatchRequestDto {

    private String networkName;
    private List<String> variableNames;

    /**
     * Standardkonstruktor (erforderlich für Frameworks wie Jackson).
     */
    public VarIdBatchRequestDto() {}

    /**
     * Konstruktor zur Initialisierung aller Felder.
     *
     * @param networkName    Der Name des Netzwerks, aus dem die Variablen stammen.
     * @param variableNames  Liste der Variablennamen, deren IDs abgefragt werden sollen.
     */
    public VarIdBatchRequestDto(String networkName, List<String> variableNames) {
        this.networkName = networkName;
        this.variableNames = variableNames;
    }

    /**
     * Gibt den Namen des Netzwerks zurück.
     *
     * @return Netzwerkname als String.
     */
    public String getNetworkName() {
        return networkName;
    }

    /**
     * Setzt den Namen des Netzwerks.
     *
     * @param networkName Netzwerkname als String.
     */
    public void setNetworkName(String networkName) {
        this.networkName = networkName;
    }

    /**
     * Gibt die Liste der Variablennamen zurück.
     *
     * @return Liste von Variablennamen.
     */
    public List<String> getVariableNames() {
        return variableNames;
    }

    /**
     * Setzt die Liste der Variablennamen.
     *
     * @param variableNames Liste von Variablennamen.
     */
    public void setVariableNames(List<String> variableNames) {
        this.variableNames = variableNames;
    }
}
