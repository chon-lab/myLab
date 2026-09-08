CREATE TABLE address (
    id UUID NOT NULL,
    street VARCHAR(255),
    number VARCHAR(30),
    complement VARCHAR(255),
    neighborhood VARCHAR(120),
    state VARCHAR(2),
    city VARCHAR(120),
    postal_code VARCHAR(8),
    post_office_box VARCHAR(30),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    CONSTRAINT pk_address PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

CREATE TABLE contact (
    id UUID NOT NULL,
    phone VARCHAR(30),
    fax VARCHAR(30),
    email VARCHAR(254),
    website VARCHAR(2048),
    CONSTRAINT pk_contact PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

ALTER TABLE research_group
    ADD COLUMN address_id UUID NULL AFTER id,
    ADD COLUMN contact_id UUID NULL AFTER address_id;

ALTER TABLE laboratory
    ADD COLUMN address_id UUID NULL AFTER id;

CREATE TEMPORARY TABLE legacy_research_group_address (
    research_group_id UUID NOT NULL,
    address_id UUID NOT NULL,
    street VARCHAR(255),
    number VARCHAR(30),
    complement VARCHAR(255),
    neighborhood VARCHAR(120),
    state VARCHAR(2),
    city VARCHAR(120),
    postal_code VARCHAR(8),
    post_office_box VARCHAR(30),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    PRIMARY KEY (research_group_id)
);

INSERT INTO legacy_research_group_address
SELECT
    id,
    UUID(),
    address_street,
    address_number,
    address_complement,
    address_neighborhood,
    address_state,
    address_city,
    address_postal_code,
    address_post_office_box,
    address_latitude,
    address_longitude
FROM research_group
WHERE address_street IS NOT NULL
   OR address_number IS NOT NULL
   OR address_complement IS NOT NULL
   OR address_neighborhood IS NOT NULL
   OR address_state IS NOT NULL
   OR address_city IS NOT NULL
   OR address_postal_code IS NOT NULL
   OR address_post_office_box IS NOT NULL
   OR address_latitude IS NOT NULL
   OR address_longitude IS NOT NULL;

INSERT INTO address (
    id, street, number, complement, neighborhood, state, city,
    postal_code, post_office_box, latitude, longitude
)
SELECT
    address_id, street, number, complement, neighborhood, state, city,
    postal_code, post_office_box, latitude, longitude
FROM legacy_research_group_address;

UPDATE research_group rg
JOIN legacy_research_group_address legacy ON legacy.research_group_id = rg.id
SET rg.address_id = legacy.address_id;

CREATE TEMPORARY TABLE legacy_laboratory_address (
    laboratory_id UUID NOT NULL,
    address_id UUID NOT NULL,
    street VARCHAR(255),
    number VARCHAR(30),
    city VARCHAR(120),
    postal_code VARCHAR(8),
    PRIMARY KEY (laboratory_id)
);

INSERT INTO legacy_laboratory_address
SELECT id, UUID(), address_street, address_number, address_city, address_postal_code
FROM laboratory
WHERE address_street IS NOT NULL
   OR address_number IS NOT NULL
   OR address_city IS NOT NULL
   OR address_postal_code IS NOT NULL;

INSERT INTO address (id, street, number, city, postal_code)
SELECT address_id, street, number, city, postal_code
FROM legacy_laboratory_address;

UPDATE laboratory l
JOIN legacy_laboratory_address legacy ON legacy.laboratory_id = l.id
SET l.address_id = legacy.address_id;

CREATE TEMPORARY TABLE legacy_research_group_contact (
    research_group_id UUID NOT NULL,
    contact_id UUID NOT NULL,
    phone VARCHAR(30),
    fax VARCHAR(30),
    email VARCHAR(254),
    website VARCHAR(2048),
    PRIMARY KEY (research_group_id)
);

INSERT INTO legacy_research_group_contact
SELECT id, UUID(), contact_phone, contact_fax, contact_email, contact_website
FROM research_group
WHERE contact_phone IS NOT NULL
   OR contact_fax IS NOT NULL
   OR contact_email IS NOT NULL
   OR contact_website IS NOT NULL;

INSERT INTO contact (id, phone, fax, email, website)
SELECT contact_id, phone, fax, email, website
FROM legacy_research_group_contact;

UPDATE research_group rg
JOIN legacy_research_group_contact legacy ON legacy.research_group_id = rg.id
SET rg.contact_id = legacy.contact_id;

DROP TEMPORARY TABLE legacy_research_group_address;
DROP TEMPORARY TABLE legacy_laboratory_address;
DROP TEMPORARY TABLE legacy_research_group_contact;

ALTER TABLE research_group
    ADD CONSTRAINT fk_research_group_address FOREIGN KEY (address_id) REFERENCES address (id),
    ADD CONSTRAINT fk_research_group_contact FOREIGN KEY (contact_id) REFERENCES contact (id),
    ADD UNIQUE INDEX uk_research_group_address_id (address_id),
    ADD UNIQUE INDEX uk_research_group_contact_id (contact_id),
    DROP COLUMN address_city,
    DROP COLUMN address_complement,
    DROP COLUMN address_latitude,
    DROP COLUMN address_longitude,
    DROP COLUMN address_neighborhood,
    DROP COLUMN address_number,
    DROP COLUMN address_post_office_box,
    DROP COLUMN address_postal_code,
    DROP COLUMN address_state,
    DROP COLUMN address_street,
    DROP COLUMN contact_email,
    DROP COLUMN contact_fax,
    DROP COLUMN contact_phone,
    DROP COLUMN contact_website;

ALTER TABLE laboratory
    ADD CONSTRAINT fk_laboratory_address FOREIGN KEY (address_id) REFERENCES address (id),
    ADD UNIQUE INDEX uk_laboratory_address_id (address_id),
    DROP COLUMN address_city,
    DROP COLUMN address_number,
    DROP COLUMN address_postal_code,
    DROP COLUMN address_street;
