# Publishing Architecture

## Overview
Publishing handles scheduling and pushing content to social media platforms.

## Flow
USER -> CONTENT SERVICE -> PUBLISHING SERVICE -> BUFFER ADAPTER -> SOCIAL NETWORK

## Status
- PLANNED: Buffer Adapter
- PLANNED: Scheduled queue via Supabase pg_cron
