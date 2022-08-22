const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(
    "https://rmgkkukzcwaywhvkwmky.supabase.co",
    process.env.SUPABASE_API_KEY
);

module.exports = supabase;
