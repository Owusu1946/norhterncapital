import { notFound } from "next/navigation";

import { Room } from "../../../lib/rooms";
import { RoomDetailsClient } from "../../../components/RoomDetailsClient";
import { Header } from "../../../components/sections/Header";
import connectDB from "@/lib/mongodb";
import RoomTypeModel from "@/models/RoomType";

interface RoomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

async function getRoomType(slug: string): Promise<Room | null> {
  try {
    await connectDB();

    // Find room type by slug directly from DB
    const roomType = await RoomTypeModel.findOne({
      slug: slug.toLowerCase(),
      isActive: true
    }).lean();

    if (!roomType) {
      console.log(`Room type not found for slug: ${slug}`);
      return null;
    }

    // Map DB model to UI model
    return {
      slug: roomType.slug,
      name: roomType.name,
      description: roomType.description || "",
      longDescription: roomType.longDescription || "",
      priceFrom: roomType.pricePerNight,
      size: roomType.size || "",
      image: roomType.mainImage && roomType.mainImage.trim() !== "" ? roomType.mainImage : "/hero.jpg",
      gallery: roomType.gallery && roomType.gallery.length > 0 && roomType.gallery[0] !== ""
        ? roomType.gallery
        : ["/hero.jpg", "/hero.jpg", "/hero.jpg"],
      perks: roomType.perks || [],
      amenities: roomType.amenities || [],
      bedType: roomType.bedType || "",
      maxGuests: roomType.maxGuests || 2,
    };
  } catch (error) {
    console.error("Error fetching room type:", error);
    return null;
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  // Next.js 16: params is a Promise, so we await it
  const { slug } = await params;

  const room = await getRoomType(slug);

  if (!room) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-white px-6 py-10 text-black sm:px-10 sm:py-16">
        <RoomDetailsClient room={room} />
      </main>
    </>
  );
}
