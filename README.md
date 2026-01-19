<div align="center">

<img src="https://www.edwinkassier.com/Assets/Monogram.png" alt="Ashes Project Monogram" width="80" height="80">

# Ashes Project Backend Next.js API

**A production-ready Next.js 13+ App Router API with strict engineering standards**

[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 13+](https://img.shields.io/badge/next-13+-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)
[![Code style: Prettier](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)](https://prettier.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## Overview

A rigoriously engineered Next.js API implementing cryptocurrency investment analysis using Domain-Driven Design (DDD). It leverages the modern App Router, strict TypeScript, and comprehensive testing strategies to ensure production reliability.

### Feature Overview

| **Development**    | **Testing**            | **Architecture**     |
| :----------------- | :--------------------- | :------------------- |
| Strict TypeScript  | Unit Tests (Jest)      | Domain-Driven Design |
| Pre-commit hooks   | Integration Tests      | Service Layer        |
| Next.js App Router | E2E Tests (Playwright) | Zod Validation       |
| ESLint + Prettier  | 100% Service Coverage  | Repository Pattern\* |

_\*Repository pattern implementation in progress via Prisma._

---

## Key Features

| **Architecture**     | **Reliability**       | **Performance**    |
| :------------------- | :-------------------- | :----------------- |
| Clean DDD Layers     | Strict Type Safety    | Serverless Ready   |
| Separated Concerns   | Zod Schema Validation | Parallel Execution |
| Dependency Injection | Automated CI/CD       | Edge Compatible    |

### Feature Details

<details>
<summary><b>Architecture</b></summary>

- **Domain-Driven Design**: Logic isolated in `src/domain`
- **Service Layer**: Pure business logic classes (`CryptoAnalysisService`)
- **Route Handlers**: Thin Next.js API routes handling only HTTP & Validation
- **TypeScript**: Strict mode enabled with no `any` policies (mostly)

</details>

<details>
<summary><b>Testing & Quality</b></summary>

- **Unit Tests**: Jest tests for Domain Services
- **Integration Tests**: API Route testing
- **Pre-commit Hooks**: Husky + lint-staged
- **CI Pipeline**: Automated build, test, and lint on push

</details>

---

## System Architecture

### Application Structure

```
ashes-project-backend-next/
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js Route Handlers (Controllers)
│   │   │   └── process_request/
│   ├── domain/                  # Pure Business Domain (DDD)
│   │   ├── crypto/
│   │   │   ├── services/        # Business Logic
│   │   │   ├── schemas/         # Zod Validation
│   │   │   ├── exceptions/      # Domain Errors
│   │   │   └── types/           # Interfaces
│   ├── infrastructure/          # Implementation Details
│   │   ├── database/            # Prisma Client
├── tests/                       # Test Suites
│   ├── unit/                    # Service Tests
│   ├── integration/             # API Tests
│   └── e2e/                     # Playwright Tests
```

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **npm**

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment

Ensure `.env` contains necessary keys (if any).

#### 3. Run Development Server

```bash
npm run dev
```

The API will be available at: **http://localhost:3000/api/process_request**

---

## Testing

### Testing Suite

| **Test Type**  | **Command**         | **Description**                 |
| :------------- | :------------------ | :------------------------------ |
| **All Tests**  | `npm test`          | Run Unit and E2E suites         |
| **Unit Tests** | `npm run test:unit` | Test domain logic with Jest     |
| **E2E Tests**  | `npm run test:e2e`  | Test full flows with Playwright |

---

## Code Quality

### Automated Quality Tools

| **Tool**      | **Command**              | **Purpose**                    |
| :------------ | :----------------------- | :----------------------------- |
| **Typecheck** | `npm run typecheck`      | Strict TypeScript verification |
| **Lint**      | `npm run lint`           | ESLint checks                  |
| **Format**    | `npx prettier --write .` | Code formatting                |

---

## CI/CD Pipeline

The repository uses GitHub Actions for continuous integration.

**Stages:**

1.  **Code Quality**: Linting and Typechecking
2.  **Unit Tests**: Jest execution
3.  **Build**: Next.js build verification
4.  **Deploy**: Automatic deployment to Google Cloud Run (on push to main branches)

---

## API Documentation

### POST /api/process_request

Analyzes a cryptocurrency investment.

**Body:**

```json
{
  "symbol": "BTC",
  "investment": 1000
}
```

**Response (200 OK):**

```json
{
  "result": {
    "symbol": "BTC",
    "profit": 0,
    "growthFactor": 0,
    ...
  },
  "graphData": {
    "points": [...],
    "color": "blue"
  }
}
```

---

## License

MIT
