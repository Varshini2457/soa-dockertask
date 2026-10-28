package com.klef.soa.docker.service;

import java.util.List;
import com.klef.soa.docker.dto.BikeRentalRequest;
import com.klef.soa.docker.dto.BikeRentalResponse;

public interface BikeRentalService {
    BikeRentalResponse add(BikeRentalRequest request);
    List<BikeRentalResponse> displayAll();
    BikeRentalResponse displayById(Long id);
    BikeRentalResponse update(Long id, BikeRentalRequest request);
    void delete(Long id);
}
