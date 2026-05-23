// app/courses/[id]/page.tsx — Course detail page with a register button.
// Shows full description, instructor, schedule, and seat availability.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  capacity: number;
  seats_left: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    api(`/courses/${params.id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Course not found");
        return res.json();
      })
      .then((data) => setCourse(data))
      .catch(() => toast.error("Could not load course"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleRegister = async () => {
    if (!course) return;
    setRegistering(true);

    try {
      const res = await api("/registrations/", {
        method: "POST",
        body: JSON.stringify({ course: course.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }

      toast.success("Registration submitted! Status: Pending");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to courses
        </button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !course ? (
          <div className="text-center py-12 text-muted-foreground">
            Course not found.
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
              <span>Instructor: <strong className="text-foreground">{course.instructor}</strong></span>
              <span>Schedule: <strong className="text-foreground">{course.schedule}</strong></span>
              <span>
                Seats:{" "}
                <Badge variant={course.seats_left > 0 ? "secondary" : "destructive"}>
                  {course.seats_left} / {course.capacity}
                </Badge>
              </span>
            </div>

            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-foreground leading-relaxed">{course.description}</p>
            </div>

            {user?.role === "student" && (
              <Button
                onClick={handleRegister}
                disabled={registering || course.seats_left <= 0}
                size="lg"
              >
                {registering
                  ? "Submitting…"
                  : course.seats_left <= 0
                  ? "No seats available"
                  : "Register for this course"}
              </Button>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
