<?php
require_once __DIR__ . '/Database.php';

/**
 * User model for handling user-related database operations
 */
class User
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create a new user
     */
    public function create($userData)
    {
        // Validate required fields
        if (!isset($userData['username']) || !isset($userData['email']) || !isset($userData['password'])) {
            throw new Exception("Missing required fields");
        }

        // Check if username or email already exists
        if ($this->findByUsername($userData['username'])) {
            throw new Exception("Username already exists");
        }

        if ($this->findByEmail($userData['email'])) {
            throw new Exception("Email already exists");
        }

        // Hash password
        $passwordHash = password_hash($userData['password'], PASSWORD_DEFAULT);

        // Generate verification token
        $verificationToken = bin2hex(random_bytes(32));

        $sql = "INSERT INTO users (username, email, password_hash, first_name, last_name, verification_token) 
                VALUES (?, ?, ?, ?, ?, ?)";

        $params = [
            $userData['username'],
            $userData['email'],
            $passwordHash,
            $userData['first_name'] ?? null,
            $userData['last_name'] ?? null,
            $verificationToken
        ];

        try {
            $this->db->beginTransaction();
            
            $this->db->execute($sql, $params);
            $userId = $this->db->lastInsertId();
            
            // Create empty profile for the user
            $this->createProfile($userId);
            
            $this->db->commit();
            
            return $userId;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Find user by ID
     */
    public function findById($id)
    {
        $sql = "SELECT u.*, p.bio, p.website_url, p.location 
                FROM users u 
                LEFT JOIN profiles p ON u.id = p.user_id 
                WHERE u.id = ? AND u.is_active = 1";
        
        return $this->db->fetch($sql, [$id]);
    }

    /**
     * Find user by username
     */
    public function findByUsername($username)
    {
        $sql = "SELECT * FROM users WHERE username = ? AND is_active = 1";
        return $this->db->fetch($sql, [$username]);
    }

    /**
     * Find user by email
     */
    public function findByEmail($email)
    {
        $sql = "SELECT * FROM users WHERE email = ? AND is_active = 1";
        return $this->db->fetch($sql, [$email]);
    }

    /**
     * Check if username exists
     */
    public function usernameExists($username)
    {
        $sql = "SELECT id FROM users WHERE username = ?";
        $result = $this->db->fetch($sql, [$username]);
        return $result !== false;
    }

    /**
     * Verify user login credentials
     */
    public function verifyLogin($login, $password)
    {
        // Try to find user by email first, then by username
        $user = $this->findByEmail($login);
        if (!$user) {
            $user = $this->findByUsername($login);
        }
        
        if ($user && password_verify($password, $user['password_hash'])) {
            if (!$user['email_verified']) {
                throw new Exception("Please verify your email before logging in");
            }
            return $user;
        }
        
        return false;
    }

    /**
     * Update user information
     */
    public function update($id, $userData)
    {
        $allowedFields = ['first_name', 'last_name', 'email'];
        $updateFields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($userData[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $userData[$field];
            }
        }

        if (empty($updateFields)) {
            throw new Exception("No valid fields to update");
        }

        $params[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
        
        return $this->db->execute($sql, $params);
    }

    /**
     * Update user password
     */
    public function updatePassword($id, $newPassword)
    {
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?";
        
        return $this->db->execute($sql, [$passwordHash, $id]);
    }

    /**
     * Verify email with token
     */
    public function verifyEmail($token)
    {
        $sql = "UPDATE users SET email_verified = 1, verification_token = NULL, updated_at = NOW() 
                WHERE verification_token = ?";
        
        $stmt = $this->db->execute($sql, [$token]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Generate password reset token
     */
    public function generateResetToken($email)
    {
        $user = $this->findByEmail($email);
        if (!$user) {
            throw new Exception("Email not found");
        }

        $resetToken = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $sql = "UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = NOW() 
                WHERE email = ?";
        
        $this->db->execute($sql, [$resetToken, $expires, $email]);
        
        return $resetToken;
    }

    /**
     * Reset password with token
     */
    public function resetPassword($token, $newPassword)
    {
        $sql = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()";
        $user = $this->db->fetch($sql, [$token]);

        if (!$user) {
            throw new Exception("Invalid or expired reset token");
        }

        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, 
                updated_at = NOW() WHERE id = ?";
        
        return $this->db->execute($sql, [$passwordHash, $user['id']]);
    }

    /**
     * Create profile for user
     */
    private function createProfile($userId)
    {
        $sql = "INSERT INTO profiles (user_id) VALUES (?)";
        return $this->db->execute($sql, [$userId]);
    }

    /**
     * Update user profile
     */
    public function updateProfile($userId, $profileData)
    {
        $allowedFields = ['bio', 'website_url', 'location', 'date_of_birth'];
        $updateFields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($profileData[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $profileData[$field];
            }
        }

        if (empty($updateFields)) {
            throw new Exception("No valid fields to update");
        }

        $params[] = $userId;
        $sql = "UPDATE profiles SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE user_id = ?";
        
        return $this->db->execute($sql, $params);
    }

    /**
     * Delete user (soft delete)
     */
    public function delete($id)
    {
        $sql = "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Create remember token for user
     */
    public function createRememberToken($userId, $token)
    {
        // First delete any existing remember tokens for this user
        $sql = "DELETE FROM remember_tokens WHERE user_id = ?";
        $this->db->execute($sql, [$userId]);
        
        // Create new remember token
        $hashedToken = password_hash($token, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 days
        
        $sql = "INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
        return $this->db->execute($sql, [$userId, $hashedToken, $expiresAt]);
    }

    /**
     * Verify remember token
     */
    public function verifyRememberToken($token)
    {
        $sql = "SELECT rt.*, u.* FROM remember_tokens rt 
                JOIN users u ON rt.user_id = u.id 
                WHERE rt.expires_at > NOW() AND u.is_active = 1";
        
        $tokens = $this->db->fetchAll($sql);
        
        foreach ($tokens as $tokenData) {
            if (password_verify($token, $tokenData['token'])) {
                return $tokenData;
            }
        }
        
        return false;
    }

    /**
     * Clear remember token for user
     */
    public function clearRememberToken($userId)
    {
        $sql = "DELETE FROM remember_tokens WHERE user_id = ?";
        return $this->db->execute($sql, [$userId]);
    }

    /**
     * Delete remember token
     */
    public function deleteRememberToken($token)
    {
        $sql = "SELECT rt.* FROM remember_tokens rt WHERE rt.expires_at > NOW()";
        $tokens = $this->db->fetchAll($sql);
        
        foreach ($tokens as $tokenData) {
            if (password_verify($token, $tokenData['token'])) {
                $sql = "DELETE FROM remember_tokens WHERE id = ?";
                return $this->db->execute($sql, [$tokenData['id']]);
            }
        }
        
        return false;
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin($userId)
    {
        $sql = "UPDATE users SET updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$userId]);
    }
}
?>