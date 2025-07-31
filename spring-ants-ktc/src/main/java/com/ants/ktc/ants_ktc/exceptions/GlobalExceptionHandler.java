package com.ants.ktc.ants_ktc.exceptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    // @ExceptionHandler(MethodArgumentNotValidException.class)
    // public ResponseEntity<Map<String, List<String>>>
    // handleValidationExceptions(MethodArgumentNotValidException ex) {
    // Map<String, List<String>> errors = new HashMap<>();
    // ex.getBindingResult().getAllErrors().forEach((error) -> {
    // String fieldName = ((FieldError) error).getField();
    // String errorMessage = error.getDefaultMessage();
    // errors.computeIfAbsent(fieldName, k -> new ArrayList<>()).add(errorMessage);
    // });
    // return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    // }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CustomErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> messages = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .toList();

        CustomErrorResponse response = new CustomErrorResponse(messages, "BadRequest", 400);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Other exception handlers can be added here
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, List<String>>> handleGeneralException(Exception ex) {
        Map<String, List<String>> errors = new HashMap<>();
        errors.computeIfAbsent("errors", k -> new ArrayList<>()).add(ex.getMessage());

        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        List<String> messages = List.of(ex.getMessage());
        return ResponseEntity.badRequest().body(
                new CustomErrorResponse(messages, "Bad Request", 400));
    }

    public static class CustomErrorResponse {
        private List<String> message;
        private String error;
        private int statusCode;

        public CustomErrorResponse(List<String> message, String error, int statusCode) {
            this.message = message;
            this.error = error;
            this.statusCode = statusCode;
        }

        public List<String> getMessage() {
            return message;
        }

        public String getError() {
            return error;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }
}
