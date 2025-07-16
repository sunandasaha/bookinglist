"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";
const About = () => {
  const navigate = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
              <button   onClick={() => navigate.back()}>
                <ArrowLeft size={24} className="text-white" />
              </button>
              <h2 className="text-sm font-bold leading-tight">
                Hello👋 Welcome to Booking List!
              </h2>
            </div>
      {/* Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-800 text-justify text-sm sm:text-base">
        <h1 className="text-center font-semibold">About Us</h1>
        <p>
          We’re the people who make booking management way less boring and a whole lot smarter.
          Whether you’re running a cozy homestay in the hills, a luxurious beachside resort,
          a rugged mountain camp, or a charming city hotel — we’ve built a platform just for you.
        </p>
        <p>No spreadsheets. No chaos. Just one powerful tool to manage your bookings like a pro.</p>

        <hr />

        <h3 className="text-xl font-semibold mt-4">What We Do (aka, Our Superpowers 🦸‍♂️)</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>🏨 One Dashboard to Rule Them All – Manage rooms, guests, and bookings in real-time.</li>
          <li>💸 Payments Made Easy – Secure, quick, and hassle-free.</li>
          <li>📅 No More Double Bookings – Real-time updates keep your calendar drama-free.</li>
          <li>📢 Smart Guest Messaging – Send automated messages and confirmations.</li>
          <li>🌐 Custom Booking Pages – Look good, feel good, book more.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4">Who We’re For (You!)</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Hotels</li>
          <li>Homestays</li>
          <li>Lodges</li>
          <li>Resorts</li>
          <li>Camps</li>
          <li>Treehouses, huts, houseboats — you name it!</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4">Why We Do It</h3>
        <p>
          Managing bookings, handling payments, and tracking guests can be… not fun. We’re here to change that.
          We believe small property owners should have access to the same slick tech that big hotels use — without
          the scary price tags or confusing dashboards.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>💡 Work smarter (not harder)</li>
          <li>🚀 Grow your business</li>
          <li>😎 Spend less time on admin, and more time doing what you love</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4">Why Choose Us?</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>🧠 Simple but Smart – Built to be super easy. No tech degree required.</li>
          <li>🤝 We’re Your Hospitality Hype Team – Real humans. Real help.</li>
          <li>🔒 Safe and Sound – We take your data security seriously.</li>
          <li>🎨 Made to Match Your Vibe – Customize your booking page to match your brand.</li>
          <li>🌍 Anywhere, Anytime – Cloud-based, accessible even off-grid (with Wi-Fi 😉).</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4">Our Big Dream</h3>
        <p>
          We want every homestay, hotel, and hidden gem to thrive — not just survive.
          Our dream? To be the go-to booking platform for property owners who care about their guests
          and their business, but don’t want to get buried under messy systems and outdated tools.
        </p>

        <h3 className="text-xl font-semibold mt-4">Let’s Do This!</h3>
        <p>
          You built a place people love. Let us help you manage it like a boss.
          🚀 Ready to level up your bookings? Let’s get started.
        </p>
        <p>No long contracts. No complicated setups. Just tools that work.</p>

        <h3 className="text-xl font-semibold mt-4">Still Have Questions? Let’s Chat.</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>📧 Email: bookinglist.in@gmail.com</li>
          <li>📞 Call: 9832252849</li>
          <li>📍 Visit us: Siliguri</li>
          <li>💬 Facebook: <a className="text-blue-600 underline" href="https://www.facebook.com/bookinglist.in/" target="_blank">facebook.com/bookinglist.in</a></li>
        </ul>

        <p className="text-center mt-6 italic text-gray-500">
          Thanks for stopping by. See you on the dashboard! 😄
        </p>
      </div>
    </div>
  );
};

export default About;
