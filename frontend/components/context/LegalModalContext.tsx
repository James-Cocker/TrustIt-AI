// src/context/LegalModalContext.tsx (or similar path)
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"; // Adjust path if needed
import { Button } from "@/components/ui/button"; // Adjust path if needed

// Define the shape of the context data
interface LegalModalContextType {
  isTermsOpen: boolean;
  isPrivacyOpen: boolean;
  openTermsModal: () => void;
  openPrivacyModal: () => void;
  // No explicit close needed here as Dialog handles it via onOpenChange
}

// Create the context with a default value (can be null or default object)
const LegalModalContext = createContext<LegalModalContextType | null>(null);

// Define the props for the provider
interface LegalModalProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const LegalModalProvider: React.FC<LegalModalProviderProps> = ({ children }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Functions to open modals
  const openTermsModal = () => setIsTermsOpen(true);
  const openPrivacyModal = () => setIsPrivacyOpen(true);

  // --- Modal Content (copied from original Footer component) ---
  // Ensure you have @tailwindcss/typography installed and configured for the 'prose' class to work
  const termsContent = (
     <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
      <p className="mb-2"><strong>Last updated:</strong> April 17, 2025</p>
      <p className="mb-4">By using TrustIt AI products and services, you agree to these Terms and Conditions. We may update these Terms and Conditions at any time. If we make significant changes, we will notify users who have signed up to our mailing list.</p>
      {/* ... (rest of terms content) ... */}
       <h3 className="text-md font-semibold mt-4 mb-2">Use of Services</h3>
      <p className="mb-4">TrustIt AI uses advanced AI agents to analyse content and identify potential misinformation, helping you make informed decisions about what you read online. You agree to use our website only for lawful purposes and in accordance with these Terms. You must not use our services in any way that breaks laws and regulations.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Intellectual Property</h3>
      <p className="mb-4">Everything on TrustIt AI’s website is protected by copyright. You cannot copy, or use our content for business purposes without our permission.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">External Links</h3>
      <p className="mb-4">Our website may contain links to external sites. TrustIt AI is not responsible for the content or practices of these third-party websites.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Changes to Terms</h3>
      <p className="mb-4">We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of TrustIt AI following any changes indicates your acceptance of the new Terms.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Privacy Policy</h3>
      <p className="mb-4">Your use of TrustIt AI is also covered by our Privacy Policy. Please read it to understand how we handle your personal information. We take your privacy seriously and comply with data protection laws when collecting, processing, and using your information.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Contact Information</h3>
      <p>If you have any questions about these Terms, please contact us through the contact information provided on our website, or email us at: trustit.ai.dev@gmail.com</p>
    </div>
  );

  const privacyContent = (
     <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
      <p className="mb-2"><strong>Last updated:</strong> April 17, 2025</p>
      <p className="mb-4">TrustIt AI is committed to ensuring that your privacy is protected. We may update these Policies at any time. If we make significant changes, we will notify users who have signed up to our mailing list.</p>
       {/* ... (rest of privacy content) ... */}
       <h3 className="text-md font-semibold mt-4 mb-2">Who We Are</h3>
      <p className="mb-4">TrustIt AI uses advanced AI agents to analyse content and identify potential misinformation, helping you make informed decisions about what you read online.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">What We Collect</h3>
      <p className="mb-4">When you interact with us through our website or join our waiting list, we collect the following personal information:</p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li><strong>Name:</strong> To identify and address you.</li>
        <li><strong>Email Address:</strong> To communicate updates, product information, and send relevant notifications.</li>
      </ul>

      <h3 className="text-md font-semibold mt-4 mb-2">How We Use Your Information</h3>
      <p className="mb-4">We use the personal data we collect for the following purposes:</p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li><strong>Communication:</strong> To respond to your inquiries and provide updates about our products.</li>
        <li><strong>Improvement:</strong> To improve our services and products.</li>
      </ul>

      <h3 className="text-md font-semibold mt-4 mb-2">Legal Basis for Processing</h3>
      <p className="mb-4">We process your personal data based on the following lawful grounds:</p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li><strong>Consent:</strong> You consent to us processing your information as outlined in this policy.</li>
        <li><strong>Legitimate Interest:</strong> We may also process your information to improve our services and respond to your inquiries.</li>
      </ul>

      <h3 className="text-md font-semibold mt-4 mb-2">How We Protect Your Information</h3>
      <p className="mb-4">We take the security of your personal information seriously. We implement appropriate technical and organizational measures to safeguard your information against unauthorized access, alteration, or disclosure.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">How Long We Keep Your Data</h3>
      <p className="mb-4">We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy. If you wish to withdraw your consent or request the deletion of your data, please contact us.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Sharing your Data</h3>
      <p className="mb-4">We do not share your personal data with any third parties, except where required by law or as necessary to fulfill our services.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Your Rights</h3>
      <p className="mb-4">Under UK data protection laws, you have the right to:</p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of your inaccurate or incomplete data.</li>
        <li>Request deletion of your personal data (right to be forgotten).</li>
        <li>Withdraw consent at any time, which will not affect the lawfulness of processing before the withdrawal.</li>
      </ul>
      <p className="mb-4">To exercise any of these rights, please contact us at trustit.ai.dev@gmail.com</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Changes to This Policy</h3>
      <p className="mb-4">We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Contact Us</h3>
      <p>If you have any questions about this Privacy Policy or how we handle your personal data. Please contact us at: trustit.ai.dev@gmail.com</p>
    </div>
  );

  // Value provided by the context
  const value = {
    isTermsOpen,
    isPrivacyOpen,
    openTermsModal,
    openPrivacyModal,
  };

  return (
    <LegalModalContext.Provider value={value}>
      {/* Render children components */}
      {children}

      {/* Render the Modals themselves here, controlled by the provider's state */}
      {/* Terms Modal */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        {/* No DialogTrigger needed here as it's triggered via context functions */}
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            {termsContent}
          </DialogDescription>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
         {/* No DialogTrigger needed here as it's triggered via context functions */}
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            {privacyContent}
          </DialogDescription>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </LegalModalContext.Provider>
  );
};

// Custom hook to easily consume the context
export const useLegalModal = (): LegalModalContextType => {
  const context = useContext(LegalModalContext);
  if (!context) {
    throw new Error('useLegalModal must be used within a LegalModalProvider');
  }
  return context;
};
