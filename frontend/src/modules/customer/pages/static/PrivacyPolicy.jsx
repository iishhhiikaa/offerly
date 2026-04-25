import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PageTransition from '../../components/ui/PageTransition';

const Section = ({ title, children, number, icon: Icon }) => {
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
          {Icon && (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Icon sx={{ fontSize: 18 }} />
            </div>
          )}
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
          className="px-4 sm:px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

const PrivacyPolicy = () => {
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
          <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <SecurityRoundedIcon className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Your Privacy Matters</h2>
              <p className="text-sm text-gray-600">
                Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Section title="Introduction">
              <p>
                At Offerly, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
              </p>
              <p>
                By using Offerly, you consent to the data practices described in this policy. If you do not agree with our 
                policies and practices, please do not use our services.
              </p>
            </Section>

            <Section title="Information We Collect">
              <p><strong>Personal Information:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and contact details (phone number, email address)</li>
                <li>Account credentials and profile information</li>
                <li>Booking and redemption history</li>
              </ul>
              <p><strong>Location Data:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your device's location to show nearby offers</li>
                <li>City and area preferences</li>
              </ul>
              <p><strong>Device Information:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device type, operating system, and browser information</li>
                <li>IP address and device identifiers</li>
              </ul>
              <p><strong>Usage Data:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pages visited, features used, and time spent on the platform</li>
                <li>Search queries and preferences</li>
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Provide Services:</strong> To enable you to browse, book, and redeem offers</li>
                <li><strong>Authentication:</strong> To send OTP for login and verify your identity</li>
                <li><strong>Personalization:</strong> To show relevant offers based on your location and preferences</li>
                <li><strong>Communication:</strong> To send booking confirmations, updates, and promotional offers</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              </ul>
            </Section>

            <Section title="Information Sharing">
              <p><strong>With Merchants:</strong></p>
              <p>
                When you redeem an offer, we share necessary information (name, booking details) with the merchant 
                to facilitate the service.
              </p>
              <p><strong>Service Providers:</strong></p>
              <p>
                We may share data with trusted third-party service providers who assist us in operating the platform 
                (e.g., SMS providers, analytics services).
              </p>
              <p><strong>Legal Requirements:</strong></p>
              <p>
                We may disclose your information if required by law, court order, or government request.
              </p>
              <p><strong>We Do Not Sell Your Data:</strong></p>
              <p>
                Offerly does not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </Section>

            <Section title="Data Security">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure servers with regular security audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular monitoring for suspicious activities</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your 
                data, we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="Your Rights">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Update:</strong> Correct or update your information through your account settings</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from promotional emails and notifications</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@offerly.com
              </p>
            </Section>

            <Section title="Cookies & Tracking">
              <p>
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However, disabling cookies may affect the 
                functionality of the platform.
              </p>
            </Section>

            <Section title="Children's Privacy">
              <p>
                Offerly is not intended for users under the age of 18. We do not knowingly collect personal information 
                from children. If you believe we have inadvertently collected data from a child, please contact us 
                immediately.
              </p>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                requirements. We will notify you of significant changes by posting the updated policy on our platform 
                and updating the "Last Updated" date.
              </p>
              <p>
                Your continued use of Offerly after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <p>
                <strong>Email:</strong> privacy@offerly.com<br />
                <strong>Support:</strong> support@offerly.com<br />
                <strong>Phone:</strong> +91 XXXXX XXXXX
              </p>
            </Section>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-primary/5 rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Your trust is important to us. We are committed to protecting your privacy and handling your data responsibly.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
