#!/bin/bash

# Install dependencies
npm install

# Setup Prisma and database
npx prisma generate
npx prisma db push

# Seed database with initial data
npm run db:seed

# Build the application
npm run build