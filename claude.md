# AD Manager — Documentação do Projeto

## O que é

Plataforma de **Digital Signage** para gerenciamento remoto de conteúdo exibido em TVs corporativas, painéis comerciais e dispositivos de mídia.

Permite:
- criação e organização de playlists (imagens e vídeos)
- agendamento de exibição por dia da semana e horário
- reprodução automática em telas em loop contínuo
- gerenciamento centralizado via painel web

**Foco do projeto:** funcionamento contínuo 24/7, estabilidade em ambiente real, compatibilidade com dispositivos antigos, baixa necessidade de suporte, facilidade de deploy e gerenciamento remoto simples.

**Público-alvo:** lojas, clínicas, recepções, ambientes corporativos — qualquer operador que precise exibir conteúdo em TVs sem complexidade técnica.

---

## Stack

### Backend
- Python 3 / Django 6 + Django REST Framework
- PostgreSQL (produção) / SQLite (desenvolvimento)
- JWT Authentication (SimpleJWT, access token 12h)
- Gunicorn + WhiteNoise

### Frontend
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 / lucide-react

### Infraestrutura
- EasyPanel (build via `Dockerfile` próprio no backend — controle explícito de workers/threads do gunicorn)
- GitHub (`VictorHMartins/ad-manager-evoa`)
- Cloudflare (DNS/proxy)

---

## Estrutura de Diretórios

```
AD MANAGER/
├── ad_manager_back/               # API Django
│   ├── core/                      # Configurações (settings, urls, wsgi, asgi)
│   ├── ads/                       # App principal
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── media/                     # Uploads dos usuários (media/playlists/)
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
│
└── ad_manager_front/
    ├── src/
    │   ├── app/                   # Páginas (App Router)
    │   │   ├── page.tsx           # Dashboard
    │   │   ├── login/
    │   │   ├── playlists/
    │   │   ├── filas/
    │   │   └── player/            # Player React (TVs modernas)
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   ├── SidebarWrapper.tsx  # Oculta sidebar em /login e /player
    │   │   ├── AuthGuard.tsx
    │   │   ├── ConfirmModal.tsx
    │   │   ├── player/            # player.tsx, ImageSlide.tsx, VideoSlide.tsx
    │   │   ├── playlists/         # PlaylistModal.tsx, AddMidiaModal.tsx
    │   │   └── filas/             # FilaModal.tsx
    │   ├── hooks/
    │   │   └── useAuth.ts
    │   └── services/
    │       └── api.ts             # apiFetch centralizado
    └── public/
        ├── tv.html                # Player legacy (TVs antigas — HTML/ES5 puro)
        ├── blank.mp4              # Vídeo mudo auxiliar (workaround autoplay)
        └── *.svg                  # Assets da marca (logo Evoa)
```

---

## Fluxo Completo do Sistema

```
TV abre /player ou /tv
        ↓
Player entra em fullscreen
        ↓
GET /api/player/
        ↓
Backend identifica dia atual + horário atual
        ↓
Localiza fila ativa compatível
        ↓
Consolida playlists da fila em lista flat de mídias
        ↓
Player monta o loop localmente
        ↓
Mídias reproduzidas sequencialmente
        ↓
Polling a cada 60s verifica atualização
        ↓
Nova playlist fica pendente (não interrompe)
        ↓
Troca aplicada apenas ao fim do ciclo atual
```

---

## Sistema de Reprodução — Dois Players

Esta é a decisão arquitetural mais importante do projeto. Existem dois players completamente separados, por motivo de compatibilidade.

### Player React — `/player`

**Arquivo:** `src/components/player/player.tsx`

Usado em: navegadores modernos, Android TV recente, Fire TV Stick, TVs com engine atualizada.

Características:
- Transição de 300ms (fade) entre mídias via classe CSS `opacity`
- Wake Lock API — tenta manter tela ativa oficialmente
- Eventos periódicos de `scrollBy` + `MouseEvent("click")` a cada 30s — fallback para TVs sem Wake Lock
- `blank.mp4` invisível (10×10px, opacity 0.05) em loop contínuo — workaround para política de autoplay: browsers que exigem interação do usuário antes de reproduzir vídeo aceitam após já haver um vídeo ativo na página
- Polling a cada 60s; nova playlist aplicada apenas ao fim do ciclo

