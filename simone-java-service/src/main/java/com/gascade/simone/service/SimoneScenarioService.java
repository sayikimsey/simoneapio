// // src/main/java/com/gascade/simone/service/SimoneScenarioService.java
// package com.gascade.simone.service;

// import java.time.Instant;
// import java.time.ZoneId;
// import java.time.ZonedDateTime;
// import java.time.format.DateTimeFormatter;
// import java.util.ArrayList;
// import java.util.Collections; 
// import java.util.List; 

// import org.slf4j.Logger; 
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.gascade.simone.dto.CalculationMessageDto;
// import com.gascade.simone.dto.CopyScenarioRequestDto;
// import com.gascade.simone.dto.CreateScenarioRequestDto;
// import com.gascade.simone.dto.CurrentScenarioCalculationStatusResponseDto;
// import com.gascade.simone.dto.DeleteScenarioRequestDto;
// import com.gascade.simone.dto.ExecuteScenarioResponseDto;
// import com.gascade.simone.dto.OpenScenarioRequestDto;
// import com.gascade.simone.dto.ReadDataRequestItemDto;
// import com.gascade.simone.dto.ReadDataResponseItemDto;
// import com.gascade.simone.dto.ReadStringDataRequestDto;
// import com.gascade.simone.dto.ReadStringDataResponseDto;
// import com.gascade.simone.dto.ScenarioCalculationStatusResponseDto;
// import com.gascade.simone.dto.ScenarioListItemDto;
// import com.gascade.simone.dto.WriteDataExRequestDto;
// import com.gascade.simone.dto.WriteDataExResponseDto;
// import com.gascade.simone.dto.WriteDataRequestItemDto;
// import com.gascade.simone.dto.WriteDataResponseItemDto;

// import de.liwacom.simone.SimInt;
// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimTimeT;
// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst;

// @Service
// public class SimoneScenarioService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneScenarioService.class);
//     private final SimoneApi simoneApi;
//     private final boolean isSimoneApiInstantiated;
//     private final SimoneLifecycleService lifecycleService;
//     private final SimoneNetworkService networkService;
    
//     private final Object simoneApiLock = new Object();    
//     private String openScenarioName = null;
//     private int openScenarioMode = -1; 
//     private Integer currentRTimeValue = null; 

//     @Autowired
//     public SimoneScenarioService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
//         this.lifecycleService = lifecycleService;
//         this.networkService = networkService;
        
//         SimoneApi tempApi = null;
//         boolean instantiated = false;
//         try {
//             tempApi = SimoneApi.getInstance();
//             if (tempApi != null) {
//                 logger.info("SimoneScenarioService: SimoneAPI instance obtained successfully.");
//                 instantiated = true;
//             } else {
//                 logger.error("SimoneScenarioService: Failed to get SimoneAPI instance (getInstance returned null).");
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("SimoneScenarioService: CRITICAL - UnsatisfiedLinkError obtaining SimoneAPI. {}", ule.getMessage());
//         } catch (Throwable t) {
//             logger.error("SimoneScenarioService: CRITICAL - Unexpected error obtaining SimoneAPI instance: {}", t.getMessage(), t);
//         }
//         this.simoneApi = tempApi;
//         this.isSimoneApiInstantiated = instantiated;
//     }

//     /**
//  * Custom exception for errors that occur during SIMONE scenario operations.
//  */
// public class SimoneScenarioException extends RuntimeException {

//     public SimoneScenarioException(String message) {
//         super(message);
//     }

//     public SimoneScenarioException(String message, Throwable cause) {
//         super(message, cause);
//     }
// }


// // Add this method to your SimoneScenarioService class

// /**
//  * Creates a copy of an existing scenario under a new name.
//  * It opens the source scenario, performs the 'save as' operation, and ensures the source scenario is closed.
//  *
//  * @param request DTO containing the source and new scenario names.
//  * @return A success message.
//  * @throws SimoneScenarioException if the copy operation fails for any reason.
//  */
// public String copyScenario(CopyScenarioRequestDto request) {
//     checkApiAndScenarioReady(false, true); // API must be ready, network selected

//     synchronized (simoneApiLock) {
//         logger.info("Service: Attempting to copy scenario '{}' to '{}'.", request.sourceScenarioName(), request.newScenarioName());

//         // A scenario must be opened to be copied. We will open the source scenario temporarily.
//         int openStatus = simoneApi.simone_open(request.sourceScenarioName(), SimoneConst.SIMONE_MODE_READ);
//         if (openStatus != SimoneConst.simone_status_ok) {
//             SimString errorMsg = new SimString();
//             simoneApi.simone_last_error(errorMsg);
//             throw new SimoneScenarioException("Failed to open source scenario '" + request.sourceScenarioName() + "' for copying. SIMONE Error: " + errorMsg.getVal());
//         }

//         try {
       
//             int saveStatus = simoneApi.simone_scenario_save_as(
//                 request.newScenarioName(),
//                 0,       
//                 null,    
//                 null,    
//                 SimoneConst.SIMONE_FLAG_VISIBLE 
//             );

//             if (saveStatus != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString();
//                 simoneApi.simone_last_error(errorMsg);               
//                 if (errorMsg.getVal() != null && errorMsg.getVal().contains("exists")) {
//                      throw new SimoneScenarioException("Cannot copy scenario: The destination scenario '" + request.newScenarioName() + "' already exists.");
//                 }
//                 throw new SimoneScenarioException("Failed to save scenario as '" + request.newScenarioName() + "'. SIMONE Error: " + errorMsg.getVal());
//             }

//             logger.info("Successfully copied scenario '{}' to '{}'.", request.sourceScenarioName(), request.newScenarioName());
//             return "Scenario '" + request.sourceScenarioName() + "' was successfully copied to '" + request.newScenarioName() + "'.";

//         } finally {          
//             int closeStatus = simoneApi.simone_close();
//             if (closeStatus != SimoneConst.simone_status_ok) {
//                 logger.warn("Failed to properly close source scenario '{}' after copy attempt, but operation may have completed.", request.sourceScenarioName());
//             }
//         }
//     }
// }

//     public void createScenario(CreateScenarioRequestDto request) {
//     if (!isSimoneApiInstantiated || simoneApi == null) {
//         throw new SimoneScenarioException("Cannot create scenario: SIMONE API native component not loaded.");
//     }
//     if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//         throw new SimoneScenarioException("Cannot create scenario: SIMONE environment is not initialized.");
//     }

//     synchronized (simoneApiLock) {
//         logger.info("Attempting to create scenario: {}", request.scenarioName());

//         int openStatus = simoneApi.simone_open(request.scenarioName(), SimoneConst.SIMONE_MODE_CREATE | SimoneConst.SIMONE_FLAG_VISIBLE);
//         if (openStatus != SimoneConst.simone_status_ok) {
//             SimString errorMsg = new SimString();
//             simoneApi.simone_last_error(errorMsg);
//             logger.error("Failed to open new scenario '{}'. Status: {}, SIMONE Error: {}", request.scenarioName(), openStatus, errorMsg.getVal());
//             throw new SimoneScenarioException("Failed to create scenario. SIMONE error: " + errorMsg.getVal());
//         }

//         try {
//             // STEP 1: Test with only simone_set_properties
//             int propsStatus = simoneApi.simone_set_properties(request.runtype(), "default", request.initialConditions());
//             if (propsStatus != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString();
//                 simoneApi.simone_last_error(errorMsg);
//                 throw new SimoneScenarioException("Failed to set scenario properties. SIMONE error: " + errorMsg.getVal());
//             }
//             logger.debug("Successfully set properties for scenario '{}'", request.scenarioName());

            
//             // // STEP 2: If the above does not crash, uncomment this block to test simone_set_times
//             // logger.info("Calling simone_set_times with initTime: {} and termTime: {}", request.initTime().intValue(), request.termTime().intValue());
//             // int timesStatus = simoneApi.simone_set_times(request.initTime().intValue(), request.termTime().intValue());
//             // if (timesStatus != SimoneConst.simone_status_ok) {
//             //     SimString errorMsg = new SimString();
//             //     simoneApi.simone_last_error(errorMsg);
//             //     throw new SimoneScenarioException("Failed to set scenario times. SIMONE error: " + errorMsg.getVal());
//             // }
//             // logger.debug("Successfully set times for scenario '{}'", request.scenarioName());
            

            
//             // // STEP 3: If the above does not crash, uncomment this block to test the comment
//             // if (request.comment() != null && !request.comment().isEmpty()) {
//             //     int commentStatus = simoneApi.simone_set_scenario_comment(request.comment());
//             //     if (commentStatus != SimoneConst.simone_status_ok) {
//             //         logger.warn("Failed to set scenario comment for '{}'.", request.scenarioName());
//             //     } else {
//             //         logger.debug("Successfully set comment for scenario '{}'", request.scenarioName());
//             //     }
//             // }
            

//         } catch (Exception e) {
//             SimString errorMsg = new SimString();
//             simoneApi.simone_last_error(errorMsg);
//             logger.error("An error occurred during scenario configuration for '{}'. SIMONE Error: {}. Exception: {}", request.scenarioName(), errorMsg.getVal(), e.getMessage(), e);
//             throw new SimoneScenarioException("Error during scenario configuration: " + e.getMessage(), e);
//         } finally {
//             // Always close the scenario to save changes and release the lock.
//             int closeStatus = simoneApi.simone_close();
//             if (closeStatus != SimoneConst.simone_status_ok) {
//                 logger.warn("Failed to properly close scenario '{}', but creation might have partially succeeded.", request.scenarioName());
//             } else {
//                 logger.info("Successfully created and closed scenario: {}", request.scenarioName());
//             }
//         }
//     }
// }

//     /**
//      * Deletes a SIMONE scenario.
//      * This method is synchronized on a dedicated lock object to prevent native library crashes.
//      * It now also ensures that if the deleted scenario was the currently open one,
//      * the internal state of the service is cleaned up.
//      *
//      * @param request The DTO containing the name of the scenario to delete.
//      * @throws SimoneScenarioException if the deletion fails.
//      */
//     public void deleteScenario(DeleteScenarioRequestDto request) {
//         if (!isSimoneApiInstantiated || simoneApi == null) {
//             throw new SimoneScenarioException("Cannot delete scenario: SIMONE API native component not loaded.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new SimoneScenarioException("Cannot delete scenario: SIMONE environment is not initialized.");
//         }
                
//         synchronized (simoneApiLock) {
//             logger.info("Attempting to delete scenario: {}", request.getScenarioName());

//             try {
              
//                 int deleteStatus = simoneApi.simone_remove(request.getScenarioName(), SimoneConst.SIMONE_FLAG_REMOVE_ALL);
//                 if (deleteStatus != SimoneConst.simone_status_ok) {
//                     SimString errorMsg = new SimString();
//                     simoneApi.simone_last_error(errorMsg);
//                     logger.error("Failed to delete scenario '{}'. Status: {}, SIMONE Error: {}", request.getScenarioName(), deleteStatus, errorMsg.getVal());
//                     throw new SimoneScenarioException("Failed to delete scenario '" + request.getScenarioName() + "'. SIMONE error: " + errorMsg.getVal());
//                 }
//                 logger.info("Successfully deleted scenario from file system: {}", request.getScenarioName());
      
//                 if (request.getScenarioName().equals(this.openScenarioName)) {
//                     logger.info("The deleted scenario '{}' was the currently open one. Clearing service's open scenario state.", this.openScenarioName);
//                     this.openScenarioName = null;
//                     this.openScenarioMode = -1; 
//                     this.currentRTimeValue = null;
//                 }
          
                
//             } catch (Exception e) {
//                 logger.error("An unexpected error occurred while trying to delete scenario '{}'.", request.getScenarioName(), e);
//                 throw new SimoneScenarioException("An unexpected error occurred during scenario deletion: " + e.getMessage(), e);
//             }
//         }
//     }

//     private void checkApiAndScenarioReady(boolean scenarioMustBeOpen, boolean networkMustBeSelected) {
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API native component not loaded.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE environment not initialized. Call /initialize first.");
//         }
//         if (networkMustBeSelected) {
//             String currentNetwork = networkService.getCurrentNetwork();
//             if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
//                 throw new IllegalStateException("No network selected. Call /networks/current/select first.");
//             }
//         }
//         if (scenarioMustBeOpen && (this.openScenarioName == null)) {
//             throw new IllegalStateException("No scenario is currently open. Please open a scenario first.");
//         }
//     }
    
//     public List<ScenarioListItemDto> listScenariosWithDetails() {
//         checkApiAndScenarioReady(false, true); 
//         String currentNetwork = networkService.getCurrentNetwork(); 
//         logger.info("Listing scenarios with details for network: {}", currentNetwork);

//         List<ScenarioListItemDto> scenarioDetailsList = new ArrayList<>();
//         SimString scenarioNameOutput = new SimString();
//         int listStatus;

//         SimInt runtypeOut = new SimInt();
//         SimString initialConditionOut = new SimString(); 
//         SimTimeT initimeOut = new SimTimeT(); 
//         SimTimeT termtimeOut = new SimTimeT(); 
//         SimString ownerOut = new SimString();       
//         SimString commentOut = new SimString();     
        
//         try {
//             listStatus = this.simoneApi.simone_scenario_list_start(SimoneConst.SIMONE_NO_FLAG);
//             if (listStatus == SimoneConst.simone_status_not_found) { return Collections.emptyList(); }
//             if (listStatus != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString(); this.simoneApi.simone_last_error(errorMsg);
//                 throw new RuntimeException("Failed to start scenario list. SIMONE Error: " + errorMsg.getVal());
//             }
//             while (true) {
//                 listStatus = this.simoneApi.simone_scenario_list_next(scenarioNameOutput, SimoneConst.SIMONE_NO_FLAG);
//                 if (listStatus == SimoneConst.simone_status_ok) {
//                     String name = scenarioNameOutput.getVal();
//                     if (name == null || name.isEmpty()) continue; 
//                     int infoStatus = this.simoneApi.simone_scenario_list_info(
//                         runtypeOut, initialConditionOut, initimeOut, termtimeOut, 
//                         ownerOut, commentOut, SimoneConst.SIMONE_NO_FLAG);
//                     if (infoStatus == SimoneConst.simone_status_ok) {
//                         scenarioDetailsList.add(new ScenarioListItemDto(name, Integer.valueOf(runtypeOut.getVal()), 
//                             initialConditionOut.getVal(), Long.valueOf(initimeOut.getVal()).intValue(), // Corrected to Integer for DTO
//                             Long.valueOf(termtimeOut.getVal()).intValue(), // Corrected to Integer for DTO
//                             ownerOut.getVal(), commentOut.getVal()));
//                     } else {
//                         scenarioDetailsList.add(new ScenarioListItemDto(name, null, null, null, null, null, null));
//                     }
//                 } else if (listStatus == SimoneConst.simone_status_not_found) { break; 
//                 } else { SimString errorMsg = new SimString(); this.simoneApi.simone_last_error(errorMsg); logger.error("Error listing scenarios: {}", errorMsg.getVal()); break; }
//             }
//         } catch (Throwable t) { throw new RuntimeException("Unexpected error listing scenarios: " + t.getMessage(), t); }
//         return scenarioDetailsList;
//     }
    

// public String openScenario(OpenScenarioRequestDto request) {
//     checkApiAndScenarioReady(false, false);

//     synchronized (simoneApiLock) {
//         logger.info("Service: Opening scenario: '{}' in network '{}', mode: '{}'",
//                 request.scenarioName(), request.networkName(), request.mode());

//         if (this.openScenarioName != null) {
//             logger.warn("Scenario '{}' already open. Closing first.", this.openScenarioName);
//             try {
//                 closeScenario();
//             } catch (Exception e) {
//                 logger.error("Error auto-closing scenario: {}", e.getMessage());
//             }
//         }

//         // Select the network before opening the scenario
//         int selectStatus = simoneApi.simone_select(request.networkName());
//         if (selectStatus != SimoneConst.simone_status_ok) {
//             throw new SimoneScenarioException("Failed to select network '" + request.networkName() + "' before opening scenario.");
//         }

