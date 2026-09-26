ALTER TABLE inventory_movement
    ADD COLUMN purchase_type VARCHAR(30) NULL AFTER reason;

UPDATE inventory_movement
SET purchase_type = 'OTHER'
WHERE movement_type = 'ENTRY' AND reason = 'PURCHASE';

UPDATE inventory_movement
SET purchase_type = 'FUNDING', reason = 'PURCHASE'
WHERE movement_type = 'ENTRY' AND reason = 'FUNDING';

UPDATE inventory_item
SET item_type = 'PERMANENT'
WHERE item_type = 'DURABLE';

ALTER TABLE inventory_movement
    DROP CONSTRAINT ck_inventory_movement_route,
    ADD CONSTRAINT ck_inventory_movement_route CHECK (
        (movement_type = 'ENTRY' AND source_laboratory_id IS NULL AND destination_laboratory_id IS NOT NULL
            AND reason IN ('PURCHASE', 'DONATION') AND external_source_name IS NOT NULL
            AND ((reason = 'PURCHASE' AND purchase_type IN ('FUNDING', 'OTHER'))
                OR (reason = 'DONATION' AND purchase_type IS NULL)))
        OR (movement_type = 'EXIT' AND source_laboratory_id IS NOT NULL AND destination_laboratory_id IS NULL
            AND reason IN ('CONSUMPTION', 'DISPOSAL', 'LOSS') AND purchase_type IS NULL)
        OR (movement_type = 'TRANSFER' AND source_laboratory_id IS NOT NULL AND destination_laboratory_id IS NOT NULL
            AND source_laboratory_id <> destination_laboratory_id AND reason = 'INTERNAL_TRANSFER'
            AND purchase_type IS NULL));
