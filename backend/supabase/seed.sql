-- SEED DATA FOR TASKIFY
-- Instructions: 
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this script
-- 3. Replace 'replace-with-your-user-uuid' with your actual User ID from Authentication > Users
-- 4. Click Run

-- VARIABLES
-- We use a temporary variable for the user_id to make it easier to change
-- Note: SQL variables in Supabase script editor might behave differently, so we'll use a WITH clause or just direct replacement instructions.
-- For this script, we will insert data directly.

-- 1. Create a Demo Board
INSERT INTO boards (title, description, user_id)
VALUES 
  ('Product Launch 🚀', 'Tracking tasks for the upcoming Q4 product launch and marketing campaign.', 'replace-with-your-user-uuid') 
RETURNING id;

-- NOTE: You will need the board_id from the above insert to insert lists. 
-- However, since we can't easily chain ID references in a simple copy-paste script without PL/pgSQL, 
-- we will use a more robust PL/pgSQL block to ensure it works in one go.

DO $$
DECLARE 
  v_user_id UUID := 'replace-with-your-user-uuid'; -- <<< REPLACE THIS
  v_board_id BIGINT;
  v_list_todo_id BIGINT;
  v_list_prog_id BIGINT;
  v_list_done_id BIGINT;
BEGIN

  -- Create Board
  INSERT INTO boards (title, description, user_id)
  VALUES ('Product Launch 🚀', 'Tracking tasks for the upcoming Q4 product launch.', v_user_id)
  RETURNING id INTO v_board_id;

  -- Create Lists
  INSERT INTO lists (title, position, board_id) VALUES ('To Do', 0, v_board_id) RETURNING id INTO v_list_todo_id;
  INSERT INTO lists (title, position, board_id) VALUES ('In Progress', 1, v_board_id) RETURNING id INTO v_list_prog_id;
  INSERT INTO lists (title, position, board_id) VALUES ('Done', 2, v_board_id) RETURNING id INTO v_list_done_id;

  -- Create Tasks (To Do)
  INSERT INTO tasks (title, description, rank, list_id, deadline) VALUES 
  ('Competitor Analysis', 'Review top 3 competitors features and pricing.', '0|hzzzzz:', v_list_todo_id, NOW() + INTERVAL '2 days'),
  ('Draft Press Release', 'Write initial draft for the media kit.', '0|i00000:', v_list_todo_id, NOW() + INTERVAL '5 days'),
  ('Update Landing Page', 'New copy and hero images need to be staged.', '0|j00000:', v_list_todo_id, NULL);

  -- Create Tasks (In Progress)
  INSERT INTO tasks (title, description, rank, list_id, deadline) VALUES 
  ('Design Social Assets', 'Create instagram and linkedin banners.', '0|hzzzzz:', v_list_prog_id, NOW() + INTERVAL '1 day'),
  ('QA Testing - Login Flow', 'Fix the issue with password reset email not sending.', '0|i00000:', v_list_prog_id, NOW() + INTERVAL '3 days');

  -- Create Tasks (Done)
  INSERT INTO tasks (title, description, rank, list_id, deadline) VALUES 
  ('Setup Analytics', 'Google Analytics 4 properties created and linked.', '0|hzzzzz:', v_list_done_id, NOW() - INTERVAL '1 day');

END $$;
