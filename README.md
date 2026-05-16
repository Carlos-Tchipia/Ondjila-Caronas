<div align="center">

<br/>

```
 ██████╗ ███╗   ██╗██████╗      ██╗██╗██╗      █████╗ 
██╔═══██╗████╗  ██║██╔══██╗     ██║██║██║     ██╔══██╗
██║   ██║██╔██╗ ██║██║  ██║     ██║██║██║     ███████║
██║   ██║██║╚██╗██║██║  ██║██   ██║██║██║     ██╔══██║
╚██████╔╝██║ ╚████║██████╔╝╚█████╔╝██║███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚════╝ ╚═╝╚══════╝╚═╝  ╚═╝
```

### *Mobilidade inteligente. Rotas partilhadas. Futuro conectado.*

> Sistema web de caronas moderno, desenvolvido para conectar passageiros e motoristas de forma segura, eficiente e em tempo real.

<br/>

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)
![ISPTEC](https://img.shields.io/badge/ISPTEC-Engenharia_Informática-orange?style=flat-square)
![Lab](https://img.shields.io/badge/Lab_%2304-Engenharia_de_Software_II-purple?style=flat-square)

<br/>

[🚀 Ver Demo](#-demonstração) · [📖 Documentação](#-arquitetura-do-sistema) · [🐛 Reportar Bug](https://github.com/seuuser/ondjila/issues) · [✨ Propor Feature](https://github.com/seuuser/ondjila/issues)

</div>

---

## 📋 Índice

- [Demonstração](#-demonstração)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura-do-sistema)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Instalação](#-instalação)
- [Base de Dados](#-configuração-da-base-de-dados)
- [APIs Utilizadas](#-apis-utilizadas)
- [Autenticação](#-sistema-de-autenticação)
- [Funcionalidades Avançadas](#-funcionalidades-avançadas)
- [Screenshots](#-screenshots)
- [Responsividade](#-responsividade)
- [Segurança](#-segurança)
- [Roadmap](#-roadmap)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Autor](#-autor)

---

## 🎬 Demonstração

<div align="center">

> 🔗 **Deploy:** [https://ondjila.vercel.app](https://ondjila.vercel.app) *(Em breve)*

| 📱 Mobile Preview | 🖥️ Desktop Preview |
|:-:|:-:|
| ![Mobile](https://via.placeholder.com/300x600/1a1a2e/ffffff?text=Ondjila+Mobile) | ![Desktop](https://via.placeholder.com/700x400/16213e/ffffff?text=Ondjila+Dashboard) |

</div>

---

## 🚗 Sobre o Projeto

**Ondjila** — palavra de origem *Kimbundu* que significa **"caminho"** ou **"rota"** — é um sistema web de caronas desenvolvido com foco em mobilidade urbana inteligente para o contexto angolano e africano.

### O Problema

O transporte urbano em cidades como Luanda apresenta desafios diários: congestionamento, custos elevados, segurança reduzida e ausência de alternativas tecnológicas acessíveis. Muitas pessoas realizam percursos semelhantes sem qualquer mecanismo de coordenação.

### A Solução

O Ondjila resolve este problema conectando **motoristas** com lugares disponíveis a **passageiros** que partilham rotas semelhantes, de forma rápida, transparente e segura — diretamente no browser, sem necessidade de instalar qualquer aplicação.

### Diferencial

| Característica | Ondjila | Soluções Tradicionais |
|:---|:---:|:---:|
| Tempo real com mapa interativo | ✅ | ❌ |
| Sem comissão de plataforma | ✅ | ❌ |
| Interface em Português + Inglês | ✅ | ⚠️ |
| Dark Mode nativo | ✅ | ❌ |
| Exportação de relatórios | ✅ | ❌ |
| Open source | ✅ | ❌ |

---

## ✨ Funcionalidades

### 👤 Passageiro

- 🔍 Pesquisar caronas por destino, data e hora
- 📍 Visualizar rota no mapa em tempo real
- 📥 Solicitar carona com um clique
- ⭐ Avaliar e comentar motoristas
- 📊 Histórico de viagens completo
- 📄 Exportar histórico em PDF/CSV
- 🔔 Notificações de confirmação de carona
- 👤 Gestão de perfil pessoal

### 🚘 Motorista

- ➕ Publicar nova carona com rota no mapa
- 📋 Gerir pedidos de passageiros (aceitar/recusar)
- 🗺️ Definir pontos de partida e chegada interativos
- 💺 Configurar número de lugares disponíveis
- 📈 Ver avaliações e feedback recebidos
- 📅 Calendário de caronas agendadas
- 📤 Exportar relatórios de atividade

### 🔧 Administrador

- 📊 Dashboard com métricas globais do sistema
- 👥 Gestão completa de utilizadores
- 🚗 Moderação e gestão de caronas publicadas
- 📋 Relatórios e estatísticas exportáveis
- 🔐 Controlo de permissões e acessos
- 🛡️ Gestão de denúncias e ocorrências
- 🌐 Configurações globais do sistema

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Função |
|:---|:---|:---:|:---|
| **Frontend** | Angular | 17+ | Framework SPA |
| **Frontend** | TypeScript | 5.x | Tipagem estática |
| **Frontend** | SCSS | 3.x | Estilização avançada |
| **Backend** | PHP Puro | 8.x | API REST |
| **Base de Dados** | MySQL | 8.x | Persistência de dados |
| **Mapas** | Google Maps API | Latest | Geolocalização e rotas |
| **Mapas** | Mapbox GL JS | 3.x | Renderização de mapas |
| **Servidor** | Apache / XAMPP | — | Servidor local |
| **Versionamento** | Git + GitHub | — | Controlo de versões |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Angular SPA (Frontend)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │   │
│  │  │Components│  │ Services │  │  Route Guards    │   │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │   │
│  │  │ Modules  │  │  Guards  │  │  Interceptors   │   │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / JSON (REST API)
┌─────────────────────▼───────────────────────────────────────┐
│                    SERVIDOR (Backend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               PHP Puro — API REST                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │   │
│  │  │ Endpoints│  │  Models  │  │  Controllers    │   │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │   │
│  │  │  Auth    │  │   JWT    │  │   Middleware     │   │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ PDO / SQL
┌─────────────────────▼───────────────────────────────────────┐
│                   BASE DE DADOS (MySQL)                      │
│      users · rides · bookings · reviews · notifications     │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    APIS EXTERNAS                             │
│         Google Maps API  ·  Mapbox GL JS                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
ondjila/
│
├── 📁 frontend/                    # Aplicação Angular
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 core/            # Serviços globais, interceptors, guards
│   │   │   │   ├── 📁 services/
│   │   │   │   ├── 📁 guards/
│   │   │   │   └── 📁 interceptors/
│   │   │   ├── 📁 shared/          # Componentes reutilizáveis
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 pipes/
│   │   │   │   └── 📁 directives/
│   │   │   ├── 📁 features/        # Módulos funcionais
│   │   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 passenger/
│   │   │   │   ├── 📁 driver/
│   │   │   │   └── 📁 admin/
│   │   │   └── 📁 layouts/
│   │   ├── 📁 assets/
│   │   ├── 📁 environments/
│   │   └── 📄 styles.scss
│   ├── 📄 angular.json
│   └── 📄 package.json
│
├── 📁 backend/                     # API REST em PHP
│   ├── 📁 src/
│   │   ├── 📁 controllers/         # Lógica de negócio
│   │   │   ├── 📄 AuthController.php
│   │   │   ├── 📄 RideController.php
│   │   │   ├── 📄 BookingController.php
│   │   │   └── 📄 AdminController.php
│   │   ├── 📁 models/              # Acesso a dados
│   │   │   ├── 📄 User.php
│   │   │   ├── 📄 Ride.php
│   │   │   └── 📄 Booking.php
│   │   ├── 📁 middleware/          # Autenticação, CORS, validação
│   │   │   ├── 📄 AuthMiddleware.php
│   │   │   └── 📄 CorsMiddleware.php
│   │   ├── 📁 config/
│   │   │   ├── 📄 database.php
│   │   │   └── 📄 env.php
│   │   └── 📁 utils/
│   │       ├── 📄 JwtHelper.php
│   │       └── 📄 Response.php
│   ├── 📁 routes/
│   │   └── 📄 api.php
│   └── 📄 index.php
│
├── 📁 database/                    # Scripts SQL
│   ├── 📄 schema.sql               # Estrutura das tabelas
│   ├── 📄 seed.sql                 # Dados de exemplo
│   └── 📄 migrations/
│
├── 📄 .env.example
├── 📄 .gitignore
└── 📄 README.md
```

---

## 🚀 Instalação

### Pré-requisitos

Antes de começar, certifica-te de que tens instalado:

- [Node.js](https://nodejs.org/) `>= 18.x`
- [Angular CLI](https://angular.io/cli) `>= 17.x`
- [XAMPP](https://www.apachefriends.org/) ou [WAMP](https://www.wampserver.com/) (Apache + MySQL)
- [Composer](https://getcomposer.org/) *(opcional para dependências PHP)*
- [Git](https://git-scm.com/)

---

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seuuser/ondjila.git
cd ondjila
```

---

### 2️⃣ Configurar o Backend (PHP)

```bash
# Navegar para a pasta do backend
cd backend

# Copiar o ficheiro de configuração
cp .env.example .env

# Editar as variáveis de ambiente
nano .env
```

Preenche o ficheiro `.env` com as tuas credenciais:

```env
# Base de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ondjila_db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=ondjila_super_secret_key_2025
JWT_EXPIRATION=86400

# APIs
GOOGLE_MAPS_KEY=AIzaSy...
MAPBOX_TOKEN=pk.eyJ1...

# Ambiente
APP_ENV=development
APP_URL=http://localhost/ondjila/backend
```

---

### 3️⃣ Configurar o Frontend (Angular)

```bash
# Navegar para a pasta do frontend
cd ../frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp src/environments/environment.example.ts src/environments/environment.ts
```

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost/ondjila/backend/api',
  googleMapsKey: 'AIzaSy...',
  mapboxToken: 'pk.eyJ1...'
};
```

---

### 4️⃣ Iniciar o Servidor Backend

```bash
# Copiar a pasta 'backend' para o htdocs do XAMPP
# Windows: C:\xampp\htdocs\ondjila\backend
# Linux/Mac: /opt/lampp/htdocs/ondjila/backend

# Iniciar Apache e MySQL no painel do XAMPP
# Backend disponível em: http://localhost/ondjila/backend
```

---

### 5️⃣ Iniciar o Frontend Angular

```bash
cd frontend
ng serve
```

> Acede à aplicação em: **[http://localhost:4200](http://localhost:4200)**

---

## 🗄️ Configuração da Base de Dados

### Criar a Base de Dados

```sql
CREATE DATABASE ondjila_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ondjila_db;
```

### Importar o Schema

```bash
# Via terminal MySQL
mysql -u root -p ondjila_db < database/schema.sql

# Via phpMyAdmin
# 1. Aceder a http://localhost/phpmyadmin
# 2. Seleccionar 'ondjila_db'
# 3. Separador 'Import' → seleccionar 'database/schema.sql'
```

### Importar Dados de Exemplo

```bash
mysql -u root -p ondjila_db < database/seed.sql
```

### Diagrama Entidade-Relacionamento (simplificado)

```
┌──────────┐    ┌──────────────┐    ┌──────────┐
│  USERS   │───<│   BOOKINGS   │>───│  RIDES   │
├──────────┤    ├──────────────┤    ├──────────┤
│ id (PK)  │    │ id (PK)      │    │ id (PK)  │
│ name     │    │ user_id (FK) │    │ driver_id│
│ email    │    │ ride_id (FK) │    │ origin   │
│ password │    │ status       │    │ destiny  │
│ role     │    │ created_at   │    │ seats    │
│ avatar   │    └──────────────┘    │ date     │
│ phone    │                        │ price    │
│ lang     │    ┌──────────────┐    │ status   │
│ theme    │───<│   REVIEWS    │    └──────────┘
│ verified │    ├──────────────┤
└──────────┘    │ id (PK)      │
                │ reviewer_id  │
                │ reviewed_id  │
                │ rating       │
                │ comment      │
                └──────────────┘
```

---

## 🗺️ APIs Utilizadas

### Google Maps Platform

| Serviço | Utilização |
|:---|:---|
| Maps JavaScript API | Renderização do mapa interativo |
| Directions API | Cálculo de rotas entre dois pontos |
| Geocoding API | Conversão de endereços em coordenadas |
| Places API | Sugestões autocomplete de localização |

```typescript
// Exemplo de uso no Angular
import { GoogleMapsModule } from '@angular/google-maps';

// Calcular rota entre dois pontos
const directionsService = new google.maps.DirectionsService();
directionsService.route({
  origin: { lat: -8.8368, lng: 13.2343 },        // Luanda
  destination: { lat: -8.9021, lng: 13.1869 },   // Destino
  travelMode: google.maps.TravelMode.DRIVING
}, (result, status) => {
  if (status === 'OK') this.directionsRenderer.setDirections(result);
});
```

### Mapbox GL JS

```typescript
// Alternativa para renderização de mapas
mapboxgl.accessToken = environment.mapboxToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [13.2343, -8.8368],
  zoom: 12
});
```

---

## 🔐 Sistema de Autenticação

O sistema implementa autenticação baseada em **JWT (JSON Web Tokens)**, com separação clara de permissões por tipo de utilizador.

### Fluxo de Autenticação

```
Utilizador
    │
    ├──► POST /api/auth/register ──► Validação ──► Hash da senha ──► Base de Dados
    │
    ├──► POST /api/auth/login ──────► Verificação ──► Gerar JWT ──► Devolver Token
    │
    ├──► GET  /api/rides (com JWT) ──► Middleware valida token ──► Resposta
    │
    └──► POST /api/auth/logout ─────► Invalidar token (blacklist)
```

### Tipos de Utilizadores e Permissões

| Permissão | Passageiro | Motorista | Administrador |
|:---|:---:|:---:|:---:|
| Ver caronas disponíveis | ✅ | ✅ | ✅ |
| Solicitar carona | ✅ | ❌ | ❌ |
| Publicar carona | ❌ | ✅ | ✅ |
| Gerir utilizadores | ❌ | ❌ | ✅ |
| Ver dashboard global | ❌ | ❌ | ✅ |
| Moderar conteúdos | ❌ | ❌ | ✅ |

### Implementação no Backend (PHP)

```php
// middleware/AuthMiddleware.php
class AuthMiddleware {
    public static function authenticate(): ?array {
        $token = self::extractToken();
        if (!$token) Response::unauthorized('Token não fornecido');
        
        try {
            return JwtHelper::verify($token);
        } catch (Exception $e) {
            Response::unauthorized('Token inválido ou expirado');
        }
    }
    
    public static function requireRole(string $role): void {
        $payload = self::authenticate();
        if ($payload['role'] !== $role) {
            Response::forbidden('Acesso negado');
        }
    }
}
```

### Recuperação de Senha

```
1. Utilizador submete email
2. Sistema gera token único (24h validade)
3. Email enviado com link de reset
4. Utilizador define nova senha
5. Token invalidado após uso
```

---

## ⚡ Funcionalidades Avançadas

### 🗺️ Mapas Interativos
- Visualização de rotas em tempo real
- Marcadores personalizados para origem e destino
- Estimativa de tempo e distância
- Modo escuro no mapa (dark tiles)

### 🌙 Dark Mode
Alternância entre modo claro e escuro persistida via `localStorage`, aplicada globalmente via variáveis CSS:

```scss
// styles.scss
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a2e;
}

[data-theme="dark"] {
  --bg-primary: #0f0e17;
  --text-primary: #fffffe;
}
```

### 🌐 Multi-idioma (i18n)
Suporte completo a **Português** e **Inglês** com `@ngx-translate`:

```typescript
// Uso nos templates
{{ 'RIDES.SEARCH' | translate }}

// Troca de idioma
this.translate.use('en');  // ou 'pt'
```

### 📤 Exportação de Dados

| Formato | Conteúdo | Quem pode exportar |
|:---|:---|:---|
| PDF | Histórico de viagens formatado | Passageiro, Motorista |
| CSV | Dados brutos de viagens | Administrador |
| PDF | Relatório de atividade do sistema | Administrador |

```typescript
// Exportação PDF com jsPDF
import jsPDF from 'jspdf';

exportarHistorico(): void {
  const doc = new jsPDF();
  doc.text('Histórico de Caronas — Ondjila', 20, 20);
  // ... adicionar dados
  doc.save('historico-ondjila.pdf');
}
```

---

## 📸 Screenshots

<div align="center">

### 🏠 Landing Page
![Landing](https://via.placeholder.com/800x450/0f0e17/fffffe?text=Ondjila+—+Landing+Page)

---

### 📊 Dashboard do Motorista
![Dashboard](https://via.placeholder.com/800x450/1a1a2e/fffffe?text=Dashboard+Motorista)

---

### 🗺️ Mapa de Caronas
![Mapa](https://via.placeholder.com/800x450/16213e/fffffe?text=Mapa+Interativo)

---

### 🌙 Dark Mode
![DarkMode](https://via.placeholder.com/800x450/0f0e17/f72585?text=Dark+Mode)

---

### 📱 Mobile View
![Mobile](https://via.placeholder.com/375x812/1a1a2e/fffffe?text=Mobile+Responsive)

</div>

---

## 📱 Responsividade

O Ondjila foi desenvolvido com abordagem **Mobile First**, garantindo uma experiência fluída em qualquer dispositivo.

| Dispositivo | Breakpoint | Suporte |
|:---|:---:|:---:|
| Mobile (portrait) | `< 576px` | ✅ Completo |
| Mobile (landscape) | `576px – 767px` | ✅ Completo |
| Tablet | `768px – 991px` | ✅ Completo |
| Desktop | `992px – 1199px` | ✅ Completo |
| Desktop large | `≥ 1200px` | ✅ Completo |

```scss
// Exemplo de breakpoints em SCSS
$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px
);

@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

---

## 🛡️ Segurança

| Camada | Medida | Implementação |
|:---|:---|:---|
| **Autenticação** | JWT com expiração | `JwtHelper::verify()` |
| **Senhas** | Hash bcrypt (custo 12) | `password_hash()` |
| **SQL Injection** | PDO com prepared statements | `$stmt->bindParam()` |
| **XSS** | Sanitização de inputs | `htmlspecialchars()` |
| **CORS** | Headers controlados | `CorsMiddleware.php` |
| **Rotas** | Guards no Angular | `AuthGuard`, `RoleGuard` |
| **Uploads** | Validação de tipo e tamanho | MIME type check |
| **Rate Limiting** | Limite de requests por IP | Middleware PHP |

```php
// Exemplo de prepared statement seguro
class RideModel {
    public function findByDestination(string $destination): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM rides WHERE destination LIKE ? AND status = 'active'"
        );
        $stmt->execute(["%{$destination}%"]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

---

## 🔭 Roadmap

```
✅ v1.0 — Lançamento inicial
   ├── Sistema de autenticação completo
   ├── CRUD de caronas
   ├── Mapas interativos
   ├── Dark Mode + i18n
   └── Exportação PDF/CSV

🔄 v1.1 — Em desenvolvimento
   ├── Notificações em tempo real (WebSockets)
   ├── Chat interno entre passageiro e motorista
   └── Sistema de avaliação avançado

📋 v1.2 — Planeado
   ├── Pagamentos integrados (Multicaixa Express / M-Pesa)
   ├── IA para sugestão de caronas compatíveis
   └── Modo offline com Service Workers

🚀 v2.0 — Visão futura
   ├── Aplicação mobile nativa (Angular + Capacitor)
   ├── Análise preditiva de rotas com ML
   ├── Programa de fidelização
   └── API pública para integrações externas
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir com o Ondjila:

```bash
# 1. Faz fork do repositório
# 2. Cria uma branch para a tua feature
git checkout -b feature/nome-da-feature

# 3. Faz commit das tuas alterações
git commit -m "feat: descrição clara da alteração"

# 4. Faz push da branch
git push origin feature/nome-da-feature

# 5. Abre um Pull Request
```

### Convenções de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Uso |
|:---|:---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação (sem lógica) |
| `refactor:` | Reestruturação de código |
| `test:` | Testes |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulta o ficheiro [LICENSE](LICENSE) para mais detalhes.

```
MIT License — Copyright (c) 2025 [Autor]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👨‍💻 Autor

<div align="center">

<br/>

<img src="https://avatars.githubusercontent.com/u/0?v=4" width="120" style="border-radius: 50%;" alt="Avatar"/>

### [Teu Nome Completo]

*Estudante de Engenharia Informática — ISPTEC*

[![GitHub](https://img.shields.io/badge/GitHub-@seuuser-181717?style=for-the-badge&logo=github)](https://github.com/seuuser)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Teu_Nome-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/seuuser)
[![Email](https://img.shields.io/badge/Email-teu@email.com-EA4335?style=for-the-badge&logo=gmail)](mailto:teu@email.com)

<br/>

> *"A tecnologia deve ser um caminho — um Ondjila — para o desenvolvimento."*

<br/>

---

<sub>Desenvolvido com ❤️ em Luanda, Angola — como parte do Laboratório #04 de Engenharia de Software II · ISPTEC · 2025/2026</sub>

</div>
