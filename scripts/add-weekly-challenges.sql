-- Adding 5-week drawing challenge system with weekly themes
-- Insert the 5-week drawing challenge system

-- Week 1: Daily Environment
INSERT INTO challenges (id, title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
(gen_random_uuid(), '🏠 Draw Your House', 'Week 1: Daily Environment - Draw the place you call home!', 'Draw your house with all the details that make it special - windows, doors, roof, and maybe a garden!', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
(gen_random_uuid(), '🌳 Draw a Tree', 'Week 1: Daily Environment - Create a beautiful tree!', 'Draw a tree with branches, leaves, and maybe some birds or squirrels living in it!', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
(gen_random_uuid(), '☀️ Draw Sun & Clouds', 'Week 1: Daily Environment - Paint the sky!', 'Draw a sunny sky with fluffy clouds. Make the sun happy with a smiling face!', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
(gen_random_uuid(), '🎒 Draw Your School Bag', 'Week 1: Daily Environment - Show us your school bag!', 'Draw your school bag and maybe some of the things you carry inside it!', 1, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');

-- Week 2: Vehicles (safe fantasy + real)
INSERT INTO challenges (id, title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
(gen_random_uuid(), '🚗 Draw Your Dream Car', 'Week 2: Vehicles - Design your perfect car!', 'Draw your dream car - it could be a BMW, a toy car, or even a car that flies!', 2, true, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
(gen_random_uuid(), '🚌 Draw a Bus', 'Week 2: Vehicles - Create a colorful bus!', 'Draw a bus with windows, wheels, and maybe some happy passengers inside!', 2, true, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
(gen_random_uuid(), '🚴 Draw a Bicycle', 'Week 2: Vehicles - Pedal into art!', 'Draw a bicycle with two wheels, handlebars, and maybe a basket for carrying things!', 2, true, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
(gen_random_uuid(), '✈️ Draw a Plane', 'Week 2: Vehicles - Soar through the sky!', 'Draw an airplane with wings, windows, and clouds around it as it flies through the sky!', 2, true, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days');

-- Week 3: Food & Drinks
INSERT INTO challenges (id, title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
(gen_random_uuid(), '🍎 Draw Your Favorite Fruit', 'Week 3: Food & Drinks - Show us your favorite fruit!', 'Draw your favorite fruit - mango, banana, apple, or any fruit you love to eat!', 1, true, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days'),
(gen_random_uuid(), '🍔 Draw a Burger or Pizza', 'Week 3: Food & Drinks - Create delicious food!', 'Draw a yummy burger with all the toppings or a pizza with your favorite ingredients!', 2, true, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days'),
(gen_random_uuid(), '🥤 Draw a Glass of Juice', 'Week 3: Food & Drinks - Refreshing drinks!', 'Draw a tall glass of your favorite juice with maybe a straw and some bubbles!', 1, true, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days'),
(gen_random_uuid(), '🎂 Draw a Birthday Cake', 'Week 3: Food & Drinks - Celebrate with cake!', 'Draw a birthday cake with candles, frosting, and decorations. Make it look delicious!', 2, true, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days');

-- Week 4: Animals & Nature
INSERT INTO challenges (id, title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
(gen_random_uuid(), '🐶 Draw a Dog', 'Week 4: Animals & Nature - Man''s best friend!', 'Draw a friendly dog with floppy ears, a wagging tail, and a happy expression!', 2, true, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '28 days'),
(gen_random_uuid(), '🐟 Draw a Fish', 'Week 4: Animals & Nature - Under the sea!', 'Draw a colorful fish swimming in the water with scales, fins, and maybe some bubbles!', 2, true, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '28 days'),
(gen_random_uuid(), '🦋 Draw a Butterfly', 'Week 4: Animals & Nature - Beautiful wings!', 'Draw a butterfly with colorful wings, patterns, and maybe flying near some flowers!', 2, true, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '28 days'),
(gen_random_uuid(), '🌸 Draw a Flower Garden', 'Week 4: Animals & Nature - Blooming beauty!', 'Draw a garden full of different flowers - roses, sunflowers, daisies, and more!', 3, true, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '28 days');

-- Week 5: Imagination & Creativity
INSERT INTO challenges (id, title, description, prompt, difficulty_level, is_active, start_date, end_date) VALUES
(gen_random_uuid(), '🤖 Draw Your Dream Robot', 'Week 5: Imagination & Creativity - Build a robot friend!', 'Draw a robot with buttons, lights, arms, and legs. What special powers does your robot have?', 3, true, CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days'),
(gen_random_uuid(), '🚀 Draw a Spaceship', 'Week 5: Imagination & Creativity - Blast off to space!', 'Draw a spaceship with rockets, windows, and maybe some aliens or astronauts inside!', 3, true, CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days'),
(gen_random_uuid(), '🏰 Draw a Castle', 'Week 5: Imagination & Creativity - Build a magical castle!', 'Draw a castle with towers, flags, a drawbridge, and maybe a dragon or princess!', 3, true, CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days'),
(gen_random_uuid(), '🦸 Draw Yourself as a Superhero', 'Week 5: Imagination & Creativity - Be the hero!', 'Draw yourself as a superhero with a cape, mask, and special powers. What''s your superpower?', 3, true, CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days');

-- Insert corresponding badges for each week
INSERT INTO badges (id, name, description, icon, criteria) VALUES
(gen_random_uuid(), '🌟 Tree Explorer', 'Completed Week 1: Daily Environment challenges', '🌟', '{"week": 1, "challenges_completed": 4}'),
(gen_random_uuid(), '🚗 Vehicle Master', 'Completed Week 2: Vehicle challenges', '🚗', '{"week": 2, "challenges_completed": 4}'),
(gen_random_uuid(), '🍎 Food Artist', 'Completed Week 3: Food & Drinks challenges', '🍎', '{"week": 3, "challenges_completed": 4}'),
(gen_random_uuid(), '🦋 Nature Friend', 'Completed Week 4: Animals & Nature challenges', '🦋', '{"week": 4, "challenges_completed": 4}'),
(gen_random_uuid(), '🚀 Creative Genius', 'Completed Week 5: Imagination & Creativity challenges', '🚀', '{"week": 5, "challenges_completed": 4}'),
(gen_random_uuid(), '🏆 Challenge Champion', 'Completed all 5 weeks of drawing challenges!', '🏆', '{"all_weeks": true, "challenges_completed": 20}');