//         int modeFlag;
//         switch (request.mode().toUpperCase()) {
//             case "READ":
//                 modeFlag = SimoneConst.SIMONE_MODE_READ;
//                 break;
//             case "WRITE":
//                 modeFlag = SimoneConst.SIMONE_MODE_WRITE;
//                 break;
//             case "CREATE":
//                 modeFlag = SimoneConst.SIMONE_MODE_CREATE;
//                 break;
//             default:
//                 // REMOVED: simoneApi.simone_deselect(0);
//                 throw new IllegalArgumentException("Invalid mode: " + request.mode());
//         }

//         int finalFlags = modeFlag | (request.isVisible() ? SimoneConst.SIMONE_FLAG_VISIBLE : SimoneConst.SIMONE_NO_FLAG);

//         int status = this.simoneApi.simone_open(request.scenarioName().trim(), finalFlags);
//         if (status == SimoneConst.simone_status_ok) {
//             this.openScenarioName = request.scenarioName().trim();
//             this.openScenarioMode = modeFlag;
//             // --- FIX: Only set rtime for READ mode ---
//             if (modeFlag == SimoneConst.SIMONE_MODE_READ) {
//                 setRetrievalTimeInternal(0, "after scenario open");
//             }
//             return "Scenario '" + this.openScenarioName + "' opened successfully.";
//         } else {
//             SimString em = new SimString();
//             this.simoneApi.simone_last_error(em);
//             // REMOVED: simoneApi.simone_deselect(0);
//             throw new RuntimeException("Failed to open scenario. SIMONE Error: " + em.getVal());
//         }
//     }
// }
//     public String closeScenario() {
//     checkApiAndScenarioReady(false, false);
//     logger.info("Service: Closing scenario. Last known: '{}'", this.openScenarioName);

//     synchronized (simoneApiLock) {
//         String prevOpen = this.openScenarioName;
//         try {
//             if (prevOpen != null) {
//                 int status = this.simoneApi.simone_close();
//                 if (status != SimoneConst.simone_status_ok) {
//                     SimString em = new SimString();
//                     this.simoneApi.simone_last_error(em);
//                     logger.warn("simone_close() failed but proceeding with cleanup. Error: {}", em.getVal());
//                 }
//             }
//         } finally {
//             // Reset state but do NOT deselect the network
//             this.openScenarioName = null;
//             this.openScenarioMode = -1;
//             this.currentRTimeValue = null;

//             // REMOVED the entire simone_deselect block
//             logger.info("Scenario closed. Network remains selected.");
//         }
//         return "Scenario '" + (prevOpen != null ? prevOpen : "unknown") + "' closed.";
//     }
// }


// public String setRetrievalTime(int timeValue) {
//     // This check is important and should be here.
//     checkApiAndScenarioReady(true, true); 
    
//     // This calls the internal method that now contains the mode-checking logic.
//     setRetrievalTimeInternal(timeValue, "external API request");
    
//     return "Retrieval time set to " + formatTimeTForResponse(timeValue) + ".";
// }
//    // src/main/java/com/gascade/simone/service/SimoneScenarioService.java

// /**
//  * Internal method to handle the actual SIMONE API call for setting rtime.
//  * This now throws an exception if the scenario is in an incorrect mode.
//  */
// private void setRetrievalTimeInternal(int timeValue, String context) {
//     // FIX: Throw an exception if the scenario is open in a mode that doesn't support setting rtime.
//     if (this.openScenarioMode == SimoneConst.SIMONE_MODE_WRITE || this.openScenarioMode == SimoneConst.SIMONE_MODE_CREATE) {
//         String mode = (this.openScenarioMode == SimoneConst.SIMONE_MODE_WRITE) ? "WRITE" : "CREATE";
//         String errorMessage = "Cannot set retrieval time (rtime) when a scenario is open in " + mode + " mode.";
//         logger.warn("Service (Internal): Attempted to set rtime in invalid mode. Context: {}. Error: {}", context, errorMessage);
//         throw new IllegalStateException(errorMessage);
//     }

//     logger.info("Service (Internal): Setting SIMONE rtime to {} for context: {}", timeValue, context);
//     int status = this.simoneApi.simone_set_rtime(timeValue);
//     if (status == SimoneConst.simone_status_ok) {
//         this.currentRTimeValue = timeValue;
//         logger.info("SIMONE rtime set to: {}", timeValue);
//     } else {
//         SimString em = new SimString();
//         this.simoneApi.simone_last_error(em);
//         throw new RuntimeException("Failed to set rtime. SIMONE Error: " + em.getVal());
//     }
// }

//     public Integer getRetrievalTimeValue() { 
//         checkApiAndScenarioReady(true, true); 
//         SimTimeT rtimeOutput = new SimTimeT(); 
//         int status = this.simoneApi.simone_get_rtime(rtimeOutput); 
//         if (status == SimoneConst.simone_status_ok) {
//             this.currentRTimeValue = rtimeOutput.getVal(); 
//             return this.currentRTimeValue;
//         } else { SimString em = new SimString(); this.simoneApi.simone_last_error(em); throw new RuntimeException("Failed to get rtime. SIMONE Error: " + em.getVal()); }
//     }
    
//     /**
//      * Advances the retrieval time to the next available time slot in the current scenario.
//      * @return The new retrieval time (epoch seconds as int), or null if no more time slots.
//      * @throws IllegalStateException if API not ready or no scenario open.
//      * @throws RuntimeException if SIMONE API call fails for other reasons.
//      */
//     public Integer advanceToNextRetrievalTime() {
//         logger.info("Service: Attempting to advance to next retrieval time.");
//         checkApiAndScenarioReady(true, true); 

//         SimTimeT nextRTimeOutput = new SimTimeT();

//         try {
//             logger.debug("Calling simoneApi.simone_next_rtime(nextRTimeOutput)...");
       
//             int status = this.simoneApi.simone_next_rtime(nextRTimeOutput);
//             logger.info("simone_next_rtime status: {}", status);

//             if (status == SimoneConst.simone_status_ok) {
//                 this.currentRTimeValue = nextRTimeOutput.getVal(); // Update current time
//                 logger.info("Advanced to next retrieval time: {}", this.currentRTimeValue);
//                 return this.currentRTimeValue;
//             } else if (status == SimoneConst.simone_status_invtime) {          
//                 logger.info("No more retrieval times available in the scenario (already at end or end reached).");
          
//                 return this.currentRTimeValue; 
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneError = errorMsg.getVal();
//                 logger.error("Failed to advance to next retrieval time. Status: {}, SIMONE Error: {}", status, simoneError);
//                 throw new RuntimeException("Failed to get next retrieval time. SIMONE Error: " + simoneError);
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError calling simone_next_rtime: {}. Native library issue.", ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error while advancing retrieval time.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error calling simone_next_rtime: {}", t.getMessage(), t);
//             throw new RuntimeException("Unexpected error advancing retrieval time: " + t.getMessage(), t);
//         }
//     }
    
//     public String formatTimeTForResponse(Integer epochSecondsInt) {
//         if (epochSecondsInt == null) return "N/A";
//         long epochSeconds = epochSecondsInt.longValue();
//         if (this.openScenarioName != null && epochSeconds == 0L) { 
//             return "Start of Scenario (time_t=0)";
//         }
//         try {
//             Instant instant = Instant.ofEpochSecond(epochSeconds);
//             ZonedDateTime zdt = ZonedDateTime.ofInstant(instant, ZoneId.systemDefault());
//             return zdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));
//         } catch (Exception e) {
//             logger.warn("Could not format epochSecondsInt {}: {}", epochSecondsInt, e.getMessage());
//             return String.valueOf(epochSecondsInt) + " (epoch seconds, int)";
//         }
//     }
// // --- NEW: Read Float Data Array ---

//     public List<ReadDataResponseItemDto> readFloatDataArray(List<ReadDataRequestItemDto> variablesToRead) {
//         logger.info("Service: readFloatDataArray called for {} variables.", 
//             (variablesToRead != null ? variablesToRead.size() : 0));
        
//         checkApiAndScenarioReady(true, true); 
        
//         if (this.currentRTimeValue == null) {
//             logger.warn("Retrieval time (rtime) is not set. Reading data at SIMONE's current default time.");
//         }
//         logger.info("Reading data for rtime: {}", this.currentRTimeValue);

//         if (variablesToRead == null || variablesToRead.isEmpty()) {
//             logger.info("No variables requested to read.");
//             return Collections.emptyList();
//         }

//         int nValues = variablesToRead.size();
        
        
//         int[] objIdsArray = new int[nValues];
//         int[] extIdsArray = new int[nValues];
//         int[] unitsArray = new int[nValues];
//         float[] valuesArray = new float[nValues]; 
//         int[] statsArray = new int[nValues];   

//         for (int i = 0; i < nValues; i++) {
//             ReadDataRequestItemDto item = variablesToRead.get(i);
//             objIdsArray[i] = item.objId();
//             extIdsArray[i] = item.extId();
//             unitsArray[i] = (item.unitDescriptor() != null) ? item.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
//         }

//         List<ReadDataResponseItemDto> results = new ArrayList<>();

//         try {
//             logger.debug("Calling simoneApi.simone_read_array (nValues: {})...", nValues);
            
          
//             int overallStatus = this.simoneApi.simone_read_array(
//                 nValues, objIdsArray, extIdsArray, unitsArray, valuesArray, statsArray
//             );
//             logger.info("simone_read_array overallStatus: {}", overallStatus);

          
//             for (int i = 0; i < nValues; i++) {
//                 ReadDataRequestItemDto requestItem = variablesToRead.get(i);
//                 int itemStatus = statsArray[i];
//                 Float itemValue = null;
//                 String statusMessage;

              
//                 if (itemStatus == SimoneConst.simone_status_ok) {
//                     itemValue = valuesArray[i];
//                     statusMessage = "Read successfully.";
//                 } else {
//                     if (itemStatus == SimoneConst.simone_status_noval) statusMessage = "Value not defined for this time/variable.";
//                     else if (itemStatus == SimoneConst.simone_status_nofloat) statusMessage = "Value is not a float type.";
//                     else if (itemStatus == SimoneConst.simone_status_invid) statusMessage = "Invalid objId/extId combination.";
//                     else if (itemStatus == SimoneConst.simone_status_badpar) statusMessage = "Invalid parameter for this variable (e.g., unit).";
//                     else statusMessage = "Error reading variable (status: " + itemStatus + ")";
//                     logger.warn("Failed to read variable objId: {}, extId: {}. Status: {}, Message: {}", 
//                                 requestItem.objId(), requestItem.extId(), itemStatus, statusMessage);
//                 }
                                  
//                 results.add(new ReadDataResponseItemDto(
//                     requestItem.objId(),
//                     requestItem.extId(),
//                     itemValue,
//                     itemStatus,
//                     statusMessage
//                 ));
//             }
            
//             if (overallStatus != SimoneConst.simone_status_ok) {
//                  if (results.isEmpty() && nValues > 0) {
//                     SimString errorMsg = new SimString(); 
//                     this.simoneApi.simone_last_error(errorMsg);
//                     String simoneError = errorMsg.getVal();
//                     logger.error("Overall error from simone_read_array call. Status: {}. SIMONE Error: {}", overallStatus, simoneError);
//                     throw new RuntimeException("Overall error from simone_read_array. Status: " + overallStatus + ". SIMONE Error: " + simoneError);
//                  }
//             }

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_read_array: {}", t.getMessage(), t);
//             throw new RuntimeException("Unexpected error reading data array: " + t.getMessage(), t);
//         }
//         return results;
//     }
//     /**
//      * Reads a single SIMONE variable as a formatted string using simone_read_str.
//      * Useful for non-float data types or specific float formatting.
//      * @param requestItem DTO containing objId, extId, and optional unit, width, precision.
//      * @return ReadStringDataResponseDto containing the string value and status.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, no network selected, or rtime not set.
//      * @throws RuntimeException for other SIMONE API errors.
//      */
//     public ReadStringDataResponseDto readStringData(ReadDataRequestItemDto requestItem) {
//         logger.info("Service: readStringData called for objId: {}, extId: {}", requestItem.objId(), requestItem.extId());
//         checkApiAndScenarioReady(true, true); // Scenario must be open, network selected, API init
        
//         if (this.currentRTimeValue == null) {
            
//             logger.warn("Retrieval time (rtime) is not set for the current open scenario. Cannot read string data.");
//             throw new IllegalStateException("Retrieval time not set. Call set-time or next-time first.");
//         }
//         logger.info("Reading string data for rtime: {}", this.currentRTimeValue);

//         SimString valueOutput = new SimString();

      
//         int unit = (requestItem.unitDescriptor() != null) ? requestItem.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
//         int width = (requestItem.width() != null && requestItem.width() > 0) ? requestItem.width() : 256; // Default width
//         int precision = (requestItem.precision() != null) ? requestItem.precision() : 4; // Default precision for floats

//         try {
//             logger.debug("Calling simoneApi.simone_read_str(objId: {}, extId: {}, unit: {}, width: {}, precision: {})...",
//                 requestItem.objId(), requestItem.extId(), unit, width, precision);

           
//             int status = this.simoneApi.simone_read_str(
//                 requestItem.objId(),
//                 requestItem.extId(),
//                 unit,
//                 valueOutput, 
//                 width,
//                 precision
//             );
//             logger.info("simone_read_str for objId: {}, extId: {} returned status: {}", 
//                         requestItem.objId(), requestItem.extId(), status);

//             String MOCK_DEFAULT_STRING_VALUE_FOR_SUCCESS = ""; 
//             String valueRead = MOCK_DEFAULT_STRING_VALUE_FOR_SUCCESS;
//             String statusMessage;

//             if (status == SimoneConst.simone_status_ok) {
//                 valueRead = valueOutput.getVal(); 
//                 statusMessage = "Read successfully.";
//                 logger.debug("Successfully read string value: '{}'", valueRead);
//             } else {
//                 valueRead = null; 
//                 if (status == SimoneConst.simone_status_noval) statusMessage = "Value not defined for this time/variable.";
//                 else if (status == SimoneConst.simone_status_invid) statusMessage = "Invalid objId/extId combination for read.";
//                 else {
//                     SimString errorMsg = new SimString();
//                     this.simoneApi.simone_last_error(errorMsg); 
//                     statusMessage = "Error reading variable (SIMONE status: " + status + "). SIMONE says: " + errorMsg.getVal();
//                 }
//                 logger.warn("Failed to read string for variable objId: {}, extId: {}. Status: {}, Message: {}",
//                             requestItem.objId(), requestItem.extId(), status, statusMessage);
//             }

//             return new ReadStringDataResponseDto(
//                 requestItem.objId(),
//                 requestItem.extId(),
//                 valueRead,
//                 status,
//                 statusMessage
//             );

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_read_str call: {}. Native library issue.", ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error during string data reading.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_read_str call for objId: {}, extId: {}: {}", 
//                          requestItem.objId(), requestItem.extId(), t.getMessage(), t);
//             throw new RuntimeException("Unexpected error reading string data: " + t.getMessage(), t);
//         }
//     }



//     public ReadStringDataResponseDto readStringDataSingle(ReadStringDataRequestDto requestDto) { 
//         logger.info("Service: readStringDataSingle called for objId: {}, extId: {}", requestDto.objId(), requestDto.extId());
//         checkApiAndScenarioReady(true, true); 
        
//         if (this.currentRTimeValue == null) {
//             logger.warn("Retrieval time (rtime) is not set. Cannot read string data.");
//             throw new IllegalStateException("Retrieval time not set. Call set-time or next-time first.");
//         }
//         logger.info("Reading string data for rtime: {}", this.currentRTimeValue);

//         SimString valueOutput = new SimString(); 

//         int unit = (requestDto.unitDescriptor() != null) ? requestDto.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
//         int width = (requestDto.width() != null && requestDto.width() > 0) ? requestDto.width() : 256; 
//         int precision = (requestDto.precision() != null && requestDto.precision() >= 0) ? requestDto.precision() : 4;

//         try {
//             logger.debug("Calling simoneApi.simone_read_str(objId: {}, extId: {}, unit: {}, width: {}, precision: {})...",
//                 requestDto.objId(), requestDto.extId(), unit, width, precision);

