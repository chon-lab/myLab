CREATE TABLE inventory_transfer (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    source_laboratory_id UUID NOT NULL,
    destination_laboratory_id UUID NOT NULL,
    transferred_at DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    reversed_at DATETIME(6),
    reversal_reason TEXT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_inventory_transfer PRIMARY KEY (id),
    CONSTRAINT ck_inventory_transfer_distinct_labs CHECK (source_laboratory_id <> destination_laboratory_id),
    CONSTRAINT ck_inventory_transfer_status CHECK (status IN ('CONFIRMED', 'REVERSED')),
    CONSTRAINT fk_inventory_transfer_research_group FOREIGN KEY (research_group_id)
        REFERENCES research_group (id),
    CONSTRAINT fk_inventory_transfer_source_lab FOREIGN KEY (source_laboratory_id)
        REFERENCES laboratory (id),
    CONSTRAINT fk_inventory_transfer_dest_lab FOREIGN KEY (destination_laboratory_id)
        REFERENCES laboratory (id),
    INDEX idx_inventory_transfer_group_source (research_group_id, source_laboratory_id, transferred_at),
    INDEX idx_inventory_transfer_group_dest (research_group_id, destination_laboratory_id, transferred_at),
    INDEX idx_inventory_transfer_status (status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE inventory_transfer_item (
    id UUID NOT NULL,
    inventory_transfer_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    CONSTRAINT pk_inventory_transfer_item PRIMARY KEY (id),
    CONSTRAINT uk_inventory_transfer_item_transfer_item UNIQUE (inventory_transfer_id, inventory_item_id),
    CONSTRAINT ck_inventory_transfer_item_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_inventory_transfer_item_cost_positive CHECK (unit_cost > 0),
    CONSTRAINT fk_inventory_transfer_item_transfer FOREIGN KEY (inventory_transfer_id)
        REFERENCES inventory_transfer (id),
    CONSTRAINT fk_inventory_transfer_item_item FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_item (id),
    INDEX idx_inventory_transfer_item_item (inventory_item_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

