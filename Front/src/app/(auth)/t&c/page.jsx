"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

const Tnc = () => {
  const navigate = useRouter();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
        <button onClick = {()=> navigate.back()}>
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="text-sm font-bold leading-tight">
          Hello👋 Welcome to Booking List!
        </h2>
      </div>

      {/* Scrollable Terms */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 max-w-screen-sm mx-auto text-gray-800 space-y-6 text-justify text-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-center">
          Terms and Conditions
        </h1>

        <p><strong>Effective Date:</strong> 11/07/2026</p>

        <p>
          These Terms and Conditions ("Terms") govern the use of the Booking List service ("Service", "Platform") which provides an online booking management system designed for hotels, homestays, lodges, resorts, camps, and similar establishments (collectively, "Providers" or "Accommodations"). By accessing or using our Platform, you ("User", "Client", or "You") agree to comply with and be bound by these Terms.
        </p>
        <p>If you do not agree to these Terms, you should not use our Platform.</p>

        <hr />

        {/* Sections */}
        {[
          {
            title: "1. Definitions",
            points: [
              "<strong>Platform:</strong> The online booking management system provided by Booking List that allows Users to manage bookings, reservations, and payments for accommodations.",
              "<strong>Provider:</strong> Any individual, business, or organization that lists accommodations (such as hotels, homestays, resorts, etc.) on the Platform.",
              "<strong>User:</strong> Any individual or entity that accesses or uses the Platform for any purpose, including Providers, guests, or anyone interacting with the service.",
            ],
          },
          {
            title: "2. Account Creation and Access",
            points: [
              "To access certain features of the Platform, you must create an account by providing accurate and complete registration information...",
              "By using the Platform, you confirm that you are legally capable of entering into contracts...",
              "You agree to immediately notify us of any unauthorized access to or use of your account.",
            ],
          },
          {
            title: "3. Use of the Platform",
            points: [
              "<strong>For Providers:</strong> As a Provider, you can list, manage, and update your accommodation...",
              "<strong>For Guests:</strong> As a guest, you may book accommodations listed...",
              "The Platform is not a party to any booking or accommodation agreement...",
            ],
          },
          {
            title: "4. Pricing and Payments",
            points: [
              "The pricing for accommodation bookings is set by the Providers...",
              "Users agree to pay for all bookings made through the Platform...",
              "Payments may be processed through third-party payment gateways...",
            ],
          },
          {
            title: "5. Cancellations and Refunds",
            points: [
              "Each Provider sets their own cancellation and refund policies...",
              "Booking List may charge a processing fee...",
              "In case of disputes over cancellations or refunds...",
            ],
          },
          {
            title: "6. Restrictions on Use",
            intro: "You agree not to:",
            points: [
              "Use the Platform for any illegal or unauthorized purpose...",
              "Use the Platform to transmit harmful, offensive, or otherwise inappropriate content.",
              "Interfere with or disrupt the Platform’s servers, networks, or systems.",
              "Attempt to gain unauthorized access to any part of the Platform or other users' accounts.",
            ],
          },
          {
            title: "7. Intellectual Property",
            points: [
              "All content, including but not limited to text, images, logos, graphics, and software...",
              "Users may only use the Platform and its content for lawful purposes...",
            ],
          },
          {
            title: "8. Privacy and Data Protection",
            points: [
              "We take your privacy seriously. For details on how we collect, use, and protect your data...",
              "By using the Platform, you consent to the collection and processing...",
            ],
          },
          {
            title: "9. Limitation of Liability",
            points: [
              "Booking List provides the Platform on an \"as-is\" basis...",
              "We are not responsible for any direct, indirect, incidental...",
              "Our liability is limited to the maximum extent permitted by law...",
            ],
          },
        ].map(({ title, points, intro }, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-semibold mt-6">{title}</h2>
            {intro && <p>{intro}</p>}
            <ul className="list-disc list-inside space-y-2" dangerouslySetInnerHTML={{
              __html: points.map(p => `<li>${p}</li>`).join("")
            }} />
          </div>
        ))}

        <h2 className="text-lg font-semibold mt-6">10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Booking List, its officers, employees, agents, and affiliates from any claims, damages, or expenses arising from your use of the Platform...
        </p>

        <h2 className="text-lg font-semibold mt-6">11. Termination</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>We reserve the right to suspend or terminate your access...</li>
          <li>You may also terminate your account at any time...</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">12. Governing Law and Dispute Resolution</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>These Terms shall be governed by and construed in accordance with the laws of India.</li>
          <li>Any disputes will be resolved through Arbitration/Mediation...</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">13. Modifications to Terms</h2>
        <p>
          We may update these Terms from time to time. You will be notified of material changes and must accept them to continue using the Platform.
        </p>

        <h2 className="text-lg font-semibold mt-6">14. Contact Us</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Email:</strong> bookinglist.in@gmail.com</li>
          <li><strong>Address:</strong> Siliguri</li>
          <li><strong>Phone:</strong> 9832252849</li>
        </ul>

        <p className="text-xs italic text-center mt-6">
          By using the Booking List service, you agree to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default Tnc;
