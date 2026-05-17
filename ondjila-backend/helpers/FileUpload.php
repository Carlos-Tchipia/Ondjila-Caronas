<?php
class FileUpload {
    private static $allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
    ];
    private static $maxSize = 5242880; // 5MB

    public static function upload(array $fileInfo, string $destinationDir): string {
        if ($fileInfo['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Erro no upload do ficheiro.");
        }

        if ($fileInfo['size'] > self::$maxSize) {
            throw new Exception("Ficheiro excede o tamanho máximo de 5MB.");
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $fileInfo['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, self::$allowedMimes)) {
            throw new Exception("Tipo de ficheiro não permitido. Apenas JPG, PNG, WEBP ou PDF.");
        }

        $extension = pathinfo($fileInfo['name'], PATHINFO_EXTENSION);
        $uuid = bin2hex(random_bytes(16)); // Gera um ID único simples
        $newFilename = $uuid . '.' . $extension;
        $targetPath = $destinationDir . '/' . $newFilename;

        if (!is_dir($destinationDir)) {
            mkdir($destinationDir, 0777, true);
        }

        if (!move_uploaded_file($fileInfo['tmp_name'], $targetPath)) {
            throw new Exception("Falha ao guardar o ficheiro.");
        }

        return $newFilename;
    }
}
