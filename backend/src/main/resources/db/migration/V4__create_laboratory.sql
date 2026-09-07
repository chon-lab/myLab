CREATE TABLE laboratory (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address_street VARCHAR(255),
    address_number VARCHAR(30),
    address_city VARCHAR(120),
    address_postal_code VARCHAR(8),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT pk_laboratory PRIMARY KEY (id),
    CONSTRAINT fk_laboratory_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    INDEX idx_laboratory_research_group_active (research_group_id, deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
