<?php
/**
 * koneksi.php
 * Koneksi MySQLi ke database db_akademik (Laragon default).
 */

$host   = 'localhost';
$user   = 'root';
$pass   = '';           // Password default Laragon (kosong)
$dbname = 'db_akademik';

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]));
}
