import { FaArrowRight } from "react-icons/fa";
import PrimaryButton from "../_particles/PrimaryButton";
import GhostButton from "../_particles/GhostButton";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="scroll-mt-100 sm:scroll-mt-100 grid grid-cols-1 md:grid-cols-[minmax(320px,460px)_1fr] gap-8 items-center justify-center sm:px-12 sm:mt-10 mt-6"
    >
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl sm:text-5xl font-semibold leading-relaxed">
          မြန်မာပြည်မှာ စျေးအသက်သာဆုံး
          <span className="text-blue-600 ml-2">Cloud POS</span>
        </h1>
        <p className="text-gray-700 text-lg">
          Stop juggling spreadsheets, outdated registers, and manual reports. With
          <span className="text-blue-600 font-extrabold"> Openware POS</span>
          , sell faster, track smarter, and grow from one platform.
        </p>
        <div className="flex gap-3">
          <PrimaryButton href="#get-started">
            Get Started Free <FaArrowRight className="ml-1" />
          </PrimaryButton>
          <GhostButton href="#features">See Features</GhostButton>
        </div>
      </div>

      <div className="relative w-full">
        <Image
          src="/hero.svg"
          alt="Openware POS hero"
          width={960}
          height={800}
          className="w-full h-auto"
          priority
          unoptimized
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-500">
          *Illustration for preview purposes
        </div>
      </div>
    </section>
  );
}
