UPDATE laboratory lab
JOIN (
    SELECT movement_lines.laboratory_id
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
) stocked_laboratories ON stocked_laboratories.laboratory_id = lab.id
JOIN (
    SELECT installed_on
    FROM flyway_schema_history
    WHERE version = '19' AND success = TRUE
    ORDER BY installed_rank DESC
    LIMIT 1
) restored_laboratories_migration
SET lab.updated_at = lab.created_at
WHERE lab.deleted_at IS NULL
  AND lab.updated_at > lab.created_at
  AND lab.updated_at BETWEEN DATE_SUB(restored_laboratories_migration.installed_on, INTERVAL 1 MINUTE)
      AND DATE_ADD(restored_laboratories_migration.installed_on, INTERVAL 1 MINUTE);
