"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  format?: "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC";
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  lineColor?: string;
  className?: string;
  imageUrl?: string; // Backend generated barcode image path
  useBackendImage?: boolean; // Option to display the image directly from the backend
}

export default function Barcode({
  value,
  format = "CODE128",
  width = 2,
  height = 50,
  displayValue = true,
  fontSize = 12,
  lineColor = "#000000",
  className = "",
  imageUrl,
  useBackendImage = false,
}: BarcodeProps) {
  const elementRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // Get API Base URL to resolve relative backend image path
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const backendBase = apiBaseUrl.replace(/\/api\/?$/, "");
  const fullImageUrl = imageUrl ? `${backendBase}${imageUrl}` : null;

  useEffect(() => {
    if ((useBackendImage && !imageFailed) || !elementRef.current || !value) {
      return;
    }

    try {
      setError(null);
      JsBarcode(elementRef.current, value, {
        format,
        width,
        height,
        displayValue,
        fontSize,
        lineColor,
        margin: 5,
        background: "transparent",
      });
    } catch (err: any) {
      console.error("JsBarcode error:", err);
      setError(err?.message || "Invalid barcode format");
    }
  }, [value, format, width, height, displayValue, fontSize, lineColor, useBackendImage, imageFailed]);

  if (!value && !imageUrl) {
    return (
      <div className={`text-xs text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg p-2 text-center ${className}`}>
        No barcode number
      </div>
    );
  }

  if (useBackendImage && fullImageUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fullImageUrl}
        alt={`Barcode: ${value}`}
        className={`max-w-full h-auto object-contain bg-white p-1 rounded border border-slate-100 ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {error ? (
        // Fallback to backend image if frontend rendering failed
        fullImageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fullImageUrl}
            alt={`Barcode (Fallback): ${value}`}
            className={`max-w-full h-auto object-contain bg-white p-1 rounded border border-slate-100 ${className}`}
          />
        ) : (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 p-2 rounded-lg text-center font-medium">
            Error: {error}
          </div>
        )
      ) : (
        <svg ref={elementRef} className={`max-w-full h-auto ${className}`} />
      )}
    </div>
  );
}
