CREATE TABLE role (
    id UUID NOT NULL,
    research_group_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    full_access BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_role PRIMARY KEY (id),
    CONSTRAINT uk_role_group_name UNIQUE (research_group_id, name),
    CONSTRAINT fk_role_research_group FOREIGN KEY (research_group_id) REFERENCES research_group (id) ON DELETE CASCADE,
    INDEX idx_role_research_group (research_group_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE role_permission (
    role_id UUID NOT NULL,
    resource VARCHAR(64) NOT NULL,
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_write BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_role_permission PRIMARY KEY (role_id, resource),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

ALTER TABLE group_member
    ADD COLUMN role_id UUID,
    ADD CONSTRAINT fk_group_member_role FOREIGN KEY (role_id) REFERENCES role (id);

CREATE INDEX idx_group_member_role ON group_member (role_id);

INSERT INTO role (id, research_group_id, name, full_access, created_at, updated_at)
SELECT UUID(), rg.id, 'Admin', TRUE, NOW(6), NOW(6)
FROM research_group rg;

UPDATE group_member gm
JOIN role r ON r.research_group_id = gm.research_group_id AND r.full_access = TRUE
SET gm.role_id = r.id
WHERE gm.role_id IS NULL;
