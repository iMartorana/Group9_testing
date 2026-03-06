create table "conversations" (
    "conversation_id" bigint generated always as identity primary key,
    "request_id" bigint,
    "booking_id" bigint,
    "created_at" timestamptz default now()
);