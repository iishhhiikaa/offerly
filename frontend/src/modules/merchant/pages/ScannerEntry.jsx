import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { getRedemptions, markRedemptionComplete } from '../../customer/data/localStorageUtils';

const BookingVerificationModal = ({ booking, onFulfill, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">Pass Validated</p>
            <h2 className="text-2xl font-bold text-white font-mono leading-none">#{booking.id}</h2>
          </div>
          <div className="bg-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold border border-white/20 backdrop-blur-sm">
            <CheckCircleRoundedIcon sx={{fontSize: 16}} /> Active
          </div>
        </div>

        <div className="p-6 bg-white border-b border-dashed border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary">
              <PersonRoundedIcon />
            </div>
            <div>
              <p className="text-micro text-gray-400 uppercase">Customer</p>
              <p className="font-semibold text-gray-900">{booking.customerName || 'Guest'}</p>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Service Items Requested:</h3>
          <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {booking.items?.map((it, idx) => (
               <div key={idx} className="flex justify-between items-center font-medium">
                 <span className="text-gray-800 text-sm">{it.qty} × {it.product.name}</span>
                 <span className="text-gray-900 font-mono text-sm">₹{it.qty * it.product.offerPrice}</span>
               </div>
            ))}
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Discount Applied: <span className="font-mono">₹{booking.totals.discount}</span></p>
              <p className="font-semibold text-gray-900">Amount to Collect:</p>
            </div>
            <p className="text-3xl font-bold text-primary font-mono">₹{booking.totals.final}</p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors w-1/3"
          >
            Cancel
          </button>
          <button 
            onClick={() => onFulfill(booking.id)}
            className="flex-1 py-4 btn-merchant !rounded-xl text-lg"
          >
            Collect Cash & Fulfill
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ScannerEntry = ({ merchant }) => {
  const [passId, setPassId] = useState('');
  const [error, setError] = useState('');
  const [scannedBooking, setScannedBooking] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!passId.trim() || !merchant) return;
    setError('');
    setSuccessMsg('');
    
    // Format id slightly
    const query = passId.trim().toUpperCase();

    const all = getRedemptions();
    const match = all.find(b => b.id === query && b.merchantId === merchant.id);

    if (!match) {
      setError(`Pass ID "${query}" not found or belongs to another store.`);
    } else if (match.status !== 'pending') {
      setError(`Pass ID "${query}" has already been fulfilled.`);
    } else if (new Date(match.qrExpiry) < new Date()) {
      setError(`Pass ID "${query}" has expired.`);
    } else {
      setScannedBooking(match);
      setPassId('');
    }
  };

  const handleFulfill = (id) => {
     markRedemptionComplete(id);
     setScannedBooking(null);
     setSuccessMsg(`Booking #${id} has been successfully fulfilled!`);
     setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6 lg:space-y-8">
      <div>
        <h1 className="merchant-page-title">Booking Scanner</h1>
        <p className="merchant-page-subtitle">Scan QR or enter customer Pass ID to collect payment.</p>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-primary-50 text-primary p-4 rounded-xl border border-primary-200 flex items-center gap-3 font-bold shadow-sm"
          >
            <CheckCircleRoundedIcon /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 flex-1">
        {/* Live Scanner Mock */}
        <div className="bg-sidebar-dark rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[400px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80')] bg-cover bg-center opacity-10 sepia contrast-125 saturate-0"></div>
          
          <div className="relative z-10 p-6 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 w-full max-w-[260px] aspect-square flex items-center justify-center mb-6">
            {/* Animated corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-xl animate-pulse-slow"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
            <QrCodeScannerRoundedIcon sx={{fontSize: 56}} className="text-white/20" />
            
            <p className="absolute bottom-4 left-0 right-0 text-center text-micro text-white/50 tracking-widest">
              SCAN TICKETS / PASSES<br/>WITH CAMERA
            </p>
          </div>
          <button className="z-10 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-white font-semibold backdrop-blur-sm border border-white/10 transition-all duration-300 hover:shadow-glow-green text-sm">
            Activate Camera
          </button>
        </div>

        {/* Manual Entry */}
        <div className="merchant-card-elevated p-6 lg:p-8 flex flex-col justify-center">
          <div className="w-14 h-14 bg-accent-cool-light text-accent-cool rounded-2xl flex items-center justify-center mb-5">
            <SearchRoundedIcon sx={{fontSize: 28}} />
          </div>
          <h2 className="text-heading text-gray-900 mb-2">Manual Pass Entry</h2>
          <p className="text-gray-500 text-sm font-medium mb-6">
            If the customer's QR code cannot be scanned, enter their 6-character Pass ID (e.g. B-45129) below.
          </p>

          <form onSubmit={handleSearch}>
            <div className="relative mb-4">
              <input 
                type="text" 
                value={passId}
                onChange={(e) => setPassId(e.target.value)}
                placeholder="e.g. B-45129"
                className="w-full bg-white border-2 border-gray-100 text-center uppercase tracking-[0.3em] font-mono font-medium text-2xl py-5 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-sans placeholder:tracking-normal placeholder:lowercase placeholder:text-base"
              />
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}}
                  className="text-accent-rose text-sm font-bold flex items-center gap-1.5 mb-4"
                >
                  <ErrorOutlineRoundedIcon sx={{fontSize: 18}} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              className="btn-merchant-dark w-full !text-base"
              disabled={!passId.trim()}
            >
              Verify Pass ID
            </button>
          </form>

          <div className="mt-6 bg-accent-cool-light/50 p-4 rounded-xl border border-blue-100/50 flex gap-3 text-sm text-blue-800">
            <InfoOutlinedIcon sx={{fontSize: 20}} className="shrink-0 text-accent-cool mt-0.5" />
            <p className="font-medium leading-relaxed">
              Verification will display the total cart amount to collect from the customer in-store.
            </p>
          </div>
        </div>
      </div>

      {scannedBooking && (
        <BookingVerificationModal 
          booking={scannedBooking} 
          onFulfill={handleFulfill}
          onCancel={() => setScannedBooking(null)}
        />
      )}
    </div>
  );
};

export default ScannerEntry;
