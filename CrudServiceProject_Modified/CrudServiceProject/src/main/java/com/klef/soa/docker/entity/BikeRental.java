package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bikerental")
public class BikeRental {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bike_id")
    private Long id;

    @Column(name = "bike_model", nullable = false, length = 100)
    private String bikeModel;

    @Column(name = "rental_date", nullable = false, length = 10)
    private String rentalDate;

    @Column(name = "hourly_rate", nullable = false)
    private Double hourlyRate;

    @Column(name = "availability", nullable = false)
    private boolean available;

    public BikeRental() {}
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
