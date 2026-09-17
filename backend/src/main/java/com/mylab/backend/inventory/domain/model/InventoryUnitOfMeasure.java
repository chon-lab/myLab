package com.mylab.backend.inventory.domain.model;

public enum InventoryUnitOfMeasure {
    UN(false), CX(false), KIT(false), M(true), KG(true), L(true);

    private final boolean fractional;

    InventoryUnitOfMeasure(boolean fractional) { this.fractional = fractional; }

    public boolean allowsFractional() { return fractional; }
}
