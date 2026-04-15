import { useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanInput from '../../../../components/auth/CleanInput';
import CleanButton from '../../../../components/auth/CleanButton';
import toast from 'react-hot-toast';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const defaultBusinessHours = {
  monday: { open: '09:00', close: '18:00', isClosed: false },
  tuesday: { open: '09:00', close: '18:00', isClosed: false },
  wednesday: { open: '09:00', close: '18:00', isClosed: false },
  thursday: { open: '09:00', close: '18:00', isClosed: false },
  friday: { open: '09:00', close: '18:00', isClosed: false },
  saturday: { open: '09:00', close: '18:00', isClosed: false },
  sunday: { open: '09:00', close: '18:00', isClosed: false },
};

const normalizeBusinessHours = (hours = {}) =>
  days.reduce((acc, day) => {
    const incoming = hours?.[day] || {};
    acc[day] = {
      open: incoming.open ?? defaultBusinessHours[day].open,
      close: incoming.close ?? defaultBusinessHours[day].close,
      isClosed:
        typeof incoming.isClosed === 'boolean'
          ? incoming.isClosed
          : defaultBusinessHours[day].isClosed,
    };
    return acc;
  }, {});

const LocationHoursStep = ({ data, onSubmit, onBack, loading }) => {
  const [formData, setFormData] = useState({
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    pincode: data.pincode || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    businessHours: normalizeBusinessHours(data.businessHours)
  });

  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleUseLocation = () => {
    setLocationLoading(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLocationLoading(false);
          toast.success('Location captured successfully!');
        },
        (error) => {
          setLocationLoading(false);
          toast.error('Location access denied. Please enter manually.');
        }
      );
    } else {
      setLocationLoading(false);
      toast.error('Geolocation not supported by your browser');
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const toggleDayClosed = (day) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          isClosed: !prev.businessHours[day].isClosed,
          // If user re-opens a day with empty values, seed practical defaults.
          open: !prev.businessHours[day].isClosed
            ? prev.businessHours[day].open
            : (prev.businessHours[day].open || defaultBusinessHours[day].open),
          close: !prev.businessHours[day].isClosed
            ? prev.businessHours[day].close
            : (prev.businessHours[day].close || defaultBusinessHours[day].close),
        }
      }
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Location validation is now optional
    /*
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please capture your location';
    }
    */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }

    onSubmit(formData);
  };

  return (
    <CleanCard title="Offerly — Location & Hours" showHeader={false} className="mx-auto">
      <div className="p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Location & Hours
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Help customers find you
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Full Address
            </label>
            <textarea
              name="address"
              placeholder="Shop No., Street, Area, Landmark"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={`w-full bg-[#FAFBFC] border rounded-lg px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all resize-none ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <CleanInput
              label="City"
              type="text"
              name="city"
              placeholder="Bengaluru"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
            />
            
            <CleanInput
              label="State"
              type="text"
              name="state"
              placeholder="Karnataka"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
            />
          </div>

          {/* Pincode */}
          <CleanInput
            label="Pincode"
            type="text"
            inputMode="numeric"
            name="pincode"
            placeholder="560001"
            value={formData.pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setFormData({ ...formData, pincode: val });
            }}
            error={errors.pincode}
          />

          {/* Location Capture */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Pin Your Location
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.latitude && formData.longitude ? (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No location captured yet</div>
              )}
              
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locationLoading}
                className="mt-3 inline-flex items-center gap-2 text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors"
              >
                {locationLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-700/40 border-t-primary-700 rounded-full animate-spin" />
                ) : (
                  <MyLocationRoundedIcon sx={{ fontSize: 18 }} />
                )}
                Use Current Location
              </button>
            </div>
            {errors.location && <p className="text-xs text-red-500 mt-1.5">{errors.location}</p>}
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-3">
              Operating Hours
            </label>
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>

                  <label className="w-[90px] inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!formData.businessHours[day].isClosed}
                      onChange={() => toggleDayClosed(day)}
                      className="w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-700"
                    />
                    <span className={`${formData.businessHours[day].isClosed ? 'text-gray-500' : 'text-gray-700'}`}>
                      {formData.businessHours[day].isClosed ? 'Closed' : 'Open'}
                    </span>
                  </label>

                  <input
                    type="time"
                    value={formData.businessHours[day].open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    disabled={formData.businessHours[day].isClosed}
                    className="h-10 w-[118px] bg-[#FAFBFC] border border-gray-200 rounded-lg px-3 text-sm text-gray-900 focus:bg-white focus:border-primary-700 focus:ring-2 focus:ring-primary-700/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`text-gray-500 ${formData.businessHours[day].isClosed ? 'opacity-50' : ''}`}>to</span>
                  <input
                    type="time"
                    value={formData.businessHours[day].close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    disabled={formData.businessHours[day].isClosed}
                    className="h-10 w-[118px] bg-[#FAFBFC] border border-gray-200 rounded-lg px-3 text-sm text-gray-900 focus:bg-white focus:border-primary-700 focus:ring-2 focus:ring-primary-700/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <CleanButton
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={ArrowBackRoundedIcon}
              iconPosition="left"
            >
              Back
            </CleanButton>

            <CleanButton
              type="submit"
              disabled={loading}
              loading={loading}
              icon={ArrowForwardRoundedIcon}
              className="flex-1"
            >
              Submit for Approval
            </CleanButton>
          </div>
        </form>
      </div>
    </CleanCard>
  );
};

export default LocationHoursStep;