### Player Legacy — `/tv`

**Arquivo:** `public/tv.html`

Arquivo HTML completamente independente — sem React, sem TypeScript, sem build do Next.js. Servido diretamente pela pasta `public/`.

**Por que existe:** muitas TVs corporativas possuem navegadores extremamente antigos. Nesses dispositivos o React travava, o bundle moderno não renderizava, o autoplay falhava silenciosamente e loops longos corrompiam memória.

Implementação deliberadamente simples:
- HTML + CSS + JavaScript **ES5 puro**
- `XMLHttpRequest` (sem `fetch`)
- `var` em vez de `const`/`let`
- Sem arrow functions, sem módulos, sem imports
- Manipulação manual de DOM
- API_URL hardcoded (produção)

**Estratégia de reset de vídeo** — necessária porque algumas TVs mantinham buffer corrompido entre reproduções, causando tela preta:
```javascript
video.pause()
video.removeAttribute("src")
video.load()        // força limpeza do buffer
video.src = URL
video.load()        // reinicia pipeline do zero
video.play()
```

**Timeout de segurança:** vídeos têm limite de 60s — se não dispararem `ended`, a reprodução avança automaticamente para a próxima mídia.

### Flatten de Playlists

O player **não** recebe playlists individuais. O backend consolida tudo em uma lista flat antes de enviar:

```
FilaReproducao
  ├── Playlist Institucional  → [video1.mp4, imagem1.jpg]
  └── Playlist Promoções      → [promo1.jpg, promo2.mp4]

Enviado ao player:
[video1.mp4, imagem1.jpg, promo1.jpg, promo2.mp4]
```

Isso simplifica a lógica do player, o loop de reprodução e a compatibilidade entre os dois players.

### Atualização Segura de Playlist

Ambos os players implementam o mesmo padrão para evitar cortes bruscos:

```
Polling detecta nova playlist
        ↓
Armazena em novaMidia / novaMidiaRef (pendente)
        ↓
Player continua reprodução atual normalmente
        ↓
Quando índice retorna para 0 (fim do ciclo):
        ↓
Nova playlist substitui a antiga
```

Implementado com **refs no React player** e **variáveis globais no `tv.html`**. Evita: vídeos cortados, imagens trocando antes do tempo, flickering visual.

```
carregar()                            → busca /api/player/
verificarAtualizacao()                → checa se passou 60s
novaMidia / novaMidiaRef              → guarda payload pendente
aplicarAtualizacaoSeNecessario(idx)   → aplica APENAS quando idx === 0
```

### Estratégia Anti-Standby

Um dos maiores desafios reais do projeto foi impedir TVs de apagar a tela ou pausar a reprodução. O sistema usa três mecanismos em paralelo:

| Mecanismo | Como funciona | Limitação |
|-----------|--------------|-----------|
| Wake Lock API | Requisição oficial ao browser para manter tela ativa | Não suportado por TVs antigas |
| Eventos simulados | `scrollBy` + click sintético a cada 30s | Pode ser ignorado por alguns browsers |
| `blank.mp4` invisível | Vídeo 10×10px em loop — mantém browser em estado "media-active" | Depende de autoplay funcionar |

Os três são necessários porque nenhum funciona em 100% dos dispositivos.

---

## Modelos de Dados

### Playlist
Agrupamento reutilizável de mídias (campanha ou tema).
- `nome`, `ativo`, `criado_em`

### PlaylistMidia
Item individual de mídia dentro de uma playlist.
- `playlist` FK, `nome`
- `arquivo` — salvo em `media/playlists/`; deletado do disco ao excluir o registro
- `tipo` — `"video"` ou `"imagem"`, detectado automaticamente por MIME type
- `ordem` — posição manual na playlist
- `duracao` — obrigatório para imagens; vídeos detectam automaticamente via `moviepy`

### FilaReproducao
Define quando um conjunto de playlists deve tocar.
- `nome`, `ativo`
- `dias_semana` — JSONField com array `[0..6]` (0 = domingo)
- `horario_inicio` / `horario_fim` — TimeField
- Validação no `save()` impede conflito de agenda com outras filas ativas

