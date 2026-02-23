create table "bookings" (
    "bookings_id" bigint generated always as identity primary key,
    "request_id" bigint unique not null,
    "customer_id" bigint not null,
    "listing_id" bigint not null,
    "start_at" timestamptz not null,
    "end_at" timestamptz not null,
    "status" text not null, 
    "agreed_price_amount" float8 not null,
    "created_at" timestamptz default now(),
    "updated_at" timestamptz default now()
);