#!/bin/bash

# Aviation Reliability Tracker - Ubuntu Setup Script
# This script sets up and runs the application locally

set -e

echo "🛫 Aviation Reliability Tracker - Setup Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js version 18+ is recommended${NC}"
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "\n📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your database URL${NC}"
fi

# Generate Prisma client
echo -e "\n🔧 Generating Prisma client..."
npx prisma generate

# Check if DATABASE_URL is configured
if grep -q "your-neon-or-supabase-host.com" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL is not configured${NC}"
    echo "Please update DATABASE_URL in .env with your Neon/Supabase connection string"
    echo ""
    echo "Example (Neon):"
    echo "DATABASE_URL=\"postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require\""
    echo ""
    echo "After updating, run:"
    echo "  npx prisma db push"
    echo "  npm run db:seed"
    echo ""
else
    echo -e "\n📊 Pushing database schema..."
    npx prisma db push --skip-generate || echo -e "${YELLOW}Database push skipped (check DATABASE_URL)${NC}"
    
    echo -e "\n🌱 Seeding database..."
    npm run db:seed || echo -e "${YELLOW}Seed skipped (run manually if needed)${NC}"
fi

echo -e "\n${GREEN}✓ Setup complete!${NC}"
echo ""
echo "To start the development server, run:"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo "The app will be available at:"
echo -e "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "For production deployment to Vercel:"
echo -e "  ${GREEN}vercel deploy${NC}"