### FilaPlaylist
Tabela de ligação entre Fila e Playlist, com ordenação.
- `fila` → FilaReproducao, `playlist` → Playlist, `ordem`

```
Playlist ──── (M) PlaylistMidia
Playlist ──── (M) FilaPlaylist
FilaReproducao ──── (M) FilaPlaylist
```

---

## API

| Rota | Auth | Descrição |
|------|------|-----------|
| `POST /api/token/` | — | Login, retorna access + refresh JWT |
| `POST /api/token/refresh/` | — | Renova access token |
| `GET /api/player/` | **Não** | Fila ativa agora + lista flat de mídias |
| `GET/POST /api/playlists/` | Sim | Listar / criar playlists |
| `PUT/DELETE /api/playlists/{id}/` | Sim | Editar / excluir playlist |
| `GET/POST /api/midias/` | Sim | Gerenciar mídias |
| `GET/POST /api/filas/` | Sim | Listar / criar filas |
| `PUT/DELETE /api/filas/{id}/` | Sim | Editar / excluir fila |

`/api/player/` é público por design — TVs não fazem login. Calcula a fila ativa pelo dia e hora atuais e retorna a lista flat de mídias.

---

## Autenticação

- JWT via SimpleJWT; token em `localStorage["token"]`
- `apiFetch()` em `services/api.ts` centraliza headers e redireciona para `/login` em 401
- `useAuth.ts` valida expiração no cliente
- Rotas `/player` e `/tv` não exigem autenticação

---

## Regras de Negócio

- Apenas uma fila pode estar ativa no mesmo horário — conflito validado no `save()` do backend
- Playlists são reutilizáveis entre múltiplas filas
- Imagens exigem `duracao` manual; vídeos detectam duração automaticamente
- Vídeos têm prioridade sobre timeout — avança ao `ended`, não por timer
- Exclusão de mídia remove o arquivo físico do disco
- Player público não exige autenticação

---

## Configuração de Ambiente

**Backend (variáveis de ambiente — produção):**
```
SECRET_KEY, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_MEDIA_URL=http://127.0.0.1:8000
```

**CORS permitido:**
- `http://localhost:3000`, `http://127.0.0.1:3000`
- `https://evoa.webnox.com.br`

**Rodar localmente:**
```bash
# Backend
cd ad_manager_back
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # :8000

# Frontend
cd ad_manager_front
npm install
npm run dev                         # :3000
```

---

## Decisões Arquiteturais

### Compatibilidade acima de sofisticação

Grande parte da arquitetura foi moldada por limitações reais de TVs corporativas:
- autoplay bloqueado por policy
- engines WebKit antigas sem suporte a ES6+
- React travando em browsers embutidos
- loops longos corrompendo memória
- tela apagando mesmo durante reprodução

Por isso o projeto mantém duas implementações paralelas do player e usa mecanismos de compatibilidade máxima, mesmo que isso signifique duplicar lógica.

### Polling em vez de WebSocket

WebSocket foi descartado inicialmente porque:
- TVs antigas têm conexões instáveis — reconnect constante gerava problemas
- navegadores embutidos têm suporte inconsistente a WebSocket
- polling é mais previsível, mais simples de depurar e mais fácil de fazer deploy

A migração para WebSocket só faz sentido após implementar heartbeat robusto e controle de estado offline.

### EasyPanel para deploy

Escolhido por:
- simplificar deploy sem overhead de DevOps manual
- facilidade de rollback e iteração rápida

O backend passou a ter `Dockerfile` e `entrypoint.sh` próprios (`ad_manager_back/`) em vez de depender do build automático da plataforma — necessário para fixar explicitamente `--workers`/`--threads` do gunicorn, que antes não eram versionados em lugar nenhum do repositório.

### Filosofia técnica

O projeto segue uma abordagem pragmática com prioridades ordenadas:

1. Funcionar em produção real
2. Ser estável e previsível
3. Ser compatível com dispositivos limitados
4. Ser simples de manter e evoluir
5. Otimizar e refatorar depois

Consequências intencionais:
- TypeScript sem strict mode — pragmático para velocidade de desenvolvimento
- Tratamento de erro via `console.log` + fallback para array vazio — adequado para MVP
- Ausência de abstrações excessivas — backend direto, sem camadas enterprise prematuras
- Duplicação de lógica entre players — aceita por compatibilidade

