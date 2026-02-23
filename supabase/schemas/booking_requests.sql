create table "bookingrequests" (
    "request_id" bigint generated always as identity primary key,
    "customer_id" bigint not null,
    "listing_id" bigint not null,
    "requested_start_at" timestamptz not null,
    "requested_end_at" timestamptz not null,
    "note" text,
    "status" text not null, 
    "created_at" timestamptz default now(),
    "updated_at" timestamptz default now()
);