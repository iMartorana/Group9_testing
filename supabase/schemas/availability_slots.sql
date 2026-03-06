create table availabilityslots (
    "slot_id" bigint generated always as identity primary key,
    "student_id" bigint not null,
    "start_at" timestamptz not null,
    "end_at" timestamptz not null,
    "status" text not null
);