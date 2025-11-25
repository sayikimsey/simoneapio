// // src/main/java/com/gascade/simone/controller/SimoneScenarioController.java
// package com.gascade.simone.controller;

// import java.util.Collections;
// import java.util.List;
// import java.util.Map;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody; // For read string request
// import org.springframework.web.bind.annotation.RequestMapping; // For read string response
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.CalculationMessageDto;
// import com.gascade.simone.dto.CopyScenarioRequestDto;
// import com.gascade.simone.dto.CreateScenarioRequestDto;
// import com.gascade.simone.dto.CurrentScenarioCalculationStatusResponseDto;
// import com.gascade.simone.dto.DeleteScenarioRequestDto;
// import com.gascade.simone.dto.ExecuteScenarioRequestDto;
// import com.gascade.simone.dto.ExecuteScenarioResponseDto;
// import com.gascade.simone.dto.MessageResponseDto;
// import com.gascade.simone.dto.OpenScenarioRequestDto;
// import com.gascade.simone.dto.ReadDataRequestDto; 
// import com.gascade.simone.dto.ReadDataResponseDto;
// import com.gascade.simone.dto.ReadDataResponseItemDto;
// import com.gascade.simone.dto.ReadStringDataRequestDto;
// import com.gascade.simone.dto.ReadStringDataResponseDto;
// import com.gascade.simone.dto.ScenarioCalculationStatusResponseDto;
// import com.gascade.simone.dto.ScenarioListItemDto;
// import com.gascade.simone.dto.ScenarioListResponseDto;
// import com.gascade.simone.dto.SetTimeRequestDto;
// import com.gascade.simone.dto.TimeResponseDto;
// import com.gascade.simone.dto.WriteDataExRequestDto;
// import com.gascade.simone.dto.WriteDataExResponseDto;
// import com.gascade.simone.dto.WriteDataRequestDto;
// import com.gascade.simone.dto.WriteDataResponseDto;
// import com.gascade.simone.dto.WriteDataResponseItemDto;
// import com.gascade.simone.service.SimoneScenarioService;
// import com.gascade.simone.service.SimoneScenarioService.SimoneScenarioException;

// import de.liwacom.simone.SimoneConst;
// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/simone-api-java/v1/scenarios") 
// public class SimoneScenarioController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneScenarioController.class);
//     private final SimoneScenarioService simoneScenarioService;

//     @Autowired
//     public SimoneScenarioController(SimoneScenarioService simoneScenarioService) {
//         this.simoneScenarioService = simoneScenarioService;
//         logger.info("SimoneScenarioController initialized.");
//     }


//     // Add this new endpoint to your SimoneScenarioController class

// /**
//  * Endpoint to copy a scenario ("Save As").
//  *
//  * @param request DTO containing the source and new scenario names.
//  * @return A response entity indicating the result of the operation.
//  */
// @PostMapping("/copy")
// public ResponseEntity<MessageResponseDto> copyScenario(@Valid @RequestBody CopyScenarioRequestDto request) {
//     logger.info("Controller: POST /scenarios/copy endpoint hit to copy '{}' to '{}'", request.sourceScenarioName(), request.newScenarioName());
//     try {
//         String message = simoneScenarioService.copyScenario(request);
//         return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponseDto(message));
//     } catch (SimoneScenarioException e) {
//         // Specific user-facing errors from the service layer
//         logger.error("Controller Error: Failed to copy scenario. Reason: {}", e.getMessage());
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto(e.getMessage()));
//     } catch (Exception e) {
//         // General server errors
//         logger.error("Controller Error: An unexpected error occurred while copying the scenario.", e);
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("An unexpected server error occurred. Please check logs."));
//     }
// }

//         /**
//      * Handles the creation of a new SIMONE scenario.
//      *
//      * @param request The request body containing the scenario details. Validated by @Valid.
//      * @return A ResponseEntity with a success or error message.
//      */
//     @PostMapping("/create")
//     public ResponseEntity<MessageResponseDto> createScenario(@Valid @RequestBody CreateScenarioRequestDto request) {
//         logger.info("Controller: POST /scenarios/create endpoint hit for scenario '{}'", request.scenarioName());
//         try {
//             simoneScenarioService.createScenario(request);
//             String successMessage = "Scenario '" + request.scenarioName() + "' created successfully.";
//             return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponseDto(successMessage));
//         } catch (SimoneScenarioException e) {
//             logger.error("Controller: Failed to create scenario '{}'. Reason: {}", request.scenarioName(), e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller: An unexpected error occurred while creating scenario '{}'.", request.scenarioName(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("An unexpected error occurred. Please check the service logs."));
//         }
//     }
    
//         /**
//      * Endpoint to delete an existing scenario.
//      * It receives the name of the scenario to be deleted and calls the service to perform the action.
//      *
//      * @param request DTO containing the name of the scenario to delete.
//      * @return A response entity indicating the result of the operation.
//      */
//     @DeleteMapping("/delete")
//     public ResponseEntity<MessageResponseDto> deleteScenario(@Valid @RequestBody DeleteScenarioRequestDto request) {
//         logger.info("Controller: DELETE /scenarios/delete endpoint hit for scenario '{}'", request.getScenarioName());
//         try {
//             simoneScenarioService.deleteScenario(request);
//             return ResponseEntity
//                     .ok(new MessageResponseDto("Scenario '" + request.getScenarioName() + "' deleted successfully."));
//         } catch (SimoneScenarioException e) {
//             logger.error("Controller Error: Failed to delete scenario '{}'. Reason: {}", request.getScenarioName(), e.getMessage());
//             return ResponseEntity
//                     .status(HttpStatus.BAD_REQUEST)
//                     .body(new MessageResponseDto("Error deleting scenario: " + e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller Error: An unexpected error occurred while deleting scenario '{}'.", request.getScenarioName(), e);
//             return ResponseEntity
//                     .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body(new MessageResponseDto("An unexpected server error occurred."));
//         }
//     } 

//     @GetMapping
//     public ResponseEntity<ScenarioListResponseDto> listScenarios() {
//         logger.info("Controller: GET /scenarios received (for current selected network).");
//         try {
//             List<ScenarioListItemDto> scenarios = simoneScenarioService.listScenariosWithDetails();
//             return ResponseEntity.ok(new ScenarioListResponseDto("Scenarios retrieved successfully.", scenarios));
//         } catch (IllegalStateException e) { 
//             logger.warn("Controller: Condition not met for listing scenarios - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED) 
//                 .body(new ScenarioListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: SIMONE API error listing scenarios: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ScenarioListResponseDto("Failed to list scenarios: " + e.getMessage(), Collections.emptyList()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error listing scenarios: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ScenarioListResponseDto("An unexpected error occurred while listing scenarios.", Collections.emptyList()));
//         }
//     }
      

