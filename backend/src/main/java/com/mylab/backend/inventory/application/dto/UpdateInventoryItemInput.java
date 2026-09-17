package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
public record UpdateInventoryItemInput(String name, String description, BigDecimal referenceUnitValue) { }
