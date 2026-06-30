# ShipFlow AI (ShipMate) — AI-Assisted Software Delivery Cockpit

ShipFlow AI (ShipMate) is an event-driven, AI-orchestrated platform designed to manage the entire software product delivery lifecycle. It ingests feature requests, clarifies specifications, drafts Product Requirements Documents (PRDs), compiles ordered engineering backlog tasks, reviews pull requests automatically against PRD acceptance criteria, and squash-merges verified branches directly from a technical cockpit dashboard.

---

## Technical Stack & Architecture

* **Frontend**: Next.js 16 (App Router), TailwindCSS, Shadcn/ui elements, and Phosphor/Hugeicons packages.
* **Authentication**: Better Auth (supporting GitHub & Google OAuth login).
* **Database**: Prisma ORM with PostgreSQL database adapter.
* **Background Processing**: Inngest background workers for serverless event-driven execution.
* **Vector Semantic Context**: Pinecone database serverless namespaces for PR diff chunks indexing and codebase search context generation.
* **AI Engine**: Vercel AI SDK mapping OpenRouter models (`openrouter/free` and `gpt-4o-mini`).

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/shipflow"

# Better Auth Session Secrets
BETTER_AUTH_SECRET="your_generated_secret_string"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub App Configuration (GitHub OAuth & Webhook Octokit)
GITHUB_CLIENT_ID="github_oauth_client_id"
GITHUB_CLIENT_SECRET="github_oauth_client_secret"
GITHUB_APP_ID="github_app_numeric_id"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_WEBHOOK_SECRET="github_webhook_handshake_secret"

# AI Services (OpenRouter & OpenAI Provider keys)
OPENAI_API_KEY="sk-proj-..."
OPENAI_API_BASE="https://api.openai.com/v1" # or OpenRouter endpoints
PINECONE_API_KEY="pinecone_console_api_key"
PINECONE_INDEX="shipflow-index"

# Razorpay Subscriptions (SaaS Billing Limit Enforcement)
RAZORPAY_KEY_ID="rzp_test_key_id"
RAZORPAY_KEY_SECRET="rzp_test_key_secret"
RAZORPAY_PLAN_ID="plan_monthly_pro_subscription_id"
```

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Install Dependencies
```bash
bun install
# or npm install
```

### 2. Generate Prisma Client
Since database migrations may be restricted in sandboxed environments, inspect `prisma/schema.prisma` and generate typing structures:
```bash
npx prisma generate
```

### 3. Start Local Development Tunnel
To route GitHub webhook deliveries to your local machine, spin up an ngrok or localtunnel instance pointing to port 3000:
```bash
ngrok http 3000
```
Update your GitHub App's **Webhook URL** and **Redirect URI** in the GitHub Developer Console with the ngrok forwarding domain (e.g. `https://<hash>.ngrok-free.app/api/github/webhook`).

### 4. Run Inngest Development Server
Inngest schedules and queues background workers locally. Spin up the Inngest CLI dev server pointing to your Next.js serve port:
```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

### 5. Launch next.js Dev Platform
Start your Next.js dashboard client:
```bash
bun run dev
# or npm run dev
```

---

## 🛠️ Workflows & Event Processing

### 1. Requirement Refinement & Planning
* When a feature request is created, select **Generate PRD**.
* Engage with the **AI Assistant Chat** in the details tab. The AI updates the database PRD schema fields dynamically.
* Approve the PRD to automatically trigger **Engineering Task Generation** and populate the project Kanban board.

### 2. Automated Reviews & Verification Loop
* The **Code Review Agent** triggers automatically upon PR `opened`, `synchronize`, or `reopened` webhook events. It saves code chunk embeddings to Pinecone, reviews code, and posts suggestions.
* The **Verification Agent** triggers on review completions (`github/pr.reviewed`) and human GitHub feedback (`github/review.submitted`), auditing code changes against PRD acceptance criteria.
* Once all Kanban tasks are checked as complete, developers can merge the branch directly by clicking **Ship Feature** on the dashboard.
