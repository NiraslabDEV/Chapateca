// Corre: node scripts/get-refresh-token.js
const http = require('http')
const { exec } = require('child_process')

// Lê do JSON descarregado do Google Cloud Console
// Usage: node scripts/get-refresh-token.js path/to/client_secret.json
const secretFile = process.argv[2]
if (!secretFile) { console.error('Uso: node scripts/get-refresh-token.js <client_secret.json>'); process.exit(1) }
const { installed } = require(require('path').resolve(secretFile))
const CLIENT_ID = installed.client_id
const CLIENT_SECRET = installed.client_secret
const REDIRECT_URI = 'http://localhost:3333'
const SCOPE = 'https://www.googleapis.com/auth/drive'

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n🔑 A abrir o browser para autorizar o acesso ao Google Drive...\n')

// Abre o browser automaticamente
const openCmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `open "${authUrl}"`
exec(openCmd)

// Servidor local para capturar o código de retorno
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  const code = url.searchParams.get('code')
  if (!code) {
    res.end('Erro: código não encontrado.')
    return
  }

  res.end('<h2>✅ Autorizado! Podes fechar esta janela.</h2>')
  server.close()

  // Troca o código pelo refresh token
  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const tokens = await tokenRes.json()

  if (tokens.refresh_token) {
    console.log('\n✅ SUCESSO! Copia estas variáveis para o Railway:\n')
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`)
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`)
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\n')
  } else {
    console.error('\n❌ Erro ao obter refresh token:', JSON.stringify(tokens))
  }
})

server.listen(3333, () => {
  console.log('A aguardar autorização no browser...')
})