//             int status = this.simoneApi.simone_read_str(
//                 requestDto.objId(),
//                 requestDto.extId(),
//                 unit,
//                 valueOutput, 
//                 width,
//                 precision
//             );
//             logger.info("simone_read_str for objId: {}, extId: {} returned status: {}", 
//                         requestDto.objId(), requestDto.extId(), status);

//             String valueRead = null;
//             String statusMessage;

//             if (status == SimoneConst.simone_status_ok) {
//                 String rawValue = valueOutput.getVal();
//                 valueRead = (rawValue != null) ? rawValue.trim() : null; 
//                 statusMessage = "Read successfully.";
//                 logger.debug("Successfully read string value (raw: '{}', trimmed: '{}')", rawValue, valueRead);
//             } else {
//                 if (status == SimoneConst.simone_status_noval) statusMessage = "Value not defined for this time/variable.";
//                 else if (status == SimoneConst.simone_status_invid) statusMessage = "Invalid objId/extId combination for read.";
//                 else { 
//                     SimString errorMsg = new SimString();
//                     this.simoneApi.simone_last_error(errorMsg); 
//                     statusMessage = "Error reading variable (SIMONE status: " + status + "). SIMONE says: " + errorMsg.getVal();
//                 }
//                 logger.warn("Failed to read string for variable objId: {}, extId: {}. Status: {}, Message: {}",
//                             requestDto.objId(), requestDto.extId(), status, statusMessage);
//             }

//             return new ReadStringDataResponseDto(
//                 requestDto.objId(),
//                 requestDto.extId(),
//                 valueRead, 
//                 status,
//                 statusMessage
//             );

//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_read_str call for objId: {}, extId: {}: {}", 
//                          requestDto.objId(), requestDto.extId(), t.getMessage(), t);
//             throw new RuntimeException("Unexpected error reading string data: " + t.getMessage(), t);
//         }
//     }


//     // src/main/java/com/gascade/simone/service/SimoneScenarioService.java

// public List<WriteDataResponseItemDto> writeFloatDataArray(List<WriteDataRequestItemDto> variablesToWrite, Integer timeValueToSet) {
//     logger.info("Service: writeFloatDataArray called for {} variables. Time to set: {}",
//         (variablesToWrite != null ? variablesToWrite.size() : 0),
//         timeValueToSet == null ? "current rtime (" + this.currentRTimeValue + ")" : timeValueToSet);

//     checkApiAndScenarioReady(true, true);

//     if (this.openScenarioMode != SimoneConst.SIMONE_MODE_WRITE &&
//         this.openScenarioMode != SimoneConst.SIMONE_MODE_RW &&
//         this.openScenarioMode != SimoneConst.SIMONE_MODE_CREATE) {
//         String modeError = "Scenario '" + this.openScenarioName + "' is not open in a writable mode (current mode: " + this.openScenarioMode + "). Cannot write data.";
//         logger.error(modeError);
//         throw new IllegalStateException(modeError);
//     }

//     // --- FIX: Default to time 0 for write operations if no time is specified ---
//     int rtimeForWrite;
//     if (timeValueToSet != null) {
//         // If a specific time is provided, use it (and set it if in READ mode).
//         if (this.openScenarioMode == SimoneConst.SIMONE_MODE_READ || this.openScenarioMode == SimoneConst.SIMONE_MODE_RW) {
//              setRetrievalTimeInternal(timeValueToSet, "writeFloatDataArray request");
//         }
//         rtimeForWrite = timeValueToSet;
//     } else if (this.currentRTimeValue != null) {
//         // If no time is provided, use the service's current time if it exists.
//         rtimeForWrite = this.currentRTimeValue;
//     } else {
//         // If no time is provided and no current time exists, default to 0 for write modes.
//         logger.warn("No retrieval time (rtime) is set. Defaulting to time 0 for this write operation.");
//         rtimeForWrite = 0;
//     }
//     logger.info("Writing data for rtime: {}", rtimeForWrite);

//     if (variablesToWrite == null || variablesToWrite.isEmpty()) {
//         logger.info("No variables provided to write. Returning empty results.");
//         return Collections.emptyList();
//     }

//     int nValues = variablesToWrite.size();
    
//     int[] objIdsArray = new int[nValues];
//     int[] extIdsArray = new int[nValues];
//     int[] unitsArray = new int[nValues];
//     float[] valuesArray = new float[nValues];
//     int[] flagsArray = new int[nValues];
//     int[] statsArray = new int[nValues];

//     for (int i = 0; i < nValues; i++) {
//         WriteDataRequestItemDto item = variablesToWrite.get(i);
//         objIdsArray[i] = item.objId();
//         extIdsArray[i] = item.extId();
//         valuesArray[i] = item.value();
//         unitsArray[i] = (item.unitDescriptor() != null) ? item.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
//         flagsArray[i] = SimoneConst.SIMONE_NO_FLAG;
//     }

//     List<WriteDataResponseItemDto> results = new ArrayList<>();

//     try {
//         logger.debug("Calling simoneApi.simone_write_array (nValues: {}, rtime: {})...", nValues, rtimeForWrite);
        
//         int overallStatus = this.simoneApi.simone_write_array(
//             rtimeForWrite,
//             nValues,
//             objIdsArray,
//             extIdsArray,
//             valuesArray,
//             unitsArray,
//             flagsArray,
//             statsArray
//         );
//         logger.info("simone_write_array overallStatus: {}", overallStatus);

//         for (int i = 0; i < nValues; i++) {
//             WriteDataRequestItemDto requestItem = variablesToWrite.get(i);
//             int itemStatus = statsArray[i];
//             String statusMessage;

//             if (itemStatus == SimoneConst.simone_status_ok) {
//                 statusMessage = "Write successful.";
//             } else {
//                 if (itemStatus == SimoneConst.simone_status_noval) statusMessage = "Cannot write: Value marked as 'no value' (e.g. inactive/protected).";
//                 else if (itemStatus == SimoneConst.simone_status_nofloat) statusMessage = "Cannot write: Value is not a float type or incompatible.";
//                 else if (itemStatus == SimoneConst.simone_status_invid) statusMessage = "Invalid objId/extId combination for write.";
//                 else if (itemStatus == SimoneConst.simone_status_badpar) statusMessage = "Invalid parameter for write (e.g. unit, value out of range).";
//                 else if (itemStatus == SimoneConst.simone_status_locked) statusMessage = "Cannot write: Scenario or object is locked.";
//                 else {
//                     SimString errorMsg = new SimString();
//                     this.simoneApi.simone_last_error(errorMsg);
//                     statusMessage = "Error writing variable (SIMONE status: " + itemStatus + "). SIMONE says: " + errorMsg.getVal();
//                 }
//                 logger.warn("Failed to write variable objId: {}, extId: {}, value: {}. Status: {}, Message: {}",
//                     requestItem.objId(), requestItem.extId(), requestItem.value(), itemStatus, statusMessage);
//             }
            
//             results.add(new WriteDataResponseItemDto(
//                 requestItem.objId(),
//                 requestItem.extId(),
//                 itemStatus,
//                 statusMessage
//             ));
//         }
        
//         if (overallStatus != SimoneConst.simone_status_ok) {
//             SimString errorMsg = new SimString();
//             this.simoneApi.simone_last_error(errorMsg);
//             String simoneError = errorMsg.getVal();
//             logger.error("Overall error/warning from simone_write_array call. Status: {}. SIMONE Error: {}", overallStatus, simoneError);
//             if (results.isEmpty() && nValues > 0) {
//                 throw new RuntimeException("Overall error from simone_write_array. Status: " + overallStatus + ". SIMONE Error: " + simoneError);
//             }
//         }

//     } catch (Throwable t) {
//         logger.error("Unexpected error during simone_write_array: {}", t.getMessage(), t);
//         throw new RuntimeException("Unexpected error writing data array: " + t.getMessage(), t);
//     }
//     return results;
// }
   

//     /**
//      * Writes a single value (float or string) for a specified variable at a given time
//      * using simone_write_ex, allowing for extended parameters like conditions and comments.
//      *
//      * @param requestDto DTO containing all parameters for simone_write_ex.
//      * @return WriteDataExResponseDto containing the objId, extId, simoneStatus, and a detailed message.
//      * @throws IllegalStateException if SIMONE API is not ready or scenario/network not set up.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public WriteDataExResponseDto writeFloatDataEx(WriteDataExRequestDto requestDto) {
//         logger.info("Service: writeFloatDataEx called for objId: {}, extId: {}, time: {}, value: {}, valueStr: '{}'", 
//             requestDto.objId(), requestDto.extId(), requestDto.timeValue(), requestDto.value(), requestDto.valueStr());
        
//         checkApiAndScenarioReady(true, true); // Scenario must be open, network selected, API init

//         if (this.openScenarioMode != SimoneConst.SIMONE_MODE_WRITE && 
//             this.openScenarioMode != SimoneConst.SIMONE_MODE_RW &&
//             this.openScenarioMode != SimoneConst.SIMONE_MODE_CREATE) {
//             String modeError = "Scenario '" + this.openScenarioName + "' is not open in a writable mode (current mode: " + this.openScenarioMode + "). Cannot write data.";
//             logger.error(modeError);
//             throw new IllegalStateException(modeError);
//         }

//         // Determine rtime: use provided timeValue or currentRTimeValue from service state
//         int rtime;
//         if (requestDto.timeValue() != null) {
//             rtime = requestDto.timeValue();
         
//         } else if (this.currentRTimeValue != null) {
//             rtime = this.currentRTimeValue;
//         } else {
//             logger.error("Write operation (writeFloatDataEx) initiated without explicit rtime and no current rtime is set.");
//             throw new IllegalStateException("Time (rtime) must be set before writing data if not provided in the request.");
//         }
//         logger.info("Writing data using simone_write_ex for rtime: {}", rtime);

     
//         int objId = requestDto.objId();
//         int extId = requestDto.extId();
        
//         float floatValueToSend = 0.0f; 
//         String stringValueToSend = requestDto.valueStr(); // Can be null

//         if (stringValueToSend != null && !stringValueToSend.isEmpty()) {
    
//         } else if (requestDto.value() != null) {
//             floatValueToSend = requestDto.value();
//             // stringValueToSend will be null in this case, as per Javadoc
//         } else {
 
//             logger.warn("Neither float 'value' nor 'valueStr' provided for objId: {}, extId: {}. Relying on SIMONE's default handling.", objId, extId);
//         }

//         int unit = (requestDto.unitDescriptor() != null) ? requestDto.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
//         int condFlags = (requestDto.condFlags() != null) ? requestDto.condFlags() : SimoneConst.SIMONE_NO_FLAG;
//         int condId = (requestDto.condId() != null) ? requestDto.condId() : 0;
//         int funcId = (requestDto.funcId() != null) ? requestDto.funcId() : 0;
//         int valueFlags = (requestDto.valueFlags() != null) ? requestDto.valueFlags() : SimoneConst.SIMONE_NO_FLAG;
//         int srcId = (requestDto.srcId() != null) ? requestDto.srcId() : 0;
//         String comment = requestDto.comment(); 
//         String simoneDetailedMessage = ""; 

//         try {
//             logger.debug("Calling simoneApi.simone_write_ex with rtime={}, objid={}, extid={}, cond_flags={}, cond_id={}, " +
//                          "value={}, value_str='{}', unit={}, func_id={}, value_flags={}, src_id={}, comment='{}'",
//                          rtime, objId, extId, condFlags, condId, floatValueToSend, stringValueToSend, unit, funcId, valueFlags, srcId, comment);

//             int simoneStatus = this.simoneApi.simone_write_ex(
//                 rtime,
//                 objId,
//                 extId,
//                 condFlags,
//                 condId,
//                 floatValueToSend,
//                 stringValueToSend, 
//                 unit,
//                 funcId,
//                 valueFlags,
//                 srcId,
//                 comment            
//             );
//             logger.info("simone_write_ex for objId: {}, extId: {} returned status: {}", objId, extId, simoneStatus);

//             String overallMessage;
//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 overallMessage = "Write operation successful.";

//             } else {
//                 SimString errorMsgOutput = new SimString();
//                 this.simoneApi.simone_last_error(errorMsgOutput); 
//                 simoneDetailedMessage = (errorMsgOutput.getVal() != null) ? errorMsgOutput.getVal().trim() : "No specific error message from SIMONE.";
//                 overallMessage = "Write operation failed. Status: " + simoneStatus;
//                 logger.warn("Failed to write value using simone_write_ex for objId: {}, extId: {}. SIMONE Status: {}, SIMONE Message: '{}'", 
//                             objId, extId, simoneStatus, simoneDetailedMessage);
//             }

//             return new WriteDataExResponseDto(
//                 objId,
//                 extId,
//                 simoneStatus,
//                 simoneDetailedMessage, 
//                 overallMessage
//             );

//         } catch (Throwable t) { 
//             logger.error("Unexpected error during simone_write_ex for objId: {}, extId: {}: {}", 
//                          objId, extId, t.getMessage(), t);
//             // Construct an error response DTO
//             return new WriteDataExResponseDto(
//                 objId, 
//                 extId, 
//                 SimoneConst.simone_status_exception, // Use a generic SIMONE error status or a custom one
//                 "Java service exception: " + t.getMessage(),
//                 "Unexpected error occurred during write operation."
//             );
//         }
//     }
   
//     /**
//      * Executes the currently open SIMONE scenario using simone_execute_ex.
//      * This function allows for flags and returns a detailed status text.
//      * Note: This function requires the "SIMONE API: Execute Simulation" license.
//      *
//      * @param requestedFlags Optional flags for execution (e.g., SIMONE_FLAG_INTERACTIVE_MSG).
//      * @return ExecuteScenarioResponseDto containing the execution status and messages.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, no network selected, or no scenario open.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public ExecuteScenarioResponseDto executeScenarioExtended(Integer requestedFlags) {
//         logger.info("Service: executeScenarioExtended called with flags: {}", 
//             requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);
        
//         checkApiAndScenarioReady(true, true); 
        
   
//         if (this.openScenarioName == null) {
//             logger.error("Cannot execute scenario: No scenario is currently open.");
//             throw new IllegalStateException("No scenario is open to execute.");
//         }
//         logger.info("Attempting to execute scenario: '{}'", this.openScenarioName);

//         SimString statusTextOutput = new SimString(); 
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;

//         try {
//             logger.debug("Calling simoneApi.simone_execute_ex(statusTextOutput, flags: {})...", flags);
            
           
//             int simoneStatus = this.simoneApi.simone_execute_ex(
//                 statusTextOutput, 
//                 flags
//             );
//             logger.info("simone_execute_ex for scenario '{}' returned status: {}", this.openScenarioName, simoneStatus);

//             String executionStatus = statusTextOutput.getVal();
//             if (executionStatus != null) {
//                 executionStatus = executionStatus.trim();
//             } else {
//                 executionStatus = "N/A"; // Should not happen if API call was made
//             }
//             logger.info("Execution status text from SIMONE: '{}'", executionStatus);

//             String serviceMessage;
//             if (simoneStatus == SimoneConst.simone_status_ok) {
                
//                 if ("RUNOK".equalsIgnoreCase(executionStatus)) {
//                     serviceMessage = "Scenario executed successfully. Status: RUNOK.";
//                 } else {
//                     serviceMessage = "Scenario execution call succeeded, but SIMONE status text indicates issues: " + executionStatus;
//                     logger.warn(serviceMessage);
//                 }
//             } else {
               
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneDetailedError = (errorMsg.getVal() != null) ? errorMsg.getVal().trim() : "No detailed error from simone_last_error.";
                
//                 serviceMessage = "Failed to execute scenario. SIMONE API Status: " + simoneStatus + 
//                                  ". Execution Status Text: '" + executionStatus + 
//                                  "'. Detailed SIMONE Error: '" + simoneDetailedError + "'";
//                 logger.error(serviceMessage);
//             }

//             return new ExecuteScenarioResponseDto(
//                 simoneStatus,
//                 executionStatus,
//                 serviceMessage
//             );

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_execute_ex call: {}. Native library issue.", ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error during scenario execution.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_execute_ex for scenario '{}': {}", 
//                          this.openScenarioName, t.getMessage(), t);
//             throw new RuntimeException("Unexpected error executing scenario: " + t.getMessage(), t);
//         }
//     }

