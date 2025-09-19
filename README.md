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
