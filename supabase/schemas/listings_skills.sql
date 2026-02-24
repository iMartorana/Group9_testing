create table "listingsskills" (
    "listing_id" bigint not null,
    "skill_id" bigint not null,
    PRIMARY KEY("listing_id", "skill_id")
);