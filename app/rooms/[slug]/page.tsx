import { notFound } from "next/navigation";

import { rooms } from "../../../lib/rooms";
import { RoomDetailsClient } from "../../../components/RoomDetailsClient";
import { Header } from "../../../components/sections/Header";

interface RoomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  // Next.js 16: params is a Promise, so we await it
  const { slug } = await params;

  const room = rooms.find((r) => r.slug === slug);

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