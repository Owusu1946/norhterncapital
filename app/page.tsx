import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedRoomsSection } from "../components/sections/FeaturedRoomsSection";
import { AboutHotelSection } from "../components/sections/AboutHotelSection";
import { ServicesSection } from "../components/sections/ServicesSection";
import { FacilitiesSection } from "../components/sections/FacilitiesSection";
import { DiningSection } from "../components/sections/DiningSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedRoomsSection />
      <AboutHotelSection />
      <ServicesSection />
      <FacilitiesSection />
      <DiningSection />
      <TestimonialsSection />
    </>
  );
}
