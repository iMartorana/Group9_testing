create table "payments" (
    "payment_id" bigint generated always as identity primary key,
    "booking_id" bigint not null,
    "customer_id" bigint not null,
    "student_id" bigint not null,
    "amount" float8 not null,
    "status" text not null,
    "provider" text,
    "provider_payment_id" bigint,
    "created_at" timestamptz default now(),
    "paid_at" timestamptz
);