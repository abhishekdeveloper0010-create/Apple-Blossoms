-- MySQL dump 10.13  Distrib 8.4.10, for macos14.8 (x86_64)
--
-- Host: localhost    Database: appleblossom
-- ------------------------------------------------------
-- Server version	8.4.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!50503 SET NAMES utf8mb4 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `addresses` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `full_name` varchar(100) NOT NULL,
    `phone` varchar(20) NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `address_line` varchar(255) NOT NULL,
    `city` varchar(100) NOT NULL,
    `state` varchar(100) NOT NULL,
    `pincode` varchar(10) NOT NULL,
    `country` varchar(100) DEFAULT 'India',
    `is_default` tinyint(1) DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */
;
INSERT INTO
    `addresses`
VALUES (
        1,
        12,
        'yonit',
        '0000000000',
        NULL,
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        1,
        '2026-08-18 04:55:15',
        '2026-08-18 04:55:15'
    ),
    (
        2,
        12,
        'yonit',
        '0000000000',
        NULL,
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        0,
        '2026-08-18 05:07:17',
        '2026-08-18 05:07:17'
    ),
    (
        3,
        12,
        'Abhishek',
        '0000000000',
        NULL,
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        0,
        '2026-08-18 05:13:18',
        '2026-08-18 05:13:18'
    ),
    (
        4,
        12,
        'Abhishek',
        '0000000000',
        'abhishekkumar97831@gmail.com',
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        0,
        '2026-08-18 05:45:40',
        '2026-08-18 05:45:40'
    ),
    (
        5,
        12,
        'yonit',
        '0000000000',
        'yonit@gmail.com',
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        0,
        '2026-08-18 05:59:24',
        '2026-08-18 05:59:24'
    ),
    (
        6,
        12,
        'Abhishek',
        '0000000000',
        'abhishekkumar97831@gmail.com',
        'Rajsthan',
        'Lalghar',
        'ganganager',
        '152128',
        'India',
        0,
        '2026-08-18 06:48:58',
        '2026-08-18 06:48:58'
    ),
    (
        7,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        1,
        '2026-08-18 07:24:22',
        '2026-08-18 07:24:22'
    ),
    (
        8,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        0,
        '2026-08-18 09:51:24',
        '2026-08-18 09:51:24'
    ),
    (
        9,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        0,
        '2026-08-18 09:51:52',
        '2026-08-18 09:51:52'
    ),
    (
        10,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        0,
        '2026-08-18 09:54:52',
        '2026-08-18 09:54:52'
    ),
    (
        11,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        0,
        '2026-08-18 10:25:58',
        '2026-08-18 10:25:58'
    ),
    (
        12,
        8,
        'Abhishek',
        '1234567890',
        'abc@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '152128',
        'India',
        0,
        '2026-08-18 10:32:46',
        '2026-08-18 10:32:46'
    ),
    (
        13,
        14,
        'Amit',
        '0000011111',
        'amit@gmail.com',
        'pnjab',
        'Abohar',
        'Punjab',
        '111111',
        'India',
        0,
        '2026-08-22 04:58:45',
        '2026-08-22 04:58:45'
    );
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `categories` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `image` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 13 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */
;
INSERT INTO
    `categories`
VALUES (
        1,
        'Shirts',
        'shirts.png',
        '2026-08-12 09:17:31'
    ),
    (
        2,
        'Dresses',
        'dresses.png',
        '2026-08-12 09:17:31'
    ),
    (
        3,
        'Beauty',
        'beauty.png',
        '2026-08-12 09:17:31'
    ),
    (
        4,
        'Bangles',
        'bangles.png',
        '2026-08-12 09:17:31'
    ),
    (
        5,
        'Shoes',
        'shoes.png',
        '2026-08-12 09:17:31'
    ),
    (
        6,
        'Slippers',
        'slippers.png',
        '2026-08-12 09:17:31'
    ),
    (
        7,
        'Shirts',
        'shirts.png',
        '2026-08-23 04:59:03'
    ),
    (
        8,
        'Dresses',
        'dresses.png',
        '2026-08-23 04:59:03'
    ),
    (
        9,
        'Beauty',
        'beauty.png',
        '2026-08-23 04:59:03'
    ),
    (
        10,
        'Bangles',
        'bangles.png',
        '2026-08-23 04:59:03'
    ),
    (
        11,
        'Shoes',
        'shoes.png',
        '2026-08-23 04:59:03'
    ),
    (
        12,
        'Slippers',
        'slippers.png',
        '2026-08-23 04:59:03'
    );
