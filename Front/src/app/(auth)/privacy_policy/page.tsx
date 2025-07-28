"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft } from "lucide-react";

const Contact = () => {
  const navigate = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
              <button onClick = {()=> navigate.back()}>
                <ArrowLeft size={24} className="text-white" />
              </button>
              <h2 className="text-sm font-bold leading-tight">
                Hello👋 Welcome to Booking List!
              </h2>
        </div>
      {/* Privacy Policy Content */}
      <div className="max-w-3xl mx-auto p-6 text-gray-800 space-y-6 text-sm sm:text-base">
        <p><strong>Effective Date:</strong> 11/07/2025</p>
        <p>
          Welcome to the Booking List (“we,” “our,” “us”). We are committed to protecting the privacy of our users (“you,” “your”) as you use our SaaS-based online booking platform (“Platform”) for managing hotel, homestay, resort, lodge, tent, and similar property reservations.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and associated services.
        </p>

        <h3 className="text-lg font-semibold">1. Information We Collect</h3>
        <p><strong>a. Personal Information</strong></p>
        <ul className="list-disc list-inside">
          <li>Name, email address, phone number</li>
          <li>Payment and billing details</li>
          <li>Government-issued ID (if required for bookings)</li>
        </ul>

        <p><strong>b. Property & Business Information (for Hosts)</strong></p>
        <ul className="list-disc list-inside">
          <li>Property name, type, location, photos</li>
          <li>Availability, pricing, and amenities</li>
          <li>Bank details for payouts</li>
        </ul>

        <p><strong>c. Booking Information</strong></p>
        <ul className="list-disc list-inside">
          <li>Check-in/check-out dates</li>
          <li>Guest details</li>
          <li>Preferences or special requests</li>
        </ul>

        <p><strong>d. Technical & Usage Data</strong></p>
        <ul className="list-disc list-inside">
          <li>IP address, browser type, device information</li>
          <li>Pages viewed, actions taken, time spent</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
        <ul className="list-disc list-inside">
          <li>Facilitate and manage bookings</li>
          <li>Process payments and refunds</li>
          <li>Verify identity and prevent fraud</li>
          <li>Improve customer experience and personalize services</li>
          <li>Send important updates, invoices, and promotional offers (if opted-in)</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3 className="text-lg font-semibold">3. How We Share Your Information</h3>
        <p>We do not sell your personal information. We may share data:</p>
        <ul className="list-disc list-inside">
          <li>With Hosts or Guests to complete a booking</li>
          <li>With payment processors (e.g., Stripe, Razorpay) for secure transactions</li>
          <li>With service providers (e.g., customer support, email/SMS services)</li>
          <li>With law enforcement or regulators if required by law</li>
        </ul>

        <h3 className="text-lg font-semibold">4. Data Security</h3>
        <p>We implement industry-standard security measures to protect your data, including:</p>
        <ul className="list-disc list-inside">
          <li>SSL encryption</li>
          <li>Secure server infrastructure</li>
          <li>Role-based access control</li>
        </ul>
        <p>However, no method of transmission over the Internet is 100% secure.</p>

        <h3 className="text-lg font-semibold">5. Cookies and Tracking Technologies</h3>
        <p>We use cookies to:</p>
        <ul className="list-disc list-inside">
          <li>Remember your preferences</li>
          <li>Analyze site traffic</li>
          <li>Improve platform functionality</li>
        </ul>
        <p>You can control cookies through your browser settings.</p>

        <h3 className="text-lg font-semibold">6. Your Rights and Choices</h3>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc list-inside">
          <li>Access, correct, or delete your data</li>
          <li>Object to or restrict processing</li>
          <li>Withdraw consent</li>
          <li>Opt-out of marketing communications</li>
        </ul>
        <p>To exercise any of these rights, contact us at <strong>bookinglist.in@gmail.com</strong>.</p>

        <h3 className="text-lg font-semibold">7. Data Retention</h3>
        <p>We retain your information as long as needed to:</p>
        <ul className="list-disc list-inside">
          <li>Provide our services</li>
          <li>Comply with legal and financial obligations</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>

        <h3 className="text-lg font-semibold">8. Third-Party Links</h3>
        <p>
          Our platform may contain links to third-party sites. We are not responsible for the privacy practices of those websites. Please review their policies before sharing your data.
        </p>

        <h3 className="text-lg font-semibold">9. Children’s Privacy</h3>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have collected data from a child, contact us immediately.
        </p>

        <h3 className="text-lg font-semibold">10. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or platform notifications. Continued use of the platform constitutes acceptance of the updated policy.
        </p>

        <h3 className="text-lg font-semibold">11. Contact Us</h3>
        <ul className="list-disc list-inside">
          <li><strong>Booking List</strong></li>
          <li>Email: bookinglist.in@gmail.com</li>
          <li>Phone: 9832252849</li>
          <li>Address: Siliguri</li>
        </ul>
      </div>
    </div>
  );
};

export default Contact;
