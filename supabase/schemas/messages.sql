create table "messages" (
    "message_id" bigint generated always as identity primary key,
    "conversation_id" bigint not null,
    "sender_user_id" bigint not null,
    "body" text not null,
    "sent_at" timestamptz not null,
    "read_at" timestamptz
);