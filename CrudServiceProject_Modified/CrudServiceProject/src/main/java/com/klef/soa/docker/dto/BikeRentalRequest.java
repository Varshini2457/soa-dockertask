package com.klef.soa.docker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BikeRentalRequest {
    @NotBlank(message = "Bike model is required")
    @Size(max = 100, message = "Bike model must not exceed 100 characters")
    private String bikeModel;

    @NotBlank(message = "Rental date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Rental date must use yyyy-MM-dd format")
    private String rentalDate;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.01", message = "Hourly rate must be greater than 0")
    private Double hourlyRate;

    private boolean available = true;

    public BikeRentalRequest() {}
    public String getBikeModel() { return bikeModel; }
    public void setBikeModel(String bikeModel) { this.bikeModel = bikeModel; }
    public String getRentalDate() { return rentalDate; }
    public void setRentalDate(String rentalDate) { this.rentalDate = rentalDate; }
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
