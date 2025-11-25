// package com.gascade.simone.dto;

// import java.util.List;

// public class VarIdBatchResponseDto {
//     private List<VarIdResponseDto> results;

//     public VarIdBatchResponseDto() {}

//     public VarIdBatchResponseDto(List<VarIdResponseDto> results) {
//         this.results = results;
//     }

//     public List<VarIdResponseDto> getResults() {
//         return results;
//     }

//     public void setResults(List<VarIdResponseDto> results) {
//         this.results = results;
//     }
// }

package com.gascade.simone.dto;

import java.util.List;

/**
 * Antwort-DTO für eine Batch-Anfrage zur Variablen-Identifikation.
 * Enthält eine Liste von {@link VarIdResponseDto}-Einträgen, jeweils für eine angefragte Variable.
 */
public class VarIdBatchResponseDto {

    private List<VarIdResponseDto> results;

    /**
     * Standardkonstruktor (benötigt für Deserialisierung).
     */
    public VarIdBatchResponseDto() {}

    /**
     * Konstruktor mit Ergebnisliste.
     *
     * @param results Liste mit den Resultaten der Variablen-ID-Auflösung.
     */
    public VarIdBatchResponseDto(List<VarIdResponseDto> results) {
        this.results = results;
    }

    /**
     * Gibt die Liste der Resultate zurück.
     *
     * @return Liste mit {@link VarIdResponseDto}.
     */
    public List<VarIdResponseDto> getResults() {
        return results;
    }

    /**
     * Setzt die Liste der Resultate.
     *
     * @param results Liste mit {@link VarIdResponseDto}.
     */
    public void setResults(List<VarIdResponseDto> results) {
        this.results = results;
    }
}
