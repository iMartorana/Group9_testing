create table "studentskills" (
    "student_id" bigint,
    "skill_id" bigint,
    "proficiency" integer,
    "interest" integer,
    PRIMARY KEY("student_id", "skill_id")
);