<?php
declare(strict_types=1);

$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'self'; style-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string
{
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf_token(mixed $submittedToken): bool
{
    return is_string($submittedToken)
        && isset($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $submittedToken);
}

function redirect(string $location): never
{
    header('Location: ' . $location, true, 303);
    exit;
}

function require_login(): void
{
    if (!isset($_SESSION['user']) || !is_array($_SESSION['user'])) {
        redirect('login.php');
    }
}

function api_base_url(): string
{
    $baseUrl = rtrim(
        getenv('API_BASE_URL') ?: 'https://backend-6apy.onrender.com',
        '/'
    );
    $parts = parse_url($baseUrl);
    $scheme = strtolower($parts['scheme'] ?? '');
    $host = strtolower($parts['host'] ?? '');
    $isLocalHost = in_array($host, ['localhost', '127.0.0.1', '::1'], true);

    if (!isset($parts['host']) || ($scheme !== 'https' && !($scheme === 'http' && $isLocalHost))) {
        throw new RuntimeException('API_BASE_URL deve usar HTTPS, exceto em localhost.');
    }

    return $baseUrl;
}

function api_request(string $method, string $path, ?array $payload = null): array
{
    if (!extension_loaded('openssl')) {
        throw new RuntimeException('Habilite a extensão OpenSSL do PHP para acessar a API por HTTPS.');
    }

    $headers = ['Accept: application/json'];
    if (isset($_SESSION['api_token']) && is_string($_SESSION['api_token'])) {
        $headers[] = 'Authorization: Bearer ' . $_SESSION['api_token'];
    }
    $content = '';
    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
        $content = json_encode($payload, JSON_THROW_ON_ERROR);
    }

    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $content,
            'timeout' => 12,
            'ignore_errors' => true,
            'follow_location' => 0,
            'max_redirects' => 0,
            'protocol_version' => 1.1,
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);

    set_error_handler(static function (int $severity, string $message): never {
        throw new ErrorException($message, 0, $severity);
    });

    try {
        $responseBody = file_get_contents(api_base_url() . $path, false, $context);
    } catch (Throwable $error) {
        throw new RuntimeException('Não foi possível conectar à API.', 0, $error);
    } finally {
        restore_error_handler();
    }

    $responseHeaders = function_exists('http_get_last_response_headers')
        ? http_get_last_response_headers()
        : ($http_response_header ?? null);
    if ($responseBody === false || !is_array($responseHeaders)) {
        throw new RuntimeException('A API não retornou uma resposta.');
    }

    $status = 0;
    foreach ($responseHeaders as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $header, $matches)) {
            $status = (int) $matches[1];
            break;
        }
    }

    try {
        $data = json_decode($responseBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        throw new RuntimeException('A API retornou uma resposta inválida.', 0, $error);
    }

    if (!is_array($data)) {
        throw new RuntimeException('A API retornou um formato inesperado.');
    }

    return ['status' => $status, 'data' => $data];
}
