create table "reviews" (
    "review_id" bigint generated always as identity primary key,
    "booking_id" bigint not null,
    "reviewer_user_id" bigint not null,
    "reviewee_user_id" bigint not null,
    "rating" integer not null,
    "comment" text,
    "created_at" timestamptz default now()
);