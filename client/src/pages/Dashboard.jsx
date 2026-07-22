import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome, {user?.username}</h1>
      <p>Repo list will go here (Day 4).</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}