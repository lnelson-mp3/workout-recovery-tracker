import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/">Dashboard</Link>
      <Link href="/log-workout">Log Workout</Link>
      <Link href="/history">Workout History</Link>
    </nav>
  );
}
