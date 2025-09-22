-- Insert initial badges
INSERT INTO public.badges (name, description, icon, criteria) VALUES
('First Drawing', 'Created your first masterpiece!', '🎨', '{"type": "drawing_count", "value": 1}'),
('Creative Explorer', 'Completed 5 drawings', '🌟', '{"type": "drawing_count", "value": 5}'),
('Art Master', 'Completed 10 drawings', '👑', '{"type": "drawing_count", "value": 10}'),
('Challenge Starter', 'Completed your first challenge', '🚀', '{"type": "challenge_count", "value": 1}'),
('Challenge Champion', 'Completed 5 challenges', '🏆', '{"type": "challenge_count", "value": 5}'),
('Color Explorer', 'Used 10 different colors', '🌈', '{"type": "color_variety", "value": 10}'),
('Daily Artist', 'Drew for 7 consecutive days', '📅', '{"type": "consecutive_days", "value": 7}')
ON CONFLICT (name) DO NOTHING;

-- Insert initial challenges
INSERT INTO public.challenges (title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
('Draw Your Pet', 'Create a drawing of your favorite animal companion', 'Draw a picture of your pet or a pet you would like to have. Include details like their favorite toy or where they like to sleep!', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Magical Castle', 'Design your dream castle with magical elements', 'Draw a magical castle with towers, flags, and maybe a dragon or unicorn nearby. What makes your castle special?', 2, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Under the Sea', 'Explore the ocean depths with your imagination', 'Create an underwater scene with fish, coral, mermaids, or sea creatures. What treasures might be hidden on the ocean floor?', 2, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Space Adventure', 'Journey to the stars and beyond', 'Draw a space scene with planets, rockets, aliens, or astronauts. What would you discover in outer space?', 3, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('My Dream Room', 'Design the perfect bedroom or playroom', 'Draw your ideal room with all your favorite things. What colors, furniture, and decorations would you include?', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;
