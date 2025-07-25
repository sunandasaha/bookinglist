import React from "react";
<<<<<<< HEAD:Front/src/app/(auth)/Footer.tsx
import {Facebook,Instagram,Youtube, Phone, MapPin, Mail} from "lucide-react";
=======
import { Facebook, Instagram, Youtube } from "lucide-react";
>>>>>>> 076570301107f312e761b212bae1fd19cb9569e8:Front/src/app/(auth)/Footer.jsx
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-white text-blue-800 border-t pt-10 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/svgs/logo.png"
              alt="BookingList Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-blue-900">BookingList</span>
          </div>
          <p className="text-black mb-4">
            Helping hosts and agents to simplify booking management with smart,
            secure, and stress-free tools.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook className="w-5 h-5 hover:text-blue-600" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram className="w-5 h-5 hover:text-pink-600" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <Youtube className="w-5 h-5 hover:text-red-600" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 mb-3">Company</h4>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a href="/about_us" className=" text-black hover:text-blue-600">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact_us" className="text-black hover:text-blue-600">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a href="/terms" className="text-black hover:text-blue-600">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-black hover:text-blue-600">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 mb-3">Get in Touch</h4>
          <ul className="space-y-2 text-gray-700 ">
            <li className="text-black hover:text-blue-600">Need any help?</li>
<<<<<<< HEAD:Front/src/app/(auth)/Footer.tsx
            <li className="flex items-center gap-1 text-black"><span className = " text-blue-900"><Phone size={18} /></span> 9832252849</li>
            <li className="text-black hover:text-blue-600">Need live support?</li>
            <li className="flex items-center gap-1 text-black"><span className = " text-blue-900"><Mail size={18} /></span>bookinglist.in@gmail.com</li>
=======
            <li className="text-black">📞 9832252849</li>
            <li className="text-black hover:text-blue-600">
              Need live support?
            </li>
            <li className="text-black">📧bookinglist.in@gmail.com</li>
>>>>>>> 076570301107f312e761b212bae1fd19cb9569e8:Front/src/app/(auth)/Footer.jsx
            <li className="text-black hover:text-blue-600">Visit Us</li>
            <li className="flex items-center gap-1 text-black"><span className = " text-blue-900"><MapPin size={18} /></span> Siliguri, West Bengal</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
        © {new Date().getFullYear()} BookingList — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
