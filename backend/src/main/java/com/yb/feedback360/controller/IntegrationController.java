package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import com.yb.feedback360.dto.response.ModuleCompletionResult;
import com.yb.feedback360.facade.ModuleCompletionFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.INTEGRATIONS)
@RequiredArgsConstructor
public class IntegrationController {

    private final ModuleCompletionFacade moduleCompletionFacade;

    @PostMapping(ApiPaths.MODULE_COMPLETED)
    public ResponseEntity<List<ModuleCompletionResult>> moduleCompleted(
            @RequestBody List<ModuleCompletedRequest> requests) {
        return ResponseEntity
                .status(HttpStatus.MULTI_STATUS)
                .body(moduleCompletionFacade.process(requests));
    }
}
