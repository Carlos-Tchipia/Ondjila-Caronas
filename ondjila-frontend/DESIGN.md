# Ondjila Design System (Light Premium)

## Paleta
- **Brand:** `#059669` → `#047857`
- **Accent (destinos/rotas sec.):** `#2563eb`
- **Background:** `#f8fafc`
- **Surface:** `#ffffff`
- **Text:** `#0f172a` / muted `#64748b`

## Tipografia
- **Display:** Plus Jakarta Sans (títulos, números)
- **Body:** DM Sans (UI, formulários)

## Componentes globais (`src/styles/`)
- `_tokens.scss` — variáveis CSS
- `_components.scss` — botões, inputs, badges, toast, skeleton
- `_auth.scss` — layout login/registo
- `_dashboard.scss` — mapa + painéis flutuantes + mobile sheet
- `_animations.scss` — fade-in, sheet-up, shimmer

## Mapa
- Tiles: Carto **Voyager** (tema claro)
- Rota: linha verde + glow + `flyToBounds`
- Marcadores: pins custom (origem, destino, táxi)

## Navegação mobile
- `app-bottom-nav` — passageiro e motorista

## Rotas UI
| Rota | Estado |
|------|--------|
| `/` | Landing redesign |
| `/login`, `/register`, `/register/driver` | Auth claro |
| `/passenger/dashboard` | Funcional |
| `/driver/dashboard` | Funcional |
| `/passenger/wallet` | Saldo API |
| `/passenger/trips`, chat, rate, notifications, settings | Shell v1.1 |
| `/admin/dashboard` | Shell admin |
