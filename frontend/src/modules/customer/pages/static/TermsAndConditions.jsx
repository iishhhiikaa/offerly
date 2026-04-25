import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PageTransition from '../../components/ui/PageTransition';

const Section = ({ title, children, number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
            {number}
          </span>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{title}</h3>
        </div>
        <ExpandMoreRoundedIcon
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 sm:px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

const TermsAndConditions = () => {
  const navigate = useNavigate();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowBackRoundedIcon />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Terms & Conditions</h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-primary/5 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-4">
            <Section number="1" title="Acceptance of Terms">
              <p>
                By accessing and using Offerly ("the Platform"), you agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, please do not use our services.
              </p>
              <p>
                You must be at least 18 years old to use this Platform. By using Offerly, you represent and warrant 
                that you are of legal age to form a binding contract.
              </p>
            </Section>

            <Section number="2" title="User Account">
              <p>
                <strong>Registration:</strong> To access certain features, you must create an account by providing 
                accurate and complete information, including your name, phone number, and email address.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your 
                account credentials and for all activities that occur under your account.
              </p>
              <p>
                <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account if 
                you violate these terms or engage in fraudulent activities.
              </p>
            </Section>

            <Section number="3" title="Using the Service">
              <p>
                Offerly provides a platform to discover and book offers from local merchants. You can browse available 
                offers, view merchant details, and generate booking QR codes for redemption.
              </p>
              <p>
                The Platform is provided for personal, non-commercial use only. You may not use Offerly for any 
                illegal or unauthorized purpose.
              </p>
            </Section>

            <Section number="4" title="Offer Redemption">
              <p>
                <strong>How to Redeem:</strong> After booking an offer, you will receive a unique QR code. Present 
                this QR code to the merchant at the time of service to redeem your offer.
              </p>
              <p>
                <strong>Expiry Rules:</strong> All offers have an expiration date. QR codes must be redeemed before 
                the expiry time mentioned in the booking details.
              </p>
              <p>
                <strong>Non-Transferable:</strong> Bookings and QR codes are non-transferable and can only be used 
                by the account holder who made the booking.
              </p>
              <p>
                <strong>Merchant Discretion:</strong> Merchants reserve the right to refuse service if the QR code 
                is expired, invalid, or if terms of the offer are not met.
              </p>
            </Section>

            <Section number="5" title="Payments & Refunds">
              <p>
                <strong>Payment Process:</strong> Offerly does not process online payments. All payments are made 
                directly to the merchant at the time of service redemption.
              </p>
              <p>
                <strong>No Online Charges:</strong> Generating a booking QR code on Offerly is free and does not 
                deduct any amount from your account.
              </p>
              <p>
                <strong>Refund Policy:</strong> Since no online payment is collected, refunds are handled directly 
                between you and the merchant as per their individual policies.
              </p>
              <p>
                <strong>Cancellation:</strong> You may cancel a booking before redemption. However, once a QR code 
                is scanned and verified by the merchant, the booking cannot be cancelled.
              </p>
            </Section>

            <Section number="6" title="User Conduct">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Platform for any fraudulent or illegal activities</li>
                <li>Create multiple accounts to abuse offers</li>
                <li>Share or sell your booking QR codes</li>
                <li>Harass, abuse, or harm merchants or other users</li>
                <li>Attempt to hack, reverse engineer, or compromise the Platform</li>
                <li>Post false reviews or ratings</li>
              </ul>
              <p>
                Violation of these rules may result in immediate account suspension or termination.
              </p>
            </Section>

            <Section number="7" title="Intellectual Property">
              <p>
                All content on Offerly, including logos, text, graphics, and software, is the property of Offerly 
                or its licensors and is protected by copyright and trademark laws.
              </p>
              <p>
                You may not copy, modify, distribute, or create derivative works from any content on the Platform 
                without our express written permission.
              </p>
            </Section>

            <Section number="8" title="Limitation of Liability">
              <p>
                <strong>Service Availability:</strong> We strive to keep Offerly available at all times, but we do 
                not guarantee uninterrupted access. The Platform may be unavailable due to maintenance or technical issues.
              </p>
              <p>
                <strong>Merchant Responsibility:</strong> Offerly acts as a platform connecting users with merchants. 
                We are not responsible for the quality of services provided by merchants or any disputes arising from 
                merchant-customer interactions.
              </p>
              <p>
                <strong>No Warranties:</strong> The Platform is provided "as is" without warranties of any kind, 
                either express or implied.
              </p>
            </Section>

            <Section number="9" title="Privacy">
              <p>
                Your use of Offerly is also governed by our Privacy Policy. Please review our Privacy Policy to 
                understand how we collect, use, and protect your personal information.
              </p>
              <p>
                By using the Platform, you consent to the collection and use of your data as described in the Privacy Policy.
              </p>
            </Section>

            <Section number="10" title="Changes to Terms">
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting on the Platform.
              </p>
              <p>
                Your continued use of Offerly after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </Section>

            <Section number="11" title="Contact Us">
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <p>
                <strong>Email:</strong> support@offerly.com<br />
                <strong>Phone:</strong> +91 XXXXX XXXXX
              </p>
            </Section>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-sm text-gray-600">
              By using Offerly, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TermsAndConditions;
