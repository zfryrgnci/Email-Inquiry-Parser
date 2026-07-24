

## 🔗 Explore the App

[**Click here to explore Email-Inquiry-Parser**](https://zfryrgnci.github.io/Email-Inquiry-Parser)

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Architecture-AI_First-purple.svg?style=for-the-badge" alt="Architecture" />

  <h1>📨 Email to Inquiry Parser (AI Ledger)</h1>
  <p><em>A high-precision, AI-powered semantic synthesizer for B2B inbox automation.</em></p>
</div>

---

## 🚀 Overview

The **Email to Inquiry Parser** is an enterprise-ready AI tool designed to ingest unstructured client emails, parse semantic intent using Google's `gemini-3.5-flash` model, and instantly synthesize verified, structured JSON records.

Tired of manually reading dense client requests, extracting contact info, timelines, and budgets, and typing them into a CRM? This application entirely automates the intake pipeline.

## ✨ Key Features
- 🧠 **AI Semantic Node Extraction**: Extracts Budget, Deadlines, Sender Meta, and Core Intent with near-perfect accuracy.
- 🎨 **Premium UI/UX**: Built with React, Tailwind v4, and Framer Motion for a sleek, glassmorphic aesthetic.
- 📊 **Cognitive Blueprinting**: Visualize exactly how the AI maps paragraphs to data structures in real-time.
- ⚡ **Automated Sales Workstation**: Generates immediate contextual follow-up drafts based on the parsed tone and timeline.
- 📈 **Ledger Archiving**: Stores history and exports directly to `.csv` for CRM integration.

## 🛠 Tech Stack
- **Frontend**: React 19, TailwindCSS v4, Vite, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, TypeScript.
- **AI Core**: `@google/genai` (Gemini API) enforcing rigorous JSON schema compliance.

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v24+)
- A Free [Google Gemini API Key](https://aistudio.google.com/)

### 2. Setup
Clone the repo and configure the environment:
```bash
git clone https://github.com/zfryrgnci/email-to-inquiry-parser.git
cd email-to-inquiry-parser
npm install
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_free_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the AI workspace.

## 🧪 Testing Suite
This project implements `Vitest` and `Supertest` for backend route validation:
```bash
npm run test
```

## 🤝 Open Source
Created by [Zafer Yorganci](https://github.com/zfryrgnci). Feel free to fork, star, and use this to optimize your agency or SaaS inbound pipelines!