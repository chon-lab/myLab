CREATE TABLE inventory_movement (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    reason VARCHAR(30) NOT NULL,
    source_laboratory_id UUID,
    destination_laboratory_id UUID,
    occurred_at DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    reversed_at DATETIME(6),
    reversal_reason TEXT,
    external_source_name VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_inventory_movement PRIMARY KEY (id),
    CONSTRAINT ck_inventory_movement_route CHECK (
        (movement_type = 'ENTRY' AND source_laboratory_id IS NULL AND destination_laboratory_id IS NOT NULL
            AND reason IN ('PURCHASE', 'DONATION', 'FUNDING') AND external_source_name IS NOT NULL)
        OR (movement_type = 'EXIT' AND source_laboratory_id IS NOT NULL AND destination_laboratory_id IS NULL
            AND reason IN ('CONSUMPTION', 'DISPOSAL', 'LOSS'))
        OR (movement_type = 'TRANSFER' AND source_laboratory_id IS NOT NULL AND destination_laboratory_id IS NOT NULL
            AND source_laboratory_id <> destination_laboratory_id AND reason = 'INTERNAL_TRANSFER')),
    CONSTRAINT ck_inventory_movement_status CHECK (status IN ('CONFIRMED', 'REVERSED')),
    CONSTRAINT fk_inventory_movement_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    CONSTRAINT fk_inventory_movement_source FOREIGN KEY (source_laboratory_id) REFERENCES laboratory (id),
    CONSTRAINT fk_inventory_movement_destination FOREIGN KEY (destination_laboratory_id) REFERENCES laboratory (id),
    INDEX idx_inventory_movement_group_date (research_group_id, occurred_at),
    INDEX idx_inventory_movement_source (source_laboratory_id, status),
    INDEX idx_inventory_movement_destination (destination_laboratory_id, status)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE inventory_movement_item (
    id UUID NOT NULL,
    inventory_movement_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    expiration_date DATE,
    CONSTRAINT pk_inventory_movement_item PRIMARY KEY (id),
    CONSTRAINT uk_inventory_movement_item UNIQUE (inventory_movement_id, inventory_item_id),
    CONSTRAINT ck_inventory_movement_item_quantity CHECK (quantity > 0),
    CONSTRAINT ck_inventory_movement_item_cost CHECK (unit_cost > 0),
    CONSTRAINT fk_inventory_movement_item_movement FOREIGN KEY (inventory_movement_id) REFERENCES inventory_movement (id),
    CONSTRAINT fk_inventory_movement_item_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_item (id),
    INDEX idx_inventory_movement_item_item (inventory_item_id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;

INSERT INTO inventory_movement (id, research_group_id, movement_type, reason, destination_laboratory_id,
    occurred_at, notes, status, reversed_at, reversal_reason, external_source_name, created_at)
SELECT id, research_group_id, 'ENTRY', source_type, laboratory_id,
    received_at, notes, status, reversed_at, reversal_reason, source_name, created_at FROM inventory_entry;

INSERT INTO inventory_movement (id, research_group_id, movement_type, reason, source_laboratory_id,
    occurred_at, notes, status, reversed_at, reversal_reason, created_at)
SELECT id, research_group_id, 'EXIT', exit_type, laboratory_id,
    occurred_at, notes, status, reversed_at, reversal_reason, created_at FROM inventory_exit;

INSERT INTO inventory_movement (id, research_group_id, movement_type, reason, source_laboratory_id,
    destination_laboratory_id, occurred_at, notes, status, reversed_at, reversal_reason, created_at)
SELECT id, research_group_id, 'TRANSFER', 'INTERNAL_TRANSFER', source_laboratory_id,
    destination_laboratory_id, transferred_at, notes, status, reversed_at, reversal_reason, created_at FROM inventory_transfer;

INSERT INTO inventory_movement_item (id, inventory_movement_id, inventory_item_id, quantity, unit_cost,
    batch_number, manufacturer, expiration_date)
SELECT id, inventory_entry_id, inventory_item_id, quantity, historical_unit_value,
    batch_number, manufacturer, expiration_date FROM inventory_entry_item;

INSERT INTO inventory_movement_item (id, inventory_movement_id, inventory_item_id, quantity, unit_cost)
SELECT id, inventory_exit_id, inventory_item_id, quantity, unit_cost FROM inventory_exit_item;

INSERT INTO inventory_movement_item (id, inventory_movement_id, inventory_item_id, quantity, unit_cost)
SELECT id, inventory_transfer_id, inventory_item_id, quantity, unit_cost FROM inventory_transfer_item;

DROP TABLE inventory_entry_item;
DROP TABLE inventory_exit_item;
DROP TABLE inventory_transfer_item;
DROP TABLE inventory_entry;
DROP TABLE inventory_exit;
DROP TABLE inventory_transfer;
