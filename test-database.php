<?php
/**
 * Database Connection Test
 * Use this script to verify database configuration and connection
 */

// Load configuration
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';

echo "=== Database Connection Test ===\n\n";

// Display configuration
echo "Configuration:\n";
echo "- Host: " . DB_HOST . "\n";
echo "- Database: " . DB_NAME . "\n";
echo "- User: " . DB_USER . "\n";
echo "- Password: " . (empty(DB_PASS) ? "(empty)" : "***") . "\n";
echo "- Charset: " . DB_CHARSET . "\n\n";

// Test connection
try {
    echo "Attempting to connect...\n";
    
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connection successful!\n\n";
    
    // Get server info
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "MySQL Version: $version\n\n";
    
    // Check if tables exist
    echo "Checking tables...\n";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "⚠️  No tables found. You need to import the database schema.\n";
        echo "Run: mysql -u root blog_app < database/blog_app.sql\n\n";
    } else {
        echo "✅ Found " . count($tables) . " tables:\n";
        foreach ($tables as $table) {
            // Count rows in each table
            $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "  - $table ($count rows)\n";
        }
        echo "\n";
    }
    
    // Test Database class
    echo "Testing Database singleton class...\n";
    require_once __DIR__ . '/Backend/models/Database.php';
    
    $db = Database::getInstance();
    $result = $db->fetch("SELECT 1 as test");
    
    if ($result && $result['test'] == 1) {
        echo "✅ Database class working correctly!\n";
    } else {
        echo "❌ Database class test failed\n";
    }
    
    echo "\n=== All tests passed! ===\n";
    
} catch (PDOException $e) {
    echo "❌ Connection failed!\n\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n\n";
    
    // Provide specific guidance
    if (strpos($e->getMessage(), 'Unknown database') !== false) {
        echo "💡 Solution: Create the database first:\n";
        echo "   mysql -u root -e \"CREATE DATABASE blog_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"\n";
        echo "   mysql -u root blog_app < database/blog_app.sql\n";
    } elseif (strpos($e->getMessage(), 'Access denied') !== false) {
        echo "💡 Solution: Check your credentials in config/database.php\n";
        echo "   For XAMPP default, password should be empty\n";
    } elseif (strpos($e->getMessage(), "Can't connect") !== false) {
        echo "💡 Solution: Start MySQL server\n";
        echo "   sudo /opt/lampp/lampp startmysql\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
