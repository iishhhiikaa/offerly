import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

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

const LegalTerms = () => {
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
        <h1 className="text-lg font-bold text-gray-900">Terms & Conditions</h1>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
          >
            <DescriptionRoundedIcon sx={{ fontSize: 32 }} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black mb-3">Merchant Terms & Conditions</h1>
          <p className="text-white/90">Last updated: April 16, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Section title="1. Acceptance of Terms">
          <p>
            By registering as a merchant on Offerly Business platform, you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </Section>

        <Section title="2. Merchant Registration">
          <p>
            To become a merchant on Offerly, you must:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete business information</li>
            <li>Have a valid business license and necessary permits</li>
            <li>Maintain an active subscription plan</li>
            <li>Comply with all local laws and regulations</li>
          </ul>
        </Section>

        <Section title="3. Merchant Responsibilities">
          <p>As a merchant, you are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Honoring all offers and deals published on the platform</li>
            <li>Providing accurate product/service descriptions and pricing</li>
            <li>Maintaining quality standards for products and services</li>
            <li>Responding to customer inquiries in a timely manner</li>
            <li>Scanning and verifying customer QR codes properly</li>
            <li>Keeping your store information up to date</li>
          </ul>
        </Section>

        <Section title="4. Offers and Pricing">
          <p>
            All offers created on the platform must be honored for the specified validity period. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Refuse to honor valid bookings</li>
            <li>Change prices after a customer has booked</li>
            <li>Add hidden charges or fees</li>
            <li>Discriminate against Offerly customers</li>
          </ul>
        </Section>

        <Section title="5. Payment and Subscription">
          <p>
            Merchants must maintain an active subscription to use the platform. Subscription fees are non-refundable. 
            If your subscription expires, your store will be temporarily deactivated until renewal.
          </p>
        </Section>

        <Section title="6. Commission and Fees">
          <p>
            Offerly may charge a commission on bookings or subscription fees as per your selected plan. 
            All fees and commission structures will be clearly communicated before you agree to them.
          </p>
        </Section>

        <Section title="7. Customer Data">
          <p>
            You will have access to customer booking information. You must:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Keep customer data confidential</li>
            <li>Use data only for fulfilling bookings</li>
            <li>Not share or sell customer information</li>
            <li>Comply with data protection regulations</li>
          </ul>
        </Section>

        <Section title="8. Quality Standards">
          <p>
            Merchants must maintain high quality standards. Offerly reserves the right to suspend or terminate 
            merchants who receive consistent negative reviews or complaints.
          </p>
        </Section>

        <Section title="9. Prohibited Activities">
          <p>Merchants may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create fake or misleading offers</li>
            <li>Manipulate reviews or ratings</li>
            <li>Engage in fraudulent activities</li>
            <li>Violate any laws or regulations</li>
            <li>Harass or discriminate against customers</li>
          </ul>
        </Section>

        <Section title="10. Account Suspension">
          <p>
            Offerly reserves the right to suspend or terminate merchant accounts for violations of these terms, 
            fraudulent activity, or consistent poor performance.
          </p>
        </Section>

        <Section title="11. Intellectual Property">
          <p>
            You retain ownership of your business content (logos, photos, descriptions). By uploading content, 
            you grant Offerly a license to display it on our platform.
          </p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p>
            Offerly is not liable for any indirect, incidental, or consequential damages arising from your use 
            of the platform. Our total liability is limited to the fees paid by you in the last 12 months.
          </p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>
            We may update these terms from time to time. Continued use of the platform after changes constitutes 
            acceptance of the new terms.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            For questions about these terms, please contact us at:
          </p>
          <p className="font-semibold">
            Email: merchant-support@offerly.com<br />
            Phone: +91 1800-OFFERLY
          </p>
        </Section>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <p className="text-sm text-amber-900 font-medium">
            By continuing to use Offerly Business, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalTerms;
