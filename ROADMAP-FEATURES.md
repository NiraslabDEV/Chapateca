# Roadmap de Features — Portal Chapateca

**Última actualização:** 28 de Maio de 2026
**Mantido por:** Gabriel
**Como usar:** referência viva. À medida que ideias surgem, adicionar aqui. Sempre que terminar uma feature, mover para "Concluídas".

---

## 🔥 Em construção — Sessão actual

### Tarefas como Zona de Comunicação (4 sub-features)

#### ▶ 1. Tarefa-como-Conversa **(a construir agora)**
- Cada tarefa vira um thread tipo WhatsApp entre quem manda e quem recebe
- Novo modelo `TaskMessage` (taskId, fromEmail, body, createdAt)
- A body original do Task vira primeira mensagem
- Input de resposta no fundo da tarefa
- Notificação visual quando há mensagem nova
- **Privacidade:** só par sender ↔ receiver vê mensagens

#### ⏳ 2. Painel Geral (Admin Kanban)
- Vista de comando para admins verem tudo em andamento
- 3 colunas: Pendentes / Em curso / Concluídas hoje
- Cada cartão: assignee, título, tempo desde última actividade, nº mensagens
- Filtros por pessoa, categoria, estado
- **NÃO mostra conteúdo** dos chats — só metadados

#### ⏳ 3. Acções Rápidas dentro da Tarefa
- Botões que levam directamente à página relevante
- Tipos: `upload_terreno`, `upload_doc_financas`, `criar_pasta`, `ver_album`, etc.
- Schema: campos `actionType` + `actionParam` no Task
- Botão pré-preenche o formulário de destino (ex: já com pasta seleccionada)

#### ⏳ 4. Tarefa-como-Zona-de-Trabalho
- Página `/tarefas` vira dashboard operacional pessoal
- Saudação personalizada, contagens, próximas tarefas
- Toda a rotina diária da pessoa passa por aqui
- Ponto de entrada principal para outras secções do portal

#### ⏳ 5. Toggle "Partilhar com Direcção" (privacy refinement)
- Por defeito tarefas são privadas entre par sender↔receiver
- Quem cria pode marcar `sharedWithDirection: true`
- Aí Sonia e Shadia também veem o conteúdo, não só metadados
- Schema: campo boolean `sharedWithDirection` no Task

---

## 🎯 Próximas grandes — Pedidos da Constance

### Relatórios Automáticos em Excel
- Diário / Semanal / Mensal
- Cada um com colunas relevantes (actividades, locais, fotos, participantes)
- Botão "Gerar Relatório" gera ficheiro `.xlsx` directamente
- Email opcional automatizado: enviar relatório semanal por email às 6ª 17h

### Lista de Locais Oficial
- Aguarda input da equipa Chapateca
- Substituir os locais provisórios em `lib/locations.ts`
- Considerar criar interface de admin para gerir locais (em vez de hardcoded)

---

## 🌱 Horizonte 1 — Próximos 6 meses

### KOHA — Catálogo de Livros (3 opções)
1. **Replicar dentro do portal** — 2-4 meses dev, integração total, identidade Chapateca
2. **Self-host KOHA oficial** — 1 semana setup, pragmático
3. **KOHA hospedado por terceiros** — caro, mata vantagem solo+IA

**Recomendação:** começar com Opção 2, migrar para Opção 1 quando fizer sentido

### Dashboard de Impacto
- Números vivos no dashboard principal
- "Este mês: X livros emprestados, Y crianças novas, Z actividades"
- Comparativos mês a mês
- Gráficos simples (libs/recharts)

### PWA Mobile Offline-first
- Service worker para funcionar sem rede
- Upload de fotos em fila offline → sincroniza quando ligar
- Resolve o problema real da equipa em zonas com pouca rede
- Adiciona ao ecrã inicial do telemóvel

---

## 💡 Horizonte 2 — 6 a 18 meses

### 💰 Rastreamento de Frota (venda separada à Constance)
**Estado:** especificado, não construído. A vender como módulo extra — não está no escopo do contrato actual.

**O conceito:** motoristas activam partilha de localização no portal, Constance vê em tempo quase-real onde está cada veículo da Chapateca. Aproveita o mesmo portal sem hardware extra.

**Como funciona:**
- Motorista activa "Estou ao volante" no portal → GPS captado a cada 15 min automaticamente
- Constance vê mapa central com pins por motorista + última actualização
- Botão **"Pedir actualização"** ao lado de cada motorista → força captura imediata (~15 seg de latência via polling do telemóvel do motorista)
- Bateria preservada: 4 leituras/hora consomem só ~5-8%/hora

**Limitações honestas:**
- Browser-only: só funciona enquanto a página estiver aberta no telemóvel do motorista
- Sem rede em zonas remotas = sem actualização (mas última posição conhecida fica visível)
- Para tracking 24/7 verdadeiro precisa de hardware GPS dedicado (próximo passo se a Chapateca crescer)

**Schema previsto:**
```prisma
model VehicleSession {
  id            String   @id @default(cuid())
  motoristEmail String
  isActive      Boolean  @default(true)
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  locations     VehicleLocation[]
}

model VehicleLocation {
  id        String   @id @default(cuid())
  sessionId String
  session   VehicleSession @relation(fields: [sessionId], references: [id])
  lat       Float
  lng       Float
  accuracy  Float?   // metros
  isManualRequest Boolean @default(false)
  capturedAt DateTime @default(now())
  @@index([sessionId, capturedAt])
}

model LocationRequest {
  id              String   @id @default(cuid())
  motoristEmail   String
  requestedBy     String
  requestedAt     DateTime @default(now())
  fulfilledAt     DateTime?
  @@index([motoristEmail, fulfilledAt])
}
```