//     @PostMapping("/open")
//     public ResponseEntity<MessageResponseDto> openScenario(@Valid @RequestBody OpenScenarioRequestDto requestDto) {
//         // --- KORREKTUR: Der Request enthält jetzt den networkName ---
//         logger.info("Controller: POST /open received for scenario: '{}' in network '{}', mode: {}",
//             requestDto.scenarioName(), requestDto.networkName(), requestDto.mode());
//         try {
//             // Die Service-Methode wird mit dem vollständigen DTO aufgerufen
//             String message = simoneScenarioService.openScenario(requestDto);
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (Exception e) {
//             logger.error("Controller: Error opening scenario: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new MessageResponseDto(e.getMessage()));
//         }
//     }

//     @PostMapping("/close")
//     public ResponseEntity<MessageResponseDto> closeScenario() {
//         // Dieser Endpunkt bleibt unverändert, da er keine Parameter benötigt.
//         logger.info("Controller: POST /close received for current scenario.");
//         try {
//             String message = simoneScenarioService.closeScenario();
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (Exception e) {
//             logger.error("Controller: Error closing scenario: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new MessageResponseDto(e.getMessage()));
//         }
//     }

//     @GetMapping("/current/status")
//     public ResponseEntity<Map<String, Object>> getCurrentScenarioStatus() {
//         logger.info("Controller: GET /current/status received.");
//         String openScenario = simoneScenarioService.getOpenScenarioName();
//         int mode = simoneScenarioService.getOpenScenarioMode();
//         String modeStr = "UNKNOWN";
//         if(openScenario != null) { 
//             if (mode == SimoneConst.SIMONE_MODE_READ) modeStr = "READ";
//             else if (mode == SimoneConst.SIMONE_MODE_WRITE) modeStr = "WRITE";
//             else if (mode == SimoneConst.SIMONE_MODE_CREATE) modeStr = "CREATE";
//         }
//         return ResponseEntity.ok(Map.of(
//             "openScenarioName", openScenario == null ? "None" : openScenario, 
//             "openScenarioMode", openScenario == null ? "N/A" : modeStr
//         ));
//     }

//  // src/main/java/com/gascade/simone/controller/SimoneScenarioController.java

// @PostMapping("/current/rtime/set")
// public ResponseEntity<MessageResponseDto> setRetrievalTime(@RequestBody SetTimeRequestDto requestDto) {
//     logger.info("Controller: POST /current/rtime/set received. TimeValue: {}", requestDto.timeValue());
//     try {
//         String message = simoneScenarioService.setRetrievalTime(requestDto.timeValue());
//         return ResponseEntity.ok(new MessageResponseDto(message));
//     } catch (IllegalStateException e) {
//         // This block now correctly handles the case where the scenario is in WRITE/CREATE mode.
//         logger.warn("Controller: Condition not met for setting retrieval time - {}", e.getMessage());
//         return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(new MessageResponseDto(e.getMessage()));
//     } catch (RuntimeException e) {
//         logger.error("Controller: SIMONE API error setting retrieval time: {}", e.getMessage());
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
//     } catch (Exception e) {
//         logger.error("Controller: Unexpected error setting retrieval time: {}", e.getMessage(), e);
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new MessageResponseDto("An unexpected error occurred while setting retrieval time."));
//     }
// }
//     @GetMapping("/current/rtime/get")
//     public ResponseEntity<TimeResponseDto> getRetrievalTime() {
//         logger.info("Controller: GET /current/rtime/get received.");
//         try {
//             Integer timeValue = simoneScenarioService.getRetrievalTimeValue();
//             String formattedTime = simoneScenarioService.formatTimeTForResponse(timeValue);
//             return ResponseEntity.ok(new TimeResponseDto(timeValue, formattedTime));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for getting retrieval time - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(new TimeResponseDto(null, e.getMessage()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: SIMONE API error getting retrieval time: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new TimeResponseDto(null, e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error getting retrieval time: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new TimeResponseDto(null, "An unexpected error occurred."));
//         }
//     }

//     @PostMapping("/current/rtime/next")
//     public ResponseEntity<TimeResponseDto> advanceToNextRetrievalTime() {
//         logger.info("Controller: POST /current/rtime/next received.");
//         try {
//             Integer nextTimeValue = simoneScenarioService.advanceToNextRetrievalTime();
//             String formattedTime = simoneScenarioService.formatTimeTForResponse(nextTimeValue);
//             return ResponseEntity.ok(new TimeResponseDto(nextTimeValue, formattedTime));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for advancing retrieval time - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(new TimeResponseDto(null, e.getMessage()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: SIMONE API error advancing retrieval time: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new TimeResponseDto(null, e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller: Unexpected error advancing retrieval time: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new TimeResponseDto(null, "An unexpected error occurred."));
//         }
//     }

//     @PostMapping("/current/read-float-array")
//     public ResponseEntity<ReadDataResponseDto> readFloatDataArray(@RequestBody ReadDataRequestDto requestDto) {
//         logger.info("Controller: POST /current/read-float-array for {} variables.", 
//             (requestDto.variables() != null ? requestDto.variables().size() : 0));
//         if (requestDto.variables() == null || requestDto.variables().isEmpty()) {
//             return ResponseEntity.badRequest().body(new ReadDataResponseDto("Variable list cannot be empty.", Collections.emptyList()));
//         }
//         try {
//             List<ReadDataResponseItemDto> results = simoneScenarioService.readFloatDataArray(requestDto.variables());
//             long successfulReads = results.stream().filter(item -> item.simoneStatus() == SimoneConst.simone_status_ok).count();
//             String message = "Data read attempted. Check individual item statuses.";
//             if (successfulReads == results.size()) {
//                 message = "Data read successfully for all items.";
//             } else if (successfulReads > 0) {
//                 message = "Data read partially successfully; some items may have no value or errors.";
//             } else if (!results.isEmpty()) { // All items had non-OK status
//                 message = "Could not read data for any requested item; check individual statuses.";
//             }
//             return ResponseEntity.ok(new ReadDataResponseDto(message, results));
//         } catch (IllegalStateException e) {
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(new ReadDataResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) { 
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReadDataResponseDto("Failed to read data array: " + e.getMessage(), Collections.emptyList()));
//         } catch (Exception e) { 
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReadDataResponseDto("An unexpected error occurred.", Collections.emptyList()));
//         }
//     }

//     // --- NEW ENDPOINT for reading single string data ---
//     @PostMapping("/current/read-string-data")
//     public ResponseEntity<ReadStringDataResponseDto> readStringData(@RequestBody ReadStringDataRequestDto requestDto) {
//         logger.info("Controller: POST /current/read-string-data for objId: {}, extId: {}", 
//             requestDto.objId(), requestDto.extId());
        
//         // Basic validation, more can be added (e.g., objId/extId > 0)
//         // The service layer will also perform checks (API ready, scenario open, etc.)
//         if (requestDto == null) { // requestDto itself could be null if not deserialized properly
//             return ResponseEntity.badRequest().body(new ReadStringDataResponseDto(0,0,null,-1,"Invalid request: No data provided."));
//         }

//         try {
//             ReadStringDataResponseDto response = simoneScenarioService.readStringDataSingle(requestDto);
            
//             // Check the simoneStatus from the DTO to determine HTTP status
//             if (response.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(response);
//             } else {
//                 // For errors like "not found" or "invalid parameter" from simone_read_str,
//                 // returning a 200 OK with the error details in the body is one approach,
//                 // or you could map specific Simone statuses to HTTP error codes.
//                 // For simplicity, if status is not OK, let's consider it a client-side type error
//                 // for now (e.g., bad objId/extId), or an issue that the client should see.
//                 logger.warn("Controller: readStringData for objId: {}, extId: {} resulted in SIMONE status: {}", 
//                             requestDto.objId(), requestDto.extId(), response.simoneStatus());
//                 // Let's return 200 OK but with the error message from SIMONE in the DTO.
//                 // Or, to be more RESTful for "not found" type errors from SIMONE:
//                 if (response.simoneStatus() == SimoneConst.simone_status_noval || 
//                     response.simoneStatus() == SimoneConst.simone_status_invid) {
//                     return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response); // For other non-OK statuses
//             }
//         } catch (IllegalStateException e) { // API not ready, no scenario/network selected, rtime not set
//             logger.warn("Controller: Condition not met for reading string data - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
//         } catch (IllegalArgumentException e) { // Invalid arguments to service method
//              logger.warn("Controller: Invalid argument for reading string data - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
//         } catch (RuntimeException e) { // Other SIMONE API related errors from service
//             logger.error("Controller: SIMONE API error reading string data: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
//         } catch (Exception e) { // General catch-all
//             logger.error("Controller: Unexpected error reading string data: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, "An unexpected error occurred."));
//         }
//     }

