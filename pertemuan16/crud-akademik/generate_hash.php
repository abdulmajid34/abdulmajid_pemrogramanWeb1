<?php
/**
 * generate_hash.php
 * Alat bantu untuk membuat hash password baru.
 * Jalankan sekali di browser: http://localhost/crud-akademik/generate_hash.php
 * Hapus file ini setelah digunakan di production!
 */

$passwords = ['admin123', 'password', '123456'];

echo '<h2>Password Hash Generator</h2>';
echo '<table border="1" cellpadding="8">';
echo '<tr><th>Password</th><th>Hash (bcrypt)</th></tr>';

foreach ($passwords as $pw) {
    $hash = password_hash($pw, PASSWORD_BCRYPT);
    echo "<tr><td><code>$pw</code></td><td><code>$hash</code></td></tr>";
}

echo '</table>';
echo '<br><p><strong>Catatan:</strong> Salin hash di atas ke file db_akademik.sql pada baris INSERT users.</p>';
echo '<p style="color:red"><strong>Hapus file ini setelah digunakan!</strong></p>';
