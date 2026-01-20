package com.zayeni.training.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.stereotype.Controller;

// Restrict this handler to standard @Controller classes in the controller package
@ControllerAdvice(basePackages = "com.zayeni.training.controller", annotations = Controller.class)
public class WebExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public String handleRuntimeException(RuntimeException ex, RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        return "redirect:/inscription/index";
    }
}
