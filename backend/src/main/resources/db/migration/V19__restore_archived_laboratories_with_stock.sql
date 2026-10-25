UPDATE laboratory lab
JOIN (
    SELECT movement_lines.laboratory_id, movement_lines.inventory_item_id
    FROM (
        SELECT movement.destination_laboratory_id AS laboratory_id,
               line.inventory_item_id,
               line.quantity AS quantity_delta
        FROM inventory_movement movement
        JOIN inventory_movement_item line ON line.inventory_movement_id = movement.id
        WHERE movement.status = 'CONFIRMED'
          AND movement.destination_laboratory_id IS NOT NULL
        UNION ALL
        SELECT movement.source_laboratory_id AS laboratory_id,
               line.inventory_item_id,
               -line.quantity AS quantity_delta
        FROM inventory_movement movement
        JOIN inventory_movement_item line ON line.inventory_movement_id = movement.id
        WHERE movement.status = 'CONFIRMED'
          AND movement.source_laboratory_id IS NOT NULL
    ) movement_lines
    GROUP BY movement_lines.laboratory_id, movement_lines.inventory_item_id
    HAVING SUM(movement_lines.quantity_delta) > 0
) stock ON stock.laboratory_id = lab.id
SET lab.deleted_at = NULL,
    lab.updated_at = CURRENT_TIMESTAMP(6)
WHERE lab.deleted_at IS NOT NULL;