//     /**
//      * Retrieves the calculation status of a specified scenario using simone_calculation_status_ex.
//      * A network must be selected, and the scenario must have been generated/calculated previously.
//      *
//      * @param scenarioName The name of the scenario to check.
//      * @param requestedFlags Optional flags for the API call (currently reserved for future use by SIMONE).
//      * @return ScenarioCalculationStatusResponseDto containing the status details.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, or no network selected.
//      * @throws IllegalArgumentException if scenarioName is null or empty.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public ScenarioCalculationStatusResponseDto getScenarioCalculationStatusExtended(String scenarioName, Integer requestedFlags) {
//         logger.info("Service: getScenarioCalculationStatusExtended called for scenario: '{}', flags: {}", 
//             scenarioName, requestedFlags == null ? "default (NO_FLAG)" : requestedFlags);
        
//         // A network must be selected. Scenario does not necessarily need to be "open" by this API session
//         // to check its calculation status, but it must exist and have been calculated.
//         checkApiAndScenarioReady(false, true); 
                                        
//         if (scenarioName == null || scenarioName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Scenario name cannot be null or empty for status check.");
//         }

//         SimString statusTextOutput = new SimString(); // Output parameter for the calculation status text
//         // Javadoc: flags - reserved for future use. So, use SIMONE_NO_FLAG.
//         int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG; 
//         int simoneStatus;

//         try {
//             logger.debug("Calling simoneApi.simone_calculation_status_ex(scenario: \"{}\", statusTextOutput, flags: {})...",
//                 scenarioName, flags);

//             // From Javadoc: public int simone_calculation_status_ex(String scenario, SimString status_text, int flags)
//             simoneStatus = this.simoneApi.simone_calculation_status_ex(
//                 scenarioName.trim(),
//                 statusTextOutput, // SimString object that will be populated
//                 flags
//             );
//             logger.info("simone_calculation_status_ex for scenario '{}' returned status: {}", scenarioName, simoneStatus);

//             String calculationStatus = ""; // Default to empty if not set
//             if (simoneStatus == SimoneConst.simone_status_ok || simoneStatus == SimoneConst.simone_status_noval || simoneStatus == SimoneConst.simone_status_failed) {
//                 // Even on some "error" statuses from the call, status_text might be populated with useful info.
//                 // e.g. simone_status_noval if scenario execution terminated improperly.
//                 String rawStatusText = statusTextOutput.getVal();
//                 if (rawStatusText != null) {
//                     calculationStatus = rawStatusText.trim();
//                 }
//                 logger.info("Calculation status text from SIMONE for scenario '{}': '{}'", scenarioName, calculationStatus);
//             }
            
//             String serviceMessage;
//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Calculation status retrieved successfully. SIMONE reported: " + calculationStatus;
//             } else {
//                 // Get detailed error from simone_last_error if the API call itself failed badly
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneDetailedError = (errorMsg.getVal() != null) ? errorMsg.getVal().trim() : "No specific error message from SIMONE.";
                
//                 serviceMessage = "Failed to retrieve calculation status. SIMONE API Call Status: " + simoneStatus +
//                                  ". Calculation Status Text: '" + calculationStatus + 
//                                  "'. Detailed SIMONE Error: '" + simoneDetailedError + "'";
//                 logger.warn(serviceMessage);
//             }

//             return new ScenarioCalculationStatusResponseDto(
//                 scenarioName,
//                 simoneStatus,
//                 calculationStatus,
//                 serviceMessage
//             );

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_calculation_status_ex call for scenario '{}': {}. Native library issue.", 
//                          scenarioName, ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error during scenario calculation status check.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_calculation_status_ex for scenario '{}': {}", 
//                          scenarioName, t.getMessage(), t);
//             return new ScenarioCalculationStatusResponseDto( // Return DTO with error info
//                 scenarioName,
//                 SimoneConst.simone_status_exception, // Or a custom internal error code
//                 "N/A",
//                 "Java service unexpected error: " + t.getMessage()
//             );
//         }
//     }

//     // Add this method to: src/main/java/com/gascade/simone/service/SimoneScenarioService.java

//     /**
//      * Retrieves the calculation status of the currently open SIMONE scenario using simone_calculation_status.
//      * The scenario must be open, typically in READ mode as per Javadoc.
//      *
//      * @return CurrentScenarioCalculationStatusResponseDto containing the status details.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, no network selected, or no scenario open.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public CurrentScenarioCalculationStatusResponseDto getCurrentOpenScenarioCalculationStatus() {
//         logger.info("Service: getCurrentOpenScenarioCalculationStatus called for open scenario: '{}'", this.openScenarioName);
        
//         // Scenario must be open. Javadoc for simone_calculation_status says "scenario must be opened for read".
//         // The checkApiAndScenarioReady will verify most prerequisites.
//         checkApiAndScenarioReady(true, true); 
        
//         if (this.openScenarioMode != SimoneConst.SIMONE_MODE_READ && 
//             this.openScenarioMode != SimoneConst.SIMONE_MODE_RW) {
//             // While the API might not strictly enforce READ for status check if already calculated,
//             // the Javadoc is specific. Let's log a warning if not in READ/RW.
//             logger.warn("Current open scenario '{}' is not in READ or RW mode (current mode: {}). " +
//                         "simone_calculation_status might behave unexpectedly or as documented for READ mode.", 
//                         this.openScenarioName, this.openScenarioMode);
//         }

//         SimString statusTextOutput = new SimString(); // Output parameter for the calculation status text
//         int simoneStatus;

//         try {
//             logger.debug("Calling simoneApi.simone_calculation_status(statusTextOutput)...");

//             // From Javadoc: public int simone_calculation_status(SimString status_txt)
//             simoneStatus = this.simoneApi.simone_calculation_status(statusTextOutput);
//             logger.info("simone_calculation_status for open scenario '{}' returned status: {}", this.openScenarioName, simoneStatus);

//             String calculationStatus = ""; 
//             if (simoneStatus == SimoneConst.simone_status_ok || 
//                 simoneStatus == SimoneConst.simone_status_noval || // "improperly terminated execution"
//                 simoneStatus == SimoneConst.simone_status_failed) { // "incomplete of failed execution"
//                 String rawStatusText = statusTextOutput.getVal();
//                 if (rawStatusText != null) {
//                     calculationStatus = rawStatusText.trim();
//                 }
//                 logger.info("Calculation status text from SIMONE for open scenario '{}': '{}'", this.openScenarioName, calculationStatus);
//             }
            
//             String serviceMessage;
//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 serviceMessage = "Calculation status for current scenario retrieved successfully. SIMONE reported: " + calculationStatus;
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneDetailedError = (errorMsg.getVal() != null) ? errorMsg.getVal().trim() : "No specific error message from SIMONE.";
                
//                 serviceMessage = "Failed to retrieve calculation status for current scenario. SIMONE API Call Status: " + simoneStatus +
//                                  ". Reported Calc Status Text: '" + calculationStatus + 
//                                  "'. Detailed SIMONE Error: '" + simoneDetailedError + "'";
//                 logger.warn(serviceMessage);
//             }

//             return new CurrentScenarioCalculationStatusResponseDto(
//                 this.openScenarioName, // Name of the currently open scenario
//                 simoneStatus,
//                 calculationStatus,
//                 serviceMessage
//             );

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_calculation_status call for open scenario '{}': {}. Native library issue.", 
//                          this.openScenarioName, ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error during current scenario calculation status check.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_calculation_status for open scenario '{}': {}", 
//                          this.openScenarioName, t.getMessage(), t);
//             return new CurrentScenarioCalculationStatusResponseDto(
//                 this.openScenarioName,
//                 SimoneConst.simone_status_exception, // Or a custom internal error code
//                 "N/A",
//                 "Java service unexpected error: " + t.getMessage()
//             );
//         }
//     }
//     // Add this method to: src/main/java/com/gascade/simone/service/SimoneScenarioService.java

//     /**
//      * Retrieves the first message from the last execution of the currently open scenario.
//      * Uses simone_get_first_message().
//      *
//      * @return CalculationMessageDto containing the first message details, or an indication if no message is found.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, no network selected, or no scenario open.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public CalculationMessageDto getFirstCalculationMessage() {
//         logger.info("Service: getFirstCalculationMessage called for open scenario: '{}'", this.openScenarioName);
        
//         // Scenario must be open. Javadoc: "last execution of the current scenario".
//         // Network selection and API initialization are also prerequisites.
//         checkApiAndScenarioReady(true, true); 
                                        
//         // Output parameters for simone_get_first_message
//         SimString msgOutput = new SimString();        // Javadoc: SimString msg
//         SimTimeT msgTimeOutput = new SimTimeT();      // Javadoc: SimTimeT msg_time
//         SimInt severityOutput = new SimInt();         // Javadoc: SimInt severity
//         SimString objNameOutput = new SimString();    // Javadoc: SimString obj_name
//         SimString msgNameOutput = new SimString();    // Javadoc: SimString msg_name
        
//         int simoneStatus;

//         try {
//             logger.debug("Calling simoneApi.simone_get_first_message(...)");