/*!40000 ALTER TABLE `categories` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `newsletter_subscribers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */
;
INSERT INTO
    `newsletter_subscribers`
VALUES (
        2,
        'abhishekkumar97831@gmail.com',
        '2026-08-15 12:18:35'
    ),
    (
        3,
        'rahualsgn2022@gmail.com',
        '2026-08-15 12:21:04'
    ),
    (
        4,
        'singhkaramsar@gmail.com',
        '2026-08-16 03:33:54'
    );
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `order_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_id` int NOT NULL,
    `product_name` varchar(255) NOT NULL,
    `product_image` varchar(500) DEFAULT NULL,
    `price` decimal(10, 2) NOT NULL,
    `quantity` int DEFAULT '1',
    `size` varchar(50) DEFAULT NULL,
    `color` varchar(50) DEFAULT NULL,
    `status` varchar(50) DEFAULT 'Order Placed',
    `rma_requested` tinyint(1) DEFAULT '0',
    `rma_reason` text,
    `rma_status` varchar(50) DEFAULT NULL,
    `rma_requested_at` datetime DEFAULT NULL,
    `return_pickup_date` datetime DEFAULT NULL,
    `returned_at` datetime DEFAULT NULL,
    `refund_amount` decimal(10, 2) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `order_id` (`order_id`),
    CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */
;
INSERT INTO
    `order_items`
VALUES (
        1,
        1,
        19,
        'Golden Bangles',
        'bangles-1.png',
        599.00,
        1,
        '2-2',
        NULL,
        'Cancelled',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-18 10:32:46'
    ),
    (
        2,
        2,
        22,
        'Party Wear Shoes',
        'shoes-2.png',
        1799.00,
        1,
        '6',
        NULL,
        'Cancelled',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-20 07:48:03'
    ),
    (
        3,
        3,
        21,
        'Women Casual Shoes',
        'shoes-1.png',
        1299.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-20 07:54:31'
    ),
    (
        4,
        4,
        24,
        'Fashion Slippers',
        'slippers-2.png',
        699.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-20 11:48:49'
    ),
    (
        5,
        5,
        23,
        'Comfortable Slippers',
        'slippers-1.png',
        499.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-21 09:41:52'
    ),
    (
        6,
        6,
        23,
        'Comfortable Slippers',
        'slippers-1.png',
        499.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-22 04:58:45'
    ),
    (
        7,
        7,
        23,
        'Comfortable Slippers',
        'slippers-1.png',
        499.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-22 05:09:32'
    ),
    (
        8,
        8,
        22,
        'Party Wear Shoes',
        'shoes-2.png',
        1799.00,
        1,
        '6',
        NULL,
        'Order Placed',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-22 05:15:36'
    );
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `order_status_history` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `status` varchar(50) NOT NULL,
    `message` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `order_id` (`order_id`),
    CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 11 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */
;
INSERT INTO
    `order_status_history`
VALUES (
        1,
        1,
        'Order Placed',
        'Your order has been placed successfully.',
        '2026-08-18 10:32:46'
    ),
    (
        2,
        1,
        'Cancelled',
        'Order cancelled by customer. Reason: chang my mind',
        '2026-08-18 11:59:41'
    ),
    (
        3,
        2,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-20 07:48:03'
    ),
    (
        4,
        2,
        'Cancelled',
        'Order cancelled by customer. Reason: product in not a good',
        '2026-08-20 07:49:00'
    ),
    (
        5,
        3,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-20 07:54:31'
    ),
    (
        6,
        4,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-20 11:48:49'
    ),
    (
        7,
        5,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-21 09:41:52'
    ),
    (
        8,
        6,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-22 04:58:45'
    ),
    (
        9,
        7,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-22 05:09:32'
    ),
    (
        10,
        8,
        'Order Placed',
        'Your order has been successfully placed.',
        '2026-08-22 05:15:36'
    );
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `orders` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_number` varchar(50) NOT NULL,
    `user_id` int NOT NULL,
    `status` varchar(50) DEFAULT 'Order Placed',
    `expected_delivery_date` date DEFAULT NULL,
    `subtotal` decimal(10, 2) DEFAULT '0.00',
    `shipping_charge` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `delivery_charge` decimal(10, 2) DEFAULT '0.00',
    `total_amount` decimal(10, 2) DEFAULT '0.00',
    `payment_method` varchar(50) DEFAULT NULL,
    `payment_status` varchar(30) DEFAULT 'pending',
    `razorpay_order_id` varchar(100) DEFAULT NULL,
    `razorpay_payment_id` varchar(100) DEFAULT NULL,
    `address_id` int DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `cancellation_reason` text,
    `cancelled_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `order_number` (`order_number`),
    KEY `user_id` (`user_id`),
    KEY `fk_orders_address` (`address_id`),
    CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */
