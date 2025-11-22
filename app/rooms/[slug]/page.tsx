import { notFound } from "next/navigation";

import { Room } from "../../../lib/rooms";
import { RoomDetailsClient } from "../../../components/RoomDetailsClient";
import { Header } from "../../../components/sections/Header";

interface RoomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getRoomType(slug: string): Promise<Room | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/room-types/${slug}`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.roomType) {
        return data.data.roomType;
      }
    }
  } catch (error) {
    console.error("Error fetching room type:", error);
  }
  
  return null;
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