import Image from 'next/image';
import styles from './page.module.css';
import { Supabase } from '@/Supabase';

export default function Home() {
  return (
    <main className={styles.main}>
      <Supabase />
    </main>
  );
}
