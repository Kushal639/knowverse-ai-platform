#!/usr/bin/env bash
set -e

echo "🚀 Setting up KnowVerse Full-Stack in GitHub Codespaces..."

# 1. Install AI Service dependencies
echo "📦 Setting up Python AI Service..."
cd /workspace/knowverse/ai-service
python -m pip install --upgrade pip
pip install -r requirements.txt

# 2. Install Backend dependencies & generate Prisma client
echo "📦 Setting up Backend API & MySQL Database..."
cd /workspace/knowverse/backend
npm install
npx prisma generate

# Wait for MySQL to be healthy
echo "⏳ Waiting for MySQL to initialize..."
until nc -z -v -w30 localhost 3306; do
  echo "Waiting for MySQL database connection..."
  sleep 2
done

# Push schema and seed data
npx prisma db push --accept-data-loss
npm run db:seed || npx ts-node prisma/seed.ts || true

# 3. Install Frontend dependencies
echo "📦 Setting up Frontend..."
cd /workspace/knowverse/frontend
npm install

echo "✅ KnowVerse Full-Stack setup complete! You can run 'npm run dev' from /workspace/knowverse to start all services."
