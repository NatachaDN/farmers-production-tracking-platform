package com.farmer.tracking.modules.sale.controller;

import com.farmer.tracking.modules.sale.api.MarginResponse;
import com.farmer.tracking.modules.sale.api.SaleRequest;
import com.farmer.tracking.modules.sale.api.SaleResponse;
import com.farmer.tracking.modules.sale.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for recording and managing harvest sales and cycle margins.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/sales}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/sales")
@Tag(name = "Sales", description = "Record harvest sales and calculate cycle margin (revenue minus expenses)")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @Operation(
            summary = "Record a harvest sale",
            description = "Records a sale (quantity sold, price, buyer, date) linked to a completed cycle. " +
                          "Computes total revenue as quantity sold × price per unit."
    )
    @ApiResponse(responseCode = "201", description = "Sale recorded successfully")
    @ApiResponse(responseCode = "400", description = "Validation error (e.g. non-positive quantity/price)")
    public ResponseEntity<SaleResponse> recordSale(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId,
            @Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.recordSale(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "List all sales for a farmer",
            description = "Returns all production sales for the authenticated farmer, newest first."
    )
    @ApiResponse(responseCode = "200", description = "List of sales returned")
    public ResponseEntity<List<SaleResponse>> getSales(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId) {
        List<SaleResponse> sales = saleService.getSalesByFarmer(farmerId);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/cycles/{cycleId}/sales")
    @Operation(
            summary = "List sales for a cycle",
            description = "Returns all sales recorded for a specific production cycle owned by the farmer."
    )
    @ApiResponse(responseCode = "200", description = "List of cycle sales returned")
    public ResponseEntity<List<SaleResponse>> getSalesByCycle(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID") @PathVariable Long cycleId) {
        List<SaleResponse> sales = saleService.getSalesByCycle(farmerId, cycleId);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/cycles/{cycleId}/margin")
    @Operation(
            summary = "Get cycle margin",
            description = "Calculates the margin for a production cycle: total sales revenue " +
                          "minus associated expenses (input purchases, labor, transport)."
    )
    @ApiResponse(responseCode = "200", description = "Margin calculation returned")
    public ResponseEntity<MarginResponse> getMargin(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID") @PathVariable Long cycleId) {
        MarginResponse margin = saleService.getMargin(farmerId, cycleId);
        return ResponseEntity.ok(margin);
    }

    @DeleteMapping("/{saleId}")
    @Operation(
            summary = "Delete a sale",
            description = "Deletes a production sale belonging to the authenticated farmer."
    )
    @ApiResponse(responseCode = "204", description = "Sale deleted successfully")
    @ApiResponse(responseCode = "404", description = "Sale not found")
    public ResponseEntity<Void> deleteSale(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Sale ID") @PathVariable Long saleId) {
        saleService.deleteSale(farmerId, saleId);
        return ResponseEntity.noContent().build();
    }
}
