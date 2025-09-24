<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../utils/Security.php';
require_once '../../utils/FileUpload.php';
require_once '../../../config/app.php';

try {
    // Check if user is logged in
    Security::requireLogin();
    
    // Check if file was uploaded
    if (!isset($_FILES['image'])) {
        throw new Exception('No image file provided');
    }
    
    $file = $_FILES['image'];
    
    // Validate file upload
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    $validationErrors = Security::validateFileUpload($file, $allowedTypes, $maxSize);
    if (!empty($validationErrors)) {
        throw new Exception(implode(', ', $validationErrors));
    }
    
    // Additional image validation
    $fileUpload = new FileUpload();
    $dimensionErrors = $fileUpload->validateImageDimensions($file, 100, 100, 2000, 2000);
    if (!empty($dimensionErrors)) {
        throw new Exception(implode(', ', $dimensionErrors));
    }
    
    // Upload image with thumbnail
    $result = $fileUpload->uploadImage($file, 'posts', true, 300);
    
    if (!$result) {
        $errors = $fileUpload->getErrors();
        throw new Exception('Upload failed: ' . implode(', ', $errors));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Image uploaded successfully',
        'image' => [
            'url' => $result['url'],
            'filename' => $result['filename'],
            'size' => $result['size'],
            'type' => $result['type'],
            'thumbnail' => $result['thumbnail'] ?? null
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>