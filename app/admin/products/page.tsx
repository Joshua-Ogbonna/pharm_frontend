import { useState, useEffect } from "react";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getUser } from "@/lib/auth";

interface Product {
  _id: string;
  name: string;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  qrCode: string;
  createdAt: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    batchNumber: "",
    manufacturingDate: "",
    expirationDate: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const user = getUser();
    if (!user) return;

    try {
      const response = await fetch("http://localhost:30299/api/admin/products", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    if (!user) return;

    try {
      const response = await fetch("http://localhost:30299/api/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Failed to create product");

      const data = await response.json();

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      // Reset form and refresh products
      setNewProduct({
        name: "",
        batchNumber: "",
        manufacturingDate: "",
        expirationDate: "",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const downloadQR = (qrCode: string, productName: string) => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${productName}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Management</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="space-y-2">
                    <label>Product Name</label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Batch Number</label>
                    <Input
                      value={newProduct.batchNumber}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          batchNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Manufacturing Date</label>
                    <Input
                      type="date"
                      value={newProduct.manufacturingDate}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          manufacturingDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Expiration Date</label>
                    <Input
                      type="date"
                      value={newProduct.expirationDate}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          expirationDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit">Create Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Manufacturing Date</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.batchNumber}</TableCell>
                    <TableCell>
                      {new Date(product.manufacturingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(product.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => downloadQR(product.qrCode, product.name)}
                      >
                        Download QR
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
