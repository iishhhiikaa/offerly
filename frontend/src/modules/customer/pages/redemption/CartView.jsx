import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';

import { getCart, getMerchantById, getAuthUser } from '../../data/localStorageUtils';
import PageTransition from '../../components/ui/PageTransition';

const CartView = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentCart = getCart();
    setUser(getAuthUser());
    
    if (currentCart && currentCart.merchantId && currentCart.items.length > 0) {
      setCart(currentCart);
      setMerchant(getMerchantById(currentCart.merchantId));
    }
  }, []);

  if (!cart || !merchant) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col pt-safe">
          <div className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-20">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
              <ArrowBackRoundedIcon />
            </button>
            <h1 className="text-lg font-bold text-gray-900 ml-2">Booking Cart</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <ShoppingCartRoundedIcon sx={{fontSize: 40}} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any services or products yet.</p>
            <button 
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
            >
              Explore Offers
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Mathematics Calculations
  const totalBasePrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const totalOfferPrice = cart.items.reduce((sum, item) => sum + (item.product.offerPrice * item.qty), 0);
  const totalDiscount = totalBasePrice - totalOfferPrice;

  const handleProceed = () => {
     // Prepare temporary cart draft data in memory to pass to QrScreen
     // To mimic user requirements, we'll navigate to /redeem/draft
     navigate('/redeem/draft', { 
       state: {
         isDraft: true,
         reqData: {
           items: cart.items,
           totals: { base: totalBasePrice, discount: totalDiscount, final: totalOfferPrice }
         },
         merchantId: merchant.id
       }
     });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 bg-gray-50 rounded-full">
            <ArrowBackRoundedIcon />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-lg font-bold text-gray-900">Review Booking</h1>
            <p className="text-xs font-semibold text-primary">{merchant.storeName}</p>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-[1200px] mx-auto">
          {/* User & Store Details Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 divide-x divide-gray-100">
             <div className="flex-1">
               <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                 <PersonRoundedIcon sx={{fontSize:14}}/> Customer
               </div>
               <p className="font-bold text-gray-900 leading-tight">{user?.name || 'Guest User'}</p>
               <p className="text-sm text-gray-500 mt-0.5">{user?.phone}</p>
             </div>
             <div className="flex-1 pl-4">
               <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                 <StorefrontRoundedIcon sx={{fontSize:14}}/> Merchant
               </div>
               <p className="font-bold text-gray-900 leading-tight">{merchant.storeName}</p>
               <p className="text-sm text-gray-500 mt-0.5 max-w-[150px] truncate">{merchant.locality}</p>
             </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
               <ReceiptLongRoundedIcon className="text-gray-400" />
               <h3 className="font-bold text-gray-900">Service Items</h3>
             </div>
             
             <div className="space-y-4">
               {cart.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty} × ₹{item.product.offerPrice}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-gray-900">₹{item.product.offerPrice * item.qty}</p>
                      {item.product.price > item.product.offerPrice && (
                         <p className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mt-1">
                           Save ₹{(item.product.price - item.product.offerPrice) * item.qty}
                         </p>
                      )}
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Bill Total */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
             {/* Decorator */}
             <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

             <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Payment Summary</h3>
             
             <div className="space-y-2 mb-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 font-medium">Original Cost</span>
                 <span className="font-semibold text-gray-700">₹{totalBasePrice}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 font-medium">Platform Offer Discount</span>
                 <span className="font-bold text-green-600">- ₹{totalDiscount}</span>
               </div>
             </div>

             <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                <span className="font-bold text-gray-900 text-lg">Total Payable</span>
                <span className="font-black text-primary text-xl">₹{totalOfferPrice}</span>
             </div>

             <div className="mt-4 bg-orange-50 p-3 rounded-lg flex gap-3 border border-orange-100">
               <InfoOutlinedIcon className="text-orange-500 shrink-0" sx={{fontSize: 20}} />
               <p className="text-xs text-orange-800 font-medium leading-relaxed">
                 Payment will be collected offline at the store directly. Generating QR does not deduct any payment online.
               </p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-20">
           <div className="max-w-[1200px] mx-auto">
              <motion.button
                whileTap={{scale: 0.97}}
                onClick={handleProceed}
                className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20"
              >
                <QrCode2RoundedIcon /> Generate Booking QR
              </motion.button>
           </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CartView;
