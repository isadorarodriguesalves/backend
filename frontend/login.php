<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (isset($_SESSION['user'])) {
    redirect('dashboard.php');
}

$errorMessage = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $emailInput = $_POST['email'] ?? '';
    $passwordInput = $_POST['password'] ?? '';
    $email = is_string($emailInput) ? trim($emailInput) : '';
    $password = is_string($passwordInput) ? $passwordInput : '';
    $submittedToken = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($submittedToken)) {
        http_response_code(400);
        $errorMessage = 'A sessão expirou. Atualize a página e tente novamente.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        $errorMessage = 'Informe um email válido e sua senha.';
    } else {
        try {
            $response = api_request('POST', '/usuario/login', [
                'email' => $email,
                'senha' => $password,
            ]);

            if ($response['status'] === 200 &&
                isset($response['data']['usuario']['id_usu']) &&
                isset($response['data']['token']) &&
                is_string($response['data']['token'])) {
                session_regenerate_id(true);
                $_SESSION['api_token'] = $response['data']['token'];
                $_SESSION['user'] = [
                    'id' => (int) $response['data']['usuario']['id_usu'],
                    'name' => (string) ($response['data']['usuario']['nome'] ?? ''),
                    'email' => (string) ($response['data']['usuario']['email'] ?? $email),
                ];
                unset($_SESSION['csrf_token']);
                redirect('dashboard.php');
            }

            if ($response['status'] === 401 || $response['status'] === 400) {
                $errorMessage = 'Email ou senha inválidos.';
            } else {
                error_log('Login API returned HTTP ' . $response['status']);
                $errorMessage = 'Não foi possível validar o login. Tente novamente.';
            }
        } catch (Throwable $error) {
            error_log('Login request failed: ' . $error->getMessage());
            $errorMessage = 'A API está indisponível no momento. Tente novamente mais tarde.';
        }
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Entrar · Loja</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="auth-page">
    <main class="auth-card">
        <a class="brand" href="index.php"><span class="brand-mark">L</span> Loja</a>
        <p class="eyebrow">ÁREA ADMINISTRATIVA</p>
        <h1>Bem-vindo de volta</h1>
        <p class="muted">Entre com seu usuário cadastrado para acessar o painel.</p>

        <?php if ($errorMessage !== ''): ?>
            <div class="notice notice-error" role="alert"><?= h($errorMessage) ?></div>
        <?php endif; ?>

        <form method="post" action="login.php" class="form">
            <input type="hidden" name="csrf_token" value="<?= h(csrf_token()) ?>">
            <label for="email">Email</label>
            <input
                id="email"
                name="email"
                type="email"
                autocomplete="username"
                maxlength="100"
                value="<?= h($email) ?>"
                placeholder="voce@exemplo.com"
                required
            >

            <label for="password">Senha</label>
            <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
            >

            <button class="button button-primary" type="submit">Entrar no painel</button>
        </form>

        <p class="auth-footnote">Acesso restrito a usuários ativos cadastrados.</p>
    </main>
</body>
</html>
