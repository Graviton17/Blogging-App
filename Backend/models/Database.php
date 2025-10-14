<?php
/**
 * Database connection and utility class
 */

// Load database configuration if not already loaded
if (!defined('DB_HOST')) {
    require_once __DIR__ . '/../database.php';
}

class Database
{
    private static $instance = null;
    private $pdo;
    private $retryCount = 0;
    private const MAX_RETRIES = 3;

    private function __construct()
    {
        $this->connect();
    }

    /**
     * Establish database connection with retry logic
     */
    private function connect()
    {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];

            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $this->retryCount = 0; // Reset retry count on successful connection
            
        } catch (PDOException $e) {
            // Log the error
            error_log("Database connection error: " . $e->getMessage());
            
            // Provide user-friendly error messages
            $errorCode = $e->getCode();
            $errorMsg = $e->getMessage();
            
            if (strpos($errorMsg, 'Unknown database') !== false) {
                throw new Exception("Database '" . DB_NAME . "' does not exist. Please create the database first.");
            } elseif (strpos($errorMsg, 'Access denied') !== false) {
                throw new Exception("Database access denied. Please check your credentials in config/database.php");
            } elseif (strpos($errorMsg, "Can't connect") !== false || $errorCode == 2002) {
                throw new Exception("Cannot connect to MySQL server. Please ensure XAMPP/MySQL is running.");
            } else {
                throw new Exception("Database connection failed: " . $errorMsg);
            }
        }
    }

    /**
     * Reconnect to database if connection is lost
     */
    private function reconnect()
    {
        if ($this->retryCount < self::MAX_RETRIES) {
            $this->retryCount++;
            error_log("Attempting to reconnect to database (attempt {$this->retryCount})");
            $this->connect();
        } else {
            throw new Exception("Failed to reconnect to database after " . self::MAX_RETRIES . " attempts");
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        // Check if connection is still alive
        try {
            $this->pdo->query('SELECT 1');
        } catch (PDOException $e) {
            // Connection lost, try to reconnect
            $this->reconnect();
        }
        
        return $this->pdo;
    }

    /**
     * Execute a prepared statement with parameters
     */
    public function execute($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            // Check if connection was lost
            if ($e->getCode() == 'HY000' && strpos($e->getMessage(), 'server has gone away') !== false) {
                // Try to reconnect and retry query
                $this->reconnect();
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
                return $stmt;
            }
            
            error_log("Database query error: " . $e->getMessage() . " | Query: " . $sql);
            throw new Exception("Database query failed: " . $e->getMessage());
        }
    }

    /**
     * Get single row from query
     */
    public function fetch($sql, $params = [])
    {
        $stmt = $this->execute($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Get all rows from query
     */
    public function fetchAll($sql, $params = [])
    {
        $stmt = $this->execute($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Get last inserted ID
     */
    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * Begin transaction
     */
    public function beginTransaction()
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit()
    {
        return $this->pdo->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback()
    {
        return $this->pdo->rollback();
    }
}
?>