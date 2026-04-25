import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { useApp } from '../../context/AppContext';

// Nav links to display in the new top bar (desktop only)
const navLinks = [
  { label: 'Explore', icon: ExploreRoundedIcon, path: '/explore' },
  { label: 'Saved Objects', icon: BookmarkRoundedIcon, path: '/saved' },
  { label: 'Locations', icon: MapRoundedIcon, path: '/map' },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, unreadCount } = useApp();

  // Determine back navigation context if deeply nested (though mainly handled gracefully by browser)
  const isNested = location.pathname.startsWith('/offer/') || location.pathname.startsWith('/store/');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-border/60 px-4 py-3 flex items-center gap-3">
      
      {/* Mobile: Logo on Left */}
      <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <CardGiftcardRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
        </div>
        <span className="font-display text-base font-bold text-primary tracking-wider">OFFERLY</span>
      </div>

      {/* Desktop: Branding only (removed toggle button) */}
      <div className="hidden lg:flex items-center gap-4 w-64 flex-shrink-0 relative">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <CardGiftcardRoundedIcon sx={{ fontSize: 20 }} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-primary tracking-wide">
            OFFERLY
          </span>
        </div>
      </div>

      {/* Desktop Quick Nav Links (Center) */}
      <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
         {navLinks.map((item) => (
           <button
             key={item.path}
             onClick={() => navigate(item.path)}
             className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
               location.pathname.startsWith(item.path)
                 ? 'text-primary bg-primary/5'
                 : 'text-text-secondary hover:text-text-primary hover:bg-surface'
             }`}
           >
             <item.icon sx={{ fontSize: 20 }} />
             {item.label}
           </button>
         ))}
      </div>

      {/* Right User Actions (Cart, Notifications, Profile) */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search Icon (Desktop only, not on home) */}
        {location.pathname !== '/home' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/search')}
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-surface border border-border/60 hover:bg-white text-text-secondary transition-colors"
          >
            <SearchRoundedIcon sx={{ fontSize: 22 }} />
          </motion.button>
        )}

        {/* Cart Icon (Mobile & Desktop) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/cart')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border/60 hover:bg-white text-text-secondary transition-colors"
        >
          <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
        </motion.button>

        {/* Notifications Icon (Mobile & Desktop) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/notifications')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border/60 hover:bg-white relative text-text-secondary transition-colors"
        >
          <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Profile Avatar (Mobile & Desktop) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center border border-primary/20 cursor-pointer"
        >
          <span className="text-primary font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </motion.button>
      </div>
    </header>
  );
};

export default TopBar;
