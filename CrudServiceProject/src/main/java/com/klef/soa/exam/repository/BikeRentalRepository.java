package com.klef.soa.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.exam.entity.BikeRental;

public interface BikeRentalRepository extends JpaRepository<BikeRental, Long>
{

}
