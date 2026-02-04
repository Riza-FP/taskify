import { redirect } from 'next/navigation';

export default function Home() {
  // For now, redirect straight to dashboard as if logged in
  redirect('/dashboard');
}
