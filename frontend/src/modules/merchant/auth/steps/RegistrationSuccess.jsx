import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CleanButton from '../../../../components/auth/CleanButton';

const RegistrationSuccess = ({ merchant }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 48 }} className="text-green-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your merchant account is under review. We'll notify you via email and SMS once approved.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-700 text-xs font-bold">1</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Admin reviews your application</div>
                <div className="text-xs text-gray-500">We verify all submitted documents</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-700 text-xs font-bold">2</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">You'll receive approval notification</div>
                <div className="text-xs text-gray-500">Via email and SMS</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-700 text-xs font-bold">3</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">You can start creating offers</div>
                <div className="text-xs text-gray-500">Access full merchant dashboard</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
          <div className="text-sm font-semibold text-blue-900 mb-1">
            Expected approval time: 24-48 hours
          </div>
          <div className="text-xs text-blue-700">
            We'll review your application as soon as possible
          </div>
        </div>

        <CleanButton
          onClick={() => navigate('/merchant/status')}
          className="mx-auto"
        >
          Check Application Status
        </CleanButton>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccess;
