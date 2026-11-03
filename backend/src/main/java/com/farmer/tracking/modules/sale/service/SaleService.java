package com.farmer.tracking.modules.sale.service;

import com.farmer.tracking.modules.sale.api.MarginResponse;
import com.farmer.tracking.modules.sale.api.SaleRequest;
import com.farmer.tracking.modules.sale.api.SaleResponse;

import java.util.List;

public interface SaleService {

    SaleResponse recordSale(Long farmerId, SaleRequest request);

    List<SaleResponse> getSalesByFarmer(Long farmerId);

    List<SaleResponse> getSalesByCycle(Long farmerId, Long cycleId);

    MarginResponse getMargin(Long farmerId, Long cycleId);

    void deleteSale(Long farmerId, Long saleId);
}