//     // --- NEW ENDPOINT for writing float data array ---
//     @PostMapping("/current/write-float-array")
//     public ResponseEntity<WriteDataResponseDto> writeFloatDataArray(@RequestBody WriteDataRequestDto requestDto) {
//         logger.info("Controller: POST /current/write-float-array for {} variables. Specified time: {}", 
//             (requestDto.variables() != null ? requestDto.variables().size() : 0),
//             requestDto.timeValue() == null ? "use current" : requestDto.timeValue());
        
//         if (requestDto.variables() == null || requestDto.variables().isEmpty()) {
//             return ResponseEntity.badRequest().body(new WriteDataResponseDto("Variable list for writing cannot be empty.", Collections.emptyList()));
//         }

//         try {
//             List<WriteDataResponseItemDto> results = simoneScenarioService.writeFloatDataArray(
//                 requestDto.variables(), 
//                 requestDto.timeValue() // Pass the optional timeValue to the service
//             );
            
//             long successfulWrites = results.stream().filter(item -> item.simoneStatus() == SimoneConst.simone_status_ok).count();
//             String message = "Data write attempt finished. Check individual item statuses.";
//             if (successfulWrites == results.size()) {
//                 message = "Data written successfully for all items.";
//             } else if (successfulWrites > 0) {
//                 message = "Data written partially successfully; some items may have failed.";
//             } else if (!results.isEmpty()) {
//                 message = "Could not write data for any requested item; check individual statuses.";
//             }
            
//             return ResponseEntity.ok(new WriteDataResponseDto(message, results));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for writing data array - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new WriteDataResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for writing data array - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new WriteDataResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: SIMONE API error writing data array: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new WriteDataResponseDto("Failed to write data array: " + e.getMessage(), Collections.emptyList()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error writing data array: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new WriteDataResponseDto("An unexpected error occurred while writing data.", Collections.emptyList()));
//         }
//     }

//     // Add this method to: src/main/java/com/gascade/simone/controller/SimoneScenarioController.java

//     // --- NEW ENDPOINT for writing a single float value with extended options ---
//     @PostMapping("/current/write-float-ex")
//     public ResponseEntity<WriteDataExResponseDto> writeFloatDataEx(@RequestBody WriteDataExRequestDto requestDto) {
//         logger.info("Controller: POST /current/write-float-ex received for objId: {}, extId: {}, value: {}, time: {}", 
//             requestDto.objId(), requestDto.extId(), requestDto.value(), requestDto.timeValue());
        
//         // Basic validation for required fields in DTO by controller if not handled by DTO constructor/validation annotations
//         if (requestDto == null) { // Should be caught by Spring if @RequestBody is malformed, but defensive
//             return ResponseEntity.badRequest().body(new WriteDataExResponseDto(0, 0, -1, "Invalid request body.", "Bad request."));
//         }
//         // Further validation (e.g., on timeValue, objId, extId) could be added here if needed

//         try {
//             WriteDataExResponseDto responseDto = simoneScenarioService.writeFloatDataEx(requestDto);
            
//             // Determine HTTP status based on the simoneStatus from the response DTO
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar ||
//                        responseDto.simoneStatus() == SimoneConst.simone_status_invid ||
//                        responseDto.simoneStatus() == SimoneConst.simone_status_noval || // e.g. trying to write to a read-only at this time
//                        responseDto.simoneStatus() == SimoneConst.simone_status_locked) {
//                 logger.warn("Controller: writeFloatDataEx resulted in SIMONE status: {} for objId: {}, extId: {}. Message: {}", 
//                             responseDto.simoneStatus(), requestDto.objId(), requestDto.extId(), responseDto.simoneMessage());
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             } else { // Other non-OK statuses from SIMONE
//                 logger.error("Controller: writeFloatDataEx resulted in unexpected SIMONE status: {} for objId: {}, extId: {}. Message: {}", 
//                             responseDto.simoneStatus(), requestDto.objId(), requestDto.extId(), responseDto.simoneMessage());
//                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDto);
//             }
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Condition not met for writeFloatDataEx - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Precondition failed."));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for writeFloatDataEx - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Bad request."));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: Runtime error during writeFloatDataEx: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Internal server error."));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error during writeFloatDataEx: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, "An unexpected error occurred.", "Unexpected error."));
//         }
//     }

//     // Add this new method inside the SimoneScenarioController class:

//     /**
//      * Executes the currently open SIMONE scenario using the extended execution command.
//      * Requires the "SIMONE API: Execute Simulation" license.
//      * @param requestDto Optional request body containing flags for execution.
//      * @return ResponseEntity containing the execution status.
//      */
//     @PostMapping("/current/execute-ex")
//     public ResponseEntity<ExecuteScenarioResponseDto> executeScenarioExtended(
//             @RequestBody(required = false) ExecuteScenarioRequestDto requestDto) {
        
//         Integer flags = (requestDto != null && requestDto.flags() != null) 
//                         ? requestDto.flags() 
//                         : null; // Service will default to SIMONE_NO_FLAG if null

//         logger.info("Controller: POST /current/execute-ex received. Flags: {}", 
//             flags == null ? "default (NO_FLAG)" : flags);

//         try {
//             ExecuteScenarioResponseDto responseDto = simoneScenarioService.executeScenarioExtended(flags);
            
//             // Determine HTTP status based on the simoneStatus from the response DTO
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 // Further check executionStatusText for "RUNOK" for ultimate success
//                 if ("RUNOK".equalsIgnoreCase(responseDto.executionStatusText())) {
//                     logger.info("Controller: Scenario execution successful (RUNOK).");
//                     return ResponseEntity.ok(responseDto);
//                 } else {
//                     logger.warn("Controller: Scenario execution call was OK, but status text is '{}'.", responseDto.executionStatusText());
//                     // Still return 200 OK as the API call itself succeeded, but the payload indicates an issue.
//                     return ResponseEntity.ok(responseDto); 
//                 }
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
//                        responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
//                 logger.error("Controller: Scenario execution failed due to license issue. Status: {}", responseDto.simoneStatus());
//                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto); // 403 Forbidden for license issues
//             } else {
//                 // For other SIMONE errors like bad_seq, no_file, locked, bad_par, failed
//                 logger.error("Controller: Scenario execution failed with SIMONE status: {}. Message: {}", 
//                              responseDto.simoneStatus(), responseDto.serviceMessage());
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto); // Or INTERNAL_SERVER_ERROR depending on nature
//             }
//         } catch (IllegalStateException e) { // e.g., API not ready, no scenario/network selected
//             logger.warn("Controller: Condition not met for scenario execution - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ExecuteScenarioResponseDto(-1, "N/A", e.getMessage()));
//         } catch (RuntimeException e) { // Other SIMONE API related errors from service
//             logger.error("Controller: Runtime error during scenario execution: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ExecuteScenarioResponseDto(-1, "N/A", e.getMessage()));
//         } catch (Exception e) { // General catch-all
//             logger.error("Controller: Unexpected error during scenario execution: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ExecuteScenarioResponseDto(-1, "N/A", "An unexpected error occurred."));
//         }
//     }
//      /**
//      * Retrieves the calculation status of a specific scenario using simone_calculation_status_ex.
//      * @param scenarioName The name of the scenario (from path variable).
//      * @param flags Optional flags for the API call (request parameter).
//      * @return ResponseEntity containing the calculation status details.
//      */
//     @GetMapping("/{scenarioName}/calculation-status-ex")
//     public ResponseEntity<ScenarioCalculationStatusResponseDto> getScenarioCalculationStatusExtended(
//             @PathVariable String scenarioName,
//             @RequestParam(required = false) Integer flags) {
        
