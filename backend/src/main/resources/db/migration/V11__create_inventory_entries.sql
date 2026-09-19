CREATE TABLE inventory_entry (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    laboratory_id UUID NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    received_at DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    reversed_at DATETIME(6),
    reversal_reason TEXT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_inventory_entry PRIMARY KEY (id),
    CONSTRAINT ck_inventory_entry_source CHECK (source_type IN ('PURCHASE', 'DONATION', 'FUNDING')),
    CONSTRAINT ck_inventory_entry_status CHECK (status IN ('CONFIRMED', 'REVERSED')),
    CONSTRAINT fk_inventory_entry_research_group FOREIGN KEY (research_group_id)
        REFERENCES research_group (id),
    CONSTRAINT fk_inventory_entry_laboratory FOREIGN KEY (laboratory_id)
        REFERENCES laboratory (id),
    INDEX idx_inventory_entry_group_laboratory_date (research_group_id, laboratory_id, received_at),
    INDEX idx_inventory_entry_status (status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE inventory_entry_item (
    id UUID NOT NULL,
    inventory_entry_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    historical_unit_value DECIMAL(15,2) NOT NULL,
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    expiration_date DATE,
    CONSTRAINT pk_inventory_entry_item PRIMARY KEY (id),
    CONSTRAINT uk_inventory_entry_item_entry_item UNIQUE (inventory_entry_id, inventory_item_id),
    CONSTRAINT ck_inventory_entry_item_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_inventory_entry_item_value_positive CHECK (historical_unit_value > 0),
    CONSTRAINT fk_inventory_entry_item_entry FOREIGN KEY (inventory_entry_id)
        REFERENCES inventory_entry (id),
    CONSTRAINT fk_inventory_entry_item_item FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_item (id),
    INDEX idx_inventory_entry_item_item (inventory_item_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
