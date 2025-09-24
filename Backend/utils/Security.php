<?php

/**
 * Security utility class for handling common security operations
 */
class Security
{
    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken()
    {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Verify CSRF token
     */
    public static function verifyCSRFToken($token)
    {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Sanitize input data
     */
    public static function sanitize($data)
    {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate email address
     */
    public static function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate password strength
     */
    public static function validatePassword($password)
    {
        $errors = [];
        
        if (strlen($password) < MIN_PASSWORD_LENGTH) {
            $errors[] = "Password must be at least " . MIN_PASSWORD_LENGTH . " characters long";
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Password must contain at least one uppercase letter";
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Password must contain at least one lowercase letter";
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Password must contain at least one number";
        }
        
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = "Password must contain at least one special character";
        }
        
        return empty($errors) ? true : $errors;
    }

    /**
     * Hash password
     */
    public static function hashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    /**
     * Generate random token for email verification, password reset, etc.
     */
    public static function generateToken($length = 32)
    {
        return bin2hex(random_bytes($length));
    }

    /**
     * Check if user is logged in
     */
    public static function isLoggedIn()
    {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    /**
     * Get current user ID
     */
    public static function getCurrentUserId()
    {
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Check if current user is admin
     */
    public static function isAdmin()
    {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    }

    /**
     * Require login
     */
    public static function requireLogin()
    {
        if (!self::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
    }

    /**
     * Require admin privileges
     */
    public static function requireAdmin()
    {
        self::requireLogin();
        
        if (!self::isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin privileges required']);
            exit;
        }
    }

    /**
     * Rate limiting
     */
    public static function checkRateLimit($key, $maxAttempts = 5, $timeWindow = 300)
    {
        $rateLimitKey = "rate_limit_$key";
        
        if (!isset($_SESSION[$rateLimitKey])) {
            $_SESSION[$rateLimitKey] = [];
        }
        
        $now = time();
        $attempts = $_SESSION[$rateLimitKey];
        
        // Remove old attempts outside the time window
        $attempts = array_filter($attempts, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        if (count($attempts) >= $maxAttempts) {
            return false;
        }
        
        // Add current attempt
        $attempts[] = $now;
        $_SESSION[$rateLimitKey] = $attempts;
        
        return true;
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent($event, $details = [])
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'user_id' => self::getCurrentUserId(),
            'details' => $details
        ];
        
        // Log to file or database
        error_log(json_encode($logEntry), 3, LOGS_DIR . '/security.log');
    }

    /**
     * Validate file upload
     */
    public static function validateFileUpload($file, $allowedTypes = [], $maxSize = null)
    {
        $errors = [];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = "File upload error: " . $file['error'];
            return $errors;
        }
        
        if (!empty($allowedTypes)) {
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                $errors[] = "File type not allowed. Allowed types: " . implode(', ', $allowedTypes);
            }
        }
        
        if ($maxSize && $file['size'] > $maxSize) {
            $errors[] = "File too large. Maximum size: " . self::formatBytes($maxSize);
        }
        
        return $errors;
    }

    /**
     * Format bytes to human readable format
     */
    public static function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Clean filename for safe storage
     */
    public static function cleanFilename($filename)
    {
        // Remove path information
        $filename = basename($filename);
        
        // Replace spaces with underscores
        $filename = str_replace(' ', '_', $filename);
        
        // Remove any character that is not alphanumeric, underscore, dash, or dot
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        return $filename;
    }

    /**
     * Generate unique filename
     */
    public static function generateUniqueFilename($originalFilename)
    {
        $info = pathinfo($originalFilename);
        $extension = isset($info['extension']) ? '.' . $info['extension'] : '';
        $basename = $info['filename'];
        
        // Clean the basename
        $basename = self::cleanFilename($basename);
        
        // Add timestamp and random string
        $timestamp = time();
        $random = substr(md5(uniqid()), 0, 8);
        
        return "{$basename}_{$timestamp}_{$random}{$extension}";
    }
}
?>