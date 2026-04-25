import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

const Section = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-8"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">
      {children}
    </div>
  </motion.div>
);

const LegalPrivacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
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

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
          >
            <SecurityRoundedIcon sx={{ fontSize: 32 }} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black mb-3">Merchant Privacy Policy</h1>
          <p className="text-white/90">Last updated: April 16, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Section title="1. Introduction">
          <p>
            This Privacy Policy explains how Offerly collects, uses, and protects merchant business information 
            on our platform. We are committed to protecting your privacy and handling your data responsibly.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information from merchants:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Business Information:</strong> Store name, category, address, contact details, business license</li>
            <li><strong>Account Information:</strong> Email, phone number, password (encrypted)</li>
            <li><strong>Financial Information:</strong> Bank account details for payouts, subscription payment information</li>
            <li><strong>Store Content:</strong> Product listings, photos, descriptions, offers, pricing</li>
            <li><strong>Transaction Data:</strong> Booking details, revenue, customer interactions</li>
            <li><strong>Usage Data:</strong> Login times, features used, analytics data</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use merchant information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the merchant platform</li>
            <li>Process bookings and payments</li>
            <li>Display your store and offers to customers</li>
            <li>Send important notifications about bookings and account</li>
            <li>Provide customer support</li>
            <li>Analyze platform usage and improve services</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Information Sharing">
          <p>We share merchant information only in these circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>With Customers:</strong> Store name, location, products, offers, and reviews are visible to customers</li>
            <li><strong>Service Providers:</strong> Payment processors, cloud hosting, analytics tools (under strict agreements)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
          </ul>
          <p className="font-semibold">We never sell your business data to third parties.</p>
        </Section>

        <Section title="5. Customer Data Access">
          <p>
            As a merchant, you have access to customer booking information (name, phone, booking details). You must:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use customer data only for fulfilling bookings</li>
            <li>Keep customer information confidential</li>
            <li>Not share, sell, or misuse customer data</li>
            <li>Comply with data protection laws</li>
          </ul>
        </Section>

        <Section title="6. Data Security">
          <p>We implement strong security measures to protect your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Secure authentication and password protection</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and employee training</li>
            <li>Secure payment processing through certified providers</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain merchant data for as long as your account is active. After account closure, we may retain 
            certain information for legal, tax, or audit purposes as required by law.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>As a merchant, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your business data</li>
            <li>Update or correct your information</li>
            <li>Delete your account (subject to legal obligations)</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request information about data processing</li>
          </ul>
        </Section>

        <Section title="9. Cookies and Tracking">
          <p>
            We use cookies and similar technologies to maintain your session, remember preferences, and analyze 
            platform usage. You can control cookies through your browser settings.
          </p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>
            Our platform integrates with third-party services (payment gateways, cloud storage, analytics). 
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </Section>

        <Section title="11. International Data Transfers">
          <p>
            Your data may be processed in servers located in different countries. We ensure appropriate 
            safeguards are in place for international data transfers.
          </p>
        </Section>

        <Section title="12. Changes to Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes 
            via email or platform notification.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            For privacy-related questions or to exercise your rights, contact us at:
          </p>
          <p className="font-semibold">
            Email: privacy@offerly.com<br />
            Phone: +91 1800-OFFERLY<br />
            Address: [Business Address]
          </p>
        </Section>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <p className="text-sm text-blue-900 font-medium">
            Your privacy is important to us. We are committed to protecting your business data and maintaining 
            transparency about our data practices.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPrivacy;
