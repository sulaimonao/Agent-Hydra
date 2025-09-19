# HydraFlow Actions API (Local-First)

This version of HydraFlow has been refactored to run 100% locally, using SQLite as a database and removing all external dependencies.

---

## Quickstart

1.  **Clone this repository**:
    ```bash
    git clone https://github.com/your-username/HydraFlow.git
    cd HydraFlow
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up your environment**:
    Copy the `.env.example` file to `.env.local`.
    ```bash
    cp .env.example .env.local
    ```

4.  **Initialize the database**:
    ```bash
    npm run db:migrate
    ```

5.  **Start the server**:
    ```bash
    npm run dev
    ```

6.  **Run the tests**:
    ```bash
    npm test
    ```

### Agent Quickstart (local-only)

1. **Requirements**
   - [Ollama](https://ollama.com) running locally.
   - Pull a compatible model (default `mistral`):
     ```bash
     ollama pull mistral
     ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run via CLI**
   ```bash
   MODEL=mistral OLLAMA_URL=http://localhost:11434 HYDRA_DB=./hydraflow.db \
   npm run agent -- "Research Whoosh vs Tantivy; save a 150-word note."
   ```

4. **Call over HTTP**
   Ensure the dev server is running (`npm run dev`), then:
   ```bash
   curl -X POST http://localhost:3000/api/agent/run \
     -H "content-type: application/json" \
     -d '{"goal":"Summarize LLM eval best practices."}'
   ```
