// app/dashboard/page.tsx — Student dashboard showing their registrations and status.

"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app-shell";
import { api } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Registration {
  id: number;
  course: number;
  course_title: string;
  course_instructor: string;
  course_schedule: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/registrations/me/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRegistrations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-1">My Registrations</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Track the status of your course registrations.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            You haven&apos;t registered for any courses yet.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden sm:table-cell">Instructor</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.course_title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {reg.course_instructor}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {reg.course_schedule}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[reg.status]}
                      >
                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
