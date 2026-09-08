ALTER TABLE contact
    ADD COLUMN research_group_id UUID NULL AFTER id;

UPDATE contact c
JOIN research_group rg ON rg.contact_id = c.id
SET c.research_group_id = rg.id;

ALTER TABLE contact
    ADD CONSTRAINT fk_contact_research_group
        FOREIGN KEY (research_group_id) REFERENCES research_group (id)
        ON DELETE CASCADE,
    ADD INDEX idx_contact_research_group (research_group_id);

ALTER TABLE research_group
    DROP FOREIGN KEY fk_research_group_contact,
    DROP INDEX uk_research_group_contact_id,
    DROP COLUMN contact_id;
