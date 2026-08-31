CREATE TABLE research_line (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT pk_research_line PRIMARY KEY (id),
    CONSTRAINT fk_research_line_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    INDEX idx_research_line_research_group (research_group_id),
    INDEX idx_research_line_name (name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE research_line_keyword (
    research_line_id UUID NOT NULL,
    sort_order INT NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    CONSTRAINT pk_research_line_keyword PRIMARY KEY (research_line_id, sort_order),
    CONSTRAINT fk_research_line_keyword_research_line FOREIGN KEY (research_line_id) REFERENCES research_line (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE research_line_knowledge_area (
    research_line_id UUID NOT NULL,
    sort_order INT NOT NULL,
    knowledge_area VARCHAR(500) NOT NULL,
    CONSTRAINT pk_research_line_knowledge_area PRIMARY KEY (research_line_id, sort_order),
    CONSTRAINT fk_research_line_knowledge_area_research_line FOREIGN KEY (research_line_id) REFERENCES research_line (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE research_line_application_sector (
    research_line_id UUID NOT NULL,
    sort_order INT NOT NULL,
    application_sector VARCHAR(255) NOT NULL,
    CONSTRAINT pk_research_line_application_sector PRIMARY KEY (research_line_id, sort_order),
    CONSTRAINT fk_research_line_application_sector_research_line FOREIGN KEY (research_line_id) REFERENCES research_line (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
