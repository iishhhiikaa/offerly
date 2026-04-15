import { useEffect } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const SlideOver = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  footer,
  widthClass = "max-w-md", // Allow customizing width on larger screens
}) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`pointer-events-auto w-screen ${widthClass} transform transition-transform duration-300 ease-in-out`}>
          <div className="flex h-full flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#0E1015] to-[#1A1D24] border-b-4 border-primary flex items-start justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-black text-white">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-3 relative z-10"
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative flex-1 px-6 py-6 overflow-y-auto no-scrollbar">
              {children}
            </div>

            {/* Footer (Actions) */}
            {footer && (
              <div className="flex flex-shrink-0 justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideOver;
