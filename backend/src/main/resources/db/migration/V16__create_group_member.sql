CREATE TABLE group_member (
    id UUID NOT NULL,
    person_id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_group_member PRIMARY KEY (id),
    CONSTRAINT uk_group_member_person_research_group UNIQUE (person_id, research_group_id),
    CONSTRAINT fk_group_member_person FOREIGN KEY (person_id) REFERENCES person (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_member_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id),
    INDEX idx_group_member_group_active (research_group_id, active),
    INDEX idx_group_member_person_active (person_id, active)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE group_member_research_line (
    group_member_id UUID NOT NULL,
    research_line_id UUID NOT NULL,
    CONSTRAINT pk_group_member_research_line PRIMARY KEY (group_member_id, research_line_id),
    CONSTRAINT fk_group_member_research_line_member FOREIGN KEY (group_member_id) REFERENCES group_member (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_member_research_line_line FOREIGN KEY (research_line_id) REFERENCES research_line (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

INSERT INTO group_member (id, person_id, research_group_id, active, created_at, updated_at)
SELECT UUID(), id, research_group_id, TRUE, created_at, updated_at
FROM person
WHERE research_group_id IS NOT NULL;

INSERT INTO group_member_research_line (group_member_id, research_line_id)
SELECT gm.id, prl.research_line_id
FROM person_research_line prl
JOIN group_member gm ON gm.person_id = prl.person_id;

DROP TABLE person_research_line;

ALTER TABLE person
    DROP FOREIGN KEY fk_person_research_group,
    DROP INDEX idx_person_research_group,
    DROP COLUMN research_group_id;
