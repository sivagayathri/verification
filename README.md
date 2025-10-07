
---

## **2️⃣ Verification Service README.md**

```markdown
# Credential Verification Service

This is a Node.js (TypeScript) microservice for verifying credentials issued by the Issuance Service. It reads Redis streams and inserts verified credentials into Supabase. It provides a REST API to check if a credential has been issued.

## Features

- Verify credentials via REST API
- Consume Redis stream for newly issued credentials
- Store verification results in Supabase
- Supports multiple scalable workers
- Logs and error handling included

## Tech Stack

- Node.js + TypeScript
- Express.js
- Supabase (PostgreSQL)
- Redis (Upstash)
- Docker for containerization




Folder Structure

verification-service/
│
├─ src/
│  ├─ clients/             # Redis and Supabase client setup
│  ├─ streams/             # Stream helpers & processor
│  ├─ routes/verification.ts # Verification API route
│  └─ index.ts             # Main Express server
│
├─ Dockerfile
├─ package.json
├─ tsconfig.json
└─ README.md