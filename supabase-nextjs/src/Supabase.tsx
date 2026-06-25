'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';

export const Supabase = () => {
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      console.log('🚀 ~ data:', data);
    })();
  }, []);

  return <div>Supabase</div>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
