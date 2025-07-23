"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "../Footer";
import {
  Menu,
  X,
  Calendar,
  Users,
  Clock,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import Fadeup from "../../_components/Fadeup";
import InviewFade from "../../_components/InviewFade";
import "./land.css";
import { AnimatePresence, motion } from "framer-motion";

const Landing = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "Features", action: () => scrollTo(featuresRef) },
    { label: "About Us", action: () => scrollTo(aboutRef) },
    { label: "Contact Us", action: () => scrollTo(contactRef) },
    { label: "Terms & Conditions", path: "/t&c" },
    { label: "Privacy Policy", path: "/contact_us" },
  ];
  const iconClass =
    "text-blue-600 w-6 h-6 shrink-0 hover:text-gray-600 transition duration-200";

  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
      {/* Header */}
      <header className="fixed w-screen top-0 z-50 bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo + Title */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center cursor-pointer"
          >
            <img
              src="/svgs/logo.png"
              alt="BookingList"
              className="h-12 w-auto object-contain"
            />
            <h1 className="text-xl font-bold text-gray-800">Booking List</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm text-gray-700">
            {navItems.map((item) =>
              item.path ? (
                <span
                  key={item.label}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => router.push(item.path)}
                >
                  {item.label}
                </span>
              ) : (
                <span
                  key={item.label}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={item.action}
                >
                  {item.label}
                </span>
              )
            )}
          </nav>

          {/* Mobile Burger Icon */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ x: 200 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="land-sb"
            >
              {navItems.map((item) =>
                item.path ? (
                  <span
                    key={item.label}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(item.path);
                    }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <span
                    key={item.label}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setMenuOpen(false);
                      item.action();
                    }}
                  >
                    {item.label}
                  </span>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <div className="land-con bg-gradient-to-b from-white to-blue-50">
        <InviewFade>
          <div className="img-con">
            <img
              src="/svgs/land1.svg"
              alt="Landing Image"
              className="land-img"
            />
          </div>
        </InviewFade>
        <div className="con justify-center">
          <InviewFade del={5}>
            <h1 className="wbl">Welcome to Booking List</h1>
          </InviewFade>

          {/* Buttons */}
          <InviewFade del={10}>
            <div className="land-btns">
              <button
                onClick={() => router.push("/login")}
                className="px-7 py-2 bg-blue-600 text-white border border-blue-600 rounded-full hover:bg-blue-500 transition"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-full hover:bg-blue-200 transition"
              >
                Register
              </button>
            </div>
          </InviewFade>
        </div>
      </div>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="feture-con bg-white py-12 px-6 text-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          <Fadeup>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition duration-200 bg-white">
              <Calendar className={iconClass} />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Calendar Dashboard
                </h3>
                <p>
                  Intuitive calendar view to manage bookings day-wise & ideal
                  for both Hosts & Agents.
                </p>
              </div>
            </div>
          </Fadeup>
          <Fadeup>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition duration-200 bg-white">
              <Users className={iconClass} />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Agent & Host Panels
                </h3>
                <p>
                  Separate login panels and workflows tailored for Agents and
                  Property Hosts.
                </p>
              </div>
            </div>
          </Fadeup>
          <Fadeup>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition duration-200 bg-white">
              <Clock className={iconClass} />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  24/7 Availability
                </h3>
                <p>
                  Stay open round-the-clock & never miss a booking, anytime,
                  anywhere.
                </p>
              </div>
            </div>
          </Fadeup>
          <Fadeup>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition duration-200 bg-white">
              <CreditCard className={iconClass} />
              <div>
                <h3 className="font-semibold text-lg mb-1">UPI Payments</h3>
                <p>
                  Instant payments via QR code & screenshot upload. Safe & fast
                  for everyone.
                </p>
              </div>
            </div>
          </Fadeup>
          <Fadeup>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition duration-200 bg-white">
              <ShieldCheck className={iconClass} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Data Safety</h3>
                <p>
                  All data is securely stored with proper encryption and
                  role-based access control.
                </p>
              </div>
            </div>
          </Fadeup>
        </div>
      </section>
      {/* About Us Section */}
      <section ref={aboutRef} className="bg-blue-50 py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-800 text-sm sm:text-base leading-relaxed">
          At <strong>Booking List</strong>, we help property owners and agents
          to manage room bookings without the chaos. Whether it's a cozy
          homestay, a lakeside resort, or a mountain camp our platform offers
          everything you need: an intuitive calendar dashboard, secure UPI
          payments, real time notification, and smart tools to simplify your
          operations.
          <br />
          <br />
          No tech skills needed. No complex setup. Just clean, efficient tools
          to help you grow.
        </p>
        <div className="mt-6">
          <a
            href="/about_us"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base px-6 py-2 rounded-full transition-colors duration-200"
          >
            Learn More →
          </a>
        </div>
      </section>
      {/* Footer */}
      <div ref={contactRef}>
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