;
INSERT INTO
    `orders`
VALUES (
        1,
        'AB-1787049166143-63',
        8,
        'Cancelled',
        NULL,
        599.00,
        0.00,
        50.00,
        649.00,
        'COD',
        'pending',
        NULL,
        NULL,
        12,
        '2026-08-18 10:32:46',
        '2026-08-18 11:59:41',
        'chang my mind',
        '2026-08-18 17:29:41'
    ),
    (
        2,
        'AB-1787212083696-8451',
        5,
        'Cancelled',
        NULL,
        1799.00,
        0.00,
        50.00,
        1849.00,
        'Cash on Delivery',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-20 07:48:03',
        '2026-08-20 07:49:00',
        'product in not a good',
        '2026-08-20 13:19:00'
    ),
    (
        3,
        'AB-1787212471388-7141',
        5,
        'Order Placed',
        NULL,
        1299.00,
        0.00,
        50.00,
        1349.00,
        'Credit / Debit Card',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-20 07:54:31',
        '2026-08-20 07:54:31',
        NULL,
        NULL
    ),
    (
        4,
        'AB-1787226529818-1673',
        13,
        'Order Placed',
        '2026-08-28',
        699.00,
        0.00,
        50.00,
        749.00,
        'Cash on Delivery',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-20 11:48:49',
        '2026-08-20 11:48:49',
        NULL,
        NULL
    ),
    (
        5,
        'AB-1787305312688-1634',
        8,
        'Order Placed',
        '2026-08-29',
        499.00,
        0.00,
        50.00,
        549.00,
        'Cash on Delivery',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-21 09:41:52',
        '2026-08-21 09:41:52',
        NULL,
        NULL
    ),
    (
        6,
        'AB-1787374725368-7841',
        14,
        'Order Placed',
        '2026-08-30',
        499.00,
        0.00,
        0.00,
        499.00,
        'cod',
        'pending',
        NULL,
        NULL,
        13,
        '2026-08-22 04:58:45',
        '2026-08-22 04:58:45',
        NULL,
        NULL
    ),
    (
        7,
        'AB-1787375372539-4849',
        14,
        'Order Placed',
        '2026-08-30',
        499.00,
        0.00,
        50.00,
        549.00,
        'Cash on Delivery',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-22 05:09:32',
        '2026-08-22 05:09:32',
        NULL,
        NULL
    ),
    (
        8,
        'AB-1787375736726-7801',
        14,
        'Order Placed',
        '2026-08-30',
        1799.00,
        0.00,
        50.00,
        1849.00,
        'UPI',
        'pending',
        NULL,
        NULL,
        NULL,
        '2026-08-22 05:15:36',
        '2026-08-22 05:15:36',
        NULL,
        NULL
    );
/*!40000 ALTER TABLE `orders` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `payments` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `razorpay_order_id` varchar(100) NOT NULL,
    `razorpay_payment_id` varchar(100) DEFAULT NULL,
    `razorpay_signature` varchar(255) DEFAULT NULL,
    `amount` decimal(10, 2) NOT NULL,
    `currency` varchar(10) DEFAULT 'INR',
    `method` varchar(50) DEFAULT 'upi',
    `status` varchar(30) DEFAULT 'created',
    `error_code` varchar(100) DEFAULT NULL,
    `error_description` text,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_razorpay_order` (`razorpay_order_id`),
    UNIQUE KEY `unique_razorpay_payment` (`razorpay_payment_id`),
    KEY `order_id` (`order_id`),
    CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */
