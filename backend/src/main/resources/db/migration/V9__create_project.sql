CREATE TABLE project (
    id UUID NOT NULL,
    laboratory_id UUID NOT NULL,
    research_line_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective TEXT NOT NULL,
    status ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'SUSPENSO') NOT NULL DEFAULT 'EM_ANDAMENTO',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT pk_project PRIMARY KEY (id),
    CONSTRAINT fk_project_laboratory FOREIGN KEY (laboratory_id) REFERENCES laboratory (id),
    CONSTRAINT fk_project_research_line FOREIGN KEY (research_line_id) REFERENCES research_line (id),
    INDEX idx_project_laboratory_active (laboratory_id, deleted_at),
    INDEX idx_project_research_line_active (research_line_id, deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE project_knowledge_area (
    project_id UUID NOT NULL,
    sort_order INT NOT NULL,
    knowledge_area VARCHAR(500) NOT NULL,
    CONSTRAINT pk_project_knowledge_area PRIMARY KEY (project_id, sort_order),
    CONSTRAINT fk_project_knowledge_area_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE project_document (
    id UUID NOT NULL,
    project_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(150) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_project_document PRIMARY KEY (id),
    CONSTRAINT fk_project_document_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    INDEX idx_project_document_project (project_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
