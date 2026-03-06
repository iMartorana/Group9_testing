create table "skills" (
    "skill_id" bigint generated always as identity primary key,
    "name" text unique,
    "is_active" bool
);