// app/courses/page.tsx — Lists all available courses in a table.
// Shows title, instructor, schedule, and available seats.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { api } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: number;
  title: string;
  instructor: string;
  schedule: string;
  capacity: number;
  seats_left: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/courses/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-1">Available Courses</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Browse and register for courses offered this semester.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No courses available at the moment.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden sm:table-cell">Instructor</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead className="text-right">Seats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <Link
                        href={`/courses/${course.id}`}
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        {course.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {course.instructor}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {course.schedule}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={course.seats_left > 0 ? "secondary" : "destructive"}
                        className={course.seats_left > 0 ? "" : ""}
                      >
                        {course.seats_left} / {course.capacity}
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