---

## Identidade Visual

- **Laranja:** `#ed5b0c` (cor primária, botões de ação)
- **Verde escuro:** `#253529` → `#1F2C22` (sidebar, gradiente)

---

## Model Dispositivo (TV)

Cada TV é um `Dispositivo` com as seguintes propriedades:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | CharField | "TV Recepção" |
| `codigo` | SlugField (unique) | Código curto: `r`, `m`, `p`, `r2` — sempre lowercase |
| `orientacao` | CharField | `h` (Horizontal) ou `v` (Vertical) |
| `tipo_player` | CharField | `react` (Player React) ou `legacy` (Player Legacy) |
| `ativo` | BooleanField | Ativa/desativa a TV |
| `descricao` | TextField | Opcional, texto livre |

**Regras:**
- `codigo` é forcado para lowercase no `save()` do model
- `codigo` é imutável após criação (bloqueado no frontend)
- Um código nunca pode ser reutilizado (UNIQUE constraint no banco)
- Excluir um `Dispositivo` exclui em cascade todas as suas `FilaReproducao`

**FilaReproducao agora tem FK para Dispositivo:**
- `dispositivo = ForeignKey(Dispositivo, null=True, blank=True)`
- Filas com `dispositivo=NULL` são o comportamento legado (sem TV específica)
- Conflito de agenda validado **por dispositivo** — duas TVs diferentes podem ter o mesmo horário

**URLs do player por TV:**

| Player | URL |
|--------|-----|
| React | `/player/{codigo}` |
| Legacy | `/tv.html?tv={codigo}` |

**Endpoint da API por TV:**
```
GET /api/player/{codigo}/   →  fila ativa para aquela TV + orientação
GET /api/player/            →  legado, retorna filas sem dispositivo
GET /api/dispositivos/      →  CRUD de TVs (auth obrigatório)
```

---

## Estado Atual

### Concluído
- Autenticação JWT com auto logout
- Dashboard administrativo
- CRUD completo: playlists, mídias, filas
- Upload de mídia com detecção automática de tipo e duração
- Ordenação manual de mídias
- Validação de conflito de horários por dispositivo
- Player React (`/player/[codigo]`) com Wake Lock e anti-standby
- Player legacy HTML (`/tv.html?tv=CODIGO`) em ES5 puro para TVs antigas
- Flatten de playlists no backend
- Atualização de playlist sem corte de ciclo em ambos os players
- Integração completa frontend/backend
- Proteção de rotas com AuthGuard
- `apiFetch` centralizado
- Deploy funcional em EasyPanel
- **Model `Dispositivo` (TV) com código único curto**
- **Endpoint `/api/player/{codigo}/` por TV**
- **CRUD de TVs na página `/tvs`**
- **Suporte a orientação vertical em ambos os players**
- **`FilaReproducao` associada a `Dispositivo`**
- **Selector de TV no modal de criação/edição de filas**

### Em andamento
- Preload inteligente de mídias
- Melhorias visuais e transições mais suaves
- Otimização do player
- Melhoria de responsividade

### Planejado (Roadmap)
- **Monitoramento de TVs** — heartbeat periódico: online/offline, última atividade, status atual
- **Screenshot remoto** — captura periódica da tela para auditoria e diagnóstico
- **Cache offline** — funcionamento temporário sem internet, persistência local de playlist
- **Grupos de TVs** — múltiplas TVs compartilhando campanhas, playlists e horários
- **Multiempresa** — separação por tenants: usuários, playlists, filas, dispositivos
- **Analytics** — tempo de reprodução, campanhas mais exibidas, uptime, erros de player
- **Controle remoto** — comandos remotos: reload, limpar cache, reiniciar reprodução, trocar playlist

---

## Problemas Conhecidos

- Autoplay depende do navegador e configuração da TV — não há garantia universal
- Algumas TVs entram em standby mesmo com Wake Lock ativo
- Navegadores muito antigos podem ter limitações além do que o `tv.html` cobre
- Vídeos muito longos podem sofrer reset inesperado dependendo do timing do polling
