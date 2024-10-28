"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ProductFormData {
  name: string;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
}

const CreateProduct = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    batchNumber: '',
    manufacturingDate: '',
    expirationDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      
      const response = await fetch('https://pharma-backend-h710.onrender.com/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          batchNumber: formData.batchNumber,
          manufacturingDate: new Date(formData.manufacturingDate).toISOString(),
          expirationDate: new Date(formData.expirationDate).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      
      toast({
        title: "Success",
        description: "Product created successfully with QR code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Generate a QR code for your product by filling out the details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter batch number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
              <Input
                id="manufacturingDate"
                name="manufacturingDate"
                type="date"
                value={formData.manufacturingDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                name="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating QR Code..." : "Generate QR Code"}
            </Button>

            {qrCode && (
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Generated QR Code</h3>
                <div className="flex justify-center">
                  <img
                    src={qrCode}
                    alt="Product QR Code"
                    className="max-w-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `qr-${formData.name}-${formData.batchNumber}.png`;
                    link.click();
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProduct;