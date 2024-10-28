"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

interface ScanResult {
  product: {
    name: string;
    batchNumber: string;
    manufacturingDate: string;
    expirationDate: string;
  };
  status: "valid" | "invalid" | "expired";
}

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  const initializeScanner = () => {
    if (!scannerDivRef.current || scannerRef.current) return;

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to initialize scanner:", err);
      setError("Failed to initialize scanner. Please try again.");
    }
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to clear scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    // Initialize scanner after component mount
    const timeoutId = setTimeout(() => {
      initializeScanner();
    }, 100);

    // Cleanup on component unmount
    return () => {
      clearTimeout(timeoutId);
      cleanupScanner();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  const onScanSuccess = (qrData: string) => {
    cleanupScanner();
    verifyProduct(qrData);
  };

  const onScanError = (err: string) => {
    // Only show actual errors, not timeout messages
    if (!err.includes("NotFound")) {
      setError(err);
    }
  };

  const verifyProduct = async (qrData: string) => {
    const user = getUser();
    if (!user) return;

    try {
      const response = await fetch("http://localhost:30299/api/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          qrData,
          location: "Web Scanner",
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();
      setScanResult(result);
    } catch (err) {
      setError("Failed to verify product. Please try again.");
      console.error(err);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError("");
    cleanupScanner();
    // Add a small delay before reinitializing
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Scan Product QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              id="reader"
              ref={scannerDivRef}
              className={`w-full ${!isScanning && "hidden"}`}
            ></div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    scanResult.status === "valid"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">
                    Verification Result:{" "}
                    <span
                      className={
                        scanResult.status === "valid"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {scanResult.status.toUpperCase()}
                    </span>
                  </h3>

                  <div className="space-y-2">
                    <p>
                      <strong>Product Name:</strong> {scanResult.product.name}
                    </p>
                    <p>
                      <strong>Batch Number:</strong>{" "}
                      {scanResult.product.batchNumber}
                    </p>
                    <p>
                      <strong>Manufacturing Date:</strong>{" "}
                      {new Date(
                        scanResult.product.manufacturingDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Expiration Date:</strong>{" "}
                      {new Date(
                        scanResult.product.expirationDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button onClick={resetScan} className="w-full">
                  Scan Another Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
