"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChevronLeft, Plus, X, UploadCloud, Car, Sparkles, Utensils, Calendar, Package } from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "transport" | "spa" | "dining" | "activities" | "other";
  icon?: string;
  isActive: boolean;
}

const categoryIcons = {
  transport: Car,
  spa: Sparkles,
  dining: Utensils,
  activities: Calendar,
  other: Package,
};

export default function NewRoomTypePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [size, setSize] = useState("");
  const [bedType, setBedType] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [maxAdults, setMaxAdults] = useState("");
  const [maxChildren, setMaxChildren] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);

  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const [perkInput, setPerkInput] = useState("");
  const [perks, setPerks] = useState<string[]>([]);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGlobalDragActive, setIsGlobalDragActive] = useState(false);
  const dragDepth = useRef(0);

  useEffect(() => {
    if (!name) {
      setSlug("");
      return;
    }
    setSlug(slugify(name));
  }, [name]);

  // Fetch available services
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const response = await fetch("/api/services", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.data.services);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  useEffect(() => {
    if (!mainImageFile) {
      setMainImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(mainImageFile);
    setMainImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [mainImageFile]);

  useEffect(() => {
    if (galleryFiles.length === 0) {
      setGalleryPreviews([]);
      return;
    }

    const urls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryFiles]);

  function handleRootDragEnter(event: React.DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer || !event.dataTransfer.types.includes("Files")) {
      return;
    }
    dragDepth.current += 1;
    setIsGlobalDragActive(true);
  }

  function handleRootDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer || !event.dataTransfer.types.includes("Files")) {
      return;
    }
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsGlobalDragActive(false);
    }
  }

  function handleRootDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (event.dataTransfer && event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
    }
  }

  function handleRootDrop(event: React.DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer || !event.dataTransfer.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    dragDepth.current = 0;
    setIsGlobalDragActive(false);

    const files = Array.from(event.dataTransfer.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!files.length) return;

    if (!mainImageFile && files[0]) {
      setMainImageFile(files[0]);
    }

    setGalleryFiles((prev) => [...prev, ...files]);
  }

  function addTag(input: string, list: string[], setter: (next: string[]) => void) {
    const value = input.trim();
    if (!value) return;
    if (list.includes(value)) return;
    setter([...list, value]);
  }

  function removeTag(value: string, list: string[], setter: (next: string[]) => void) {
    setter(list.filter((item) => item !== value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("Processing...");

    let uploadedMainImage = "";
    let uploadedGallery: string[] = [];

    // Upload main image if exists
    if (mainImageFile) {
      try {
        const formData = new FormData();
        formData.append("files", mainImageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.success && uploadData.data.urls.length > 0) {
            uploadedMainImage = uploadData.data.urls[0];
          }
        }
      } catch (error) {
        console.error("Error uploading main image:", error);
      }
    }

    // Upload gallery images if exist
    if (galleryFiles.length > 0) {
      try {
        const formData = new FormData();
        galleryFiles.forEach(file => formData.append("files", file));

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            uploadedGallery = uploadData.data.urls;
          }
        }
      } catch (error) {
        console.error("Error uploading gallery images:", error);
      }
    }

    const payload = {
      slug,
      name,
      description,
      longDescription,
      pricePerNight: Number(pricePerNight || 0),
      size,
      perks,
      amenities,
      services: selectedServices,
      bedType,
      maxGuests: Number(maxGuests || 0),
      maxAdults: Number(maxAdults || maxGuests || 0),
      maxChildren: Number(maxChildren || 0),
      totalRooms: Number(totalRooms || 1),
      mainImage: uploadedMainImage || "/hotel-images/4.JPG",
      gallery: uploadedGallery.length > 0 ? uploadedGallery : ["/hotel-images/4.JPG", "/hotel-images/4.JPG", "/hotel-images/4.JPG"],
    };

    try {
      const response = await fetch("/api/room-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage("Room type created successfully!");
        setTimeout(() => {
          router.push("/admin/rooms/add-room-type");
        }, 1500);
      } else {
        setStatusMessage(data.message || "Failed to create room type");
      }
    } catch (error) {
      console.error("Error creating room type:", error);
      setStatusMessage("An error occurred. Please try again.");
    }
  }

  return (
    <div
      className="flex h-screen bg-gray-50"
      onDragEnter={handleRootDragEnter}
      onDragLeave={handleRootDragLeave}
      onDragOver={handleRootDragOver}
      onDrop={handleRootDrop}
    >
      {isGlobalDragActive && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="pointer-events-auto flex flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/95 px-8 py-6 text-center shadow-2xl shadow-black/20">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Drop images to upload</p>
            <p className="mt-1 text-xs text-gray-500">
              Images will be added to this room type's gallery.
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/admin/rooms/add-room-type")}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back to room types</span>
              </button>

              <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
                Add new room type
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic details */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Basic details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Deluxe Suite"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Slug</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. deluxe-suite"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400">
                      Used in the public URL and booking flow.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Price per night (₵)</label>
                    <input
                      type="number"
                      min={0}
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      placeholder="e.g. 220"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Size</label>
                    <input
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="e.g. 32 m²"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Bed type</label>
                    <input
                      value={bedType}
                      onChange={(e) => setBedType(e.target.value)}
                      placeholder="e.g. King bed"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Total rooms</label>
                    <input
                      type="number"
                      min={1}
                      value={totalRooms}
                      onChange={(e) => setTotalRooms(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Max guests</label>
                    <input
                      type="number"
                      min={1}
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Max adults</label>
                    <input
                      type="number"
                      min={1}
                      value={maxAdults}
                      onChange={(e) => setMaxAdults(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Max children</label>
                    <input
                      type="number"
                      min={0}
                      value={maxChildren}
                      onChange={(e) => setMaxChildren(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Short description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Long description</label>
                    <textarea
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Images */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Images</h2>
                <div className="space-y-4">
                  {/* Main image drag & drop */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Main image</label>
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const file = event.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          setMainImageFile(file);
                        }
                        dragDepth.current = 0;
                        setIsGlobalDragActive(false);
                      }}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50/40"
                    >
                      <input
                        id="main-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            setMainImageFile(file);
                          }
                        }}
                      />

                      {mainImageFile ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {mainImageFile.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Drag a new file here or click below to replace.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                            <Plus className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            Drag & drop main image
                          </p>
                          <p className="text-[11px] text-gray-400">
                            or click to browse from your computer
                          </p>
                        </>
                      )}

                      <label
                        htmlFor="main-image-input"
                        className="mt-2 inline-flex cursor-pointer items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Choose file
                      </label>
                    </div>
                    {mainImagePreview && (
                      <div className="mt-3 h-32 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        <img
                          src={mainImagePreview}
                          alt="Main image preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400">
                      Used as the hero image on the public room page.
                    </p>
                  </div>

                  {/* Gallery drag & drop */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Gallery images</label>
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const files = Array.from(event.dataTransfer.files || []).filter((file) =>
                          file.type.startsWith("image/")
                        );
                        if (files.length) {
                          setGalleryFiles((prev) => [...prev, ...files]);
                        }
                        dragDepth.current = 0;
                        setIsGlobalDragActive(false);
                      }}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50/40"
                    >
                      <input
                        id="gallery-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []).filter((file) =>
                            file.type.startsWith("image/")
                          );
                          if (files.length) {
                            setGalleryFiles((prev) => [...prev, ...files]);
                          }
                          if (event.target) {
                            event.target.value = "";
                          }
                        }}
                      />

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                        <Plus className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        Drag & drop gallery images
                      </p>
                      <p className="text-[11px] text-gray-400">
                        or click to select multiple images
                      </p>

                      <label
                        htmlFor="gallery-images-input"
                        className="mt-2 inline-flex cursor-pointer items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Choose files
                      </label>
                    </div>

                    {galleryFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {galleryFiles.map((file, index) => (
                          <div
                            key={file.name + index}
                            className="relative h-20 w-28 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                          >
                            {galleryPreviews[index] && (
                              <img
                                src={galleryPreviews[index]}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Amenities & perks */}
              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold text-gray-900">Amenities</h2>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        placeholder="e.g. Smart TV"
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addTag(amenityInput, amenities, setAmenities);
                          setAmenityInput("");
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {amenities.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(item, amenities, setAmenities)}
                              className="text-blue-400 hover:text-blue-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold text-gray-900">Perks</h2>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={perkInput}
                        onChange={(e) => setPerkInput(e.target.value)}
                        placeholder="e.g. Complimentary breakfast"
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addTag(perkInput, perks, setPerks);
                          setPerkInput("");
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {perks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {perks.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(item, perks, setPerks)}
                              className="text-emerald-400 hover:text-emerald-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Services */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Available Services</h2>
                <p className="mb-4 text-xs text-gray-500">
                  Select services that guests can add to their booking for this room type
                </p>

                {services.length === 0 ? (
                  <p className="text-sm text-gray-400">No services available. Add services from the Services menu.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Group services by category */}
                    {Object.entries(
                      services.reduce((acc, service) => {
                        if (!acc[service.category]) {
                          acc[service.category] = [];
                        }
                        acc[service.category].push(service);
                        return acc;
                      }, {} as Record<string, Service[]>)
                    ).map(([category, categoryServices]) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons];
                      return (
                        <div key={category} className="rounded-xl border border-gray-100 p-3">
                          <div className="mb-3 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <h3 className="text-xs font-semibold capitalize text-gray-700">
                              {category}
                            </h3>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {categoryServices.map((service) => (
                              <label
                                key={service.id}
                                className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedServices.includes(service.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedServices([...selectedServices, service.id]);
                                    } else {
                                      setSelectedServices(selectedServices.filter(id => id !== service.id));
                                    }
                                  }}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">
                                        {service.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-gray-500">
                                        {service.description}
                                      </p>
                                    </div>
                                    <span className="ml-2 text-sm font-semibold text-gray-900">
                                      ₵{service.price}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/rooms/add-room-type")}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Save room type
                </button>
              </div>

              {statusMessage && (
                <p className="text-sm text-emerald-600">{statusMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
