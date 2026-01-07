"use client";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";

interface ImageUploadProps {
    value?: string;
    onChange: (file: File | null, previewUrl: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onChange(file, previewUrl);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
                relative h-40 w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
                ${isDragging ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"}
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />

            {preview ? (
                <>
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </>
            ) : (
                <div className="text-center text-gray-400">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-gray-600">Click to upload</p>
                    <p className="text-xs">or drag and drop</p>
                </div>
            )}
        </div>
    );
}
