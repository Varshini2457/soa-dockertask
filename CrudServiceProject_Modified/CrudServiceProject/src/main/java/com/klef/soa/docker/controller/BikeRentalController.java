package com.klef.soa.docker.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.klef.soa.docker.dto.BikeRentalRequest;
import com.klef.soa.docker.dto.BikeRentalResponse;
import com.klef.soa.docker.service.BikeRentalService;

@RestController
@RequestMapping("/bikerental")
@CrossOrigin(origins = "*") 
public class BikeRentalController {
    private final BikeRentalService service;

    public BikeRentalController(BikeRentalService service) {
        this.service = service;
    }

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Bike Rental CRUD API is running");
    }

    @PostMapping("/Add")
    public ResponseEntity<BikeRentalResponse> addBikeRental(@Valid @RequestBody BikeRentalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(request));
    }

    @GetMapping("/DisplayAll")
    public ResponseEntity<List<BikeRentalResponse>> displayAll() {
        return ResponseEntity.ok(service.displayAll());
    }

    @GetMapping("/DisplayById/{id}")
    public ResponseEntity<BikeRentalResponse> displayById(@PathVariable Long id) {
        return ResponseEntity.ok(service.displayById(id));
    }

    @PutMapping("/Update/{id}")
    public ResponseEntity<BikeRentalResponse> update(@PathVariable Long id,
            @Valid @RequestBody BikeRentalRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<String> deleteBikeRental(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Bike rental record deleted successfully");
    }
}