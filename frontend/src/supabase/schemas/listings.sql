create table "listings" (
    "listing_id" bigint generated always as identity primary key,
    "student_id" bigint not null,
    "title" text not null,
    "description" text,
    "status" text not null,
    "location_text" text,
    "pricing_type" text not null,
    "price_amount" float8 not null,
    "created_at" timestamptz default now(),
    "updated_at" timestamptz default now()
);