-- Create a function to handle bulk notification creation
CREATE OR REPLACE FUNCTION public.create_bulk_notifications(
  notifications jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  )
  SELECT 
    (n->>'user_id')::uuid,
    n->>'title',
    n->>'message',
    n->>'type',
    n->>'related_entity_type',
    (n->>'related_entity_id')::uuid
  FROM jsonb_array_elements(notifications) AS n;
END;
$$;