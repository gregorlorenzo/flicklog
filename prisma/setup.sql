-- ##################################################################
-- #                Flicklog - Complete setup.sql                   #
-- ##################################################################


-- ##################################################################
-- #  INITIAL USER AND PERSONAL SPACE SETUP (TRIGGERS & FUNCTIONS)  #
-- ##################################################################

-- Step 1: Add the foreign key constraint...
alter table public."Profile"
  add constraint fk_user
  foreign key (user_id)
  references auth.users (id)
  on delete cascade;

-- Step 2: Create the function that runs on new user creation...
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_space_id uuid;
begin
  insert into public."Profile" (user_id, username, display_name, updated_at)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)),
    coalesce(new.raw_app_meta_data->>'display_name', split_part(new.email, '@', 1)),
    now()
  );

  insert into public."Space" (owner_id, name, type, "updatedAt")
  values (new.id, 'Personal Space', 'PERSONAL', now())
  returning id into new_space_id;

  insert into public."SpaceMember" (user_id, space_id, role)
  values (new.id, new_space_id, 'ADMIN');

  return new;
end;
$$;

-- Step 3: Create the trigger...
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ##################################################################
-- #            ROW LEVEL SECURITY (RLS) POLICIES                   #
-- ##################################################################

-- ---------------------------------------------
-- Table: Space
-- ---------------------------------------------
ALTER TABLE public."Space" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow members to view their own spaces" ON public."Space";
DROP POLICY IF EXISTS "Allow authenticated users to create spaces" ON public."Space";
DROP POLICY IF EXISTS "Allow admins to update their spaces" ON public."Space";
DROP POLICY IF EXISTS "Allow owner to delete their space" ON public."Space";

CREATE POLICY "Allow members to view their own spaces"
ON public."Space" FOR SELECT USING (EXISTS (SELECT 1 FROM public."SpaceMember" WHERE space_id = public."Space".id AND user_id = auth.uid()));
CREATE POLICY "Allow authenticated users to create spaces"
ON public."Space" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to update their spaces"
ON public."Space" FOR UPDATE USING (EXISTS (SELECT 1 FROM public."SpaceMember" WHERE space_id = public."Space".id AND user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Allow owner to delete their space"
ON public."Space" FOR DELETE USING (owner_id = auth.uid());


-- ---------------------------------------------
-- Table: Profile
-- ---------------------------------------------
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public."Profile";
CREATE POLICY "Allow authenticated users to view profiles" ON public."Profile" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow user to update their own profile" ON public."Profile";
CREATE POLICY "Allow user to update their own profile" ON public."Profile" FOR UPDATE USING (user_id = auth.uid());


-- ---------------------------------------------
-- Table: SpaceMember
-- ---------------------------------------------
ALTER TABLE public."SpaceMember" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow members to see other members in the same space" ON public."SpaceMember";
DROP POLICY IF EXISTS "Allow admins to add new members to a space" ON public."SpaceMember";
DROP POLICY IF EXISTS "Allow admins to change member roles" ON public."SpaceMember";
DROP POLICY IF EXISTS "Allow admins to remove members from a space" ON public."SpaceMember";

CREATE POLICY "Allow members to see other members in the same space"
ON public."SpaceMember" FOR SELECT USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."SpaceMember".space_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow admins to add new members to a space"
ON public."SpaceMember" FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."SpaceMember".space_id AND sm.user_id = auth.uid() AND sm.role = 'ADMIN'));
CREATE POLICY "Allow admins to change member roles"
ON public."SpaceMember" FOR UPDATE USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."SpaceMember".space_id AND sm.user_id = auth.uid() AND sm.role = 'ADMIN'));
CREATE POLICY "Allow admins to remove members from a space"
ON public."SpaceMember" FOR DELETE USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."SpaceMember".space_id AND sm.user_id = auth.uid() AND sm.role = 'ADMIN'));


-- ---------------------------------------------
-- Table: LogEntry
-- ---------------------------------------------
ALTER TABLE public."LogEntry" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow members to view log entries in their spaces" ON public."LogEntry";
DROP POLICY IF EXISTS "Allow members to create log entries in their spaces" ON public."LogEntry";
DROP POLICY IF EXISTS "Allow admins to update log entries" ON public."LogEntry";
DROP POLICY IF EXISTS "Allow admins to delete log entries" ON public."LogEntry";

