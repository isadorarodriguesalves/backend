<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_login();

$products = [];
$apiError = '';

try {
    $response = api_request('GET', '/produto');
    if ($response['status'] === 401) {
        unset($_SESSION['user'], $_SESSION['api_token'], $_SESSION['csrf_token']);
        redirect('login.php');
    }
    if ($response['status'] !== 200 || !isset($response['data']['produtos']) || !is_array($response['data']['produtos'])) {
        throw new RuntimeException('A API de produtos retornou uma resposta inesperada.');
    }
    $products = $response['data']['produtos'];
} catch (Throwable $error) {
    error_log('Dashboard product request failed: ' . $error->getMessage());
    $apiError = 'Não foi possível carregar os produtos. Atualize a página para tentar novamente.';
}

$user = $_SESSION['user'];
$displayName = trim((string) ($user['name'] ?? ''));
if ($displayName === '') {
    $displayName = (string) ($user['email'] ?? 'Usuário');
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard · Loja</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="dashboard-page">
    <aside class="sidebar">
        <a class="brand" href="dashboard.php"><span class="brand-mark">L</span> Loja</a>
        <p class="sidebar-label">MENU</p>
        <a class="nav-link active" href="dashboard.php"><span aria-hidden="true">▦</span> Dashboard</a>
        <div class="sidebar-bottom">
            <div class="user-chip">
                <span class="avatar"><?= h(strtoupper(substr($displayName, 0, 1))) ?></span>
                <span class="user-meta"><strong><?= h($displayName) ?></strong><small><?= h((string) ($user['email'] ?? '')) ?></small></span>
            </div>
            <form method="post" action="logout.php">
                <input type="hidden" name="csrf_token" value="<?= h(csrf_token()) ?>">
                <button class="button button-quiet button-full" type="submit">Sair da conta</button>
            </form>
        </div>
    </aside>

    <main class="main-content">
        <header class="topbar">
            <div>
                <p class="eyebrow">VISÃO GERAL</p>
                <h1>Dashboard</h1>
            </div>
            <span class="status-pill"><span class="status-dot"></span> Painel conectado</span>
        </header>

        <section class="welcome-panel">
            <div>
                <p class="eyebrow">PAINEL DA LOJA</p>
                <h2>Olá, <?= h($displayName) ?>.</h2>
                <p>Acompanhe os produtos cadastrados na sua loja.</p>
            </div>
            <div class="welcome-icon" aria-hidden="true">▦</div>
        </section>

        <?php if ($apiError !== ''): ?>
            <div class="notice notice-error" role="alert"><?= h($apiError) ?></div>
        <?php endif; ?>

        <section class="stats-grid" aria-label="Resumo">
            <article class="stat-card">
                <span class="stat-icon">▦</span>
                <p class="muted">Produtos cadastrados</p>
                <strong class="stat-value"><?= count($products) ?></strong>
                <small>Registros retornados pela API</small>
            </article>
            <article class="stat-card">
                <span class="stat-icon stat-icon-green">↗</span>
                <p class="muted">API</p>
                <strong class="stat-value"><?= $apiError === '' ? 'Online' : 'Indisponível' ?></strong>
                <small>Conexão com o serviço de produtos</small>
            </article>
        </section>

        <section class="content-card">
            <div class="section-heading">
                <div>
                    <p class="eyebrow">CATÁLOGO</p>
                    <h2>Produtos</h2>
                </div>
                <span class="count-badge"><?= count($products) ?> itens</span>
            </div>

            <?php if ($products === [] && $apiError === ''): ?>
                <div class="empty-state">
                    <span class="empty-icon">▦</span>
                    <strong>Nenhum produto cadastrado</strong>
                    <p>Quando houver produtos na API, eles aparecerão aqui.</p>
                </div>
            <?php elseif ($products !== []): ?>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Descrição</th>
                                <th>Preço</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($products, 0, 12) as $product): ?>
                                <tr>
                                    <td>
                                        <div class="product-name">
                                            <span class="product-icon">P</span>
                                            <strong><?= h((string) ($product['nome'] ?? 'Produto')) ?></strong>
                                        </div>
                                    </td>
                                    <td class="muted"><?= h((string) ($product['descricao'] ?? '—')) ?></td>
                                    <td class="price">
                                        <?php if (isset($product['preco']) && is_numeric($product['preco'])): ?>
                                            R$ <?= h(number_format((float) $product['preco'], 2, ',', '.')) ?>
                                        <?php else: ?>
                                            —
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php if (count($products) > 12): ?>
                    <p class="table-note">Mostrando os primeiros 12 de <?= count($products) ?> produtos.</p>
                <?php endif; ?>
            <?php endif; ?>
        </section>
        <footer class="page-footer">API de Gestão de Loja · Área restrita</footer>
    </main>
</body>
</html>
