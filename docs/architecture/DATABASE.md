# Database Architecture

## Overview
VIMERO uses PostgreSQL provided by Supabase.
All business-critical state must be persisted here.

## Core Entities
- PLANNED: Profiles
- PLANNED: Businesses
- PLANNED: Business Members
- PLANNED: Brand Kits, etc.

## Multi-Tenant Approach
- The `business_id` is the primary tenant boundary. Row Level Security (RLS) is used to isolate data between businesses.
