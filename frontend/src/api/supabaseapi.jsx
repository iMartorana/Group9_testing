import supabase from "../../../supabaseconfig.js"
/*
File to contain wrapper functions that can call supabase functions. 
Supabase configured in supabaseconfig.js
Supabase installed on system using scoop in command line
Supabase commands to retrieve and set up database. Connection should be made already,
so these are for set up. Need docker desktop running
supabase start
supabase migration up
supabase push
supabase pull
Dependencies:
supabase
supabase-js
*/

/*
User definition
create table "users" (
  "user_id" bigint generated always as identity primary key,
  "email" text unique,
  "role" text default 'customer',
  "first_name" text,
  "last_name" text,
  "phone" text,
  "bio" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
*/

//Get user by email. For initial checks and retrieval from login
//Return user set. Should be one element
//Something was going wrong with the functions, so I deleted them for now.
//Best option is likely just to use javascript commands and writing functions here