;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `description` text,
    `price` decimal(10, 2) NOT NULL,
    `shipping_charge` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `delivery_charge` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `shipping_free` tinyint(1) NOT NULL DEFAULT '0',
    `delivery_free` tinyint(1) NOT NULL DEFAULT '0',
    `image` varchar(255) DEFAULT NULL,
    `category` varchar(50) NOT NULL,
    `stock` int DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `category_id` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 13 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */
;
INSERT INTO
    `products`
VALUES (
        1,
        'Classic Cotton Shirt',
        'Comfortable cotton shirt for everyday wear',
        999.00,
        0.00,
        0.00,
        0,
        0,
        'shirts-1.png',
        'Shirts',
        50,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        2,
        'Premium Women Shirt',
        'Stylish premium shirt for women',
        1299.00,
        0.00,
        0.00,
        0,
        0,
        'shirts-2.png',
        'Shirts',
        35,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        3,
        'Floral Summer Dress',
        'Beautiful floral dress perfect for summer',
        1499.00,
        0.00,
        0.00,
        0,
        0,
        'dress-1.png',
        'Dresses',
        30,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        4,
        'Party Wear Dress',
        'Elegant party wear dress',
        1999.00,
        0.00,
        0.00,
        0,
        0,
        'dress-2.png',
        'Dresses',
        20,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        5,
        'Beauty Makeup Kit',
        'Complete makeup kit for daily use',
        799.00,
        0.00,
        0.00,
        0,
        0,
        'beauty-1.png',
        'Beauty',
        40,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        6,
        'Premium Beauty Kit',
        'Premium beauty products collection',
        1499.00,
        0.00,
        0.00,
        0,
        0,
        'beauty-2.png',
        'Beauty',
        25,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        7,
        'Golden Bangles',
        'Beautiful traditional golden bangles',
        599.00,
        0.00,
        0.00,
        0,
        0,
        'bangles-1.png',
        'Bangles',
        50,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        8,
        'Designer Bangles Set',
        'Designer bangles set for special occasions',
        899.00,
        0.00,
        0.00,
        0,
        0,
        'bangles-2.png',
        'Bangles',
        30,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        9,
        'Women Casual Shoes',
        'Comfortable casual shoes for women',
        1299.00,
        0.00,
        0.00,
        0,
        0,
        'shoes-1.png',
        'Shoes',
        25,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        10,
        'Party Wear Shoes',
        'Stylish shoes for parties and events',
        1799.00,
        0.00,
        0.00,
        0,
        0,
        'shoes-2.png',
        'Shoes',
        20,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        11,
        'Comfortable Slippers',
        'Soft and comfortable slippers',
        499.00,
        0.00,
        0.00,
        0,
        0,
        'slippers-1.png',
        'Slippers',
        60,
        '2026-08-23 04:58:51',
        NULL
    ),
    (
        12,
        'Fashion Slippers',
        'Trendy slippers for everyday use',
        699.00,
        0.00,
        0.00,
        0,
        0,
        'slippers-2.png',
        'Slippers',
        40,
        '2026-08-23 04:58:51',
        NULL
    );
/*!40000 ALTER TABLE `products` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `test` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */
;
/*!40000 ALTER TABLE `test` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password` varchar(255) NOT NULL,
    `role` enum('user', 'admin') DEFAULT 'user',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `reset_password_token` varchar(255) DEFAULT NULL,
    `reset_password_expires` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 15 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */
;
INSERT INTO
    `users`
