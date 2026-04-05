# Feyn — AI Drive Management Agent

Feyn is an **AI-powered agent** that lets users manage their Google Drive using natural language via WhatsApp or Telegram — eliminating the need to navigate the Drive UI.

---

## What it does

- Retrieve files → “send me my resume pdf”
- Store files → “save this in invoices/2026”
- Search content → “find latest offer letter”

---

## Architecture

```

User (Telegram / WhatsApp)
↓
Messaging Layer (Webhooks)
↓
Feyn Core Server (Node.js + TypeScript)
↓
MCP Agent (Reasoning Brain)
↓
Google Drive API

```

---

## Key Features

- **AI Agent (MCP-based)** for intent → action execution  
- **Natural language interface** over messaging platforms  
- **OAuth2-based Google Drive integration**  
- **Token-based onboarding + identity linking** (Telegram/WhatsApp ↔ Web ↔ Drive)  
- **Modular backend architecture** (auth, messaging, drive, agent)  
- **Structured message normalization + execution pipeline**

---

## Tech Stack

- **Backend:** Node.js, TypeScript, Express  
- **Database:** PostgreSQL, Prisma  
- **AI / Agent:** MCP (Model Context Protocol)  
- **Messaging:** Telegram Bot API, WhatsApp (planned)  
- **Auth:** JWT + OAuth2 (Google Drive)  
- **Infra (dev):** Docker  

---

## Core Flow

1. User messages the agent on Telegram/WhatsApp  
2. If not onboarded → receives a secure onboarding link  
3. User signs in and connects Google Drive  
4. Agent processes natural language requests → executes Drive actions  

---
