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

CALL ab_add_column('users', 'phone', '`phone` VARCHAR(20) DEFAULT NULL');
CALL ab_add_column('users', 'phone_verified', '`phone_verified` TINYINT(1) NOT NULL DEFAULT 0');
CALL ab_add_column('orders', 'courier_name', '`courier_name` VARCHAR(100) DEFAULT NULL');
CALL ab_add_column('orders', 'tracking_number', '`tracking_number` VARCHAR(120) DEFAULT NULL');
CALL ab_add_column('orders', 'tracking_url', '`tracking_url` VARCHAR(500) DEFAULT NULL');
CALL ab_add_column('orders', 'shipped_at', '`shipped_at` DATETIME DEFAULT NULL');
CALL ab_add_column('orders', 'delivered_at', '`delivered_at` DATETIME DEFAULT NULL');
CALL ab_add_column('orders', 'refund_amount', '`refund_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL ab_add_column('orders', 'refund_status', '`refund_status` VARCHAR(40) DEFAULT NULL');
CALL ab_add_column('order_items', 'rma_quantity', '`rma_quantity` INT NOT NULL DEFAULT 1');
CALL ab_add_column('order_items', 'rma_admin_note', '`rma_admin_note` TEXT DEFAULT NULL');
CALL ab_add_column('order_items', 'rma_reviewed_at', '`rma_reviewed_at` DATETIME DEFAULT NULL');
CALL ab_add_column('order_items', 'rma_reviewed_by', '`rma_reviewed_by` INT DEFAULT NULL');

CREATE TABLE IF NOT EXISTS `order_returns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `order_item_id` int NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `reason` text NOT NULL,
  `customer_note` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `status` varchar(40) NOT NULL DEFAULT 'Pending',
  `admin_note` text DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `refund_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `refund_method` varchar(40) DEFAULT NULL,
  `refund_status` varchar(40) DEFAULT NULL,
  `refund_reference` varchar(150) DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_returns_order_id` (`order_id`),
  KEY `order_returns_item_id` (`order_item_id`),
  KEY `order_returns_user_id` (`user_id`),
  KEY `order_returns_status` (`status`),
  CONSTRAINT `order_returns_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `refunds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `return_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(40) NOT NULL DEFAULT 'manual',
  `status` varchar(40) NOT NULL DEFAULT 'Pending',
  `reference_id` varchar(150) DEFAULT NULL,
  `razorpay_payment_id` varchar(120) DEFAULT NULL,
  `razorpay_refund_id` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `refunds_order_id` (`order_id`),
  KEY `refunds_return_id` (`return_id`),
  KEY `refunds_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `shipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `provider` varchar(40) NOT NULL DEFAULT 'manual',
  `provider_order_id` varchar(120) DEFAULT NULL,
  `provider_shipment_id` varchar(120) DEFAULT NULL,
  `courier_name` varchar(100) DEFAULT NULL,
  `courier_code` varchar(60) DEFAULT NULL,
  `awb_number` varchar(120) DEFAULT NULL,
  `tracking_url` varchar(500) DEFAULT NULL,
  `status` varchar(40) NOT NULL DEFAULT 'Created',
  `weight_grams` int DEFAULT NULL,
  `shipping_cost` decimal(10,2) DEFAULT NULL,
  `payment_mode` varchar(30) DEFAULT NULL,
  `label_url` varchar(500) DEFAULT NULL,
  `manifest_url` varchar(500) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `last_tracked_at` datetime DEFAULT NULL,
  `provider_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shipments_order_id` (`order_id`),
  KEY `shipments_awb` (`awb_number`),
  KEY `shipments_status` (`status`),
  CONSTRAINT `shipments_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `shipment_tracking_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipment_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `status` varchar(80) DEFAULT NULL,
  `location` varchar(180) DEFAULT NULL,
  `message` varchar(500) DEFAULT NULL,
  `event_time` datetime DEFAULT NULL,
  `raw` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shipment_events_shipment_id` (`shipment_id`),
  CONSTRAINT `shipment_events_shipment_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `return_id` int DEFAULT NULL,
  `channel` varchar(20) NOT NULL,
  `event` varchar(60) NOT NULL,
  `recipient` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `provider` varchar(40) DEFAULT NULL,
  `provider_message_id` varchar(150) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id` (`user_id`),
  KEY `notifications_order_id` (`order_id`),
  KEY `notifications_channel` (`channel`),
  KEY `notifications_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `order_returns` (
  `order_id`,
  `order_item_id`,
  `user_id`,
  `product_id`,
  `product_name`,
  `quantity`,
  `reason`,
  `status`,
  `created_at`
)
SELECT
  oi.`order_id`,
  oi.`id`,
  o.`user_id`,
  oi.`product_id`,
  oi.`product_name`,
  COALESCE(oi.`quantity`, 1),
  COALESCE(oi.`rma_reason`, 'Not specified'),
  'Pending',
  COALESCE(oi.`rma_requested_at`, oi.`created_at`)
FROM `order_items` oi
INNER JOIN `orders` o ON o.`id` = oi.`order_id`
WHERE
  oi.`rma_requested` = 1
  AND NOT EXISTS (
    SELECT 1
    FROM `order_returns` r
    WHERE r.`order_item_id` = oi.`id`
  );

DROP PROCEDURE IF EXISTS ab_add_column;
