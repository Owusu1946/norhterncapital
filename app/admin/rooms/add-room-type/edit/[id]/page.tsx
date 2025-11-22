"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2, Plus, X, UploadCloud } from "lucide-react";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditRoomTypePage({ params }: PageProps) {
  const router = useRouter();
  const [roomTypeId, setRoomTypeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const [existingMainImage, setExistingMainImage] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  
  const [perkInput, setPerkInput] = useState("");
  const [perks, setPerks] = useState<string[]>([]);
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGlobalDragActive, setIsGlobalDragActive] = useState(false);
  const dragDepth = useRef(0);

  useEffect(() => {
    // Get the room type ID from params
    params.then(p => {
      setRoomTypeId(p.id);
      fetchRoomType(p.id);
    });
  }, [params]);

  const fetchRoomType = async (id: string) => {
    try {
      const response = await fetch(`/api/room-types/${id}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.roomType) {
          const rt = data.data.roomType;
          setName(rt.name || "");
          setSlug(rt.slug || "");
          setPricePerNight(rt.pricePerNight?.toString() || "");
          setSize(rt.size || "");
          setBedType(rt.bedType || "");
          setMaxGuests(rt.maxGuests?.toString() || "");
          setMaxAdults(rt.maxAdults?.toString() || "");
          setMaxChildren(rt.maxChildren?.toString() || "");
          setTotalRooms(rt.totalRooms?.toString() || "");
          setDescription(rt.description || "");
          setLongDescription(rt.longDescription || "");
          setAmenities(rt.amenities || []);
          setPerks(rt.perks || []);
          setExistingMainImage(rt.mainImage || "");
          setExistingGallery(rt.gallery || []);
        }
      } else {
        setStatusMessage("Failed to load room type");
        setTimeout(() => router.push("/admin/rooms/add-room-type"), 2000);
      }
    } catch (error) {
      console.error("Error fetching room type:", error);
      setStatusMessage("Failed to load room type");
    } finally {
      setLoading(false);
    }
  };

  // Sync main image preview from either newly selected file or existing image
  useEffect(() => {
    if (mainImageFile) {
      const url = URL.createObjectURL(mainImageFile);
      setMainImagePreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    if (existingMainImage) {
      setMainImagePreview(existingMainImage);
    } else {
      setMainImagePreview(null);
    }
  }, [mainImageFile, existingMainImage]);

  // Sync gallery previews for newly selected files (existing images are shown separately)
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

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    setName(newName);
    setSlug(createSlug(newName));
  }

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      setMainImageFile(files[0]);
    }
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      setGalleryFiles(Array.from(files));
    }
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
    setSaving(true);
    setStatusMessage("Saving changes...");

    let uploadedMainImage = existingMainImage;
    let uploadedGallery = existingGallery;

    // Upload new main image if exists
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

    // Upload new gallery images if exist (append to existing gallery)
    if (galleryFiles.length > 0) {
      try {
        const formData = new FormData();
        galleryFiles.forEach((file) => formData.append("files", file));

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            // Append new images to any existing gallery URLs
            const newUrls: string[] = uploadData.data.urls || [];
            uploadedGallery = [...uploadedGallery, ...newUrls];
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
      bedType,
      maxGuests: Number(maxGuests || 0),
      maxAdults: Number(maxAdults || maxGuests || 0),
      maxChildren: Number(maxChildren || 0),
      totalRooms: Number(totalRooms || 1),
      mainImage: uploadedMainImage,
      gallery: uploadedGallery,
    };

    try {
      const response = await fetch(`/api/room-types/${roomTypeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatusMessage("Room type updated successfully!");
        setTimeout(() => {
          router.push("/admin/rooms/add-room-type");
        }, 1500);
      } else {
        setStatusMessage(data.message || "Failed to update room type");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error updating room type:", error);
      setStatusMessage("An error occurred. Please try again.");
      setSaving(false);
    }
  }

  // Drag and drop handlers (match new room type page behavior)
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
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading room type...</p>
          </div>
        </div>
      </div>
    );
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
              Images will be added to this room type&apos;s gallery.
            </p>
          </div>
        </div>
      )}

      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit room type
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Update room type information
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/rooms/add-room-type")}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Basic information */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">
                  Basic information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g. Deluxe Suite"
                      required
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Slug</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. deluxe-suite"
                      required
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      required
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Size</label>
                    <input
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="e.g. 32 m²"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Bed type</label>
                    <input
                      value={bedType}
                      onChange={(e) => setBedType(e.target.value)}
                      placeholder="e.g. King bed"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      required
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Long description</label>
                    <textarea
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      rows={3}
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </section>

              {/* Images */}
              <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
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

                      {mainImagePreview ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {mainImageFile?.name || "Current main image"}
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

                    {(existingGallery.length > 0 || galleryPreviews.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {/* Existing gallery images (from DB) */}
                        {existingGallery.map((url, index) => (
                          <div
                            key={"existing-" + url + index}
                            className="relative h-20 w-28 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                          >
                            <img
                              src={url}
                              alt={"Existing gallery image " + (index + 1)}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setExistingGallery((prev) => prev.filter((_, i) => i !== index))
                              }
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* Newly added (unsaved) gallery images */}
                        {galleryPreviews.map((preview, index) => (
                          <div
                            key={"new-" + preview + index}
                            className="relative h-20 w-28 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                          >
                            <img
                              src={preview}
                              alt={"New gallery image " + (index + 1)}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
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

              {/* Amenities & Perks */}
              <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">
                  Amenities & Perks
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Amenities</label>
                    <div className="flex gap-2">
                      <input
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(amenityInput, amenities, setAmenities);
                            setAmenityInput("");
                          }
                        }}
                        placeholder="Type and press Enter"
                        disabled={saving}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addTag(amenityInput, amenities, setAmenities);
                          setAmenityInput("");
                        }}
                        disabled={saving}
                        className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeTag(amenity, amenities, setAmenities)}
                            disabled={saving}
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Perks</label>
                    <div className="flex gap-2">
                      <input
                        value={perkInput}
                        onChange={(e) => setPerkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(perkInput, perks, setPerks);
                            setPerkInput("");
                          }
                        }}
                        placeholder="Type and press Enter"
                        disabled={saving}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addTag(perkInput, perks, setPerks);
                          setPerkInput("");
                        }}
                        disabled={saving}
                        className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {perks.map((perk) => (
                        <span
                          key={perk}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                        >
                          {perk}
                          <button
                            type="button"
                            onClick={() => removeTag(perk, perks, setPerks)}
                            disabled={saving}
                            className="text-green-500 hover:text-green-700 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between">
                {statusMessage && (
                  <p className={`text-sm ${
                    statusMessage.includes("successfully") 
                      ? "text-emerald-600" 
                      : statusMessage.includes("Failed") || statusMessage.includes("error")
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}>
                    {statusMessage}
                  </p>
                )}
                <div className="ml-auto flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/rooms/add-room-type")}
                    disabled={saving}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}
