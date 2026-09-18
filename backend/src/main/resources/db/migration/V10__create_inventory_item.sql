CREATE TABLE inventory_item (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(20) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    reference_unit_value DECIMAL(15,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT pk_inventory_item PRIMARY KEY (id),
    CONSTRAINT ck_inventory_item_reference_value_positive CHECK (reference_unit_value > 0),
    CONSTRAINT fk_inventory_item_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    INDEX idx_inventory_item_research_group_active (research_group_id, deleted_at),
    INDEX idx_inventory_item_name (research_group_id, name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