//         logger.info("Controller: GET /{}/calculation-status-ex received. Flags: {}", 
//             scenarioName, flags == null ? "default (NO_FLAG)" : flags);

//         if (scenarioName == null || scenarioName.trim().isEmpty()) {
//             return ResponseEntity.badRequest().body(new ScenarioCalculationStatusResponseDto(
//                 null, SimoneConst.simone_status_badpar, "N/A", "Scenario name must be provided."
//             ));
//         }

//         try {
//             ScenarioCalculationStatusResponseDto responseDto = 
//                 simoneScenarioService.getScenarioCalculationStatusExtended(scenarioName, flags);
            
//             // The service method already populates simoneStatus and messages within the DTO.
//             // We can return it directly. The HTTP status will be based on the success of this call.
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok || 
//                 responseDto.simoneStatus() == SimoneConst.simone_status_noval || // E.g. improperly terminated execution
//                 responseDto.simoneStatus() == SimoneConst.simone_status_failed) { // E.g. execution failed
//                 // For these statuses from simone_calculation_status_ex, the call itself was "OK"
//                 // in terms of API interaction, the payload describes the calculation outcome.
//                 return ResponseEntity.ok(responseDto);
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
//                        responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
//                 logger.error("Controller: Get calculation status failed for '{}' due to license issue. Status: {}", 
//                              scenarioName, responseDto.simoneStatus());
//                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto);
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                  logger.warn("Controller: Get calculation status for '{}': scenario not calculated or file missing. Status: {}", 
//                              scenarioName, responseDto.simoneStatus());
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
//             }
//             else { // Other errors from the API call like bad_par, bad_seq
//                 logger.warn("Controller: Get calculation status for '{}' failed with SIMONE status: {}. Message: {}", 
//                              scenarioName, responseDto.simoneStatus(), responseDto.serviceMessage());
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) { // e.g., API not ready, no network selected
//             logger.warn("Controller: Condition not met for getting calculation status for scenario '{}' - {}", scenarioName, e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/A", e.getMessage()));
//         } catch (IllegalArgumentException e) {
//              logger.warn("Controller: Invalid argument for getting calculation status for scenario '{}' - {}", scenarioName, e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/A", e.getMessage()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: Runtime error getting calculation status for scenario '{}': {}", scenarioName, e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/A", e.getMessage()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error getting calculation status for scenario '{}': {}", scenarioName, e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/A", "An unexpected error occurred."));
//         }
//     }

//     // Add this new method inside the SimoneScenarioController class:

//     /**
//      * Retrieves the calculation status of the *currently open* SIMONE scenario.
//      * @return ResponseEntity containing the calculation status details for the open scenario.
//      */
//     @GetMapping("/current/calculation-status")
//     public ResponseEntity<CurrentScenarioCalculationStatusResponseDto> getCurrentOpenScenarioCalculationStatus() {
//         logger.info("Controller: GET /current/calculation-status received.");
//         try {
//             CurrentScenarioCalculationStatusResponseDto responseDto = 
//                 simoneScenarioService.getCurrentOpenScenarioCalculationStatus();
            
//             // The service method populates all fields in the DTO, including error messages if any.
//             // Determine HTTP status based on the API call status from SIMONE.
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
//                 return ResponseEntity.ok(responseDto);
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
//                        responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
//                 logger.error("Controller: Get current scenario calculation status failed due to license issue. Status: {}", 
//                              responseDto.simoneStatus());
//                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto);
//             } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile || // Scenario not calculated
//                        responseDto.simoneStatus() == SimoneConst.simone_status_noval) {  // Improperly terminated
//                  logger.warn("Controller: Get current scenario calculation status: scenario not calculated or issue with result. Status: {}", 
//                              responseDto.simoneStatus());
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto); // Or OK with details
//             } else { // Other SIMONE errors like bad_seq, bad_par
//                 logger.warn("Controller: Get current scenario calculation status failed with SIMONE status: {}. Message: {}", 
//                              responseDto.simoneStatus(), responseDto.serviceMessage());
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) { // e.g., API not ready, no scenario/network selected
//             logger.warn("Controller: Condition not met for getting current scenario calculation status - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new CurrentScenarioCalculationStatusResponseDto("N/A", -1, "N/A", e.getMessage()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: Runtime error getting current scenario calculation status: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new CurrentScenarioCalculationStatusResponseDto("N/A", -1, "N/A", e.getMessage()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error getting current scenario calculation status: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new CurrentScenarioCalculationStatusResponseDto("N/A", -1, "N/A", "An unexpected error occurred."));
//         }
//     }
//     /**
//      * Retrieves the first calculation message from the last execution of the currently open scenario.
//      * Uses simone_get_first_message().
//      * @return ResponseEntity containing the first calculation message details.
//      */
//     @GetMapping("/current/messages/first")
//     public ResponseEntity<CalculationMessageDto> getFirstCalculationMessage() {
//         logger.info("Controller: GET /current/messages/first received.");
//         try {
//             CalculationMessageDto responseDto = simoneScenarioService.getFirstCalculationMessage();
            
//             // The service method populates simoneStatus and messages within the DTO.
//             // We can return 200 OK even if no message is found (simone_status_not_found),
//             // as the API call itself was successful. The payload indicates the outcome.
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok ||
//                 responseDto.simoneStatus() == SimoneConst.simone_status_not_found) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // For other SIMONE errors during the API call (e.g., bad_seq, no_file if scenario wasn't executed)
//                 logger.warn("Controller: getFirstCalculationMessage resulted in SIMONE status: {}. Message: {}", 
//                              responseDto.simoneStatus(), responseDto.statusMessage());
//                 // Consider mapping specific Simone statuses to HTTP statuses if needed,
//                 // e.g., NOT_FOUND for simone_status_nofile.
//                 // For now, let's return the DTO with an appropriate error status if not OK/NOT_FOUND.
//                 // A 400 or 404 might be suitable depending on the simoneStatus.
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
//                      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) { // e.g., API not ready, no scenario/network selected
//             logger.warn("Controller: Condition not met for getting first calculation message - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: Runtime error getting first calculation message: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error getting first calculation message: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_exception, "An unexpected error occurred."));
//         }
//     } 

//     /**
//      * Retrieves the next calculation message from the last execution of the currently open scenario.
//      * Uses simone_get_next_message(). This should be called after a successful call to
//      * getFirstCalculationMessage or a previous call to getNextCalculationMessage.
//      * @return ResponseEntity containing the next calculation message details.
//      */
//     @GetMapping("/current/messages/next")
//     public ResponseEntity<CalculationMessageDto> getNextCalculationMessage() {
//         logger.info("Controller: GET /current/messages/next received.");
//         try {
//             CalculationMessageDto responseDto = simoneScenarioService.getNextCalculationMessage();
            
//             // The service method populates simoneStatus and messages within the DTO.
//             // Respond with 200 OK if the API call itself was successful, even if no more messages are found
//             // (simone_status_not_found), as the payload will indicate this.
//             if (responseDto.simoneStatus() == SimoneConst.simone_status_ok ||
//                 responseDto.simoneStatus() == SimoneConst.simone_status_not_found) {
//                 return ResponseEntity.ok(responseDto);
//             } else {
//                 // For other SIMONE errors during the API call
//                 logger.warn("Controller: getNextCalculationMessage resulted in SIMONE status: {}. Message: {}", 
//                              responseDto.simoneStatus(), responseDto.statusMessage());
//                 // Consider mapping specific Simone statuses to HTTP statuses if needed.
//                 if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) { // e.g., scenario not executed
//                      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
//                 }
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//             }
//         } catch (IllegalStateException e) { // e.g., API not ready, no scenario/network selected
//             logger.warn("Controller: Condition not met for getting next calculation message - {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
//         } catch (RuntimeException e) { 
//             logger.error("Controller: Runtime error getting next calculation message: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
//         } catch (Exception e) { 
//             logger.error("Controller: Unexpected error getting next calculation message: {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_exception, "An unexpected error occurred."));
//         }
//     }

    
//     @GetMapping("/current/messages/all")
//     public ResponseEntity<List<CalculationMessageDto>> getAllCalculationMessages() {
//         List<CalculationMessageDto> messages = simoneScenarioService.getAllCalculationMessages();
//         return ResponseEntity.ok(messages);
//     }


 
// }


// src/main/java/com/gascade/simone/controller/SimoneScenarioController.java
package com.gascade.simone.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; // For read string request
import org.springframework.web.bind.annotation.RequestMapping; // For read string response
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.CalculationMessageDto;
import com.gascade.simone.dto.CopyScenarioRequestDto;
import com.gascade.simone.dto.CreateScenarioRequestDto;
import com.gascade.simone.dto.CurrentScenarioCalculationStatusResponseDto;
import com.gascade.simone.dto.DeleteScenarioRequestDto;
import com.gascade.simone.dto.ExecuteScenarioRequestDto;
import com.gascade.simone.dto.ExecuteScenarioResponseDto;
import com.gascade.simone.dto.MessageResponseDto;
import com.gascade.simone.dto.OpenScenarioRequestDto;
import com.gascade.simone.dto.ReadDataRequestDto; 
import com.gascade.simone.dto.ReadDataResponseDto;
import com.gascade.simone.dto.ReadDataResponseItemDto;
import com.gascade.simone.dto.ReadStringDataRequestDto;
import com.gascade.simone.dto.ReadStringDataResponseDto;
import com.gascade.simone.dto.ScenarioCalculationStatusResponseDto;
import com.gascade.simone.dto.ScenarioListItemDto;
import com.gascade.simone.dto.ScenarioListResponseDto;
import com.gascade.simone.dto.SetTimeRequestDto;
import com.gascade.simone.dto.TimeResponseDto;
import com.gascade.simone.dto.WriteDataExRequestDto;
import com.gascade.simone.dto.WriteDataExResponseDto;
import com.gascade.simone.dto.WriteDataRequestDto;
import com.gascade.simone.dto.WriteDataResponseDto;
import com.gascade.simone.dto.WriteDataResponseItemDto;
import com.gascade.simone.service.SimoneScenarioService;
import com.gascade.simone.service.SimoneScenarioService.SimoneScenarioException;

import de.liwacom.simone.SimoneConst;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/v1/scenarios")
public class SimoneScenarioController {

    private static final Logger logger = LoggerFactory.getLogger(SimoneScenarioController.class);
    private final SimoneScenarioService simoneScenarioService;

    @Autowired
    public SimoneScenarioController(SimoneScenarioService simoneScenarioService) {
        this.simoneScenarioService = simoneScenarioService;
        logger.info("SimoneScenarioController wurde initialisiert.");
    }

    /**
     * Endpunkt zum Kopieren eines vorhandenen Szenarios (entspricht "Speichern unter").
     *
     * @param request DTO mit Quell- und Zielnamen des Szenarios.
     * @return {@link ResponseEntity} mit Erfolgsmeldung oder Fehler.
     */
    @PostMapping("/copy")
    public ResponseEntity<MessageResponseDto> copyScenario(@Valid @RequestBody CopyScenarioRequestDto request) {
        logger.info("Controller: POST /scenarios/copy aufgerufen, um '{}' nach '{}' zu kopieren.",
                request.sourceScenarioName(), request.newScenarioName());
        try {
            String message = simoneScenarioService.copyScenario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponseDto(message));
        } catch (SimoneScenarioException e) {
            logger.error("Controller-Fehler: Szenario konnte nicht kopiert werden. Grund: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto(e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller-Fehler: Unerwarteter Fehler beim Kopieren des Szenarios.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Ein unerwarteter Serverfehler ist aufgetreten. Bitte prüfen Sie die Logs."));
        }
    }

    /**
     * Endpunkt zum Erstellen eines neuen SIMONE-Szenarios.
     *
     * @param request DTO mit den Szenario-Eigenschaften.
     * @return {@link ResponseEntity} mit Statusmeldung.
     */
    @PostMapping("/create")
    public ResponseEntity<MessageResponseDto> createScenario(@Valid @RequestBody CreateScenarioRequestDto request) {
        logger.info("Controller: POST /scenarios/create aufgerufen für Szenario '{}'", request.scenarioName());
        try {
            simoneScenarioService.createScenario(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponseDto("Szenario '" + request.scenarioName() + "' wurde erfolgreich erstellt."));
        } catch (SimoneScenarioException e) {
            logger.error("Controller: Szenario '{}' konnte nicht erstellt werden. Grund: {}", request.scenarioName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Erstellen von Szenario '{}'.", request.scenarioName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Ein unerwarteter Fehler ist aufgetreten. Bitte prüfen Sie die Service-Logs."));
        }
    }

    /**
     * Endpunkt zum Löschen eines bestehenden Szenarios.
     *
     * @param request DTO mit dem Namen des zu löschenden Szenarios.
     * @return {@link ResponseEntity} mit Erfolg oder Fehlermeldung.
     */
    @DeleteMapping("/delete")
    public ResponseEntity<MessageResponseDto> deleteScenario(@Valid @RequestBody DeleteScenarioRequestDto request) {
        logger.info("Controller: DELETE /scenarios/delete aufgerufen für Szenario '{}'", request.getScenarioName());
        try {
            simoneScenarioService.deleteScenario(request);
            return ResponseEntity.ok(new MessageResponseDto("Szenario '" + request.getScenarioName() + "' wurde erfolgreich gelöscht."));
        } catch (SimoneScenarioException e) {
            logger.error("Controller-Fehler: Löschen von Szenario '{}' fehlgeschlagen. Grund: {}", request.getScenarioName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto("Fehler beim Löschen des Szenarios: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller-Fehler: Unerwarteter Fehler beim Löschen von Szenario '{}'.", request.getScenarioName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Ein unerwarteter Serverfehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Auflisten aller Szenarien im aktuell ausgewählten Netzwerk.
     *
     * @return {@link ScenarioListResponseDto} mit Szenarien oder Fehlermeldung.
     */
    @GetMapping
    public ResponseEntity<ScenarioListResponseDto> listScenarios() {
        logger.info("Controller: GET /scenarios empfangen.");
        try {
            List<ScenarioListItemDto> scenarios = simoneScenarioService.listScenariosWithDetails();
            return ResponseEntity.ok(new ScenarioListResponseDto("Szenarien erfolgreich geladen.", scenarios));
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung zum Auflisten der Szenarien nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ScenarioListResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API-Fehler beim Laden der Szenarien – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ScenarioListResponseDto("Fehler beim Laden der Szenarien: " + e.getMessage(), Collections.emptyList()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Laden der Szenarien – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ScenarioListResponseDto("Ein unerwarteter Fehler ist beim Laden der Szenarien aufgetreten.", Collections.emptyList()));
        }
    }

    /**
     * Endpunkt zum Öffnen eines bestimmten Szenarios in einem Netzwerk und Modus.
     *
     * @param requestDto DTO mit Szenarioname, Netzwerkname und Öffnungsmodus.
     * @return {@link MessageResponseDto} mit Ergebnis.
     */
    @PostMapping("/open")
    public ResponseEntity<MessageResponseDto> openScenario(@Valid @RequestBody OpenScenarioRequestDto requestDto) {
        logger.info("Controller: POST /open empfangen für Szenario '{}', Netzwerk '{}', Modus {}",
                requestDto.scenarioName(), requestDto.networkName(), requestDto.mode());
        try {
            String message = simoneScenarioService.openScenario(requestDto);
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler beim Öffnen von Szenario '{}': {}", requestDto.scenarioName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    /**
     * Endpunkt zum Schließen des aktuell geöffneten Szenarios.
     *
     * @return {@link MessageResponseDto} mit Erfolg oder Fehler.
     */
    @PostMapping("/close")
    public ResponseEntity<MessageResponseDto> closeScenario() {
        logger.info("Controller: POST /close empfangen.");
        try {
            String message = simoneScenarioService.closeScenario();
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (Exception e) {
            logger.error("Controller: Fehler beim Schließen des Szenarios: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    /**
     * Endpunkt zur Abfrage des Namens und Modus des aktuell geöffneten Szenarios.
     *
     * @return {@link ResponseEntity} mit Name und Modus oder leerem Status.
     */
    @GetMapping("/current/status")
    public ResponseEntity<Map<String, Object>> getCurrentScenarioStatus() {
        logger.info("Controller: GET /current/status empfangen.");
        String openScenario = simoneScenarioService.getOpenScenarioName();
        int mode = simoneScenarioService.getOpenScenarioMode();
        String modeStr = "UNBEKANNT";

        if (openScenario != null) {
            switch (mode) {
                case SimoneConst.SIMONE_MODE_READ -> modeStr = "LESEN";
                case SimoneConst.SIMONE_MODE_WRITE -> modeStr = "SCHREIBEN";
                case SimoneConst.SIMONE_MODE_CREATE -> modeStr = "NEU";
            }
        }

        return ResponseEntity.ok(Map.of(
                "openScenarioName", openScenario == null ? "Kein Szenario geöffnet" : openScenario,
                "openScenarioMode", openScenario == null ? "N/A" : modeStr
        ));
    }

    /**
     * Endpunkt zum Setzen des aktuellen Zeitpunkts (rtime) für Datenzugriffe.
     *
     * @param requestDto DTO mit dem gewünschten rtime-Wert.
     * @return {@link MessageResponseDto} mit Bestätigung oder Fehler.
     */
    @PostMapping("/current/rtime/set")
    public ResponseEntity<MessageResponseDto> setRetrievalTime(@RequestBody SetTimeRequestDto requestDto) {
        logger.info("Controller: POST /current/rtime/set empfangen. Angeforderter Zeitwert: {}", requestDto.timeValue());
        try {
            String message = simoneScenarioService.setRetrievalTime(requestDto.timeValue());
            return ResponseEntity.ok(new MessageResponseDto(message));
        } catch (IllegalStateException e) {
            logger.warn("Controller: Setzen der Abrufzeit fehlgeschlagen – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(new MessageResponseDto(e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API-Fehler beim Setzen der Abrufzeit – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Setzen der Abrufzeit – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Ein unerwarteter Fehler ist beim Setzen der Abrufzeit aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Abrufen der aktuellen Retrieval Time des geöffneten Szenarios.
     *
     * @return Eine {@link ResponseEntity} mit der Zeit als Integer und formatiertem String.
     */
    @GetMapping("/current/rtime/get")
    public ResponseEntity<TimeResponseDto> getRetrievalTime() {
        logger.info("Controller: GET /current/rtime/get empfangen.");
        try {
            Integer timeValue = simoneScenarioService.getRetrievalTimeValue();
            String formattedTime = simoneScenarioService.formatTimeTForResponse(timeValue);
            return ResponseEntity.ok(new TimeResponseDto(timeValue, formattedTime));
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung für das Abrufen der Retrieval Time nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new TimeResponseDto(null, e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Fehler beim Abrufen der Retrieval Time: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TimeResponseDto(null, e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Abrufen der Retrieval Time: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TimeResponseDto(null, "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Vorwärtsschalten auf die nächste Retrieval Time.
     *
     * @return Eine {@link ResponseEntity} mit der neuen Zeit und formatiertem Text.
     */
    @PostMapping("/current/rtime/next")
    public ResponseEntity<TimeResponseDto> advanceToNextRetrievalTime() {
        logger.info("Controller: POST /current/rtime/next empfangen.");
        try {
            Integer nextTimeValue = simoneScenarioService.advanceToNextRetrievalTime();
            String formattedTime = simoneScenarioService.formatTimeTForResponse(nextTimeValue);
            return ResponseEntity.ok(new TimeResponseDto(nextTimeValue, formattedTime));
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung zum Vorwärtsschalten der Retrieval Time nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new TimeResponseDto(null, e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Fehler beim Vorwärtsschalten der Retrieval Time: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TimeResponseDto(null, e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Vorwärtsschalten der Retrieval Time: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TimeResponseDto(null, "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Auslesen von Float-Daten mehrerer Variablen für die aktuelle Retrieval Time.
     *
     * @param requestDto Enthält eine Liste von Variablen (objId/extId), die gelesen werden sollen.
     * @return {@link ResponseEntity} mit einem Ergebnisstatus und pro Variable einem Ergebnisobjekt.
     */
    @PostMapping("/current/read-float-array")
    public ResponseEntity<ReadDataResponseDto> readFloatDataArray(@RequestBody ReadDataRequestDto requestDto) {
        logger.info("Controller: POST /current/read-float-array für {} Variablen empfangen.",
                (requestDto.variables() != null ? requestDto.variables().size() : 0));

        if (requestDto.variables() == null || requestDto.variables().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ReadDataResponseDto("Variablenliste darf nicht leer sein.", Collections.emptyList()));
        }

        try {
            List<ReadDataResponseItemDto> results = simoneScenarioService.readFloatDataArray(requestDto.variables());
            long successfulReads = results.stream().filter(item -> item.simoneStatus() == SimoneConst.simone_status_ok).count();

            String message;
            if (successfulReads == results.size()) {
                message = "Alle Daten erfolgreich gelesen.";
            } else if (successfulReads > 0) {
                message = "Einige Daten wurden erfolgreich gelesen; andere enthalten keine Werte oder Fehler.";
            } else {
                message = "Daten konnten für keine der angeforderten Variablen gelesen werden.";
            }

            return ResponseEntity.ok(new ReadDataResponseDto(message, results));

        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung für das Lesen von Float-Daten nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ReadDataResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Fehler beim Lesen der Daten – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReadDataResponseDto("Fehler beim Lesen der Daten: " + e.getMessage(), Collections.emptyList()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Lesen der Float-Daten – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReadDataResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
        }
    }
    /**
     * Endpunkt zum Lesen eines einzelnen String-Wertes einer Variablen zur aktuellen Retrieval Time.
     *
     * @param requestDto Objekt mit objId und extId der Zielvariable.
     * @return {@link ResponseEntity} mit dem gelesenen String-Wert oder Fehlermeldung.
     */
    @PostMapping("/current/read-string-data")
    public ResponseEntity<ReadStringDataResponseDto> readStringData(@RequestBody ReadStringDataRequestDto requestDto) {
        logger.info("Controller: POST /current/read-string-data empfangen für objId: {}, extId: {}",
                requestDto.objId(), requestDto.extId());

        if (requestDto == null) {
            return ResponseEntity.badRequest()
                    .body(new ReadStringDataResponseDto(0, 0, null, -1, "Ungültige Anfrage: keine Daten bereitgestellt."));
        }

        try {
            ReadStringDataResponseDto response = simoneScenarioService.readStringDataSingle(requestDto);

            if (response.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(response);
            } else if (response.simoneStatus() == SimoneConst.simone_status_noval ||
                    response.simoneStatus() == SimoneConst.simone_status_invid) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung nicht erfüllt für String-Datenabruf – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.warn("Controller: Ungültiges Argument für String-Datenabruf – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Fehler beim Abruf von String-Daten – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Lesen von String-Daten – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReadStringDataResponseDto(requestDto.objId(), requestDto.extId(), null, -1, "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zum Schreiben eines Arrays von Float-Werten in das aktuell geöffnete Szenario.
     *
     * @param requestDto Enthält die Variablen und optional den Zeitwert, zu dem geschrieben werden soll.
     * @return {@link ResponseEntity} mit einem zusammenfassenden Status und pro Variable ein Ergebnisobjekt.
     */
    @PostMapping("/current/write-float-array")
    public ResponseEntity<WriteDataResponseDto> writeFloatDataArray(@RequestBody WriteDataRequestDto requestDto) {
        logger.info("Controller: POST /current/write-float-array für {} Variablen empfangen. Angegebene Zeit: {}",
                (requestDto.variables() != null ? requestDto.variables().size() : 0),
                requestDto.timeValue() == null ? "verwende aktuelle" : requestDto.timeValue());

        if (requestDto.variables() == null || requestDto.variables().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new WriteDataResponseDto("Die Liste der zu schreibenden Variablen darf nicht leer sein.", Collections.emptyList()));
        }

        try {
            List<WriteDataResponseItemDto> results = simoneScenarioService.writeFloatDataArray(
                    requestDto.variables(),
                    requestDto.timeValue()
            );

            long successfulWrites = results.stream()
                    .filter(item -> item.simoneStatus() == SimoneConst.simone_status_ok)
                    .count();

            String message;
            if (successfulWrites == results.size()) {
                message = "Alle Daten erfolgreich geschrieben.";
            } else if (successfulWrites > 0) {
                message = "Teilweise erfolgreich geschrieben; einige Variablen schlugen fehl.";
            } else {
                message = "Keine der angeforderten Variablen konnte erfolgreich geschrieben werden.";
            }

            return ResponseEntity.ok(new WriteDataResponseDto(message, results));

        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung zum Schreiben nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new WriteDataResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (IllegalArgumentException e) {
            logger.warn("Controller: Ungültiges Argument beim Schreiben – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new WriteDataResponseDto(e.getMessage(), Collections.emptyList()));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Fehler beim Schreiben von Daten – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new WriteDataResponseDto("Fehler beim Schreiben der Daten: " + e.getMessage(), Collections.emptyList()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Schreiben – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new WriteDataResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
        }
    }

    /**
     * Endpunkt zum Schreiben eines einzelnen Wertes mit erweiterten Optionen (Bedingungen, Kommentar, etc.).
     *
     * @param requestDto Enthält die Zielvariable, den Wert (float oder string), Zeitwert und optionale Parameter.
     * @return {@link ResponseEntity} mit detailliertem SIMONE-Antwortstatus und Nachricht.
     */
    @PostMapping("/current/write-float-ex")
    public ResponseEntity<WriteDataExResponseDto> writeFloatDataEx(@RequestBody WriteDataExRequestDto requestDto) {
        logger.info("Controller: POST /current/write-float-ex empfangen für objId: {}, extId: {}, Wert: {}, Zeit: {}",
                requestDto.objId(), requestDto.extId(), requestDto.value(), requestDto.timeValue());

        if (requestDto == null) {
            return ResponseEntity.badRequest()
                    .body(new WriteDataExResponseDto(0, 0, -1, "Ungültiger Anfragekörper.", "Bad Request."));
        }

        try {
            WriteDataExResponseDto responseDto = simoneScenarioService.writeFloatDataEx(requestDto);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_badpar ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_invid ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_noval ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_locked) {
                logger.warn("Controller: writeFloatDataEx meldet SIMONE Status {} für objId: {}, extId: {} – {}",
                        responseDto.simoneStatus(), requestDto.objId(), requestDto.extId(), responseDto.simoneMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            } else {
                logger.error("Controller: Unerwarteter SIMONE Fehler bei writeFloatDataEx – Status: {}, Nachricht: {}",
                        responseDto.simoneStatus(), responseDto.simoneMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDto);
            }

        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung für writeFloatDataEx nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Vorbedingung fehlgeschlagen."));
        } catch (IllegalArgumentException e) {
            logger.warn("Controller: Ungültiges Argument für writeFloatDataEx – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Bad Request."));
        } catch (RuntimeException e) {
            logger.error("Controller: SIMONE API Laufzeitfehler bei writeFloatDataEx – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, e.getMessage(), "Interner Serverfehler."));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler bei writeFloatDataEx – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new WriteDataExResponseDto(requestDto.objId(), requestDto.extId(), -1, "Ein unerwarteter Fehler ist aufgetreten.", "Unexpected error."));
        }
    }

    /**
     * Endpunkt zur Ausführung des aktuell geöffneten SIMONE-Szenarios.
     * Es können optionale Flags übergeben werden.
     *
     * @param requestDto Optionales DTO mit Ausführungs-Flags.
     * @return {@link ResponseEntity} mit dem Ergebnis der Ausführung.
     */
    @PostMapping("/current/execute-ex")
    public ResponseEntity<ExecuteScenarioResponseDto> executeScenarioExtended(
            @RequestBody(required = false) ExecuteScenarioRequestDto requestDto) {

        Integer flags = (requestDto != null && requestDto.flags() != null)
                ? requestDto.flags() : null;

        logger.info("Controller: POST /current/execute-ex empfangen. Flags: {}",
                flags == null ? "Standard (NO_FLAG)" : flags);

        try {
            ExecuteScenarioResponseDto responseDto = simoneScenarioService.executeScenarioExtended(flags);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                if ("RUNOK".equalsIgnoreCase(responseDto.executionStatusText())) {
                    logger.info("Controller: Szenario erfolgreich ausgeführt (RUNOK).");
                    return ResponseEntity.ok(responseDto);
                } else {
                    logger.warn("Controller: Ausführung war erfolgreich, aber Status-Text ist '{}'", responseDto.executionStatusText());
                    return ResponseEntity.ok(responseDto);
                }
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
                logger.error("Controller: Lizenzproblem bei Szenario-Ausführung. Status: {}", responseDto.simoneStatus());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto);
            } else {
                logger.error("Controller: Szenario-Ausführung fehlgeschlagen – Status: {}, Nachricht: {}",
                        responseDto.simoneStatus(), responseDto.serviceMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung für Szenario-Ausführung nicht erfüllt – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ExecuteScenarioResponseDto(-1, "N/A", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: Laufzeitfehler bei Szenario-Ausführung – {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ExecuteScenarioResponseDto(-1, "N/A", e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler bei Szenario-Ausführung – {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ExecuteScenarioResponseDto(-1, "N/A", "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }
    /**
     * Endpunkt zur Abfrage des Berechnungsstatus eines bestimmten Szenarios
     * über simone_calculation_status_ex.
     *
     * @param scenarioName Name des Szenarios (aus dem Pfad entnommen).
     * @param flags Optionale Flags für den API-Aufruf (als Request-Parameter).
     * @return {@link ResponseEntity} mit den Statusinformationen der Berechnung.
     */
    @GetMapping("/{scenarioName}/calculation-status-ex")
    public ResponseEntity<ScenarioCalculationStatusResponseDto> getScenarioCalculationStatusExtended(
            @PathVariable String scenarioName,
            @RequestParam(required = false) Integer flags) {

        logger.info("Controller: GET /{}/calculation-status-ex empfangen. Flags: {}",
                scenarioName, flags == null ? "Standard (NO_FLAG)" : flags);

        if (scenarioName == null || scenarioName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ScenarioCalculationStatusResponseDto(
                    null, SimoneConst.simone_status_badpar, "N/V", "Szenarioname muss angegeben werden."
            ));
        }

        try {
            ScenarioCalculationStatusResponseDto responseDto =
                    simoneScenarioService.getScenarioCalculationStatusExtended(scenarioName, flags);

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_noval ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_failed) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
                logger.error("Controller: Berechnungsstatus von '{}' konnte wegen Lizenzproblemen nicht abgefragt werden. Status: {}",
                        scenarioName, responseDto.simoneStatus());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                logger.warn("Controller: Szenario '{}' wurde nicht berechnet oder Datei fehlt. Status: {}",
                        scenarioName, responseDto.simoneStatus());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
            } else {
                logger.warn("Controller: Fehler beim Abfragen des Berechnungsstatus von '{}'. SIMONE-Status: {}. Nachricht: {}",
                        scenarioName, responseDto.simoneStatus(), responseDto.serviceMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung nicht erfüllt beim Abfragen des Status für Szenario '{}': {}", scenarioName, e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/V", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.warn("Controller: Ungültiges Argument beim Abfragen des Status für Szenario '{}': {}", scenarioName, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/V", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: Laufzeitfehler beim Abfragen des Status für Szenario '{}': {}", scenarioName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/V", e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Abfragen des Status für Szenario '{}': {}", scenarioName, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ScenarioCalculationStatusResponseDto(scenarioName, -1, "N/V", "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zur Abfrage des Berechnungsstatus des aktuell geöffneten Szenarios.
     *
     * @return {@link ResponseEntity} mit Statusdetails der letzten Berechnung.
     */
    @GetMapping("/current/calculation-status")
    public ResponseEntity<CurrentScenarioCalculationStatusResponseDto> getCurrentOpenScenarioCalculationStatus() {
        logger.info("Controller: GET /current/calculation-status empfangen.");
        try {
            CurrentScenarioCalculationStatusResponseDto responseDto =
                    simoneScenarioService.getCurrentOpenScenarioCalculationStatus();

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok) {
                return ResponseEntity.ok(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nolicense ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_insuff_license) {
                logger.error("Controller: Lizenzfehler beim Abfragen des aktuellen Szenariostatus. Status: {}",
                        responseDto.simoneStatus());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseDto);
            } else if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_noval) {
                logger.warn("Controller: Kein gültiges Berechnungsergebnis für aktuelles Szenario. Status: {}",
                        responseDto.simoneStatus());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
            } else {
                logger.warn("Controller: Fehler beim Abfragen des Status für aktuelles Szenario. SIMONE-Status: {}. Nachricht: {}",
                        responseDto.simoneStatus(), responseDto.serviceMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung nicht erfüllt beim Abfragen des Status für aktuelles Szenario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(new CurrentScenarioCalculationStatusResponseDto("N/V", -1, "N/V", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: Laufzeitfehler beim Abfragen des Status für aktuelles Szenario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CurrentScenarioCalculationStatusResponseDto("N/V", -1, "N/V", e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Abfragen des Status für aktuelles Szenario: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CurrentScenarioCalculationStatusResponseDto("N/V", -1, "N/V", "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zur Abfrage der ersten Berechnungsnachricht des aktuell geöffneten Szenarios.
     *
     * @return {@link ResponseEntity} mit der ersten Nachricht oder einem Fehler.
     */
    @GetMapping("/current/messages/first")
    public ResponseEntity<CalculationMessageDto> getFirstCalculationMessage() {
        logger.info("Controller: GET /current/messages/first empfangen.");
        try {
            CalculationMessageDto responseDto = simoneScenarioService.getFirstCalculationMessage();

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_not_found) {
                return ResponseEntity.ok(responseDto);
            } else {
                logger.warn("Controller: Erste Berechnungsnachricht konnte nicht geladen werden. SIMONE-Status: {}. Nachricht: {}",
                        responseDto.simoneStatus(), responseDto.statusMessage());

                if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung nicht erfüllt beim Laden der ersten Berechnungsnachricht: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: Laufzeitfehler beim Laden der ersten Berechnungsnachricht: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Laden der ersten Berechnungsnachricht: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_exception, "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zur Abfrage der nächsten Berechnungsnachricht (nach Aufruf von getFirstCalculationMessage).
     *
     * @return {@link ResponseEntity} mit der nächsten Nachricht oder einem Fehler.
     */
    @GetMapping("/current/messages/next")
    public ResponseEntity<CalculationMessageDto> getNextCalculationMessage() {
        logger.info("Controller: GET /current/messages/next empfangen.");
        try {
            CalculationMessageDto responseDto = simoneScenarioService.getNextCalculationMessage();

            if (responseDto.simoneStatus() == SimoneConst.simone_status_ok ||
                    responseDto.simoneStatus() == SimoneConst.simone_status_not_found) {
                return ResponseEntity.ok(responseDto);
            } else {
                logger.warn("Controller: Nächste Berechnungsnachricht konnte nicht geladen werden. SIMONE-Status: {}. Nachricht: {}",
                        responseDto.simoneStatus(), responseDto.statusMessage());

                if (responseDto.simoneStatus() == SimoneConst.simone_status_nofile) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDto);
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }
        } catch (IllegalStateException e) {
            logger.warn("Controller: Vorbedingung nicht erfüllt beim Laden der nächsten Berechnungsnachricht: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Controller: Laufzeitfehler beim Laden der nächsten Berechnungsnachricht: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_error, e.getMessage()));
        } catch (Exception e) {
            logger.error("Controller: Unerwarteter Fehler beim Laden der nächsten Berechnungsnachricht: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CalculationMessageDto.noMessage(SimoneConst.simone_status_exception, "Ein unerwarteter Fehler ist aufgetreten."));
        }
    }

    /**
     * Endpunkt zur Rückgabe aller Berechnungsnachrichten des zuletzt ausgeführten Szenarios.
     *
     * @return {@link ResponseEntity} mit Liste der Berechnungsnachrichten.
     */
    @GetMapping("/current/messages/all")
    public ResponseEntity<List<CalculationMessageDto>> getAllCalculationMessages() {
        List<CalculationMessageDto> messages = simoneScenarioService.getAllCalculationMessages();
        return ResponseEntity.ok(messages);
    }
}