-- =====================================================
-- DATABASE PERFORMANCE MONITORING QUERIES
-- Use these to check if your indexes are being used
-- =====================================================

-- 1. CHECK USER INDEXES
-- Test phone number lookup (should use idx_user_phone_number)
EXPLAIN SELECT * FROM Users WHERE phone_number = '1234567890';

-- Test email lookup (should use idx_user_email)
EXPLAIN SELECT * FROM Users WHERE email = 'test@example.com';

-- 2. CHECK ORDER INDEXES
-- Test customer orders (should use idx_order_customer_id)
EXPLAIN SELECT * FROM Orders WHERE customer_id = 1;

-- Test order status (should use idx_order_status)
EXPLAIN SELECT * FROM Orders WHERE status = 'pending';

-- Test order date sorting (should use idx_order_created_at)
EXPLAIN SELECT * FROM Orders ORDER BY createdAt DESC LIMIT 10;

-- 3. CHECK PRODUCT INDEXES
-- Test vendor products (should use idx_product_vendor_id)
EXPLAIN SELECT * FROM Products WHERE vendor_id = 1;

-- Test product category (should use idx_product_vendor_category_id)
EXPLAIN SELECT * FROM Products WHERE vendor_category_id = 1;

-- Test active products (should use idx_product_status)
EXPLAIN SELECT * FROM Products WHERE status = 'active';

-- 4. CHECK ORDER ITEM INDEXES
-- Test order items (should use idx_order_item_order_id)
EXPLAIN SELECT * FROM OrderItems WHERE order_id = 1;

-- Test product orders (should use idx_order_item_product_id)
EXPLAIN SELECT * FROM OrderItems WHERE product_id = 1;

-- 5. CHECK VENDOR INDEXES
-- Test vendor info (should use idx_vendor_info_vendor_id)
EXPLAIN SELECT * FROM VendorInfos WHERE vendor_id = 1;

-- Test vendor phone (should use idx_vendor_info_phone_number)
EXPLAIN SELECT * FROM VendorInfos WHERE phone_number = '1234567890';

-- 6. CHECK RIDE INDEXES
-- Test customer rides (should use idx_ride_customer_id)
EXPLAIN SELECT * FROM Rides WHERE customer_id = 1;

-- Test captain rides (should use idx_ride_captain_id)
EXPLAIN SELECT * FROM Rides WHERE captain_id = 1;

-- Test ride status (should use idx_ride_status)
EXPLAIN SELECT * FROM Rides WHERE status = 'pending';

-- =====================================================
-- COMPLEX QUERIES (Test multiple indexes)
-- =====================================================

-- Test customer orders with status (might use composite index)
EXPLAIN SELECT * FROM Orders 
WHERE customer_id = 1 AND status = 'pending';

-- Test vendor products with status (might use composite index)
EXPLAIN SELECT * FROM Products 
WHERE vendor_id = 1 AND status = 'active';

-- Test orders with items (joins)
EXPLAIN SELECT o.*, oi.* 
FROM Orders o 
JOIN OrderItems oi ON o.id = oi.order_id 
WHERE o.customer_id = 1;

-- =====================================================
-- INDEX USAGE STATISTICS
-- =====================================================

-- Show all indexes in your database
SHOW INDEX FROM Users;
SHOW INDEX FROM Orders;
SHOW INDEX FROM Products;
SHOW INDEX FROM OrderItems;
SHOW INDEX FROM VendorInfos;
SHOW INDEX FROM Rides;

-- Show table sizes (to understand data volume)
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = DATABASE()
AND table_name IN ('Users', 'Orders', 'Products', 'OrderItems', 'VendorInfos', 'Rides');

-- =====================================================
-- SLOW QUERY ANALYSIS
-- =====================================================

-- Enable slow query log (run this in MySQL)
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 2;

-- Check slow queries (if enabled)
-- SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- =====================================================
-- INDEX EFFICIENCY CHECK
-- =====================================================

-- Check if indexes are being used (look for 'Using index' in EXPLAIN)
-- If you see 'Using filesort' or 'Using temporary', you might need more indexes

-- Example of what to look for in EXPLAIN output:
-- +----+-------------+-------+------------+-------+---------------+------+---------+------+------+----------+-------+
-- | id | select_type | table | partitions | type  | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
-- +----+-------------+-------+------------+-------+---------------+------+---------+------+------+----------+-------+
-- |  1 | SIMPLE      | Users | NULL       | ref   | idx_phone     | idx_phone | 767 | const |    1 |   100.00 | NULL  |
-- +----+-------------+-------+------------+-------+---------------+------+---------+------+------+----------+-------+

-- Good signs:
-- - 'type' = 'ref', 'eq_ref', 'const' (using index)
-- - 'key' shows the index name
-- - 'rows' is small number
-- - 'Extra' shows 'Using index'

-- Bad signs:
-- - 'type' = 'ALL' (full table scan)
-- - 'key' = NULL (no index used)
-- - 'rows' = very large number
-- - 'Extra' shows 'Using filesort' or 'Using temporary' 