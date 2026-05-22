# 🧠 Dev Digest — AI News Intelligence Engine

An automated **AI-powered news ingestion and summarization system** that continuously collects developer-focused content from RSS feeds, processes it using LLMs, enriches it with structured insights, and stores it in both local storage and Git version control.

---

## 🚀 Overview

Dev Digest is a personal **AI research intelligence pipeline** that:

- Fetches technical news from multiple RSS feeds  
- Removes duplicates intelligently  
- Uses AI (Groq LLM) to summarize and analyze content  
- Extracts insights, tags, and importance scoring  
- Stores structured knowledge locally  
- Generates markdown-based knowledge notes  
- Maintains Git-based version history automatically  

---

## ⚙️ Architecture
RSS Feeds  
↓  
Normalization Layer  
↓  
Deduplication Engine  
↓  
AI Summarization (Groq LLM)  
↓  
Enrichment Layer  
↓  
Markdown Export  
↓  
Local JSON Database  
↓  
Index Generator  
↓  
Git Auto Commit & Push

---

## ✨ Features

### 📡 RSS Aggregation
- Supports multiple RSS sources  
- Category-based feed organization  
- Automatic article extraction  

---

### 🧠 AI-Powered Intelligence (Groq LLM)
- Converts raw articles into structured insights  
- Generates:
  - Bullet-point summaries  
  - Importance scoring (low / medium / high)  
  - Key insights  
  - Developer-focused impact analysis  
  - Tags for categorization  

---

### 🧹 Deduplication System
- Prevents duplicate processing using hash-based IDs  
- Persistent tracking via local storage  

---

### 📝 Markdown  Vault  
- Automatically generates readable `.md` files  
- Category-based folder structure  
- Developer-friendly notes format  

### 📂 Category Indexing  
- Auto-generates index files per category  
- Helps navigate  base easily  

### 🔁 Git-Based Versioning  
- Every run commits changes automatically  
- Maintains full history of  evolution  

### 🧠 AI Enrichment Engine  
Each article is transformed into:  
- Technical summary  
- Why it matters  
- Industry impact  
- Key insights  
- Tags for classification  

---

## How to Run

### 1. Install dependencies
```bash
npm install
```
### 2. Set up environment variables 
 Create a .env file
```bash
GROQ_API_KEY=your_api_key_here
```
### 3. Run pipeline
```bash
node scripts/run.js
```

## 🔮 Future Roadmap

### Phase 3 — Email Digest System
- Daily/weekly email summaries  
- Personalized AI news digest  
- Subscriber system  

---

### Phase 4 — Frontend Dashboard
- Beautiful UI to browse knowledge  
- Filter by category, importance, tags  
- Search system  
- Article viewer  

---

### Phase 5 — Advanced Intelligence Layer
- Semantic clustering of articles  
- Knowledge graph generation  
- Trend detection across feeds  
- AI “what matters today” digest  

---

### Phase 6 — Agent Mode
- Autonomous research agent  
- Custom topic tracking  
- Auto-learning preferences

## 👤 Author Note

This project, **Dev Digest**, is created and maintained by **Adarsh Ranjan** as an experimental system to explore how AI can transform raw information streams into structured intelligence.

It reflects a broader goal: building personal systems that help developers stay informed without drowning in information overload.

If you use or extend this project, feel free to adapt it to your own workflow—RSS sources, AI models, and storage strategies can all be customized.

Contributions, ideas, and improvements are welcome.

GitHub: https://github.com/adarsh-aur

---

## 📄 License

This project is licensed under the **MIT License**.

---

Made with ❤️ in India
