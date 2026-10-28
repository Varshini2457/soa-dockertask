package com.klef.soa.docker.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klef.soa.docker.dto.BikeRentalRequest;
import com.klef.soa.docker.dto.BikeRentalResponse;
import com.klef.soa.docker.entity.BikeRental;
import com.klef.soa.docker.exception.ResourceNotFoundException;
import com.klef.soa.docker.repository.BikeRentalRepository;

@Service
@Transactional
public class BikeRentalServiceImpl implements BikeRentalService {
    private final BikeRentalRepository repository;

    public BikeRentalServiceImpl(BikeRentalRepository repository) {
        this.repository = repository;
    }

    @Override
    public BikeRentalResponse add(BikeRentalRequest request) {
        BikeRental bike = new BikeRental();
        applyRequest(bike, request);
        return toResponse(repository.save(bike));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BikeRentalResponse> displayAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BikeRentalResponse displayById(Long id) {
        return toResponse(findBike(id));
    }

    @Override
    public BikeRentalResponse update(Long id, BikeRentalRequest request) {
        BikeRental bike = findBike(id);
        applyRequest(bike, request);
        return toResponse(repository.save(bike));
    }

    @Override
    public void delete(Long id) {
        BikeRental bike = findBike(id);
        repository.delete(bike);
    }

    private BikeRental findBike(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Bike rental ID must be a positive number");
        }
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bike rental record not found for ID: " + id));
    }

    private void applyRequest(BikeRental bike, BikeRentalRequest request) {
        bike.setBikeModel(request.getBikeModel().trim());
        bike.setRentalDate(request.getRentalDate());
        bike.setHourlyRate(request.getHourlyRate());
        bike.setAvailable(request.isAvailable());
    }

    private BikeRentalResponse toResponse(BikeRental bike) {
        return new BikeRentalResponse(bike.getId(), bike.getBikeModel(), bike.getRentalDate(),
            bike.getHourlyRate(), bike.isAvailable());
    }
}
