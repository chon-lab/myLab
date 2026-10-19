CREATE TABLE inventory_movement_document (
    id UUID NOT NULL,
    inventory_movement_id UUID NOT NULL,
    document_number VARCHAR(100),
    issuer VARCHAR(255),
    document_date DATE,
    file_name VARCHAR(255),
    stored_path VARCHAR(500),
    content_type VARCHAR(150),
    size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    uploaded_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_inventory_movement_document PRIMARY KEY (id),
    CONSTRAINT fk_inventory_movement_document_movement FOREIGN KEY (inventory_movement_id)
        REFERENCES inventory_movement (id) ON DELETE CASCADE,
    CONSTRAINT ck_inventory_movement_document_file CHECK (
        (stored_path IS NULL AND file_name IS NULL AND content_type IS NULL AND size_bytes IS NULL AND checksum_sha256 IS NULL)
        OR (stored_path IS NOT NULL AND file_name IS NOT NULL AND content_type IS NOT NULL
            AND size_bytes > 0 AND checksum_sha256 IS NOT NULL)
    ),
    INDEX idx_inventory_movement_document_movement (inventory_movement_id, uploaded_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
