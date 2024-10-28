"use client"

import { useEffect, useState } from "react";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VerificationStats {
  recentScans: number;
  validProducts: number;
  invalidProducts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<VerificationStats>({
    recentScans: 0,
    validProducts: 0,
    invalidProducts: 0,
  });
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      const user = getUser();
      if (!user) return;

      try {
        const response = await fetch(
          "http://localhost:30299/api/verification-stats",
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await response.json();

        // Transform the data into our stats format
        const statsData = {
          recentScans: data.reduce(
            (acc: number, curr: any) => acc + curr.count,
            0
          ),
          validProducts:
            data.find((item: any) => item._id === "valid")?.count || 0,
          invalidProducts:
            data.find((item: any) => item._id === "invalid")?.count || 0,
        };

        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedLayout>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.recentScans}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valid Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.validProducts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invalid Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {stats.invalidProducts}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button onClick={() => router.push("/scan")} className="h-24">
            Scan New Product
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => router.push("/history")}
            className="h-24"
          >
            View Scan History
          </Button> */}
          <Button
            variant="outline"
            onClick={() => router.push("/product")}
            className="h-24"
          >
            Add Product
          </Button>
        </CardContent>
      </Card>
    </ProtectedLayout>
  );
}
