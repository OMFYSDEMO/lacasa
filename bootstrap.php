<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Kolkata');
ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
]);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['message' => $message]);
    exit;
}
