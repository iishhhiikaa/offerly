import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

import { bookingAPI } from '../../../../api/booking.api';
import { cartAPI } from '../../../../api/cart.api';
import { merchantAPI } from '../../../../api/merchant.api';
import PageTransition from '../../components/ui/PageTransition';
import { useApp } from '../../context/AppContext';
import { useSocket } from '../../../../context/SocketContext';

function formatDateTime(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

const QrScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [isDraft, setIsDraft] = useState(id === 'draft');
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const { user } = useApp();

  const [draftData, setDraftData] = useState(null);
  const [draftMerchantId, setDraftMerchantId] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (id === 'draft') {
        try {
          const cartRes = await cartAPI.getCart();
          const backendCart = cartRes.data;
          
          if (!backendCart || !backendCart.merchantId || !backendCart.items || backendCart.items.length === 0) {
            navigate('/explore');
            return;
          }

          const mId = backendCart.merchantId._id || backendCart.merchantId;
          setDraftMerchantId(mId);

          const totalBasePrice = backendCart.items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
          const totalOfferPrice = backendCart.items.reduce((sum, item) => sum + (item.product.offerPrice * item.qty), 0);
          const totalDiscount = totalBasePrice - totalOfferPrice;

          setDraftData({
            items: backendCart.items,
            totals: { base: totalBasePrice, discount: totalDiscount, final: totalOfferPrice }
          });

          const merchantRes = await merchantAPI.getById(mId);
          if (merchantRes && merchantRes.merchant) {
            setMerchant(merchantRes.merchant);
          }
        } catch (err) {
          console.error("Failed to load draft cart:", err);
          navigate('/explore');
        }
        setLoading(false);
      } else {
        try {
          const response = await bookingAPI.getById(id);
          if (response && response.success) {
            const b = response.data;
            setBooking(b);
            setMerchant(b.merchantId); // API populates merchantId
            setIsDraft(false);
          } else {
            toast.error('Booking not found');
            navigate('/explore');
          }
        } catch (error) {
          console.error('Failed to load booking:', error);
          toast.error('Failed to load booking details');
          navigate('/explore');
        } finally {
          setLoading(false);
        }
      }
    };

    loadBooking();
  }, [id, navigate]);

  const { socket } = useSocket();

  // WebSocket listener for real-time fulfillment notification
  useEffect(() => {
    if (!booking || isDraft || !socket) return;

    const handleNotification = (notification) => {
      if (notification.type === 'booking_fulfilled' &&
          (notification.redemptionId === booking._id || notification.redemptionId === booking.id)) {
        setIsFulfilled(true);
        setBooking(prev => prev ? { ...prev, status: 'completed', scannedAt: new Date().toISOString() } : prev);
      }
    };

    socket.on('user_notification', handleNotification);

    return () => {
      socket.off('user_notification', handleNotification);
    };
  }, [booking?._id, isDraft, socket]);

  // Polling fallback
  useEffect(() => {
    if (!booking || isDraft || isFulfilled || isExpired) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await bookingAPI.getById(id);
        if (response?.data?.status === 'completed') {
           setIsFulfilled(true);
           setBooking(prev => prev ? ({ ...prev, status: 'completed' }) : prev);
        } else if (response?.data?.status === 'expired') {
           setIsExpired(true);
           setBooking(prev => prev ? ({ ...prev, status: 'expired' }) : prev);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [booking?._id, isDraft, isFulfilled, isExpired, id]);

  // Expiry Countdown Timer
  useEffect(() => {
    if (!booking || isDraft || isFulfilled || isExpired || !booking.qrExpiry) return;

    const calculateTimeLeft = () => {
      const difference = new Date(booking.qrExpiry) - new Date();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        setBooking(prev => prev ? { ...prev, status: 'expired' } : prev);
        return;
      }
      
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft(
        `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [booking?.qrExpiry, isDraft, isFulfilled, isExpired]);

  // Wake lock
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };
    if (booking && !isDraft) {
      requestWakeLock();
    }
    return () => {
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [booking?._id, isDraft]);

  const handleSendRequest = async () => {
    setIsRequesting(true);
    try {
      const response = await bookingAPI.create({
        merchantId: draftMerchantId,
        items: draftData.items.map(it => {
          const prod = it.product;
          return {
            productId: prod._id || prod.id,
            product: {
              id: prod._id || prod.id,
              name: prod.name,
              category: prod.category,
              price: prod.price,
              offerPrice: prod.offerPrice,
              isVeg: prod.isVeg,
              duration: prod.duration
            },
            qty: it.qty
          };
        }),
        totals: {
          base: draftData.totals.base,
          discount: draftData.totals.discount,
          final: draftData.totals.final,
          original: draftData.totals.base
        }
      });

      if (response && response.success) {
        await cartAPI.clearCart();
        navigate(`/redeem/${response.data._id || response.data.id}`, { replace: true });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate pass';
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!merchant) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 flex flex-col items-center">
        {/* Top Navbar */}
        <div className="w-full max-w-[1200px] px-4 py-4 flex items-center justify-between z-20 sticky top-0">
          <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <CloseRoundedIcon />
          </button>
          <p className="text-white font-bold tracking-widest text-sm uppercase">{"Service Request"}</p>
          <div className="w-10 h-10" />
        </div>

        {isDraft ? (
          /* ──────── DRAFT REQUEST VIEW ──────── */
          <div className="flex-1 w-full max-w-md mx-auto px-4 pb-24 flex flex-col items-center justify-center">

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full p-6 md:p-8 rounded-3xl shadow-2xl relative"
            >
              {/* Decorative Hole punch top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-950" />

              <div className="text-center mt-2 mb-6 border-b border-dashed border-gray-200 pb-6">
                <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-1">Booking Preview</p>
                <h2 className="text-xl font-bold text-gray-900">{merchant.storeName}</h2>
              </div>

              <div className="space-y-4 mb-6">
                {draftData?.items?.map((it, idx) => {
                  const product = it.product;
                  const productName = typeof product === 'object' ? product.name : 'Product';
                  const productPrice = typeof product === 'object' ? (product.offerPrice || 0) : 0;
                  return (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <span className="font-semibold text-gray-700">{it.qty} × {productName}</span>
                    <span className="font-bold text-gray-900">₹{it.qty * productPrice}</span>
                  </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-600">Total Payable at Store</span>
                <span className="text-xl font-black text-primary">₹{draftData?.totals?.final}</span>
              </div>

              <div className="mt-8">
                <p className="text-center text-xs text-gray-500 mb-4 px-2">
                  Please review your items. Generating a pass locks the service offer until its expiry. No online payment required!
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSendRequest}
                  disabled={isRequesting}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors focus:outline-none bg-primary text-white"
                >
                  {isRequesting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Accept & Send Request</>
                  )}
                </motion.button>
              </div>
            </motion.div>

          </div>
        ) : booking && (
          /* ──────── ACTIVE BOOKING QR PASS VIEW ──────── */
          <div className="flex-1 w-full max-w-md mx-auto px-4 pb-12 flex flex-col items-center">

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white w-full rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
            >
              {/* Header Area */}
              <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
                <CheckCircleRoundedIcon className="text-primary mb-2" sx={{ fontSize: 48 }} />
                <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">Booking<br />Confirmed</h1>
                <p className="text-sm font-medium text-gray-500 mt-2">Pass ID: <span className="font-bold text-gray-800">{booking.internalId || booking.id || booking._id}</span></p>
              </div>

              {/* QR Code Segment */}
              <div className="p-8 flex flex-col items-center justify-center bg-white border-b border-dashed border-gray-200 relative">
                {/* Decorative cutouts */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950" />
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950" />

                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary-500/10 border-2 border-primary-100 mt-2">
                  <QRCodeSVG
                    value={booking.qrToken || booking.id || booking._id}
                    size={180}
                    fgColor="#111827"
                    bgColor="#ffffff"
                    level="H"
                  />
                </div>

                <div className="bg-gray-50 flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold tracking-[0.2em] text-gray-800">
                  {booking.internalId || booking.id || booking._id}
                </div>
              </div>

              {/* Details Segment */}
              <div className="p-6 bg-gray-50/50">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-4">
                  <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} /> Invoice
                </div>
                <div className="p-6 bg-white flex flex-col items-center">
                  <h3 className="font-bold text-gray-900 mb-1">{merchant.storeName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{merchant.locality || merchant.address}</p>

                  {booking.items && booking.items.length > 0 && (
                    <div className="space-y-2.5 mb-4 w-full px-2">
                      {booking.items.map((it, idx) => {
                        const productName = it.product?.name || it.product?.title || 'Product';
                        const productPrice = it.product?.offerPrice || it.product?.discountValue || 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-700">{it.qty} × {productName}</span>
                            <span className="text-gray-900">₹{it.qty * productPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {booking.totals && (
                    <div className="pt-3 flex justify-between items-center border-t border-gray-100 w-full px-2">
                      <span className="font-bold text-gray-900">Total Offline Payment</span>
                      <span className="text-lg font-black text-primary">₹{booking.totals.total || booking.totals.final}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Scanning Instructions */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-8 text-center text-gray-400 space-y-3"
            >
              <KeyboardDoubleArrowDownRoundedIcon className="animate-bounce text-primary" sx={{ fontSize: 32 }} />
              <div className="bg-gray-800/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-700 mx-auto">
                <QrCodeScannerRoundedIcon className="text-white mb-2" />
                <p className="text-sm font-bold text-white mb-1">Show this Pass to the Merchant</p>
                <p className="text-xs text-gray-400">The merchant will verify your ID and scan this QR code to fulfill your booking.</p>
                {isExpired ? (
                  <p className="text-xs font-bold text-red-500 mt-3 flex items-center justify-center gap-1">
                    <InfoOutlinedIcon sx={{ fontSize: 14 }} /> Pass Expired
                  </p>
                ) : (
                  <p className="text-xs font-bold text-orange-400 mt-3 flex items-center justify-center gap-1">
                    <InfoOutlinedIcon sx={{ fontSize: 14 }} /> Expires in {timeLeft}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Fulfilled Overlay */}
        <AnimatePresence>
          {isFulfilled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 48 }} />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Fulfilled!</h2>
                <p className="text-gray-500 font-medium mb-6">
                  Your booking <span className="font-bold text-gray-800">#{booking?.internalId || booking?._id}</span> has been verified by the merchant.
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/home')}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                >
                  Back to Home
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default QrScreen;