//             // From Javadoc: public int simone_get_first_message(SimString msg, SimTimeT msg_time, 
//             //                                                  SimInt severity, SimString obj_name, SimString msg_name)
//             simoneStatus = this.simoneApi.simone_get_first_message(
//                 msgOutput,
//                 msgTimeOutput,
//                 severityOutput,
//                 objNameOutput,
//                 msgNameOutput
//             );
//             logger.info("simone_get_first_message for open scenario '{}' returned status: {}", this.openScenarioName, simoneStatus);

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 return new CalculationMessageDto(
//                     simoneStatus,
//                     "First message retrieved successfully.",
//                     msgOutput.getVal() != null ? msgOutput.getVal().trim() : null,
//                     msgTimeOutput.getVal(), // SimTimeT.getVal() returns int
//                     severityOutput.getVal(), // SimInt.getVal() returns int
//                     objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : null,
//                     msgNameOutput.getVal() != null ? msgNameOutput.getVal().trim() : null
//                 );
//             } else if (simoneStatus == SimoneConst.simone_status_not_found) {
//                 logger.info("No first message found for the last execution of scenario '{}'.", this.openScenarioName);
//                 return CalculationMessageDto.noMessage(simoneStatus, "No messages found for the last execution.");
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneDetailedError = (errorMsg.getVal() != null) ? errorMsg.getVal().trim() : "No specific error detail from SIMONE.";
//                 String serviceMsg = "Failed to retrieve first message. SIMONE API Call Status: " + simoneStatus + ". SIMONE Error: " + simoneDetailedError;
//                 logger.warn(serviceMsg);
//                 return new CalculationMessageDto(simoneStatus, serviceMsg, null, null, null, null, null);
//             }

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_get_first_message call for open scenario '{}': {}. Native library issue.", 
//                          this.openScenarioName, ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error while retrieving first calculation message.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_get_first_message for open scenario '{}': {}", 
//                          this.openScenarioName, t.getMessage(), t);
//             // Return a DTO indicating error rather than throwing for this "get" operation.
//             // The controller can then decide the HTTP status.
//             return new CalculationMessageDto(
//                 SimoneConst.simone_status_exception, // Or a custom internal error code
//                 "Java service unexpected error: " + t.getMessage(),
//                 null, null, null, null, null
//             );
//         }
//     } 

//     /**
//      * Retrieves the next message from the last execution of the currently open scenario,
//      * following a call to simone_get_first_message() or a previous simone_get_next_message().
//      * Uses simone_get_next_message().
//      *
//      * @return CalculationMessageDto containing the next message details, or an indication if no more messages are found.
//      * @throws IllegalStateException if SIMONE API is not ready, not initialized, no network selected, or no scenario open.
//      * @throws RuntimeException for other SIMONE API errors or unexpected issues.
//      */
//     public CalculationMessageDto getNextCalculationMessage() {
//         logger.info("Service: getNextCalculationMessage called for open scenario: '{}'", this.openScenarioName);
        
//         // Scenario must be open. Javadoc: "last execution of the current scenario".
//         checkApiAndScenarioReady(true, true); 
                                        
//         // Output parameters for simone_get_next_message
//         SimString msgOutput = new SimString();
//         SimTimeT msgTimeOutput = new SimTimeT();
//         SimInt severityOutput = new SimInt();
//         SimString objNameOutput = new SimString();
//         SimString msgNameOutput = new SimString();
        
//         int simoneStatus;

//         try {
//             logger.debug("Calling simoneApi.simone_get_next_message(...)");

//             // From Javadoc: public int simone_get_next_message(SimString msg, SimTimeT msg_time, 
//             //                                                 SimInt severity, SimString obj_name, SimString msg_name)
//             simoneStatus = this.simoneApi.simone_get_next_message(
//                 msgOutput,
//                 msgTimeOutput,
//                 severityOutput,
//                 objNameOutput,
//                 msgNameOutput
//             );
//             logger.info("simone_get_next_message for open scenario '{}' returned status: {}", this.openScenarioName, simoneStatus);

//             if (simoneStatus == SimoneConst.simone_status_ok) {
//                 return new CalculationMessageDto(
//                     simoneStatus,
//                     "Next message retrieved successfully.",
//                     msgOutput.getVal() != null ? msgOutput.getVal().trim() : null,
//                     msgTimeOutput.getVal(), // SimTimeT.getVal() returns int
//                     severityOutput.getVal(), // SimInt.getVal() returns int
//                     objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : null,
//                     msgNameOutput.getVal() != null ? msgNameOutput.getVal().trim() : null
//                 );
//             } else if (simoneStatus == SimoneConst.simone_status_not_found) {
//                 logger.info("No more messages found for the last execution of scenario '{}'.", this.openScenarioName);
//                 return CalculationMessageDto.noMessage(simoneStatus, "No more messages found.");
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneDetailedError = (errorMsg.getVal() != null) ? errorMsg.getVal().trim() : "No specific error detail from SIMONE.";
//                 String serviceMsg = "Failed to retrieve next message. SIMONE API Call Status: " + simoneStatus + ". SIMONE Error: " + simoneDetailedError;
//                 logger.warn(serviceMsg);
//                 // Return a DTO that reflects the API call error but indicates no message data
//                 return new CalculationMessageDto(simoneStatus, serviceMsg, null, null, null, null, null);
//             }

//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during simone_get_next_message call for open scenario '{}': {}. Native library issue.", 
//                          this.openScenarioName, ule.getMessage(), ule);
//             throw new IllegalStateException("Native library error while retrieving next calculation message.", ule);
//         } catch (Throwable t) {
//             logger.error("Unexpected error during simone_get_next_message for open scenario '{}': {}", 
//                          this.openScenarioName, t.getMessage(), t);
//             return new CalculationMessageDto(
//                 SimoneConst.simone_status_exception, 
//                 "Java service unexpected error: " + t.getMessage(),
//                 null, null, null, null, null
//             );
//         }
//     }
    
//     // Add this new method to the SimoneScenarioService class


// public List<CalculationMessageDto> getAllCalculationMessages() {
//     logger.info("Service: Getting all calculation messages for open scenario: '{}'", this.openScenarioName);
//     checkApiAndScenarioReady(true, true); // Ensures scenario is open

//     List<CalculationMessageDto> allMessages = new ArrayList<>();
    
//     // Start with the first message
//     CalculationMessageDto currentMessage = getFirstCalculationMessage();

//     // Loop as long as the status is OK (meaning a message was found)
//     while (currentMessage != null && currentMessage.simoneStatus() == SimoneConst.simone_status_ok) {
//         allMessages.add(currentMessage);
//         currentMessage = getNextCalculationMessage(); // Get the next one
//     }

//     logger.info("Retrieved {} calculation messages.", allMessages.size());
//     return allMessages;
// }



//     public String getOpenScenarioName() { return this.openScenarioName; }
//     public int getOpenScenarioMode() { return this.openScenarioMode; }
// }

// src/main/java/com/gascade/simone/service/SimoneScenarioService.java
package com.gascade.simone.service;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections; 
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gascade.simone.dto.CalculationMessageDto;
import com.gascade.simone.dto.CopyScenarioRequestDto;
import com.gascade.simone.dto.CreateScenarioRequestDto;
import com.gascade.simone.dto.CurrentScenarioCalculationStatusResponseDto;
import com.gascade.simone.dto.DeleteScenarioRequestDto;
import com.gascade.simone.dto.ExecuteScenarioResponseDto;
import com.gascade.simone.dto.OpenScenarioRequestDto;
import com.gascade.simone.dto.ReadDataRequestItemDto;
import com.gascade.simone.dto.ReadDataResponseItemDto;
import com.gascade.simone.dto.ReadStringDataRequestDto;
import com.gascade.simone.dto.ReadStringDataResponseDto;
import com.gascade.simone.dto.ScenarioCalculationStatusResponseDto;
import com.gascade.simone.dto.ScenarioListItemDto;
import com.gascade.simone.dto.WriteDataExRequestDto;
import com.gascade.simone.dto.WriteDataExResponseDto;
import com.gascade.simone.dto.WriteDataRequestItemDto;
import com.gascade.simone.dto.WriteDataResponseItemDto;

import de.liwacom.simone.SimInt;
import de.liwacom.simone.SimString;
import de.liwacom.simone.SimTimeT;
import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;

@Service
public class SimoneScenarioService {
private static final Logger logger = LoggerFactory.getLogger(SimoneScenarioService.class);

private final SimoneApi simoneApi;
private final boolean isSimoneApiInstantiated;
private final SimoneLifecycleService lifecycleService;
private final SimoneNetworkService networkService;

private final Object simoneApiLock = new Object();    
private String openScenarioName = null;
private int openScenarioMode = -1; 
private Integer currentRTimeValue = null; 

@Autowired
public SimoneScenarioService(SimoneLifecycleService lifecycleService, SimoneNetworkService networkService) {
    this.lifecycleService = lifecycleService;
    this.networkService = networkService;

    SimoneApi tempApi = null;
    boolean instantiated = false;

    try {
        tempApi = SimoneApi.getInstance();
        if (tempApi != null) {
            logger.info("SimoneScenarioService: SimoneAPI-Instanz erfolgreich erhalten.");
            instantiated = true;
        } else {
            logger.error("SimoneScenarioService: Fehler beim Abrufen der SimoneAPI-Instanz (getInstance liefert null).");
        }
    } catch (UnsatisfiedLinkError ule) {
        logger.error("SimoneScenarioService: KRITISCH - UnsatisfiedLinkError beim Abrufen der SimoneAPI: {}", ule.getMessage());
    } catch (Throwable t) {
        logger.error("SimoneScenarioService: KRITISCH - Unerwarteter Fehler beim Abrufen der SimoneAPI-Instanz: {}", t.getMessage(), t);
    }

    this.simoneApi = tempApi;
    this.isSimoneApiInstantiated = instantiated;
}

/**
 * Eigene Ausnahme für Szenario-bezogene Fehler im Zusammenhang mit SIMONE.
 */
public class SimoneScenarioException extends RuntimeException {
    public SimoneScenarioException(String message) {
        super(message);
    }

    public SimoneScenarioException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * Erstellt eine Kopie eines vorhandenen Szenarios unter neuem Namen.
 * Öffnet das Quellszenario temporär, führt "Speichern unter" aus und schließt es danach.
 *
 * @param request Enthält Quell- und Zielnamen des Szenarios.
 * @return Erfolgsnachricht.
 * @throws SimoneScenarioException bei einem Fehler während des Vorgangs.
 */
public String copyScenario(CopyScenarioRequestDto request) {
    checkApiAndScenarioReady(false, true); // API muss bereit sein, Netzwerk ausgewählt

    synchronized (simoneApiLock) {
        logger.info("Service: Kopieren des Szenarios '{}' nach '{}' wird versucht.", request.sourceScenarioName(), request.newScenarioName());

        int openStatus = simoneApi.simone_open(request.sourceScenarioName(), SimoneConst.SIMONE_MODE_READ);
        if (openStatus != SimoneConst.simone_status_ok) {
            SimString errorMsg = new SimString();
            simoneApi.simone_last_error(errorMsg);
            throw new SimoneScenarioException("Öffnen des Quellszenarios '" + request.sourceScenarioName() + "' fehlgeschlagen. SIMONE-Fehler: " + errorMsg.getVal());
        }

        try {
            int saveStatus = simoneApi.simone_scenario_save_as(
                request.newScenarioName(),
                0,
                null,
                null,
                SimoneConst.SIMONE_FLAG_VISIBLE
            );

            if (saveStatus != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                simoneApi.simone_last_error(errorMsg);
                if (errorMsg.getVal() != null && errorMsg.getVal().contains("exists")) {
                    throw new SimoneScenarioException("Zielszenario '" + request.newScenarioName() + "' existiert bereits.");
                }
                throw new SimoneScenarioException("Speichern als '" + request.newScenarioName() + "' fehlgeschlagen. SIMONE-Fehler: " + errorMsg.getVal());
            }

            logger.info("Szenario '{}' erfolgreich als '{}' kopiert.", request.sourceScenarioName(), request.newScenarioName());
            return "Szenario '" + request.sourceScenarioName() + "' wurde erfolgreich nach '" + request.newScenarioName() + "' kopiert.";

        } finally {
            int closeStatus = simoneApi.simone_close();
            if (closeStatus != SimoneConst.simone_status_ok) {
                logger.warn("Quellszenario '{}' konnte nach dem Kopiervorgang nicht korrekt geschlossen werden.", request.sourceScenarioName());
            }
        }
    }
}

/**
 * Erstellt ein neues Szenario mit den gegebenen Einstellungen.
 *
 * @param request DTO mit Szenarioname, Initialbedingungen, Laufzeittyp etc.
 * @throws SimoneScenarioException bei Fehler während der Erstellung.
 */
public void createScenario(CreateScenarioRequestDto request) {
    if (!isSimoneApiInstantiated || simoneApi == null) {
        throw new SimoneScenarioException("Szenario kann nicht erstellt werden: SIMONE API ist nicht geladen.");
    }
    if (!lifecycleService.isSimoneEnvironmentInitialized()) {
        throw new SimoneScenarioException("Szenario kann nicht erstellt werden: SIMONE-Umgebung ist nicht initialisiert.");
    }

    synchronized (simoneApiLock) {
        logger.info("Erstellen des Szenarios '{}' wird gestartet.", request.scenarioName());

        int openStatus = simoneApi.simone_open(request.scenarioName(), SimoneConst.SIMONE_MODE_CREATE | SimoneConst.SIMONE_FLAG_VISIBLE);
        if (openStatus != SimoneConst.simone_status_ok) {
            SimString errorMsg = new SimString();
            simoneApi.simone_last_error(errorMsg);
            logger.error("Erstellen des neuen Szenarios '{}' fehlgeschlagen. Status: {}, SIMONE-Fehler: {}", request.scenarioName(), openStatus, errorMsg.getVal());
            throw new SimoneScenarioException("Szenario konnte nicht erstellt werden. SIMONE-Fehler: " + errorMsg.getVal());
        }

        try {
            int propsStatus = simoneApi.simone_set_properties(request.runtype(), "default", request.initialConditions());
            if (propsStatus != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                simoneApi.simone_last_error(errorMsg);
                throw new SimoneScenarioException("Szenarioeigenschaften konnten nicht gesetzt werden. SIMONE-Fehler: " + errorMsg.getVal());
            }
            logger.debug("Szenarioeigenschaften für '{}' erfolgreich gesetzt.", request.scenarioName());

            // Optional: simone_set_times und simone_set_scenario_comment können bei Bedarf aktiviert werden

        } catch (Exception e) {
            SimString errorMsg = new SimString();
            simoneApi.simone_last_error(errorMsg);
            logger.error("Fehler bei der Konfiguration des Szenarios '{}'. SIMONE-Fehler: {}, Ausnahme: {}", request.scenarioName(), errorMsg.getVal(), e.getMessage(), e);
            throw new SimoneScenarioException("Fehler bei der Szenario-Konfiguration: " + e.getMessage(), e);
        } finally {
            int closeStatus = simoneApi.simone_close();
            if (closeStatus != SimoneConst.simone_status_ok) {
                logger.warn("Szenario '{}' konnte nicht korrekt geschlossen werden. Die Erstellung war möglicherweise nur teilweise erfolgreich.", request.scenarioName());
            } else {
                logger.info("Szenario '{}' erfolgreich erstellt und geschlossen.", request.scenarioName());
            }
        }
    }
}

/**
 * Löscht ein SIMONE-Szenario.
 * Stellt sicher, dass bei erfolgreicher Löschung auch interne Zustände zurückgesetzt werden,
 * wenn das gelöschte Szenario das aktuell geöffnete war.
 *
 * @param request DTO mit dem Namen des zu löschenden Szenarios.
 * @throws SimoneScenarioException bei einem Fehler während der Löschung.
 */
public void deleteScenario(DeleteScenarioRequestDto request) {
    if (!isSimoneApiInstantiated || simoneApi == null) {
        throw new SimoneScenarioException("Szenario kann nicht gelöscht werden: SIMONE API ist nicht geladen.");
    }
    if (!lifecycleService.isSimoneEnvironmentInitialized()) {
        throw new SimoneScenarioException("Szenario kann nicht gelöscht werden: SIMONE-Umgebung ist nicht initialisiert.");
    }

    synchronized (simoneApiLock) {
        logger.info("Lösche Szenario: {}", request.getScenarioName());

        try {
            int deleteStatus = simoneApi.simone_remove(request.getScenarioName(), SimoneConst.SIMONE_FLAG_REMOVE_ALL);
            if (deleteStatus != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                simoneApi.simone_last_error(errorMsg);
                logger.error("Löschen von Szenario '{}' fehlgeschlagen. Status: {}, SIMONE-Fehler: {}", request.getScenarioName(), deleteStatus, errorMsg.getVal());
                throw new SimoneScenarioException("Szenario '" + request.getScenarioName() + "' konnte nicht gelöscht werden. SIMONE-Fehler: " + errorMsg.getVal());
            }

            logger.info("Szenario erfolgreich vom Dateisystem gelöscht: {}", request.getScenarioName());

            if (request.getScenarioName().equals(this.openScenarioName)) {
                logger.info("Das gelöschte Szenario '{}' war aktuell geöffnet. Interner Zustand wird zurückgesetzt.", this.openScenarioName);
                this.openScenarioName = null;
                this.openScenarioMode = -1;
                this.currentRTimeValue = null;
            }

        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Löschen des Szenarios '{}'.", request.getScenarioName(), e);
            throw new SimoneScenarioException("Unerwarteter Fehler beim Löschen des Szenarios: " + e.getMessage(), e);
        }
    }
}

/**
 * Prüft, ob die SIMONE-API und ggf. ein Szenario und ein Netzwerk bereit sind.
 *
 * @param scenarioMustBeOpen true, wenn ein Szenario geöffnet sein muss.
 * @param networkMustBeSelected true, wenn ein Netzwerk ausgewählt sein muss.
 */
private void checkApiAndScenarioReady(boolean scenarioMustBeOpen, boolean networkMustBeSelected) {
    if (!isSimoneApiInstantiated || this.simoneApi == null) {
        throw new IllegalStateException("SIMONE API ist nicht geladen.");
    }
    if (!lifecycleService.isSimoneEnvironmentInitialized()) {
        throw new IllegalStateException("SIMONE-Umgebung ist nicht initialisiert. Bitte zuerst /initialize aufrufen.");
    }
    if (networkMustBeSelected) {
        String currentNetwork = networkService.getCurrentNetwork();
        if (currentNetwork == null || currentNetwork.trim().isEmpty()) {
            throw new IllegalStateException("Kein Netzwerk ausgewählt. Bitte /networks/current/select aufrufen.");
        }
    }
    if (scenarioMustBeOpen && this.openScenarioName == null) {
        throw new IllegalStateException("Kein Szenario geöffnet. Bitte zuerst ein Szenario öffnen.");
    }
}

/**
 * Gibt eine Liste aller verfügbaren Szenarien mit Detailinformationen zurück.
 *
 * @return Liste mit Szenarien und zugehörigen Metadaten.
 */
public List<ScenarioListItemDto> listScenariosWithDetails() {
    checkApiAndScenarioReady(false, true);
    String currentNetwork = networkService.getCurrentNetwork();
    logger.info("Szenarien mit Details werden aufgelistet für Netzwerk: {}", currentNetwork);

    List<ScenarioListItemDto> scenarioDetailsList = new ArrayList<>();

    SimString scenarioNameOutput = new SimString();
    SimInt runtypeOut = new SimInt();
    SimString initialConditionOut = new SimString();
    SimTimeT initimeOut = new SimTimeT();
    SimTimeT termtimeOut = new SimTimeT();
    SimString ownerOut = new SimString();
    SimString commentOut = new SimString();

    try {
        int listStatus = this.simoneApi.simone_scenario_list_start(SimoneConst.SIMONE_NO_FLAG);
        if (listStatus == SimoneConst.simone_status_not_found) return Collections.emptyList();
        if (listStatus != SimoneConst.simone_status_ok) {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            throw new RuntimeException("Fehler beim Starten der Szenarienliste. SIMONE-Fehler: " + errorMsg.getVal());
        }

        while (true) {
            listStatus = this.simoneApi.simone_scenario_list_next(scenarioNameOutput, SimoneConst.SIMONE_NO_FLAG);
            if (listStatus == SimoneConst.simone_status_ok) {
                String name = scenarioNameOutput.getVal();
                if (name == null || name.isEmpty()) continue;

                int infoStatus = this.simoneApi.simone_scenario_list_info(
                    runtypeOut, initialConditionOut, initimeOut, termtimeOut, ownerOut, commentOut, SimoneConst.SIMONE_NO_FLAG
                );

                if (infoStatus == SimoneConst.simone_status_ok) {
                    scenarioDetailsList.add(new ScenarioListItemDto(
                        name,
                        runtypeOut.getVal(),
                        initialConditionOut.getVal(),
                        Long.valueOf(initimeOut.getVal()).intValue(),
                        Long.valueOf(termtimeOut.getVal()).intValue(),
                        ownerOut.getVal(),
                        commentOut.getVal()
                    ));
                } else {
                    scenarioDetailsList.add(new ScenarioListItemDto(name, null, null, null, null, null, null));
                }

            } else if (listStatus == SimoneConst.simone_status_not_found) {
                break;
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                logger.error("Fehler beim Durchlaufen der Szenarienliste: {}", errorMsg.getVal());
                break;
            }
        }

    } catch (Throwable t) {
        throw new RuntimeException("Unerwarteter Fehler beim Auflisten der Szenarien: " + t.getMessage(), t);
    }

    return scenarioDetailsList;
}

/**
 * Öffnet ein bestehendes Szenario im angegebenen Modus.
 *
 * @param request DTO mit Szenarioname, Netzwerkname, Modus etc.
 * @return Bestätigungstext.
 * @throws RuntimeException bei Fehlern beim Öffnen.
 */
public String openScenario(OpenScenarioRequestDto request) {
    checkApiAndScenarioReady(false, false);

    synchronized (simoneApiLock) {
        logger.info("Service: Szenario wird geöffnet: '{}' im Netzwerk '{}', Modus: '{}'",
                request.scenarioName(), request.networkName(), request.mode());

        if (this.openScenarioName != null) {
            logger.warn("Ein Szenario ('{}') ist bereits geöffnet. Es wird zuerst geschlossen.", this.openScenarioName);
            try {
                closeScenario();
            } catch (Exception e) {
                logger.error("Fehler beim automatischen Schließen des vorherigen Szenarios: {}", e.getMessage());
            }
        }

        int selectStatus = simoneApi.simone_select(request.networkName());
        if (selectStatus != SimoneConst.simone_status_ok) {
            throw new SimoneScenarioException("Netzwerk '" + request.networkName() + "' konnte vor dem Öffnen des Szenarios nicht ausgewählt werden.");
        }

        int modeFlag;
        switch (request.mode().toUpperCase()) {
            case "READ": modeFlag = SimoneConst.SIMONE_MODE_READ; break;
            case "WRITE": modeFlag = SimoneConst.SIMONE_MODE_WRITE; break;
            case "CREATE": modeFlag = SimoneConst.SIMONE_MODE_CREATE; break;
            default:
                throw new IllegalArgumentException("Ungültiger Modus: " + request.mode());
        }

        int finalFlags = modeFlag | (request.isVisible() ? SimoneConst.SIMONE_FLAG_VISIBLE : SimoneConst.SIMONE_NO_FLAG);
        int status = this.simoneApi.simone_open(request.scenarioName().trim(), finalFlags);

        if (status == SimoneConst.simone_status_ok) {
            this.openScenarioName = request.scenarioName().trim();
            this.openScenarioMode = modeFlag;

            if (modeFlag == SimoneConst.SIMONE_MODE_READ) {
                setRetrievalTimeInternal(0, "nach Szenario-Öffnung");
            }

            return "Szenario '" + this.openScenarioName + "' wurde erfolgreich geöffnet.";
        } else {
            SimString em = new SimString();
            this.simoneApi.simone_last_error(em);
            throw new RuntimeException("Szenario konnte nicht geöffnet werden. SIMONE-Fehler: " + em.getVal());
        }
    }
}


/**
 * Schließt das aktuell geöffnete Szenario.
 * Der Netzwerkstatus bleibt dabei erhalten.
 */
public String closeScenario() {
    checkApiAndScenarioReady(false, false);
    logger.info("Service: Schließe Szenario. Zuletzt geöffnet: '{}'", this.openScenarioName);

    synchronized (simoneApiLock) {
        String prevOpen = this.openScenarioName;
        try {
            if (prevOpen != null) {
                int status = this.simoneApi.simone_close();
                if (status != SimoneConst.simone_status_ok) {
                    SimString em = new SimString();
                    this.simoneApi.simone_last_error(em);
                    logger.warn("simone_close() fehlgeschlagen, fahre dennoch mit Bereinigung fort. Fehler: {}", em.getVal());
                }
            }
        } finally {
            this.openScenarioName = null;
            this.openScenarioMode = -1;
            this.currentRTimeValue = null;
            logger.info("Szenario geschlossen. Netzwerk bleibt ausgewählt.");
        }
        return "Szenario '" + (prevOpen != null ? prevOpen : "unbekannt") + "' wurde geschlossen.";
    }
}

/**
 * Setzt die Abrufzeit (rtime) extern.
 *
 * @param timeValue Zeitwert in Sekunden seit Epochenbeginn.
 * @return Bestätigungstext.
 */
public String setRetrievalTime(int timeValue) {
    checkApiAndScenarioReady(true, true); 
    setRetrievalTimeInternal(timeValue, "externer API-Aufruf");
    return "Abrufzeit gesetzt auf " + formatTimeTForResponse(timeValue) + ".";
}

/**
 * Setzt intern die rtime über die SIMONE-API.
 * Wirft Fehler bei ungültigem Modus.
 */
private void setRetrievalTimeInternal(int timeValue, String context) {
    if (this.openScenarioMode == SimoneConst.SIMONE_MODE_WRITE || this.openScenarioMode == SimoneConst.SIMONE_MODE_CREATE) {
        String mode = (this.openScenarioMode == SimoneConst.SIMONE_MODE_WRITE) ? "WRITE" : "CREATE";
        String errorMessage = "Abrufzeit (rtime) kann im Modus " + mode + " nicht gesetzt werden.";
        logger.warn("Service (Intern): Ungültiger rtime-Zugriff. Kontext: {}. Fehler: {}", context, errorMessage);
        throw new IllegalStateException(errorMessage);
    }

    logger.info("Service (Intern): Setze rtime auf {} (Kontext: {})", timeValue, context);
    int status = this.simoneApi.simone_set_rtime(timeValue);
    if (status == SimoneConst.simone_status_ok) {
        this.currentRTimeValue = timeValue;
        logger.info("rtime erfolgreich gesetzt: {}", timeValue);
    } else {
        SimString em = new SimString();
        this.simoneApi.simone_last_error(em);
        throw new RuntimeException("Setzen der rtime fehlgeschlagen. SIMONE-Fehler: " + em.getVal());
    }
}

/**
 * Gibt den aktuellen rtime-Wert aus SIMONE zurück.
 */
public Integer getRetrievalTimeValue() {
    checkApiAndScenarioReady(true, true);
    SimTimeT rtimeOutput = new SimTimeT();
    int status = this.simoneApi.simone_get_rtime(rtimeOutput);
    if (status == SimoneConst.simone_status_ok) {
        this.currentRTimeValue = rtimeOutput.getVal();
        return this.currentRTimeValue;
    } else {
        SimString em = new SimString();
        this.simoneApi.simone_last_error(em);
        throw new RuntimeException("Abruf der rtime fehlgeschlagen. SIMONE-Fehler: " + em.getVal());
    }
}

/**
 * Springt zur nächsten verfügbaren Abrufzeit.
 * @return Neue Abrufzeit oder aktuelle, falls keine weitere existiert.
 */
public Integer advanceToNextRetrievalTime() {
    logger.info("Service: Nächste Abrufzeit wird ermittelt.");
    checkApiAndScenarioReady(true, true);

    SimTimeT nextRTimeOutput = new SimTimeT();

    try {
        logger.debug("Rufe simone_next_rtime(nextRTimeOutput) auf...");
        int status = this.simoneApi.simone_next_rtime(nextRTimeOutput);
        logger.info("Status simone_next_rtime: {}", status);

        if (status == SimoneConst.simone_status_ok) {
            this.currentRTimeValue = nextRTimeOutput.getVal();
            logger.info("Abrufzeit fortgeschritten: {}", this.currentRTimeValue);
            return this.currentRTimeValue;
        } else if (status == SimoneConst.simone_status_invtime) {
            logger.info("Keine weiteren Abrufzeiten vorhanden (bereits am Ende).");
            return this.currentRTimeValue;
        } else {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String simoneError = errorMsg.getVal();
            logger.error("Fehler beim Ermitteln der nächsten rtime. Status: {}, SIMONE-Fehler: {}", status, simoneError);
            throw new RuntimeException("Fehler beim Weiterschalten der Abrufzeit. SIMONE-Fehler: " + simoneError);
        }
    } catch (UnsatisfiedLinkError ule) {
        logger.error("UnsatisfiedLinkError bei simone_next_rtime: {}", ule.getMessage(), ule);
        throw new IllegalStateException("Native-Library-Fehler bei rtime-Vorwärtsschaltung.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_next_rtime: {}", t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler bei rtime-Vorwärtsschaltung: " + t.getMessage(), t);
    }
}

/**
 * Formatiert einen rtime-Wert (epoch seconds) als lesbares Datum.
 */
public String formatTimeTForResponse(Integer epochSecondsInt) {
    if (epochSecondsInt == null) return "N/V";
    long epochSeconds = epochSecondsInt.longValue();
    if (this.openScenarioName != null && epochSeconds == 0L) {
        return "Szenariostart (time_t=0)";
    }
    try {
        Instant instant = Instant.ofEpochSecond(epochSeconds);
        ZonedDateTime zdt = ZonedDateTime.ofInstant(instant, ZoneId.systemDefault());
        return zdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));
    } catch (Exception e) {
        logger.warn("Formatierung von epochSecondsInt {} fehlgeschlagen: {}", epochSecondsInt, e.getMessage());
        return String.valueOf(epochSecondsInt) + " (epoch seconds, int)";
    }
}

/**
 * Liest mehrere Float-Datenwerte aus einem Szenario für gegebene Objekt-/Extensionskombinationen.
 *
 * @param variablesToRead Liste von Variablen (objId/extId) die gelesen werden sollen.
 * @return Liste von Ergebnissen mit Werten, Status und Nachrichten.
 */
public List<ReadDataResponseItemDto> readFloatDataArray(List<ReadDataRequestItemDto> variablesToRead) {
    logger.info("Service: readFloatDataArray aufgerufen für {} Variablen.", 
        (variablesToRead != null ? variablesToRead.size() : 0));

    checkApiAndScenarioReady(true, true);

    if (this.currentRTimeValue == null) {
        logger.warn("Abrufzeit (rtime) ist nicht gesetzt. Es wird mit der Standardzeit gelesen.");
    }
    logger.info("Daten werden gelesen für rtime: {}", this.currentRTimeValue);

    if (variablesToRead == null || variablesToRead.isEmpty()) {
        logger.info("Keine Variablen zum Lesen übergeben.");
        return Collections.emptyList();
    }

    int nValues = variablesToRead.size();
    int[] objIdsArray = new int[nValues];
    int[] extIdsArray = new int[nValues];
    int[] unitsArray = new int[nValues];
    float[] valuesArray = new float[nValues];
    int[] statsArray = new int[nValues];

    for (int i = 0; i < nValues; i++) {
        ReadDataRequestItemDto item = variablesToRead.get(i);
        objIdsArray[i] = item.objId();
        extIdsArray[i] = item.extId();
        unitsArray[i] = (item.unitDescriptor() != null) ? item.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
    }

    List<ReadDataResponseItemDto> results = new ArrayList<>();

    try {
        logger.debug("Aufruf von simone_read_array (nValues: {})...", nValues);

        int overallStatus = this.simoneApi.simone_read_array(
            nValues, objIdsArray, extIdsArray, unitsArray, valuesArray, statsArray
        );
        logger.info("simone_read_array Status: {}", overallStatus);

        for (int i = 0; i < nValues; i++) {
            ReadDataRequestItemDto requestItem = variablesToRead.get(i);
            int itemStatus = statsArray[i];
            Float itemValue = null;
            String statusMessage;

            if (itemStatus == SimoneConst.simone_status_ok) {
                itemValue = valuesArray[i];
                statusMessage = "Wert erfolgreich gelesen.";
            } else {
                if (itemStatus == SimoneConst.simone_status_noval) statusMessage = "Kein Wert zu diesem Zeitpunkt.";
                else if (itemStatus == SimoneConst.simone_status_nofloat) statusMessage = "Kein Float-Wert.";
                else if (itemStatus == SimoneConst.simone_status_invid) statusMessage = "Ungültige ID-Kombination.";
                else if (itemStatus == SimoneConst.simone_status_badpar) statusMessage = "Ungültiger Parameter/Einheit.";
                else statusMessage = "Fehler beim Lesen (Status: " + itemStatus + ")";
                logger.warn("Fehler beim Lesen von objId: {}, extId: {}. Status: {}, Nachricht: {}", 
                            requestItem.objId(), requestItem.extId(), itemStatus, statusMessage);
            }

            results.add(new ReadDataResponseItemDto(
                requestItem.objId(),
                requestItem.extId(),
                itemValue,
                itemStatus,
                statusMessage
            ));
        }

        if (overallStatus != SimoneConst.simone_status_ok && results.isEmpty() && nValues > 0) {
            SimString errorMsg = new SimString(); 
            this.simoneApi.simone_last_error(errorMsg);
            String simoneError = errorMsg.getVal();
            logger.error("Gesamtfehler bei simone_read_array. Status: {}, SIMONE-Fehler: {}", overallStatus, simoneError);
            throw new RuntimeException("Fehler bei simone_read_array. SIMONE-Fehler: " + simoneError);
        }

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_read_array: {}", t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler beim Lesen von Daten: " + t.getMessage(), t);
    }

    return results;
}

/**
 * Liest eine einzelne SIMONE-Variable als formatierter String mithilfe von simone_read_str.
 * Dies ist nützlich für Nicht-Float-Datentypen oder zur benutzerdefinierten Formatierung von Floats.
 *
 * @param requestItem DTO mit objId, extId sowie optional Unit, Breite und Genauigkeit.
 * @return Ein ReadStringDataResponseDto mit dem gelesenen Wert und dem Status.
 * @throws IllegalStateException Wenn die API nicht bereit ist, nicht initialisiert wurde,
 *         kein Netzwerk gewählt ist oder keine rtime gesetzt wurde.
 * @throws RuntimeException Bei anderen SIMONE-Fehlern.
 */
public ReadStringDataResponseDto readStringData(ReadDataRequestItemDto requestItem) {
    logger.info("Service: readStringData aufgerufen für objId: {}, extId: {}", requestItem.objId(), requestItem.extId());
    checkApiAndScenarioReady(true, true);

    if (this.currentRTimeValue == null) {
        logger.warn("Abrufzeit (rtime) ist nicht gesetzt. String-Daten können nicht gelesen werden.");
        throw new IllegalStateException("Abrufzeit ist nicht gesetzt. Bitte zuerst set-time oder next-time aufrufen.");
    }

    logger.info("String-Daten werden gelesen für rtime: {}", this.currentRTimeValue);

    SimString valueOutput = new SimString();
    int unit = (requestItem.unitDescriptor() != null) ? requestItem.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
    int width = (requestItem.width() != null && requestItem.width() > 0) ? requestItem.width() : 256;
    int precision = (requestItem.precision() != null) ? requestItem.precision() : 4;

    try {
        logger.debug("Aufruf simone_read_str mit objId: {}, extId: {}, unit: {}, width: {}, precision: {}",
            requestItem.objId(), requestItem.extId(), unit, width, precision);

        int status = this.simoneApi.simone_read_str(
            requestItem.objId(),
            requestItem.extId(),
            unit,
            valueOutput,
            width,
            precision
        );
        logger.info("simone_read_str Rückgabestatus für objId: {}, extId: {}: {}", 
                    requestItem.objId(), requestItem.extId(), status);

        String valueRead = null;
        String statusMessage;

        if (status == SimoneConst.simone_status_ok) {
            valueRead = valueOutput.getVal();
            statusMessage = "Lesen erfolgreich.";
            logger.debug("String-Wert erfolgreich gelesen: '{}'", valueRead);
        } else {
            if (status == SimoneConst.simone_status_noval) statusMessage = "Kein Wert zu diesem Zeitpunkt.";
            else if (status == SimoneConst.simone_status_invid) statusMessage = "Ungültige objId/extId-Kombination.";
            else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                statusMessage = "Fehler beim Lesen (Status: " + status + "). SIMONE: " + errorMsg.getVal();
            }
            logger.warn("Fehler beim Lesen für objId: {}, extId: {}. Status: {}, Nachricht: {}",
                        requestItem.objId(), requestItem.extId(), status, statusMessage);
        }

        return new ReadStringDataResponseDto(
            requestItem.objId(),
            requestItem.extId(),
            valueRead,
            status,
            statusMessage
        );

    } catch (UnsatisfiedLinkError ule) {
        logger.error("UnsatisfiedLinkError bei simone_read_str: {}", ule.getMessage(), ule);
        throw new IllegalStateException("Native-Bibliotheksfehler beim Lesen von String-Daten.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_read_str für objId: {}, extId: {}: {}",
                     requestItem.objId(), requestItem.extId(), t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler beim Lesen von String-Daten: " + t.getMessage(), t);
    }
}


/**
 * Liest eine einzelne Variable als Stringwert. Alternative zu readStringData für spezialisiertes DTO.
 *
 * @param requestDto DTO mit objId, extId, Einheit, Breite und Genauigkeit.
 * @return Ein ReadStringDataResponseDto mit dem gelesenen Stringwert.
 * @throws IllegalStateException Wenn rtime nicht gesetzt ist.
 * @throws RuntimeException Bei Fehlern aus der SIMONE-API.
 */
public ReadStringDataResponseDto readStringDataSingle(ReadStringDataRequestDto requestDto) {
    logger.info("Service: readStringDataSingle aufgerufen für objId: {}, extId: {}", requestDto.objId(), requestDto.extId());
    checkApiAndScenarioReady(true, true);

    if (this.currentRTimeValue == null) {
        logger.warn("Abrufzeit (rtime) ist nicht gesetzt. Lesen nicht möglich.");
        throw new IllegalStateException("Abrufzeit ist nicht gesetzt. Bitte zuerst set-time oder next-time aufrufen.");
    }

    logger.info("String-Daten werden gelesen für rtime: {}", this.currentRTimeValue);

    SimString valueOutput = new SimString();
    int unit = (requestDto.unitDescriptor() != null) ? requestDto.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
    int width = (requestDto.width() != null && requestDto.width() > 0) ? requestDto.width() : 256;
    int precision = (requestDto.precision() != null && requestDto.precision() >= 0) ? requestDto.precision() : 4;

    try {
        logger.debug("Aufruf simone_read_str mit objId: {}, extId: {}, unit: {}, width: {}, precision: {}",
            requestDto.objId(), requestDto.extId(), unit, width, precision);

        int status = this.simoneApi.simone_read_str(
            requestDto.objId(),
            requestDto.extId(),
            unit,
            valueOutput,
            width,
            precision
        );
        logger.info("simone_read_str Rückgabestatus: {}", status);

        String valueRead = null;
        String statusMessage;

        if (status == SimoneConst.simone_status_ok) {
            String rawValue = valueOutput.getVal();
            valueRead = (rawValue != null) ? rawValue.trim() : null;
            statusMessage = "Lesen erfolgreich.";
            logger.debug("String-Wert gelesen (roh: '{}', getrimmt: '{}')", rawValue, valueRead);
        } else {
            if (status == SimoneConst.simone_status_noval) statusMessage = "Kein Wert für diesen Zeitpunkt vorhanden.";
            else if (status == SimoneConst.simone_status_invid) statusMessage = "Ungültige objId/extId-Kombination.";
            else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                statusMessage = "Fehler beim Lesen (Status: " + status + "). SIMONE: " + errorMsg.getVal();
            }
            logger.warn("Lesen fehlgeschlagen für objId: {}, extId: {}. Nachricht: {}", requestDto.objId(), requestDto.extId(), statusMessage);
        }

        return new ReadStringDataResponseDto(
            requestDto.objId(),
            requestDto.extId(),
            valueRead,
            status,
            statusMessage
        );

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_read_str für objId: {}, extId: {}: {}", requestDto.objId(), requestDto.extId(), t.getMessage(), t);
        throw new RuntimeException("Unerwarteter Fehler beim Lesen von String-Daten: " + t.getMessage(), t);
    }
}

