import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (user: any): string => {
    if (!user) return "U";
    if (user?.user_metadata?.full_name) {
      const nameParts = user.user_metadata.full_name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.user_metadata.full_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };
  
  const getDisplayName = (user: any): string => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
      <div className="relative container mx-auto px-6 h-16 flex items-center justify-between">
        {/* --- UPDATED: Replaced image with styled text --- */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-red-500 bg-clip-text text-transparent">
            FitHub
          </div>
        </Link>

        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
          <Link to="/" className="text-white hover:text-purple-400 transition-colors font-medium">
            Home
          </Link>
          <Link to="/ai-models" className="text-white hover:text-purple-400 transition-colors font-medium">
            AI Models
          </Link>
          <Link to="/workout" className="text-white hover:text-purple-400 transition-colors font-medium">
            Workout
          </Link>
        </div>

        <div className="hidden md:flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center justify-center h-10 w-10 rounded-full p-0">
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <AvatarFallback className="text-sm bg-transparent">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                 <div className="px-2 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">{getDisplayName(user)}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center space-x-2 text-white hover:text-purple-400">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 text-white hover:text-purple-400">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300">
              <Link to="/auth">Get Started</Link>
            </button>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800">
          <div className="px-6 py-4 space-y-4">
            <Link to="/" className="block text-white hover:text-purple-400 transition-colors font-medium">
              Home
            </Link>
            <Link to="/ai-models" className="block text-white hover:text-purple-400 transition-colors font-medium">
              AI Models
            </Link>
            <Link to="/workout" className="block text-white hover:text-purple-400 transition-colors font-medium">
              Workout
            </Link>
            {!user && (
              <Link to="/auth" className="block bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-6 rounded-lg text-center">
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
