export type Room = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  priceFrom: number;
  size: string;
  image: string;
  gallery: string[];
  perks: string[];
  amenities: string[];
  bedType: string;
  maxGuests: number;
};

export const rooms: Room[] = [
  {
    slug: "signature-suite",
    name: "Signature Suite",
    description:
      "Expansive suite with skyline views, lounge area, and private balcony.",
    longDescription:
      "Our Signature Suite is designed for guests who want generous space, quiet luxury, and a calm place to unwind after a day in Tamale and Savelugu.",
    priceFrom: 320,
    size: "52 m²",
    image: "/hotel-images/1.JPG",
    gallery: ["/hotel-images/5.JPG", "/hotel-images/31.JPG", "/hotel-images/32.JPG"],
    perks: ["City view", "King bed", "Breakfast included"],
    amenities: [
      "Separate lounge area",
      "Private balcony",
      "Complimentary breakfast",
      "Smart TV",
      "High-speed Wi-Fi",
      "In-room safe",
      "Mini bar",
    ],
    bedType: "King bed",
    maxGuests: 3,
  },
  {
    slug: "deluxe-room",
    name: "Deluxe Room",
    description:
      "Comfortable room with warm tones, perfect for business or leisure.",
    longDescription:
      "Thoughtfully designed for business travellers and city explorers, our Deluxe Room balances comfort with functionality.",
    priceFrom: 210,
    size: "32 m²",
    image: "/hotel-images/3.JPG",
    gallery: ["/hotel-images/10.JPG", "/hotel-images/11.JPG", "/hotel-images/12.JPG"],
    perks: ["Work desk", "Rain shower", "High-speed Wi-Fi"],
    amenities: [
      "Dedicated work desk",
      "Rain shower",
      "High-speed Wi-Fi",
      "Tea and coffee set-up",
      "Smart TV",
      "Air conditioning",
    ],
    bedType: "Queen bed",
    maxGuests: 2,
  },
  {
    slug: "family-room",
    name: "Family Room",
    description:
      "Spacious layout with flexible bedding for small families or groups.",
    longDescription:
      "Ideal for small families and close groups, our Family Room offers flexible bedding and extra space so everyone can settle in comfortably.",
    priceFrom: 260,
    size: "40 m²",
    image: "/hotel-images/4.JPG",
    gallery: ["/hotel-images/20.JPG", "/hotel-images/21.JPG", "/hotel-images/22.JPG"],
    perks: ["Sofa bed", "Kids-friendly", "Late checkout"],
    amenities: [
      "Sofa bed",
      "Kids-friendly layout",
      "Late checkout (subject to availability)",
      "Smart TV",
      "High-speed Wi-Fi",
      "Tea and coffee set-up",
    ],
    bedType: "King bed + sofa bed",
    maxGuests: 4,
  },
];