VALUES (
        1,
        'Abhishek',
        'abhishek123@gmail.com',
        '$2a$10$w/UmYq/domo4fw9gB7DK9uQ4/1JFI8iKywCHwgC86KdUeGmpPfoCq',
        'user',
        '2026-08-13 07:37:40',
        NULL,
        NULL
    ),
    (
        2,
        'Rahul sain',
        'rahualsan@gmail.com',
        '$2a$10$ahmndRYlyY00OqSVoU.H6u5EzdvaV6eYxYrTja//167q/Rb9DhluC',
        'user',
        '2026-08-13 07:41:10',
        NULL,
        NULL
    ),
    (
        3,
        'rahul sahani',
        'rahulsgnr2022@gmail.com',
        '$2a$10$QIkyxzCzj7RG.A3pn9L.muVreUStmiz7MTN7R4kqGW3eJwlAqE1GS',
        'user',
        '2026-08-13 07:54:28',
        NULL,
        NULL
    ),
    (
        4,
        'Kuljeet singh',
        'kuljeetsingh@gmail.com',
        '$2a$10$V1xIOCRFkFtof2e.raTupeu.BNV94IOtBhzDBWsOoJNuBjBbRFCJG',
        'user',
        '2026-08-13 08:06:12',
        NULL,
        NULL
    ),
    (
        5,
        'Jayant',
        'jayant@gmail.com',
        '$2a$10$KbZU9URgIv/cGLUUKulZX.uSelsMeZM3QYONZrp8sWrE1ZPbHhw7S',
        'user',
        '2026-08-13 10:57:27',
        NULL,
        NULL
    ),
    (
        7,
        'Abhishek',
        'abhishekkumar97831@gmail.com',
        '$2a$10$92FkXYzwHqVm5YYiRoZSKuSAkRkiG7TydE6cisHPxnQA06Wygp3Ry',
        'user',
        '2026-08-13 11:17:25',
        '273f1b3047dc87c369a1ecfbaf21f1fef1808a7a7d2ed8da26a8fc7bdaacbeb6',
        '2026-08-14 12:25:01'
    ),
    (
        8,
        'abc',
        'abc@gmail.com',
        '$2a$10$aihle54RkXc43o7fR4oBwuXrgTy648QH/SAQJxoEqZXBnHUrvFW6K',
        'user',
        '2026-08-14 06:47:11',
        'cee84befcda1101d3e1f3a0e8f7fee5298f376c4b802b3fc35dacbca1b81aaef',
        '2026-08-14 12:32:47'
    ),
    (
        9,
        'Rahul sain',
        'rahulkumar2022@gmail.com',
        '$2a$10$g02Vs9k0N1myRJakKYltZOVEgbjV8ijkcjF8UJS8DEpfmZgQNDR/C',
        'user',
        '2026-08-14 06:57:09',
        'dd44ec60b4ae8d367bd12ec38ce6c4ba981218049bad26319b26f7635a344d49',
        '2026-08-14 12:46:04'
    ),
    (
        10,
        'kuljeet singh',
        'kuljeet@gmail.com',
        '$2a$10$lp.pSVM8vsgGZwqzfeAFkuIeeeQp1rfhST6nmIj0I9yURNsN.hbKG',
        'user',
        '2026-08-16 03:18:26',
        '7ed55c9fe199078f730d7be9836f80c45cfee60faae5b47523b79ad5a363dc71',
        '2026-08-16 09:09:25'
    ),
    (
        11,
        'kuljeet singh',
        'singhkaramsar@gmail.com',
        '$2a$10$.hmK5SpcWh3SU2mH5Lr8dOtEgNr0bfKx1.muo0ZPAchx3.6iDyUd.',
        'user',
        '2026-08-16 03:25:53',
        'b8c0bce6196837ab2b18d1629c1f54bc9068e0875d98aefe8e010ce8748ad3fb',
        '2026-08-16 09:38:15'
    ),
    (
        12,
        ' yonit ',
        'yonit@gmail.com',
        '$2a$10$CpKb7F8bNj7VIK6oLmtfAexmVHkQ6jSy86jbcJryCIKaefCf.yjbu',
        'user',
        '2026-08-18 04:47:43',
        NULL,
        NULL
    ),
    (
        13,
        'Vikash',
        'vikash@gmail.com',
        '$2a$10$ZTdVbK4wHTPyMyDss4f9JuZbBzMiB5GJJWMjhXM2Nvn8pDlGXjYK.',
        'user',
        '2026-08-20 11:14:39',
        NULL,
        NULL
    ),
    (
        14,
        'Amit',
        'amit@gmail.com',
        '$2a$10$1dnELZs5QZ7lV9.ueyEqeugQT/wRs/80icfz5.0IAd31.YAQp6x7C',
        'user',
        '2026-08-22 04:57:23',
        NULL,
        NULL
    );
/*!40000 ALTER TABLE `users` ENABLE KEYS */
;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */
;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;

-- Dump completed on 2026-08-23 10:51:09