**Componentes a construir:**
1. `/frota/conduzir` — página do motorista com toggle "Estou ao volante" + PWA
2. `/frota` — mapa Leaflet + OSM (gratuito) com pins por motorista
3. API: `POST /api/frota/posicao`, `GET /api/frota/pedido-pendente`, `POST /api/frota/pedir-refresh`
4. Histórico de rotas do dia (timeline visual)

**Custo de construção:** ~1 semana de trabalho focado
**Custo operacional adicional:** zero (Leaflet + OSM são gratuitos, sem API key)
**Valor para a Chapateca:** alto — substitui sistemas comerciais de gestão de frota que custam 50-150 USD/mês

**Pricing sugerido:** projecto único 25-40 mil MZN + 2-3 mil MZN/mês de manutenção, ou incluído num upgrade de honorários para 18 mil MZN/mês (vê [ANALISE-CUSTOS-ESCALA.md](ANALISE-CUSTOS-ESCALA.md))

---

### Portal do Doador
- Cada patrocinador tem login próprio
- Vê em tempo real onde o dinheiro dele está a ser usado
- Fotos das actividades que ele financia
- Relatório automático trimestral
- **Esta feature fecha doações sozinha**

### Portal do Leitor
- Miúdo da comunidade vê o catálogo da sua biblioteca
- Reserva livros por WhatsApp
- Cria sentido de pertença comunitária

### Integração WhatsApp / SMS
- Realidade Moçambique: todos têm WhatsApp
- Notificações de actividades
- Lembretes de devolução de livros
- Partilha de fotos com doadores
- Bot básico para reservas (via WhatsApp Business API)

### Storytelling Editorial
- `/projetos` evolui para blog real com histórias escritas, não só fotos
- Posicionamento mediático
- Cada post pode ter foto destacada, texto, autor
- SEO básico para aparecer no Google

---

## 🚀 Horizonte 3 — 18 meses a 3 anos

### Multi-Biblioteca
- Cada biblioteca com a sua identidade visual
- Mesmo portal, dados separados
- Comparações de performance
- Partilha de boas práticas

### Features de IA Verdadeiras
- **Auto-categorização de fotos** (qual biblioteca, qual actividade — sem tagar)
- **Geração automática de descrições** para o blog público
- **Sugestão de livros** para reservas baseada em padrões
- **OCR** para digitalizar documentos antigos (memória institucional)
- **Resumo automático** de relatórios

### M-Pesa / eMola Integrados
- Botão "Apoiar" no `/projetos` aceita doações móveis
- Tracking de quem doou o quê para que actividade
- Recibo automático

### Gestão de Voluntários
- Onboarding online
- Calendário de turnos
- Formação online (mini-cursos)
- Tracking de horas voluntárias

---

## 🌍 Horizonte 4 — 3+ anos (Visão Grande)

### "Chapateca Stack" — SaaS para ONGs Lusófonas
- Empacotar toda a stack
- Oferecer a outras ONGs comunitárias em África lusófona
- $50-100/mês por ONG
- "Notion para ONGs comunitárias africanas"

### Marketplace de Impacto
- Patrocinadores procuram ONGs por área, transparência, métricas
- Tu és o intermediário tecnológico
- Comissão por matching ou subscrição

### Relatórios Sectoriais
- Dados agregados anónimos de várias ONGs
- "O estado da literacia infantil em Maputo segundo 12 bibliotecas"
- Credibilidade junto de UNICEF, Banco Mundial, governo

---

## 🎨 Pequenos detalhes de UX a melhorar

> Anotar aqui ideias pequenas que surgem no dia-a-dia

- [ ] Notificação sonora opcional quando recebe nova tarefa
- [ ] Modo escuro persistente (já existe toggle, melhorar)
- [ ] Atalhos de teclado para acções comuns
- [ ] Pesquisa global (Cmd+K) que procura em fotos, docs, tarefas
- [ ] Histórico de actividade pessoal ("nas últimas 7 dias fiz...")
- [ ] Mencionar pessoas em tarefas com `@Judite`
- [ ] Anexar ficheiros directamente no chat de tarefas
- [ ] Reacções emoji rápidas nas mensagens (✓, 👍, ❤️)

---

## ✅ Concluídas

### Maio 2026
- Subpastas em Financeiro / Manuais / Estratégia
- Upload múltiplo de ficheiros
- Download de fotos em álbuns partilhados
- Renomear "Actividade" → "Projecto" na galeria
- Página `/acesso-negado`
- Correcção das permissões (DB > estático)
- Blog público `/projetos` com toggle público/privado
- Toggle de visibilidade Pública/Privada por álbum

---

## 📝 Notas de arquitectura

- **Privacidade > Conveniência** — quando em dúvida sobre quem vê o quê, opta sempre por mais privado
- **WhatsApp é o padrão mental** — quando UI confunde, perguntar "como faria o WhatsApp?"
- **Solo + IA é a regra** — qualquer feature que exija manutenção humana fora de ti é mau investimento
- **Sentido moçambicano** — testar em rede lenta, telemóvel barato, dados limitados sempre
