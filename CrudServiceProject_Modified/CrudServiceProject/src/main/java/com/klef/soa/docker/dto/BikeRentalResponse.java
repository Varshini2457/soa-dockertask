package com.klef.soa.docker.dto;

public class BikeRentalResponse {
    private Long id;
    private String bikeModel;
    private String rentalDate;
    private Double hourlyRate;
    private boolean available;

    public BikeRentalResponse() {}
    public BikeRentalResponse(Long id, String bikeModel, String rentalDate, Double hourlyRate, boolean available) {
        this.id = id;
        this.bikeModel = bikeModel;
        this.rentalDate = rentalDate;
        this.hourlyRate = hourlyRate;
        this.available = available;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBikeModel() { return bikeModel; }
    public void setBikeModel(String bikeModel) { this.bikeModel = bikeModel; }
    public String getRentalDate() { return rentalDate; }
    public void setRentalDate(String rentalDate) { this.rentalDate = rentalDate; }
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
