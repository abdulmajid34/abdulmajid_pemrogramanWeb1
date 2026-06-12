<?php
/**
 * login.php
 * Halaman autentikasi pengguna.
 * Menggunakan password_verify() untuk validasi password yang di-hash.
 */

session_start();
require_once 'koneksi.php';

// Jika sudah login, langsung ke dashboard
if (isset($_SESSION['login']) && $_SESSION['login'] === true) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Username dan password tidak boleh kosong.';
    } else {
        $username_esc = mysqli_real_escape_string($conn, $username);
        $result = $conn->query("SELECT * FROM users WHERE username = '$username_esc' LIMIT 1");

        if ($result && $result->num_rows === 1) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                $_SESSION['login']    = true;
                $_SESSION['username'] = $user['username'];
                $_SESSION['user_id']  = $user['id'];
                header('Location: index.php');
                exit;
            } else {
                $error = 'Username atau password salah.';
            }
        } else {
            $error = 'Username atau password salah.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login – Sistem Akademik</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-dark: #3730a3;
        }

        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 2.5rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.2rem;
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        }

        .login-logo i { font-size: 2rem; color: #fff; }

        h2.login-title {
            text-align: center;
            font-weight: 700;
            color: #1e1b4b;
            margin-bottom: 0.3rem;
        }

        .login-subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 1.8rem;
        }

        .form-label { font-weight: 600; color: #374151; font-size: 0.875rem; }

        .form-control {
            border-radius: 10px;
            border: 2px solid #e5e7eb;
            padding: 0.65rem 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }

        .input-group-text {
            border-radius: 10px 0 0 10px;
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-right: none;
            color: #6b7280;
        }

        .input-group .form-control { border-radius: 0 10px 10px 0; border-left: none; }

        .btn-login {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border: none;
            border-radius: 10px;
            padding: 0.75rem;
            font-weight: 600;
            font-size: 1rem;
            letter-spacing: 0.3px;
            transition: transform 0.15s, box-shadow 0.15s;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
        }

        .btn-login:active { transform: translateY(0); }

        .alert-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
        }

        .footer-text {
            text-align: center;
            color: #9ca3af;
            font-size: 0.8rem;
            margin-top: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-logo">
            <i class="bi bi-mortarboard-fill"></i>
        </div>
        <h2 class="login-title">Sistem Akademik</h2>
        <p class="login-subtitle">Masuk untuk mengelola data akademik</p>

        <?php if ($error): ?>
        <div class="alert-error mb-3">
            <i class="bi bi-exclamation-triangle-fill me-2"></i><?= htmlspecialchars($error) ?>
        </div>
        <?php endif; ?>

        <form method="POST" action="login.php" autocomplete="off">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" class="form-control" id="username" name="username"
                           placeholder="Masukkan username"
                           value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" required autofocus>
                </div>
            </div>
            <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="password" name="password"
                           placeholder="Masukkan password" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-login w-100">
                <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
            </button>
        </form>

        <p class="footer-text">
            <i class="bi bi-shield-lock me-1"></i>
            Demo: <strong>admin</strong> / <strong>admin123</strong>
        </p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
