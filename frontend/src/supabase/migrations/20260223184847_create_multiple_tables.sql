create extension if not exists "pg_net" with schema "extensions";


  create table "public"."availabilityslots" (
    "slot_id" bigint generated always as identity not null,
    "student_id" bigint not null,
    "start_at" timestamp with time zone not null,
    "end_at" timestamp with time zone not null,
    "status" text not null
      );



  create table "public"."bookingrequests" (
    "request_id" bigint generated always as identity not null,
    "customer_id" bigint not null,
    "listing_id" bigint not null,
    "requested_start_at" timestamp with time zone not null,
    "requested_end_at" timestamp with time zone not null,
    "note" text,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."bookings" (
    "bookings_id" bigint generated always as identity not null,
    "request_id" bigint not null,
    "customer_id" bigint not null,
    "listing_id" bigint not null,
    "start_at" timestamp with time zone not null,
    "end_at" timestamp with time zone not null,
    "status" text not null,
    "agreed_price_amount" double precision not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."conversations" (
    "conversation_id" bigint generated always as identity not null,
    "request_id" bigint,
    "booking_id" bigint,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."listings" (
    "listing_id" bigint generated always as identity not null,
    "student_id" bigint not null,
    "title" text not null,
    "description" text,
    "status" text not null,
    "location_text" text,
    "pricing_type" text not null,
    "price_amount" double precision not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."listingsskills" (
    "listing_id" bigint not null,
    "skill_id" bigint not null
      );



  create table "public"."messages" (
    "message_id" bigint generated always as identity not null,
    "conversation_id" bigint not null,
    "sender_user_id" bigint not null,
    "body" text not null,
    "sent_at" timestamp with time zone not null,
    "read_at" timestamp with time zone
      );



  create table "public"."notifications" (
    "notification_id" bigint generated always as identity not null,
    "user_id" bigint not null,
    "type" text not null,
    "channel" text not null,
    "status" text not null,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."payments" (
    "payment_id" bigint generated always as identity not null,
    "booking_id" bigint not null,
    "customer_id" bigint not null,
    "student_id" bigint not null,
    "amount" double precision not null,
    "status" text not null,
    "provider" text,
    "provider_payment_id" bigint,
    "created_at" timestamp with time zone default now(),
    "paid_at" timestamp with time zone
      );



  create table "public"."reviews" (
    "review_id" bigint generated always as identity not null,
    "booking_id" bigint not null,
    "reviewer_user_id" bigint not null,
    "reviewee_user_id" bigint not null,
    "rating" integer not null,
    "comment" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."skills" (
    "skill_id" bigint generated always as identity not null,
    "name" text,
    "is_active" boolean
      );



  create table "public"."studentskills" (
    "student_id" bigint not null,
    "skill_id" bigint not null,
    "proficiency" integer,
    "interest" integer
      );


CREATE UNIQUE INDEX availabilityslots_pkey ON public.availabilityslots USING btree (slot_id);

CREATE UNIQUE INDEX bookingrequests_pkey ON public.bookingrequests USING btree (request_id);

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (bookings_id);

CREATE UNIQUE INDEX bookings_request_id_key ON public.bookings USING btree (request_id);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (conversation_id);

CREATE UNIQUE INDEX listings_pkey ON public.listings USING btree (listing_id);

CREATE UNIQUE INDEX listingsskills_pkey ON public.listingsskills USING btree (listing_id, skill_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (message_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (notification_id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (payment_id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (review_id);

CREATE UNIQUE INDEX skills_name_key ON public.skills USING btree (name);

CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (skill_id);

CREATE UNIQUE INDEX studentskills_pkey ON public.studentskills USING btree (student_id, skill_id);

alter table "public"."availabilityslots" add constraint "availabilityslots_pkey" PRIMARY KEY using index "availabilityslots_pkey";

alter table "public"."bookingrequests" add constraint "bookingrequests_pkey" PRIMARY KEY using index "bookingrequests_pkey";

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."listings" add constraint "listings_pkey" PRIMARY KEY using index "listings_pkey";

alter table "public"."listingsskills" add constraint "listingsskills_pkey" PRIMARY KEY using index "listingsskills_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."skills" add constraint "skills_pkey" PRIMARY KEY using index "skills_pkey";

alter table "public"."studentskills" add constraint "studentskills_pkey" PRIMARY KEY using index "studentskills_pkey";

alter table "public"."bookings" add constraint "bookings_request_id_key" UNIQUE using index "bookings_request_id_key";

alter table "public"."skills" add constraint "skills_name_key" UNIQUE using index "skills_name_key";

grant delete on table "public"."availabilityslots" to "anon";

grant insert on table "public"."availabilityslots" to "anon";

grant references on table "public"."availabilityslots" to "anon";

grant select on table "public"."availabilityslots" to "anon";

grant trigger on table "public"."availabilityslots" to "anon";

grant truncate on table "public"."availabilityslots" to "anon";

grant update on table "public"."availabilityslots" to "anon";

grant delete on table "public"."availabilityslots" to "authenticated";

grant insert on table "public"."availabilityslots" to "authenticated";

grant references on table "public"."availabilityslots" to "authenticated";

grant select on table "public"."availabilityslots" to "authenticated";

grant trigger on table "public"."availabilityslots" to "authenticated";

grant truncate on table "public"."availabilityslots" to "authenticated";

grant update on table "public"."availabilityslots" to "authenticated";

grant delete on table "public"."availabilityslots" to "service_role";

grant insert on table "public"."availabilityslots" to "service_role";

grant references on table "public"."availabilityslots" to "service_role";

grant select on table "public"."availabilityslots" to "service_role";

grant trigger on table "public"."availabilityslots" to "service_role";

grant truncate on table "public"."availabilityslots" to "service_role";

grant update on table "public"."availabilityslots" to "service_role";

grant delete on table "public"."bookingrequests" to "anon";

grant insert on table "public"."bookingrequests" to "anon";

grant references on table "public"."bookingrequests" to "anon";

grant select on table "public"."bookingrequests" to "anon";

grant trigger on table "public"."bookingrequests" to "anon";

grant truncate on table "public"."bookingrequests" to "anon";

grant update on table "public"."bookingrequests" to "anon";

grant delete on table "public"."bookingrequests" to "authenticated";

grant insert on table "public"."bookingrequests" to "authenticated";

grant references on table "public"."bookingrequests" to "authenticated";

grant select on table "public"."bookingrequests" to "authenticated";

grant trigger on table "public"."bookingrequests" to "authenticated";

grant truncate on table "public"."bookingrequests" to "authenticated";

grant update on table "public"."bookingrequests" to "authenticated";

grant delete on table "public"."bookingrequests" to "service_role";

grant insert on table "public"."bookingrequests" to "service_role";

grant references on table "public"."bookingrequests" to "service_role";

grant select on table "public"."bookingrequests" to "service_role";

grant trigger on table "public"."bookingrequests" to "service_role";

grant truncate on table "public"."bookingrequests" to "service_role";

grant update on table "public"."bookingrequests" to "service_role";

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."listings" to "anon";

grant insert on table "public"."listings" to "anon";

grant references on table "public"."listings" to "anon";

grant select on table "public"."listings" to "anon";

grant trigger on table "public"."listings" to "anon";

grant truncate on table "public"."listings" to "anon";

grant update on table "public"."listings" to "anon";

grant delete on table "public"."listings" to "authenticated";

grant insert on table "public"."listings" to "authenticated";

grant references on table "public"."listings" to "authenticated";

grant select on table "public"."listings" to "authenticated";

grant trigger on table "public"."listings" to "authenticated";

grant truncate on table "public"."listings" to "authenticated";

grant update on table "public"."listings" to "authenticated";

grant delete on table "public"."listings" to "service_role";

grant insert on table "public"."listings" to "service_role";

grant references on table "public"."listings" to "service_role";

grant select on table "public"."listings" to "service_role";

grant trigger on table "public"."listings" to "service_role";

grant truncate on table "public"."listings" to "service_role";

grant update on table "public"."listings" to "service_role";

grant delete on table "public"."listingsskills" to "anon";

grant insert on table "public"."listingsskills" to "anon";

grant references on table "public"."listingsskills" to "anon";

grant select on table "public"."listingsskills" to "anon";

grant trigger on table "public"."listingsskills" to "anon";

grant truncate on table "public"."listingsskills" to "anon";

grant update on table "public"."listingsskills" to "anon";

grant delete on table "public"."listingsskills" to "authenticated";

grant insert on table "public"."listingsskills" to "authenticated";

grant references on table "public"."listingsskills" to "authenticated";

grant select on table "public"."listingsskills" to "authenticated";

grant trigger on table "public"."listingsskills" to "authenticated";

grant truncate on table "public"."listingsskills" to "authenticated";

grant update on table "public"."listingsskills" to "authenticated";

grant delete on table "public"."listingsskills" to "service_role";

grant insert on table "public"."listingsskills" to "service_role";

grant references on table "public"."listingsskills" to "service_role";

grant select on table "public"."listingsskills" to "service_role";

grant trigger on table "public"."listingsskills" to "service_role";

grant truncate on table "public"."listingsskills" to "service_role";

grant update on table "public"."listingsskills" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."payments" to "anon";

grant insert on table "public"."payments" to "anon";

grant references on table "public"."payments" to "anon";

grant select on table "public"."payments" to "anon";

grant trigger on table "public"."payments" to "anon";

grant truncate on table "public"."payments" to "anon";

grant update on table "public"."payments" to "anon";

grant delete on table "public"."payments" to "authenticated";

grant insert on table "public"."payments" to "authenticated";

grant references on table "public"."payments" to "authenticated";

grant select on table "public"."payments" to "authenticated";

grant trigger on table "public"."payments" to "authenticated";

grant truncate on table "public"."payments" to "authenticated";

grant update on table "public"."payments" to "authenticated";

grant delete on table "public"."payments" to "service_role";

grant insert on table "public"."payments" to "service_role";

grant references on table "public"."payments" to "service_role";

grant select on table "public"."payments" to "service_role";

grant trigger on table "public"."payments" to "service_role";

grant truncate on table "public"."payments" to "service_role";

grant update on table "public"."payments" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."skills" to "anon";

grant insert on table "public"."skills" to "anon";

grant references on table "public"."skills" to "anon";

grant select on table "public"."skills" to "anon";

grant trigger on table "public"."skills" to "anon";

grant truncate on table "public"."skills" to "anon";

grant update on table "public"."skills" to "anon";

grant delete on table "public"."skills" to "authenticated";

grant insert on table "public"."skills" to "authenticated";

grant references on table "public"."skills" to "authenticated";

grant select on table "public"."skills" to "authenticated";

grant trigger on table "public"."skills" to "authenticated";

grant truncate on table "public"."skills" to "authenticated";

grant update on table "public"."skills" to "authenticated";

grant delete on table "public"."skills" to "service_role";

grant insert on table "public"."skills" to "service_role";

grant references on table "public"."skills" to "service_role";

grant select on table "public"."skills" to "service_role";

grant trigger on table "public"."skills" to "service_role";

grant truncate on table "public"."skills" to "service_role";

grant update on table "public"."skills" to "service_role";

grant delete on table "public"."studentskills" to "anon";

grant insert on table "public"."studentskills" to "anon";

grant references on table "public"."studentskills" to "anon";

grant select on table "public"."studentskills" to "anon";

grant trigger on table "public"."studentskills" to "anon";

grant truncate on table "public"."studentskills" to "anon";

grant update on table "public"."studentskills" to "anon";

grant delete on table "public"."studentskills" to "authenticated";

grant insert on table "public"."studentskills" to "authenticated";

grant references on table "public"."studentskills" to "authenticated";

grant select on table "public"."studentskills" to "authenticated";

grant trigger on table "public"."studentskills" to "authenticated";

grant truncate on table "public"."studentskills" to "authenticated";

grant update on table "public"."studentskills" to "authenticated";

grant delete on table "public"."studentskills" to "service_role";

grant insert on table "public"."studentskills" to "service_role";

grant references on table "public"."studentskills" to "service_role";

grant select on table "public"."studentskills" to "service_role";

grant trigger on table "public"."studentskills" to "service_role";

grant truncate on table "public"."studentskills" to "service_role";

grant update on table "public"."studentskills" to "service_role";


