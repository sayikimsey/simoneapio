// package com.gascade.simone.dto;

// /**
//  * Represents a single SIMONE run type for selection in a dropdown.
//  *
//  * @param id The numeric constant for the run type (e.g., SimoneConst.SIMONE_RUNTYPE_DYN).
//  * @param name The display name for the run type (e.g., "Dynamic Simulation (DYN)").
//  */
// public record RunTypeDto(int id, String name) {}


package com.gascade.simone.dto;

/**
 * Repräsentiert einen einzelnen SIMONE-Simulationstyp für die Auswahl in einer Dropdown-Liste.
 *
 * @param id   Die numerische Konstante des Simulationstyps (z. B. {@code SimoneConst.SIMONE_RUNTYPE_DYN}).
 * @param name Der Anzeigename des Simulationstyps (z. B. „Dynamische Simulation (DYN)“).
 */
public record RunTypeDto(int id, String name) {}