/**
 * Schreibt eine Liste von Float-Werten in das aktuell geöffnete SIMONE-Szenario zum gegebenen Zeitpunkt.
 *
 * @param variablesToWrite Liste von Variablen (mit objId, extId, Wert und Einheit), die geschrieben werden sollen.
 * @param timeValueToSet Optionaler Zeitwert (rtime) in Sekunden seit Epoch. Wenn null, wird der aktuelle rtime verwendet oder 0.
 * @return Liste von Ergebnis-Datensätzen für jede Variable (inkl. Status und Nachricht).
 * @throws IllegalStateException Wenn das Szenario nicht im Schreibmodus ist oder keine rtime verfügbar ist.
 * @throws RuntimeException Bei Fehlern während des Schreibens mit simone_write_array.
 */
public List<WriteDataResponseItemDto> writeFloatDataArray(List<WriteDataRequestItemDto> variablesToWrite, Integer timeValueToSet) {
    logger.info("Service: writeFloatDataArray aufgerufen für {} Variablen. Zeit: {}",
        (variablesToWrite != null ? variablesToWrite.size() : 0),
        (timeValueToSet != null ? timeValueToSet : "aktueller rtime (" + this.currentRTimeValue + ")"));

    checkApiAndScenarioReady(true, true);

    // Überprüfe, ob das Szenario im Schreibmodus ist
    if (this.openScenarioMode != SimoneConst.SIMONE_MODE_WRITE &&
        this.openScenarioMode != SimoneConst.SIMONE_MODE_RW &&
        this.openScenarioMode != SimoneConst.SIMONE_MODE_CREATE) {
        String fehler = "Szenario '" + this.openScenarioName + "' ist nicht im Schreibmodus geöffnet (aktueller Modus: " + this.openScenarioMode + "). Schreiben nicht möglich.";
        logger.error(fehler);
        throw new IllegalStateException(fehler);
    }

    // Bestimme Zeitwert für das Schreiben
    int rtimeForWrite;
    if (timeValueToSet != null) {
        // Setze rtime explizit, falls angegeben
        if (this.openScenarioMode == SimoneConst.SIMONE_MODE_READ || this.openScenarioMode == SimoneConst.SIMONE_MODE_RW) {
             setRetrievalTimeInternal(timeValueToSet, "writeFloatDataArray-Anfrage");
        }
        rtimeForWrite = timeValueToSet;
    } else if (this.currentRTimeValue != null) {
        rtimeForWrite = this.currentRTimeValue;
    } else {
        logger.warn("Abrufzeit (rtime) nicht gesetzt. Verwende Standardwert 0 für Schreiboperation.");
        rtimeForWrite = 0;
    }

    logger.info("Schreibe Daten für Zeitwert (rtime): {}", rtimeForWrite);

    if (variablesToWrite == null || variablesToWrite.isEmpty()) {
        logger.info("Keine Variablen zum Schreiben übergeben. Breche ab.");
        return Collections.emptyList();
    }

    int nValues = variablesToWrite.size();

    // Vorbereitung der Arrays für SIMONE
    int[] objIdsArray = new int[nValues];
    int[] extIdsArray = new int[nValues];
    int[] unitsArray = new int[nValues];
    float[] valuesArray = new float[nValues];
    int[] flagsArray = new int[nValues];
    int[] statsArray = new int[nValues];

    for (int i = 0; i < nValues; i++) {
        WriteDataRequestItemDto item = variablesToWrite.get(i);
        objIdsArray[i] = item.objId();
        extIdsArray[i] = item.extId();
        valuesArray[i] = item.value();
        unitsArray[i] = (item.unitDescriptor() != null) ? item.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
        flagsArray[i] = SimoneConst.SIMONE_NO_FLAG;
    }

    List<WriteDataResponseItemDto> ergebnisse = new ArrayList<>();

    try {
        logger.debug("Aufruf von simone_write_array mit nValues: {}, rtime: {}", nValues, rtimeForWrite);

        int overallStatus = this.simoneApi.simone_write_array(
            rtimeForWrite,
            nValues,
            objIdsArray,
            extIdsArray,
            valuesArray,
            unitsArray,
            flagsArray,
            statsArray
        );
        logger.info("simone_write_array Status: {}", overallStatus);

        // Ergebnisse für jede Variable analysieren
        for (int i = 0; i < nValues; i++) {
            WriteDataRequestItemDto item = variablesToWrite.get(i);
            int status = statsArray[i];
            String nachricht;

            if (status == SimoneConst.simone_status_ok) {
                nachricht = "Schreiben erfolgreich.";
            } else if (status == SimoneConst.simone_status_noval) {
                nachricht = "Kann nicht schreiben: Wert als 'nicht vorhanden' markiert.";
            } else if (status == SimoneConst.simone_status_nofloat) {
                nachricht = "Kann nicht schreiben: Kein gültiger Float-Wert.";
            } else if (status == SimoneConst.simone_status_invid) {
                nachricht = "Ungültige objId/extId-Kombination.";
            } else if (status == SimoneConst.simone_status_badpar) {
                nachricht = "Ungültiger Parameter (z.B. Einheit oder Wertebereich).";
            } else if (status == SimoneConst.simone_status_locked) {
                nachricht = "Kann nicht schreiben: Objekt oder Szenario gesperrt.";
            } else {
                SimString fehler = new SimString();
                this.simoneApi.simone_last_error(fehler);
                nachricht = "Unbekannter Fehler (Status: " + status + "). SIMONE: " + fehler.getVal();
            }

            if (status != SimoneConst.simone_status_ok) {
                logger.warn("Schreiben fehlgeschlagen für objId: {}, extId: {}, Wert: {}. Status: {}, Nachricht: {}",
                    item.objId(), item.extId(), item.value(), status, nachricht);
            }

            ergebnisse.add(new WriteDataResponseItemDto(
                item.objId(),
                item.extId(),
                status,
                nachricht
            ));
        }

        // Übergeordneter Fehler prüfen
        if (overallStatus != SimoneConst.simone_status_ok) {
            SimString fehler = new SimString();
            this.simoneApi.simone_last_error(fehler);
            logger.error("Gesamtfehler bei simone_write_array. Status: {}, SIMONE: {}", overallStatus, fehler.getVal());

            if (ergebnisse.isEmpty() && nValues > 0) {
                throw new RuntimeException("Gesamtfehler bei simone_write_array. Status: " + overallStatus + ". SIMONE: " + fehler.getVal());
            }
        }

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_write_array: {}", t.getMessage(), t);
        throw new RuntimeException("Fehler beim Schreiben der Daten: " + t.getMessage(), t);
    }

    return ergebnisse;
}

