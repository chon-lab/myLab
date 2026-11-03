ALTER TABLE group_member
    ADD COLUMN status VARCHAR(32);

UPDATE group_member
SET status = CASE WHEN active THEN 'ACTIVE' ELSE 'INACTIVE' END;

ALTER TABLE group_member
    MODIFY COLUMN status VARCHAR(32) NOT NULL;

ALTER TABLE group_member
    ADD INDEX idx_group_member_group_status (research_group_id, status),
    ADD INDEX idx_group_member_person_status (person_id, status);

ALTER TABLE group_member
    DROP INDEX idx_group_member_group_active,
    DROP INDEX idx_group_member_person_active,
    DROP COLUMN active;
