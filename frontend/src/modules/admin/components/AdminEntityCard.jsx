import React from 'react';
import { motion } from 'framer-motion';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';

const StatBox = ({ icon: Icon, label, value, colorClass = "text-gray-900" }) => (
  <div className="flex flex-col gap-1 p-2 rounded-md bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-300 group/stat">
    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover/stat:text-primary transition-colors">
      <Icon sx={{ fontSize: 12 }} className="opacity-70" />
      {label}
    </div>
    <div className={`text-sm font-black tracking-tight ${colorClass}`}>
      {value === '0' || value === '0.0' || value === '0%' ? (
        <span className="text-gray-300 font-medium">--</span>
      ) : value}
    </div>
  </div>
);

const AdminEntityCard = ({ 
  entity, 
  type = 'merchant', // or 'customer'
  onView, 
  onStatusToggle 
}) => {
  const isMerchant = type === 'merchant';
  const name = isMerchant ? entity.storeName : entity.name;
  const ownerName = isMerchant ? entity.ownerName : null;
  const subtext = entity.phone;
  const location = isMerchant ? `${entity.locality || ''} ${entity.city || ''}` : entity.city || 'N/A';
  const status = entity.status || 'active';
  
  // Dynamic stats based on entity type
  const stats = isMerchant ? [
    { icon: StarRoundedIcon, label: 'Rating', value: entity.avgRating || '0.0', color: 'text-amber-600' },
    { icon: EventAvailableRoundedIcon, label: 'Bookings', value: entity.totalRedemptions || '0', color: 'text-primary' },
    { icon: CancelRoundedIcon, label: 'Cancelled', value: '0%', color: 'text-red-600' },
    { icon: HistoryRoundedIcon, label: 'Missed', value: '0', color: 'text-orange-600' },
    { icon: TimerRoundedIcon, label: 'Accept. Time', value: 'N/A', color: 'text-gray-400' },
    { icon: PaymentsRoundedIcon, label: 'Revenue', value: entity.revenue ? `₹${entity.revenue}` : '0', color: 'text-green-600' },
  ] : [
    { icon: EventAvailableRoundedIcon, label: 'Redemptions', value: entity.redemptionsCount || '0', color: 'text-primary' },
    { icon: PaymentsRoundedIcon, label: 'Total Spend', value: entity.totalSpend ? `₹${entity.totalSpend}` : '0', color: 'text-green-600' },
    { icon: HistoryRoundedIcon, label: 'Activity', value: 'High', color: 'text-amber-600' },
    { icon: StarRoundedIcon, label: 'Loyalty', value: 'Silver', color: 'text-indigo-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:border-primary/20 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Background Accent on Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Top Row: Profile & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-primary font-black text-2xl border-2 border-gray-200 shadow-inner group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 overflow-hidden">
              {entity.logo || entity.logoUrl || entity.profilePhoto ? (
                <img src={entity.logo || entity.logoUrl || entity.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                name?.[0]?.toUpperCase()
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-3 border-white flex items-center justify-center shadow-lg ${
              status === 'approved' || status === 'active' ? 'bg-green-500' : 'bg-amber-500'
            }`}>
              {status === 'approved' || status === 'active' ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 12 }} className="text-white" />
              ) : (
                <HistoryRoundedIcon sx={{ fontSize: 12 }} className="text-white" />
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h3 className="text-gray-900 font-black text-xl leading-tight tracking-tight group-hover:text-primary transition-colors">
                {name}
              </h3>
              {ownerName && (
                <span className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 uppercase tracking-widest">
                  {ownerName}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                <LocalPhoneRoundedIcon sx={{ fontSize: 14 }} className="text-gray-300" />
                <span className="text-gray-500">{subtext}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                <PlaceRoundedIcon sx={{ fontSize: 14 }} className="text-gray-300" />
                <span className="text-gray-500">{location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button 
            onClick={() => onView(entity)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 border-2 border-gray-200 font-black text-[10px] uppercase tracking-[0.15em] shadow-sm hover:shadow-[0_8px_20px_rgba(61,122,79,0.25)]"
          >
            <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
            View Profile
          </button>
          <button 
            onClick={() => onStatusToggle(entity)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-red-500 border-2 border-red-200 hover:border-red-300 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em] shadow-sm hover:shadow-[0_8px_20px_rgba(239,68,68,0.2)]"
          >
            <BlockRoundedIcon sx={{ fontSize: 16 }} />
            {isMerchant ? 'Restrict' : 'Suspend'}
          </button>
        </div>
      </div>

      {/* Bottom: Stats Grid (Visible only on hover) */}
      <div className="max-h-0 group-hover:max-h-96 group-hover:mt-6 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 bg-gray-50/50 rounded-md border border-gray-100">
          {stats.map((stat, idx) => (
            <StatBox key={idx} {...stat} colorClass={stat.color} />
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <div className="px-3 py-1 bg-primary/5 rounded-full text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">
            Real-time Performance Analytics
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminEntityCard;
