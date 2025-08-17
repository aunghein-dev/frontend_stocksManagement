"use client";

import { useState } from "react";
import { Pnavbar } from "./_components/Pnavbar";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
//import FeatureCard from "./_components/_layouts/FeatureCard";

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on link click (mobile)
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* Navbar */}
      <Pnavbar 
        handleLinkClick={handleLinkClick}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Page content sections */}
      <main className="p-6 sm:py-6 sm:px-14 space-y-20">
          <section className="grid grid-cols-1 md:grid-cols-[440px_1fr] gap-4 w-full
                            items-center justify-center sm:px-12 sm:mt-14 mt-7"
                    id="home">
            <div className="flex flex-col space-y-10">
              <span className="text-4xl sm:text-5xl font-semibold leading-[3.5rem] sm:leading-[4.8rem]">
                မြန်မာပြည်မှာ စျေးအသက်သာဆုံး 
                <span className="text-blue-600 ml-1">Cloud POS</span>
              </span>
              <span className="text-gray-600 text-lg">Stop juggling spreadsheets, outdated cash registers, and manual reports. With 
                <span className="text-blue-600 font-extrabold">{" "}Openware POS</span>, you get a simple, intuitive, and powerful Point of Sale system that helps you sell faster, track smarter, and grow easier — all from one platform.</span>
              
              <button className="bg-blue-600 hover:bg-blue-700 
                              text-white font-semibold max-w-[200px]
                                py-3 px-4 rounded-lg flex flex-row items-center justify-center gap-2
                                hover:scale-105 transition-all ease-in-out 
                                duration-250 cursor-pointer">
              Get Started Free <FaArrowRight className="font-normal"/>
            </button>
            </div>
            
            <Image
              src="/hero.svg"
              alt="Hero Image"
              width={800}
              height={800}
              unoptimized
            />
          
          </section>

         {/* Features section 
          <section id="features" className="scroll-mt-24 sm:px-12 text-center space-y-1.5">
            
            <h1 className="text-3xl font-bold text-slate-900">All-in-One Business Management Suite</h1>
            <span className=" text-gray-600 text-lg">Only one solution to manage, grow, and automate your business operations.</span>

            <FeatureCard/>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="mt-2 text-gray-600">Details of services we provide.</p>
          </section>

          <section id="pricing" className="scroll-mt-24">
            <h1 className="text-3xl font-bold">Pricing</h1>
            <p className="mt-2 text-gray-600">Pricing details for our products/services.</p>
          </section>
          */}
        
        </main>

    </div>
  );
}
