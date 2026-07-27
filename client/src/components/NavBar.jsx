import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-brand">CodeLens</Link>
        <nav className="navbar-links">
          <Link to="/dashboard" className={isActive('/dashboard') || isActive('/repos') ? 'nav-link active' : 'nav-link'}>
            Repos
          </Link>
          <Link to="/history" className={isActive('/history') ? 'nav-link active' : 'nav-link'}>
            History
          </Link>
          <Link to="/file-review" className={isActive('/file-review') ? 'nav-link active' : 'nav-link'}>
            File Review
          </Link>
        </nav>
      </div>
      <div className="navbar-right">
        <span>{user.username}</span>
        <button className="btn btn-secondary" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}