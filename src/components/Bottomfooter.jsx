import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaTimes } from 'react-icons/fa';

import VisaIcon from '../assets/Icons/visa.png';
import ShoppingIcon from '../assets/Icons/shopping.png';
import americanexpressIcon from '../assets/Icons/american-express.png';
import unionIcon from '../assets/Icons/unionpay.png';
import Logo from '../assets/Logo One Gadget White-01.png';


// Define the content for easier maintenance
const shoppingLinks = [
  'Making Payments',
  'Delivery Options',
  'Buyer Protection',
];

const shopLinks = [
  'Search',
  'Home',
  'Wish List',
  'New In',
  'Reviews',
];

const customerServiceLinks = [
  'FAQ',
  'Contact us',
  'AI Assistant',
];

const Bottomfooter = () => {
  return (
    // Main footer container with the distinct purple background
    <footer className="w-full bg-[#2E2DAD] text-white p-8  px-4 ">
      <div className="     max-w-7xl mx-auto px-6  justify-between items-center">
        {/* Top Section: Logo, Links, and Payment Icons */}
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 lg:grid-cols-5 pb-8 border-b border-white">
          
          {/* Logo and Social Media */}
          <div className="col-span-2 lg:col-span-1 mb-8 sm:mb-0">
            <img
              src={Logo}
              alt="Blossoms Logo" className='w-40' />  
            <p className="text-xs uppercase mt-3 text-white">Social Media</p>
            <p className="text-sm mb-4">onegadget.com</p>
            <div className="flex space-x-4">
              {/* Social Icons (using React Icons) */}
              <a href="#" className="hover:text-black"><FaFacebookF className="text-xl p-1 border rounded-full" /></a>
              <a href="#" className="hover:text-black"><FaInstagram className="text-xl p-1 border rounded-full" /></a>
              <a href="#" className="hover:text-black"><FaTwitter className="text-xl p-1 border rounded-full" /></a>
              {/* The 'X' icon for the last one (using FaTimes as a placeholder/stylistic choice) */}
              <a href="#" className="hover:text-black"><FaTimes className="text-xl p-1 border rounded-full" /></a>
            </div>
          </div>

          {/* Shopping with Us Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shopping with Us</h3>
            <ul className="space-y-2 text-sm text-purple-200">
              {shoppingLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white hover:text-black">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* SHOP Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SHOP</h3>
            <ul className="space-y-2 text-sm text-purple-200">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#" className=" text-white hover:text-black">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service (Aligned in a different spot for larger screens) */}
          <div className="hidden lg:block">
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-purple-200">
              {customerServiceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white hover:text-black">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Payment Icons (right-most column on large screens) */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Pay with</h3>
            <div className="flex space-x-2">
              {/* Placeholder images/icons for payment methods */}
              <img
                          src={VisaIcon}
                          alt="Visa"
                          className="h-8 w-auto"  // <-- FIXED SIZE
                        /> 
              <img src={ShoppingIcon} alt='shopping' className='h-8 w-auto'></img>
              <img src={americanexpressIcon} alt='american' className='h-8 w-auto'/>
              <img src={unionIcon} alt='unionicon' className='h-8 w-auto'></img>
            </div>
          </div>

          {/* Customer Service (For smaller screens, placed below the other link groups) */}
          <div className="col-span-2 lg:hidden">
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-purple-200">
              {customerServiceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-black">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Terms, Privacy, Cookies, and Developers */}
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-white">
          <div className="flex space-x-4 uppercase order-2 md:order-1 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
          <div className="order-1 md:order-2">
            @devby : Himesh | Supun | Dilshan
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Bottomfooter;