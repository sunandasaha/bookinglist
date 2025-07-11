import React from "react";
import { Phone, Mail, Globe, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-200 text-white px-6 py-8 mt-10">
        <h2 className="text-lg font-semibold text-center mb-4 text-black">
          Contact Us
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 text-sm text-black">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-yellow-400" />
            <span>9832252849</span>
            <br />
            <Mail className="w-4 h-4 text-yellow-400" />
            <span>bookinglist.in@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-yellow-400" />
            <a
              href="https://www.bookinglist.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-black-700"
            >
              www.bookinglist.in
            </a>
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span>Visit us at Siliguri</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
