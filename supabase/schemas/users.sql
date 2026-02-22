create table "users" (
  "user_id" bigint generated always as identity primary key,
  "email" text unique,
  "role" text default 'customer',
  "first_name" text,
  "last_name" text,
  "phone" integer,
  "bio" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);