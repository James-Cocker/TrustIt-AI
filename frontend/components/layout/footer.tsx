// Add "use client" directive because we are using React hooks (useState)
"use client";

import React from 'react';
import { useLegalModal } from '@/components/context/LegalModalContext';
// Import Button if needed for styling (though DialogClose might handle this)
// import { Button } from "@/components/ui/button"; // Likely not needed directly in Footer

// --- Footer Component ---

// Define the props type if you expect any props, otherwise use React.FC or React.FunctionComponent
const Footer: React.FC = () => {
  const { openTermsModal, openPrivacyModal } = useLegalModal();

  return (
    // Footer element with Tailwind CSS styling
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm">
        {/* Copyright Info */}
        <div className="mb-4 sm:mb-0">
          &copy; {new Date().getFullYear()} TrustIt AI. All rights reserved.
        </div>

        {/* Legal Links Container */}
        <div className="flex space-x-4">

          {/* Terms and Conditions Link */}
          <button
            className="hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer underline focus:outline-none"
            onClick={openTermsModal}
            type="button" // Ensure it doesn't submit forms
          >
            Terms and Conditions
          </button>

          {/* Privacy Policy Link */}
          <button
            className="hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer underline focus:outline-none"
            onClick={openPrivacyModal}
            type="button" // Ensure it doesn't submit forms
          >
            Privacy Policy
          </button>

        </div>
      </div>
    </footer>
  );
};

// Export the Footer component to be used in your layout.tsx
export default Footer;