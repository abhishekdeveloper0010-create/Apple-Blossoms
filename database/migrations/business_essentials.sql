DROP PROCEDURE IF EXISTS ab_add_column;

DELIMITER $$

CREATE PROCEDURE ab_add_column(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_ddl VARCHAR(500)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE
      TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND COLUMN_NAME = p_column
  ) THEN
    SET @ab_sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN ', p_ddl);
    PREPARE ab_stmt FROM @ab_sql;
    EXECUTE ab_stmt;
    DEALLOCATE PREPARE ab_stmt;
  END IF;
END$$

DELIMITER ;

CALL ab_add_column('orders', 'tax_amount', '`tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'tax_rate_percent', '`tax_rate_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'cgst_amount', '`cgst_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'sgst_amount', '`sgst_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'igst_amount', '`igst_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'shipping_pincode', '`shipping_pincode` VARCHAR(10) DEFAULT NULL');
CALL ab_add_column('orders', 'shipping_state', '`shipping_state` VARCHAR(100) DEFAULT NULL');
CALL ab_add_column('orders', 'shipping_zone', '`shipping_zone` VARCHAR(30) DEFAULT NULL');
CALL ab_add_column('orders', 'cod_charge', '`cod_charge` DECIMAL(10,2) NOT NULL DEFAULT 0.00');

DROP PROCEDURE IF EXISTS ab_add_column;
