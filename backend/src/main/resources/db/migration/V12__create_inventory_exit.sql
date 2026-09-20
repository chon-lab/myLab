CREATE TABLE inventory_exit (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    laboratory_id UUID NOT NULL,
    exit_type VARCHAR(20) NOT NULL,
    occurred_at DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    reversed_at DATETIME(6),
    reversal_reason TEXT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_inventory_exit PRIMARY KEY (id),
    CONSTRAINT ck_inventory_exit_type CHECK (exit_type IN ('CONSUMPTION', 'DISPOSAL', 'LOSS')),
    CONSTRAINT ck_inventory_exit_status CHECK (status IN ('CONFIRMED', 'REVERSED')),
    CONSTRAINT fk_inventory_exit_research_group FOREIGN KEY (research_group_id)
        REFERENCES research_group (id),
    CONSTRAINT fk_inventory_exit_laboratory FOREIGN KEY (laboratory_id)
        REFERENCES laboratory (id),
    INDEX idx_inventory_exit_group_laboratory_date (research_group_id, laboratory_id, occurred_at),
    INDEX idx_inventory_exit_status (status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE inventory_exit_item (
    id UUID NOT NULL,
    inventory_exit_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    CONSTRAINT pk_inventory_exit_item PRIMARY KEY (id),
    CONSTRAINT uk_inventory_exit_item_exit_item UNIQUE (inventory_exit_id, inventory_item_id),
    CONSTRAINT ck_inventory_exit_item_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_inventory_exit_item_cost_positive CHECK (unit_cost > 0),
    CONSTRAINT fk_inventory_exit_item_exit FOREIGN KEY (inventory_exit_id)
        REFERENCES inventory_exit (id),
    CONSTRAINT fk_inventory_exit_item_item FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_item (id),
    INDEX idx_inventory_exit_item_item (inventory_item_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

