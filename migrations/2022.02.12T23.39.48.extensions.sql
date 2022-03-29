create extension if not exists "citext";
create schema if not exists public;

create function tg__update_timestamps() returns trigger as $$
begin
  NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
  return NEW;
end;
$$ language plpgsql volatile;
comment on function tg__update_timestamps() is
  E'This trigger should be called on all tables with updated_at - it ensures that they cannot be manipulated and that updated_at will always be larger than the previous updated_at.';
