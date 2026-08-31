CREATE TABLE person (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    social_name VARCHAR(255),
    email VARCHAR(254),
    phone VARCHAR(30),
    cpf VARCHAR(11),
    academic_degree VARCHAR(100),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT pk_person PRIMARY KEY (id),
    CONSTRAINT fk_person_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    INDEX idx_person_research_group (research_group_id),
    INDEX idx_person_name (name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE person_area_of_expertise (
    person_id UUID NOT NULL,
    sort_order INT NOT NULL,
    area_of_expertise VARCHAR(500) NOT NULL,
    CONSTRAINT pk_person_area_of_expertise PRIMARY KEY (person_id, sort_order),
    CONSTRAINT fk_person_area_of_expertise_person FOREIGN KEY (person_id) REFERENCES person (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE person_research_line (
    person_id UUID NOT NULL,
    research_line_id UUID NOT NULL,
    CONSTRAINT pk_person_research_line PRIMARY KEY (person_id, research_line_id),
    CONSTRAINT fk_person_research_line_person FOREIGN KEY (person_id) REFERENCES person (id) ON DELETE CASCADE,
    CONSTRAINT fk_person_research_line_research_line FOREIGN KEY (research_line_id) REFERENCES research_line (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;
