<?php
require_once __DIR__ . '/Security.php';

/**
 * File upload utility class
 */
class FileUpload
{
    private $uploadDir;
    private $allowedTypes;
    private $maxFileSize;
    private $errors = [];

    public function __construct($uploadDir = null, $allowedTypes = null, $maxFileSize = null)
    {
        $this->uploadDir = $uploadDir ?? UPLOADS_DIR;
        $this->allowedTypes = $allowedTypes ?? ALLOWED_IMAGE_TYPES;
        $this->maxFileSize = $maxFileSize ?? MAX_FILE_SIZE;
        
        // Ensure upload directory exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Upload single file
     */
    public function uploadFile($file, $subDir = '')
    {
        $this->errors = [];
        
        // Validate file
        $validationErrors = Security::validateFileUpload($file, $this->allowedTypes, $this->maxFileSize);
        if (!empty($validationErrors)) {
            $this->errors = $validationErrors;
            return false;
        }
        
        $targetDir = $this->uploadDir;
        if (!empty($subDir)) {
            $targetDir .= '/' . trim($subDir, '/');
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
        }
        
        $filename = Security::generateUniqueFilename($file['name']);
        $targetPath = $targetDir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return [
                'filename' => $filename,
                'path' => $targetPath,
                'url' => $this->getFileUrl($filename, $subDir),
                'size' => $file['size'],
                'type' => mime_content_type($targetPath)
            ];
        } else {
            $this->errors[] = "Failed to move uploaded file";
            return false;
        }
    }

    /**
     * Upload multiple files
     */
    public function uploadMultipleFiles($files, $subDir = '')
    {
        $uploadedFiles = [];
        $this->errors = [];
        
        // Handle different file input formats
        if (isset($files['name']) && is_array($files['name'])) {
            // Multiple files from single input
            for ($i = 0; $i < count($files['name']); $i++) {
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
                
                $result = $this->uploadFile($file, $subDir);
                if ($result) {
                    $uploadedFiles[] = $result;
                }
            }
        } else {
            // Multiple files from different inputs
            foreach ($files as $file) {
                $result = $this->uploadFile($file, $subDir);
                if ($result) {
                    $uploadedFiles[] = $result;
                }
            }
        }
        
        return $uploadedFiles;
    }

    /**
     * Upload image with thumbnail generation
     */
    public function uploadImage($file, $subDir = 'images', $generateThumbnail = true, $thumbnailSize = 300)
    {
        $result = $this->uploadFile($file, $subDir);
        
        if ($result && $generateThumbnail) {
            $thumbnailResult = $this->generateThumbnail($result['path'], $thumbnailSize);
            if ($thumbnailResult) {
                $result['thumbnail'] = $thumbnailResult;
            }
        }
        
        return $result;
    }

    /**
     * Generate thumbnail
     */
    private function generateThumbnail($imagePath, $size = 300)
    {
        $imageInfo = getimagesize($imagePath);
        if (!$imageInfo) {
            return false;
        }
        
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];
        
        // Calculate thumbnail dimensions
        if ($width > $height) {
            $newWidth = $size;
            $newHeight = ($height / $width) * $size;
        } else {
            $newHeight = $size;
            $newWidth = ($width / $height) * $size;
        }
        
        // Create image resource
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($imagePath);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($imagePath);
                break;
            case IMAGETYPE_GIF:
                $source = imagecreatefromgif($imagePath);
                break;
            default:
                return false;
        }
        
        // Create thumbnail
        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG and GIF
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);
        }
        
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        
        // Save thumbnail
        $pathInfo = pathinfo($imagePath);
        $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
        
        switch ($type) {
            case IMAGETYPE_JPEG:
                $success = imagejpeg($thumbnail, $thumbnailPath, 85);
                break;
            case IMAGETYPE_PNG:
                $success = imagepng($thumbnail, $thumbnailPath, 6);
                break;
            case IMAGETYPE_GIF:
                $success = imagegif($thumbnail, $thumbnailPath);
                break;
        }
        
        imagedestroy($source);
        imagedestroy($thumbnail);
        
        if ($success) {
            return [
                'path' => $thumbnailPath,
                'url' => $this->getFileUrl('thumb_' . $pathInfo['basename'], dirname($this->getRelativePath($imagePath))),
                'width' => $newWidth,
                'height' => $newHeight
            ];
        }
        
        return false;
    }

    /**
     * Delete file
     */
    public function deleteFile($filename, $subDir = '')
    {
        $filePath = $this->uploadDir;
        if (!empty($subDir)) {
            $filePath .= '/' . trim($subDir, '/');
        }
        $filePath .= '/' . $filename;
        
        if (file_exists($filePath)) {
            // Also delete thumbnail if exists
            $pathInfo = pathinfo($filePath);
            $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
            if (file_exists($thumbnailPath)) {
                unlink($thumbnailPath);
            }
            
            return unlink($filePath);
        }
        
        return false;
    }

    /**
     * Get file URL
     */
    private function getFileUrl($filename, $subDir = '')
    {
        $baseUrl = rtrim(BASE_URL, '/') . '/uploads';
        if (!empty($subDir)) {
            $baseUrl .= '/' . trim($subDir, '/');
        }
        return $baseUrl . '/' . $filename;
    }

    /**
     * Get relative path from uploads directory
     */
    private function getRelativePath($fullPath)
    {
        return str_replace($this->uploadDir . '/', '', $fullPath);
    }

    /**
     * Get upload errors
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Validate image dimensions
     */
    public function validateImageDimensions($file, $minWidth = null, $minHeight = null, $maxWidth = null, $maxHeight = null)
    {
        $imageInfo = getimagesize($file['tmp_name']);
        if (!$imageInfo) {
            return ["Invalid image file"];
        }
        
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $errors = [];
        
        if ($minWidth && $width < $minWidth) {
            $errors[] = "Image width must be at least {$minWidth}px";
        }
        
        if ($minHeight && $height < $minHeight) {
            $errors[] = "Image height must be at least {$minHeight}px";
        }
        
        if ($maxWidth && $width > $maxWidth) {
            $errors[] = "Image width must not exceed {$maxWidth}px";
        }
        
        if ($maxHeight && $height > $maxHeight) {
            $errors[] = "Image height must not exceed {$maxHeight}px";
        }
        
        return $errors;
    }

    /**
     * Get file info
     */
    public function getFileInfo($filename, $subDir = '')
    {
        $filePath = $this->uploadDir;
        if (!empty($subDir)) {
            $filePath .= '/' . trim($subDir, '/');
        }
        $filePath .= '/' . $filename;
        
        if (!file_exists($filePath)) {
            return false;
        }
        
        return [
            'filename' => $filename,
            'path' => $filePath,
            'url' => $this->getFileUrl($filename, $subDir),
            'size' => filesize($filePath),
            'type' => mime_content_type($filePath),
            'modified' => filemtime($filePath)
        ];
    }
}
?>