create table "notifications" (
    "notification_id" bigint generated always as identity primary key,
    "user_id" bigint not null,
    "type" text not null,
    "channel" text not null,
    "status" text not null,
    "created_at" timestamptz default now()
);