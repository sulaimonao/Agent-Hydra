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

3.  **Create environment variables**:
    The server looks for a `.env.local` file. Create one with at least:
    ```bash
    cat <<'EOF' > .env.local
    MODEL=mistral
    OLLAMA_URL=http://localhost:11434
    HYDRA_DB=./hydraflow.db
    HOST=127.0.0.1
    PORT=3000
    EOF
    ```
    Adjust the values to match your Ollama setup or desired database path.

4.  **Start the local API (UI + agent backend)**:
    Use `tsx` so TypeScript sources load without a separate build step.
    ```bash
    npm exec tsx server/index.js
    ```
    The server runs migrations on boot and exposes the agent at `/api/agent/run`.

5.  **Run the tests**:
    ```bash
    npm run test:agent
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
   Ensure the dev server is running (`npm exec tsx server/index.js`), then:
   ```bash
   curl -X POST http://localhost:3000/api/agent/run \
     -H "content-type: application/json" \
     -d '{"goal":"Summarize LLM eval best practices."}'
   ```

### Agent UI Quickstart

1. **Ensure the API is running**
   - Start the backend with the environment variables from the quickstart:
     ```bash
     MODEL=mistral OLLAMA_URL=http://localhost:11434 HYDRA_DB=./hydraflow.db \
     PORT=3001 npm exec tsx server/index.js
     ```
     Using `PORT=3001` keeps the API separate from a UI dev server on `3000`.

2. **Point your UI at the local API**
   - Configure your UI client (for example, a Vite/Next app) to call
     `http://127.0.0.1:3001/api/agent/run`.
   - A quick health check before launching the browser UI:
     ```bash
     curl -X POST http://127.0.0.1:3001/api/agent/run \
       -H "content-type: application/json" \
       -d '{"goal":"List three interesting OSS AI eval projects."}'
     ```

3. **Launch the browser UI**
   - Start your UI project (not included in this repository) with its usual
     dev command once the API above responds successfully. The UI can now
     create and monitor agent runs through the local backend.
