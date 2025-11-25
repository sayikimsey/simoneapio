// package com.gascade.simone.dto;

// import java.util.List;

// /**
//  * A DTO for returning a list of valid extensions for a given SIMONE object.
//  */

// public class ValidExtensionsDto {
// 	private List<String> extensions;
// 	public ValidExtensionsDto(List<String> extensions) {
// 		this.extensions = extensions;
// 	}
// 	public List<String> getExtensions() {
// 		return extensions;
// 	}

// 	public void setExtensions(List<String> extensions) {
// 		this.extensions = extensions;
// 	}

// }

package com.gascade.simone.dto;

import java.util.List;

/**
 * DTO zur Rückgabe einer Liste gültiger Erweiterungen (Extensions) für ein SIMONE-Objekt.
 */
public class ValidExtensionsDto {

    private List<String> extensions;

    /**
     * Konstruktor zur Initialisierung mit einer Liste von Erweiterungen.
     *
     * @param extensions Liste gültiger Extension-Namen.
     */
    public ValidExtensionsDto(List<String> extensions) {
        this.extensions = extensions;
    }

    /**
     * Gibt die Liste der gültigen Erweiterungen zurück.
     *
     * @return Liste von Erweiterungen.
     */
    public List<String> getExtensions() {
        return extensions;
    }

    /**
     * Setzt die Liste der gültigen Erweiterungen.
     *
     * @param extensions Neue Liste von Erweiterungen.
     */
    public void setExtensions(List<String> extensions) {
        this.extensions = extensions;
    }
}
