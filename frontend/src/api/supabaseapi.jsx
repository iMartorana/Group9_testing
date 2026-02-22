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
  "phone" integer,
  "bio" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
*/

//Get user by email. For initial checks and retrieval from login
//Return user set. Should be one element
export function get_user_by_email(email) {
    const {data, error} = supabase.rpc('get_user_by_email', {emailparam : email});
    if(error == null){
        return data;
    } else {
        console.log(error);
        return error;
    }
} 

//Get user by id
//Return user set. Should be one element
export function get_user_by_id(id) {
    const {data, error} = supabase.rpc('get_user_by_id', {idparam : id});
    if(error == null){
        return data;
    } else {
        console.log(error);
        return error;
    }
}

//Add new user by providing email and role
//Returns new id
export function add_user(email, role) {
    const {data, error} = supabase.rpc('add_user', {emailparam : email, roleparam : role});
    if(error == null){
        return data;
    } else {
        console.log(error);
        return error;
    }
}