/**
 * Schreibt einen einzelnen Wert (Float oder String) für eine bestimmte Variable zu einem gegebenen Zeitpunkt,
 * unter Verwendung von `simone_write_ex`, das erweiterte Parameter wie Bedingungen und Kommentare unterstützt.
 *
 * @param requestDto DTO, das alle Parameter für den erweiterten Schreibvorgang enthält, wie Zeit, Wert(e), Einheit, Flags usw.
 * @return WriteDataExResponseDto mit objId, extId, Rückgabestatus von SIMONE und einer Statusnachricht.
 * @throws IllegalStateException Wenn die SIMONE-API nicht bereit ist oder das Szenario/Netzwerk nicht korrekt gesetzt ist.
 * @throws RuntimeException Bei anderen unerwarteten Fehlern.
 */
public WriteDataExResponseDto writeFloatDataEx(WriteDataExRequestDto requestDto) {
    logger.info("Service: writeFloatDataEx aufgerufen für objId: {}, extId: {}, Zeit: {}, Wert: {}, Wert (String): '{}'", 
        requestDto.objId(), requestDto.extId(), requestDto.timeValue(), requestDto.value(), requestDto.valueStr());

    checkApiAndScenarioReady(true, true); // Szenario muss geöffnet und Netzwerk ausgewählt sein

    if (this.openScenarioMode != SimoneConst.SIMONE_MODE_WRITE && 
        this.openScenarioMode != SimoneConst.SIMONE_MODE_RW &&
        this.openScenarioMode != SimoneConst.SIMONE_MODE_CREATE) {
        String fehler = "Szenario '" + this.openScenarioName + "' ist nicht im Schreibmodus geöffnet (aktueller Modus: " + this.openScenarioMode + "). Schreiben nicht möglich.";
        logger.error(fehler);
        throw new IllegalStateException(fehler);
    }

    // Bestimme den rtime-Wert
    int rtime;
    if (requestDto.timeValue() != null) {
        rtime = requestDto.timeValue();
    } else if (this.currentRTimeValue != null) {
        rtime = this.currentRTimeValue;
    } else {
        logger.error("Schreibvorgang (writeFloatDataEx) gestartet ohne expliziten rtime und kein aktueller rtime gesetzt.");
        throw new IllegalStateException("Ein Zeitwert (rtime) muss gesetzt sein, wenn er nicht im Request mitgegeben wird.");
    }

    logger.info("Schreibe Daten mit simone_write_ex für rtime: {}", rtime);

    int objId = requestDto.objId();
    int extId = requestDto.extId();

    float floatValueToSend = 0.0f;
    String stringValueToSend = requestDto.valueStr();

    // Entscheide, welcher Wert geschrieben wird
    if (stringValueToSend != null && !stringValueToSend.isEmpty()) {
        // stringValueToSend wird genutzt, float bleibt 0
    } else if (requestDto.value() != null) {
        floatValueToSend = requestDto.value();
        stringValueToSend = null; // explizit null setzen
    } else {
        logger.warn("Weder Float-Wert noch String-Wert übergeben für objId: {}, extId: {}. SIMONE verwendet möglicherweise einen Defaultwert.", objId, extId);
    }

    int unit = (requestDto.unitDescriptor() != null) ? requestDto.unitDescriptor() : SimoneConst.SIMONE_UNIT_DEFAULT;
    int condFlags = (requestDto.condFlags() != null) ? requestDto.condFlags() : SimoneConst.SIMONE_NO_FLAG;
    int condId = (requestDto.condId() != null) ? requestDto.condId() : 0;
    int funcId = (requestDto.funcId() != null) ? requestDto.funcId() : 0;
    int valueFlags = (requestDto.valueFlags() != null) ? requestDto.valueFlags() : SimoneConst.SIMONE_NO_FLAG;
    int srcId = (requestDto.srcId() != null) ? requestDto.srcId() : 0;
    String kommentar = requestDto.comment();
    String simoneFehlermeldung = "";

    try {
        logger.debug("Aufruf simoneApi.simone_write_ex mit rtime={}, objId={}, extId={}, condFlags={}, condId={}, " +
                     "Wert={}, WertStr='{}', Einheit={}, funcId={}, valueFlags={}, srcId={}, Kommentar='{}'",
                     rtime, objId, extId, condFlags, condId, floatValueToSend, stringValueToSend, unit, funcId, valueFlags, srcId, kommentar);

        int simoneStatus = this.simoneApi.simone_write_ex(
            rtime,
            objId,
            extId,
            condFlags,
            condId,
            floatValueToSend,
            stringValueToSend,
            unit,
            funcId,
            valueFlags,
            srcId,
            kommentar
        );

        logger.info("simone_write_ex für objId: {}, extId: {} ergab Status: {}", objId, extId, simoneStatus);

        String statusNachricht;
        if (simoneStatus == SimoneConst.simone_status_ok) {
            statusNachricht = "Schreibvorgang erfolgreich.";
        } else {
            SimString fehlerText = new SimString();
            this.simoneApi.simone_last_error(fehlerText);
            simoneFehlermeldung = (fehlerText.getVal() != null) ? fehlerText.getVal().trim() : "Keine spezifische Fehlermeldung von SIMONE.";
            statusNachricht = "Schreibvorgang fehlgeschlagen. Status: " + simoneStatus;
            logger.warn("Fehler beim Schreiben (simone_write_ex) für objId: {}, extId: {}. Status: {}, Nachricht: '{}'",
                        objId, extId, simoneStatus, simoneFehlermeldung);
        }

        return new WriteDataExResponseDto(
            objId,
            extId,
            simoneStatus,
            simoneFehlermeldung,
            statusNachricht
        );

    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_write_ex für objId: {}, extId: {}: {}", objId, extId, t.getMessage(), t);
        return new WriteDataExResponseDto(
            objId,
            extId,
            SimoneConst.simone_status_exception,
            "Java-Service-Ausnahme: " + t.getMessage(),
            "Unerwarteter Fehler beim Schreibvorgang."
        );
    }
}
/**
 * Führt das aktuell geöffnete SIMONE-Szenario aus, mithilfe von simone_execute_ex.
 * Diese Methode erlaubt das Setzen von Ausführungs-Flags und liefert einen ausführlichen Statusbericht.
 * Hinweis: Für diese Funktion ist die Lizenz "SIMONE API: Execute Simulation" erforderlich.
 *
 * @param requestedFlags Optional: Flags für die Ausführung (z. B. SIMONE_FLAG_INTERACTIVE_MSG).
 * @return ExecuteScenarioResponseDto mit Statuscode, SIMONE-Antworttext und einer Nachricht des Services.
 * @throws IllegalStateException Wenn die SIMONE API nicht bereit ist, kein Netzwerk ausgewählt oder kein Szenario geöffnet ist.
 * @throws RuntimeException Bei unerwarteten Fehlern bei der Ausführung.
 */
