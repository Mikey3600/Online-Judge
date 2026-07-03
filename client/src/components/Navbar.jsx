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
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-green-400 font-bold text-xl">⚖️ Online Judge</Link>
            <div className="flex items-center gap-6">
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition">Problems</Link>
                <Link to="/leaderboard" className="text-gray-400 hover:text-white text-sm transition">Leaderboard</Link>
                {user ? (
                    <>
                        <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition">{user.fullName}</Link>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm transition">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-400 hover:text-white text-sm transition">Login</Link>
                        <Link to="/register" className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-1.5 rounded-lg text-sm transition">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;