CREATE POLICY "Allow members to view log entries in their spaces"
ON public."LogEntry" FOR SELECT USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."LogEntry".space_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow members to create log entries in their spaces"
ON public."LogEntry" FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."LogEntry".space_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow admins to update log entries"
ON public."LogEntry" FOR UPDATE USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."LogEntry".space_id AND sm.user_id = auth.uid() AND sm.role = 'ADMIN'));
CREATE POLICY "Allow admins to delete log entries"
ON public."LogEntry" FOR DELETE USING (EXISTS (SELECT 1 FROM public."SpaceMember" sm WHERE sm.space_id = public."LogEntry".space_id AND sm.user_id = auth.uid() AND sm.role = 'ADMIN'));


-- ---------------------------------------------
-- Table: Rating
-- ---------------------------------------------
ALTER TABLE public."Rating" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow members to view ratings in their spaces" ON public."Rating";
DROP POLICY IF EXISTS "Allow members to create their own ratings" ON public."Rating";
DROP POLICY IF EXISTS "Allow users to modify their own ratings" ON public."Rating";
DROP POLICY IF EXISTS "Allow users to delete their own ratings" ON public."Rating";

CREATE POLICY "Allow members to view ratings in their spaces"
ON public."Rating" FOR SELECT USING (EXISTS (SELECT 1 FROM public."LogEntry" le JOIN public."SpaceMember" sm ON le.space_id = sm.space_id WHERE le.id = public."Rating".log_entry_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow members to create their own ratings"
ON public."Rating" FOR INSERT WITH CHECK (public."Rating".user_id = auth.uid() AND EXISTS (SELECT 1 FROM public."LogEntry" le JOIN public."SpaceMember" sm ON le.space_id = sm.space_id WHERE le.id = public."Rating".log_entry_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow users to modify their own ratings"
ON public."Rating" FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Allow users to delete their own ratings"
ON public."Rating" FOR DELETE USING (user_id = auth.uid());


-- ---------------------------------------------
-- Table: Comment
-- ---------------------------------------------
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow members to view comments in their spaces" ON public."Comment";
DROP POLICY IF EXISTS "Allow members to create their own comments" ON public."Comment";
DROP POLICY IF EXISTS "Allow users to modify their own comments" ON public."Comment";
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public."Comment";

CREATE POLICY "Allow members to view comments in their spaces"
ON public."Comment" FOR SELECT USING (EXISTS (SELECT 1 FROM public."Rating" r JOIN public."LogEntry" le ON r.log_entry_id = le.id JOIN public."SpaceMember" sm ON le.space_id = sm.space_id WHERE r.id = public."Comment".rating_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow members to create their own comments"
ON public."Comment" FOR INSERT WITH CHECK (public."Comment".user_id = auth.uid() AND EXISTS (SELECT 1 FROM public."Rating" r JOIN public."LogEntry" le ON r.log_entry_id = le.id JOIN public."SpaceMember" sm ON le.space_id = sm.space_id WHERE r.id = public."Comment".rating_id AND sm.user_id = auth.uid()));
CREATE POLICY "Allow users to modify their own comments"
ON public."Comment" FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Allow users to delete their own comments"
ON public."Comment" FOR DELETE USING (user_id = auth.uid());


-- ##################################################################
-- #          REALTIME NOTIFICATION SETUP (BROADCAST)               #
-- ##################################################################

ALTER TABLE public."PendingRating" ENABLE ROW LEVEL SECURITY;

create or replace function public.notify_pending_rating()
returns trigger
language plpgsql
security definer
as $$
begin
  perform realtime.broadcast_changes(
    ('user-notifications:' || new.user_id::text)::text,  -- topic
    'new_pending_rating'::text,                          -- event
    'INSERT'::text,                                      -- operation (using trigger op)
    'PendingRating'::text,                               -- table name
    'public'::text,                                      -- schema name
    new,                                                 -- new record (pass the whole record)
    old                                                  -- old record (pass the variable, it's null on insert)
  );
  return new;
end;
$$;

drop trigger if exists on_pending_rating_created on public."PendingRating";
create trigger on_pending_rating_created
  after insert on public."PendingRating"
  for each row execute procedure public.notify_pending_rating();

create policy "Allow users to read their own notifications"
on "realtime"."messages" for select
to authenticated
using (
  realtime.topic() = 'user-notifications:' || auth.uid()::text
);