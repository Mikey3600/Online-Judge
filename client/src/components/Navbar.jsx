import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link to="/" className="text-white font-bold text-lg">Online Judge</Link>
                <div className="flex items-center gap-6">
                    <Link to="/problems" className="text-gray-400 hover:text-white text-sm transition">Problems</Link>
                    <Link to="/leaderboard" className="text-gray-400 hover:text-white text-sm transition">Leaderboard</Link>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="text-gray-300 hover:text-white text-sm transition">{user.fullName}</Link>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-sm transition">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-400 hover:text-white text-sm transition">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
