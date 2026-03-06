create table if not exists reviews (
  id bigserial primary key,
  student_email text not null,
  client_email text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamptz default now()
);

create unique index if not exists uniq_review_per_client_student
on reviews (student_email, client_email);

create index if not exists idx_reviews_student_email
on reviews (student_email);