import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <>
      <Link href={'/page1'}>Go to Page 1</Link>
    </>
  );
}
