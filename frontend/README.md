# Frontend PHP da API de Gestão de Loja

Este frontend fornece uma tela de login e um dashboard protegido por sessão
PHP. O login é validado pela rota `POST /usuario/login` da API. O dashboard
consulta `GET /produto` pelo servidor PHP, portanto o navegador não precisa
acessar a API diretamente nem depende de CORS.

## Requisitos

- PHP 8.1 ou superior.
- Extensão PHP OpenSSL habilitada para conexões HTTPS.
- A API Node.js publicada e acessível pelo servidor que executa o PHP.

## Executar localmente

Na raiz do repositório, defina `API_BASE_URL` se quiser apontar para outra API.
O padrão é `https://backend-6apy.onrender.com`.

PowerShell:

```powershell
$env:API_BASE_URL = "https://backend-6apy.onrender.com"
php -d extension=openssl -S 127.0.0.1:8080 -t frontend
```

Abra `http://127.0.0.1:8080`. Entre com as credenciais de um usuário ativo já
cadastrado na API. O frontend não cria usuários.

Em produção, defina `API_BASE_URL` no ambiente do host PHP e publique somente
o conteúdo deste diretório em um host que execute PHP. Use HTTPS para que o
cookie de sessão seja protegido com o atributo `Secure`.

## Segurança e limitações

- A sessão autenticada é mantida no servidor PHP; o identificador de sessão é
  regenerado após login. O token de acesso da API fica somente na sessão PHP e
  é enviado pelo servidor no cabeçalho `Authorization`.
- Formulários de login e saída validam token CSRF. As senhas são enviadas ao
  endpoint HTTPS da API e não são guardadas na sessão.
- O dashboard exige uma sessão PHP válida e renderiza a saída com escape HTML.
- As rotas de dados da API exigem um token Bearer recebido no login, exceto
  `POST /usuario/login` e a página inicial. Cada conta autenticada tem as mesmas
  permissões; não há níveis de acesso por função.
- Configure `JWT_SECRET` com pelo menos 32 bytes aleatórios no ambiente da API.
  Gere um valor com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  e configure-o no host sem colocá-lo no repositório.
- Os tokens expiram após uma hora. Quando expiram, o frontend encerra a sessão
  local e solicita novo login.
- As sessões locais usam o handler padrão de arquivos do PHP. Em hospedagem
  com múltiplas instâncias, configure um armazenamento de sessão compartilhado.
