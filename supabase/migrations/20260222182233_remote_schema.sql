drop extension if exists "pg_net";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_user(emailparam text, roleparam text)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
  new_row bigint;
begin
  insert into users(role, email, first_name, last_name)
  values (add_user.roleparam, add_user.emailparam, 'Firstname', 'Lastname')
  returning user_id into new_row;

  return new_row;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_by_email(emailparam text)
 RETURNS SETOF public.users
 LANGUAGE sql
AS $function$
  select * from users
  where users.email = emailparam;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_by_id(idparam bigint)
 RETURNS SETOF public.users
 LANGUAGE sql
AS $function$
  select * from users 
  where users.user_id = idparam;
$function$
;