public ExecuteScenarioResponseDto executeScenarioExtended(Integer requestedFlags) {
    logger.info("Service: executeScenarioExtended aufgerufen mit Flags: {}", 
        requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);

    checkApiAndScenarioReady(true, true); 

    if (this.openScenarioName == null) {
        logger.error("Szenario kann nicht ausgeführt werden: Kein Szenario ist geöffnet.");
        throw new IllegalStateException("Kein Szenario geöffnet zur Ausführung.");
    }

    logger.info("Versuche Szenario auszuführen: '{}'", this.openScenarioName);
    SimString statusTextOutput = new SimString(); 
    int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;

    try {
        logger.debug("Aufruf simoneApi.simone_execute_ex(statusTextOutput, Flags: {})...", flags);
        int simoneStatus = this.simoneApi.simone_execute_ex(statusTextOutput, flags);
        logger.info("simone_execute_ex für Szenario '{}' ergab Status: {}", this.openScenarioName, simoneStatus);

        String executionStatus = Optional.ofNullable(statusTextOutput.getVal()).orElse("N/A").trim();
        logger.info("SIMONE-Ausführungsstatus: '{}'", executionStatus);

        String serviceMessage;
        if (simoneStatus == SimoneConst.simone_status_ok) {
            if ("RUNOK".equalsIgnoreCase(executionStatus)) {
                serviceMessage = "Szenario erfolgreich ausgeführt. Status: RUNOK.";
            } else {
                serviceMessage = "Szenario wurde ausgeführt, aber SIMONE meldet: " + executionStatus;
                logger.warn(serviceMessage);
            }
        } else {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String detailedError = Optional.ofNullable(errorMsg.getVal()).orElse("Keine Fehlermeldung von SIMONE.").trim();

            serviceMessage = "Fehler bei Ausführung. SIMONE-Status: " + simoneStatus +
                             ". Status-Text: '" + executionStatus + 
                             "'. Detail: '" + detailedError + "'";
            logger.error(serviceMessage);
        }

        return new ExecuteScenarioResponseDto(simoneStatus, executionStatus, serviceMessage);

    } catch (UnsatisfiedLinkError ule) {
        logger.error("UnsatisfiedLinkError bei simone_execute_ex: {}", ule.getMessage(), ule);
        throw new IllegalStateException("Fehler in nativer Bibliothek während der Ausführung.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei Ausführung von Szenario '{}': {}", this.openScenarioName, t.getMessage(), t);
        throw new RuntimeException("Fehler bei Szenarioausführung: " + t.getMessage(), t);
    }
}

/**
 * Ruft den Berechnungsstatus eines bestimmten SIMONE-Szenarios über simone_calculation_status_ex ab.
 * Hinweis: Das Szenario muss existieren und zuvor berechnet worden sein. Ein geöffnetes Szenario ist nicht zwingend nötig.
 *
 * @param scenarioName Name des Szenarios, dessen Status abgefragt werden soll.
 * @param requestedFlags Optional: Flags (derzeit für zukünftige Verwendungen reserviert).
 * @return ScenarioCalculationStatusResponseDto mit Szenarioname, Statuscode, SIMONE-Antworttext und Dienstnachricht.
 * @throws IllegalStateException Wenn SIMONE API nicht bereit ist oder kein Netzwerk gewählt wurde.
 * @throws IllegalArgumentException Wenn der Szenarioname null oder leer ist.
 * @throws RuntimeException Bei unerwarteten Fehlern.
 */
public ScenarioCalculationStatusResponseDto getScenarioCalculationStatusExtended(String scenarioName, Integer requestedFlags) {
    logger.info("Service: getScenarioCalculationStatusExtended für Szenario: '{}', Flags: {}", 
        scenarioName, requestedFlags == null ? "Standard (NO_FLAG)" : requestedFlags);

    checkApiAndScenarioReady(false, true); 

    if (scenarioName == null || scenarioName.trim().isEmpty()) {
        throw new IllegalArgumentException("Szenarioname darf nicht null oder leer sein.");
    }

    SimString statusTextOutput = new SimString();
    int flags = (requestedFlags != null) ? requestedFlags : SimoneConst.SIMONE_NO_FLAG;

    try {
        logger.debug("Aufruf simone_calculation_status_ex(\"{}\", statusTextOutput, Flags: {})...", scenarioName, flags);

        int simoneStatus = this.simoneApi.simone_calculation_status_ex(
            scenarioName.trim(), statusTextOutput, flags
        );

        logger.info("simone_calculation_status_ex für '{}' ergab Status: {}", scenarioName, simoneStatus);

        String calcStatus = Optional.ofNullable(statusTextOutput.getVal()).orElse("").trim();
        logger.info("SIMONE-Berechnungsstatus für '{}': '{}'", scenarioName, calcStatus);

        String serviceMessage;
        if (simoneStatus == SimoneConst.simone_status_ok) {
            serviceMessage = "Berechnungsstatus erfolgreich abgefragt: " + calcStatus;
        } else {
            SimString err = new SimString();
            this.simoneApi.simone_last_error(err);
            String detailedError = Optional.ofNullable(err.getVal()).orElse("Keine Fehlerbeschreibung.").trim();

            serviceMessage = "Fehler beim Abruf des Status. SIMONE-Status: " + simoneStatus +
                             ", Status-Text: '" + calcStatus + "', Fehler: '" + detailedError + "'";
            logger.warn(serviceMessage);
        }

        return new ScenarioCalculationStatusResponseDto(scenarioName, simoneStatus, calcStatus, serviceMessage);

    } catch (UnsatisfiedLinkError ule) {
        logger.error("UnsatisfiedLinkError bei simone_calculation_status_ex für '{}': {}", scenarioName, ule.getMessage(), ule);
        throw new IllegalStateException("Native-Bibliotheksfehler beim Abruf des Szenariostatus.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_calculation_status_ex für '{}': {}", scenarioName, t.getMessage(), t);
        return new ScenarioCalculationStatusResponseDto(
            scenarioName,
            SimoneConst.simone_status_exception,
            "N/A",
            "Unerwarteter Fehler: " + t.getMessage()
        );
    }
}

/**
 * Ruft den Berechnungsstatus des aktuell geöffneten SIMONE-Szenarios über simone_calculation_status ab.
 * Das Szenario muss geöffnet sein (idealerweise im READ-Modus).
 *
 * @return CurrentScenarioCalculationStatusResponseDto mit Name, Statuscode, Status-Text und Nachricht.
 * @throws IllegalStateException Wenn keine Netzwerkauswahl oder Szenario geöffnet ist.
 * @throws RuntimeException Bei API- oder Laufzeitfehlern.
 */
public CurrentScenarioCalculationStatusResponseDto getCurrentOpenScenarioCalculationStatus() {
    logger.info("Service: getCurrentOpenScenarioCalculationStatus aufgerufen für: '{}'", this.openScenarioName);

    checkApiAndScenarioReady(true, true); 

    if (this.openScenarioMode != SimoneConst.SIMONE_MODE_READ && 
        this.openScenarioMode != SimoneConst.SIMONE_MODE_RW) {
        logger.warn("Aktuell geöffnetes Szenario '{}' ist nicht im READ- oder RW-Modus (aktuell: {}). " +
                    "API-Verhalten könnte nicht dokumentiert sein.", this.openScenarioName, this.openScenarioMode);
    }

    SimString statusTextOutput = new SimString();

    try {
        logger.debug("Aufruf simone_calculation_status(statusTextOutput)...");
        int simoneStatus = this.simoneApi.simone_calculation_status(statusTextOutput);
        logger.info("simone_calculation_status für '{}' ergab Status: {}", this.openScenarioName, simoneStatus);

        String calcStatus = Optional.ofNullable(statusTextOutput.getVal()).orElse("").trim();

        String message;
        if (simoneStatus == SimoneConst.simone_status_ok) {
            message = "Berechnungsstatus erfolgreich abgerufen: " + calcStatus;
        } else {
            SimString err = new SimString();
            this.simoneApi.simone_last_error(err);
            String detailedError = Optional.ofNullable(err.getVal()).orElse("Keine Fehlerbeschreibung.").trim();

            message = "Fehler beim Abrufen des Status. SIMONE-Status: " + simoneStatus +
                      ", Status-Text: '" + calcStatus + "', Fehler: '" + detailedError + "'";
            logger.warn(message);
        }

        return new CurrentScenarioCalculationStatusResponseDto(
            this.openScenarioName,
            simoneStatus,
            calcStatus,
            message
        );

    } catch (UnsatisfiedLinkError ule) {
        logger.error("UnsatisfiedLinkError bei simone_calculation_status für '{}': {}", this.openScenarioName, ule.getMessage(), ule);
        throw new IllegalStateException("Native-Bibliotheksfehler beim Statusabruf.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler bei simone_calculation_status für '{}': {}", this.openScenarioName, t.getMessage(), t);
        return new CurrentScenarioCalculationStatusResponseDto(
            this.openScenarioName,
            SimoneConst.simone_status_exception,
            "N/A",
            "Unerwarteter Fehler: " + t.getMessage()
        );
    }
}

/**
 * Holt die erste Berechnungsnachricht des zuletzt ausgeführten, aktuell geöffneten Szenarios.
 * Verwendet intern {@code simone_get_first_message()}.
 *
 * @return {@link CalculationMessageDto} mit Details der ersten Nachricht oder ein DTO mit passendem Status,
 *         falls keine Nachricht gefunden wurde.
 * @throws IllegalStateException falls die SIMONE API nicht bereit ist, kein Netzwerk/Szenario geöffnet ist.
 */
public CalculationMessageDto getFirstCalculationMessage() {
    logger.info("Service: getFirstCalculationMessage aufgerufen für geöffnetes Szenario: '{}'", this.openScenarioName);
    checkApiAndScenarioReady(true, true);

    SimString msgOutput = new SimString();
    SimTimeT msgTimeOutput = new SimTimeT();
    SimInt severityOutput = new SimInt();
    SimString objNameOutput = new SimString();
    SimString msgNameOutput = new SimString();

    try {
        logger.debug("Service: Aufruf von simoneApi.simone_get_first_message(...)");

        int simoneStatus = this.simoneApi.simone_get_first_message(
            msgOutput, msgTimeOutput, severityOutput, objNameOutput, msgNameOutput
        );

        logger.info("simone_get_first_message lieferte Status: {}", simoneStatus);

        if (simoneStatus == SimoneConst.simone_status_ok) {
            return new CalculationMessageDto(
                simoneStatus,
                "Erste Nachricht erfolgreich abgerufen.",
                msgOutput.getVal() != null ? msgOutput.getVal().trim() : null,
                msgTimeOutput.getVal(),
                severityOutput.getVal(),
                objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : null,
                msgNameOutput.getVal() != null ? msgNameOutput.getVal().trim() : null
            );
        } else if (simoneStatus == SimoneConst.simone_status_not_found) {
            logger.info("Keine erste Nachricht gefunden für Szenario '{}'.", this.openScenarioName);
            return CalculationMessageDto.noMessage(simoneStatus, "Keine Nachrichten für die letzte Ausführung gefunden.");
        } else {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String detailedError = Optional.ofNullable(errorMsg.getVal()).orElse("Keine SIMONE-Fehlermeldung").trim();

            logger.warn("Fehler beim Abrufen der ersten Nachricht. SIMONE-Status: {}, Detail: {}", simoneStatus, detailedError);
            return new CalculationMessageDto(simoneStatus,
                "Abrufen der ersten Nachricht fehlgeschlagen. SIMONE-Fehler: " + detailedError,
                null, null, null, null, null
            );
        }

    } catch (UnsatisfiedLinkError ule) {
        logger.error("Native-Bibliotheksfehler bei simone_get_first_message: {}", ule.getMessage(), ule);
        throw new IllegalStateException("Fehler in nativer Bibliothek beim Abrufen der ersten Berechnungsnachricht.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler in getFirstCalculationMessage: {}", t.getMessage(), t);
        return new CalculationMessageDto(
            SimoneConst.simone_status_exception,
            "Unerwarteter Fehler im Java-Service: " + t.getMessage(),
            null, null, null, null, null
        );
    }
}

/**
 * Holt die nächste Berechnungsnachricht nach einem vorherigen Aufruf von {@code simone_get_first_message()} 
 * oder {@code simone_get_next_message()}.
 * Verwendet intern {@code simone_get_next_message()}.
 *
 * @return {@link CalculationMessageDto} mit Details der nächsten Nachricht oder ein DTO mit entsprechendem Status,
 *         falls keine weiteren Nachrichten vorhanden sind.
 * @throws IllegalStateException falls die API oder das Szenario nicht korrekt initialisiert sind.
 */
public CalculationMessageDto getNextCalculationMessage() {
    logger.info("Service: getNextCalculationMessage aufgerufen für geöffnetes Szenario: '{}'", this.openScenarioName);
    checkApiAndScenarioReady(true, true);

    SimString msgOutput = new SimString();
    SimTimeT msgTimeOutput = new SimTimeT();
    SimInt severityOutput = new SimInt();
    SimString objNameOutput = new SimString();
    SimString msgNameOutput = new SimString();

    try {
        logger.debug("Service: Aufruf von simoneApi.simone_get_next_message(...)");

        int simoneStatus = this.simoneApi.simone_get_next_message(
            msgOutput, msgTimeOutput, severityOutput, objNameOutput, msgNameOutput
        );

        logger.info("simone_get_next_message lieferte Status: {}", simoneStatus);

        if (simoneStatus == SimoneConst.simone_status_ok) {
            return new CalculationMessageDto(
                simoneStatus,
                "Nächste Nachricht erfolgreich abgerufen.",
                msgOutput.getVal() != null ? msgOutput.getVal().trim() : null,
                msgTimeOutput.getVal(),
                severityOutput.getVal(),
                objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : null,
                msgNameOutput.getVal() != null ? msgNameOutput.getVal().trim() : null
            );
        } else if (simoneStatus == SimoneConst.simone_status_not_found) {
            logger.info("Keine weiteren Nachrichten für Szenario '{}'.", this.openScenarioName);
            return CalculationMessageDto.noMessage(simoneStatus, "Keine weiteren Nachrichten gefunden.");
        } else {
            SimString errorMsg = new SimString();
            this.simoneApi.simone_last_error(errorMsg);
            String detailedError = Optional.ofNullable(errorMsg.getVal()).orElse("Keine SIMONE-Fehlermeldung").trim();

            logger.warn("Fehler beim Abrufen der nächsten Nachricht. SIMONE-Status: {}, Detail: {}", simoneStatus, detailedError);
            return new CalculationMessageDto(simoneStatus,
                "Abrufen der nächsten Nachricht fehlgeschlagen. SIMONE-Fehler: " + detailedError,
                null, null, null, null, null
            );
        }

    } catch (UnsatisfiedLinkError ule) {
        logger.error("Native-Bibliotheksfehler bei simone_get_next_message: {}", ule.getMessage(), ule);
        throw new IllegalStateException("Fehler in nativer Bibliothek beim Abrufen der nächsten Nachricht.", ule);
    } catch (Throwable t) {
        logger.error("Unerwarteter Fehler in getNextCalculationMessage: {}", t.getMessage(), t);
        return new CalculationMessageDto(
            SimoneConst.simone_status_exception,
            "Unerwarteter Fehler im Java-Service: " + t.getMessage(),
            null, null, null, null, null
        );
    }
}

/**
 * Holt alle Berechnungsnachrichten des aktuell geöffneten Szenarios.
 * Führt intern eine Schleife über {@code simone_get_first_message()} und {@code simone_get_next_message()} aus.
 *
 * @return Liste von {@link CalculationMessageDto}; ggf. leer, wenn keine Nachrichten vorhanden sind.
 * @throws IllegalStateException falls die SIMONE API oder das Szenario nicht korrekt vorbereitet sind.
 */
public List<CalculationMessageDto> getAllCalculationMessages() {
    logger.info("Service: getAllCalculationMessages aufgerufen für Szenario '{}'", this.openScenarioName);
    checkApiAndScenarioReady(true, true);

    List<CalculationMessageDto> messages = new ArrayList<>();

    CalculationMessageDto currentMessage = getFirstCalculationMessage();

    while (currentMessage != null && currentMessage.simoneStatus() == SimoneConst.simone_status_ok) {
        messages.add(currentMessage);
        currentMessage = getNextCalculationMessage();
    }

    logger.info("{} Berechnungsnachricht(en) abgerufen.", messages.size());
    return messages;
}

/**
 * Gibt den Namen des aktuell geöffneten Szenarios zurück.
 *
 * @return Szenarioname als {@link String}
 */
public String getOpenScenarioName() {
    return this.openScenarioName;
}

/**
 * Gibt den Modus des aktuell geöffneten Szenarios zurück (READ/WRITE/CREATE).
 *
 * @return Szenario-Modus als {@code int}
 */
public int getOpenScenarioMode() {
    return this.openScenarioMode;
}



}