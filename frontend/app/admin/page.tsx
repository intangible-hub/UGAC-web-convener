// app/admin/page.tsx — Admin panel with course management and registration approval.
// Two sections: courses table (add/edit/delete) and registrations table (accept/reject).

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  capacity: number;
  seats_left: number;
}

interface Registration {
  id: number;
  course_title: string;
  user_name: string;
  user_email: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

// Course form fields
const emptyCourse = {
  title: "",
  description: "",
  instructor: "",
  schedule: "",
  capacity: 30,
  seats_left: 30,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(true);

  // Course dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/courses");
    }
  }, [user, authLoading, router]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api("/courses/");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch {
      // ignore
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await api("/admin/registrations/");
      const data = await res.json();
      if (Array.isArray(data)) setRegistrations(data);
    } catch {
      // ignore
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCourses();
      fetchRegistrations();
    }
  }, [user, fetchCourses, fetchRegistrations]);

  // Course CRUD
  const openAddDialog = () => {
    setEditingCourse(null);
    setForm(emptyCourse);
    setDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      schedule: course.schedule,
      capacity: course.capacity,
      seats_left: course.seats_left,
    });
    setDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      if (editingCourse) {
        // Update existing
        const res = await api(`/admin/courses/${editingCourse.id}/`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to update course");
        toast.success("Course updated");
      } else {
        // Create new
        const res = await api("/admin/courses/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create course");
        toast.success("Course created");
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      const res = await api(`/admin/courses/${id}/delete/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Course deleted");
      setDeleteConfirmId(null);
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  // Registration status update
  const updateRegistrationStatus = async (id: number, status: string) => {
    try {
      const res = await api(`/admin/registrations/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update");
      }
      toast.success(`Registration ${status}`);
      fetchRegistrations();
      fetchCourses(); // seats_left might have changed
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    }
  };

  if (authLoading || user?.role !== "admin") {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl space-y-10">
        {/* Course Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Courses</h2>
              <p className="text-sm text-muted-foreground">Manage course offerings</p>
            </div>
            <Button onClick={openAddDialog}>Add Course</Button>
          </div>

          {loadingCourses ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No courses yet. Click &ldquo;Add Course&rdquo; to create one.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Instructor</TableHead>
                    <TableHead className="hidden md:table-cell">Schedule</TableHead>
                    <TableHead className="text-center">Seats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {course.instructor}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {course.schedule}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.seats_left} / {course.capacity}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmId(course.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <Separator />

        {/* Registration Management */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Registrations</h2>
            <p className="text-sm text-muted-foreground">Accept or reject student registrations</p>
          </div>

          {loadingRegs ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No registrations yet.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reg.user_name}</div>
                          <div className="text-xs text-muted-foreground">{reg.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{reg.course_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[reg.status]}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {reg.status !== "accepted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={() => updateRegistrationStatus(reg.id, "accepted")}
                          >
                            Accept
                          </Button>
                        )}
                        {reg.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 hover:text-red-800 hover:bg-red-50"
                            onClick={() => updateRegistrationStatus(reg.id, "rejected")}
                          >
                            Reject
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                id="course-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Introduction to Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-instructor">Instructor</Label>
              <Input
                id="course-instructor"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="e.g. Dr. Sarah Chen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-schedule">Schedule</Label>
              <Input
                id="course-schedule"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="e.g. Mon/Wed 10:00–11:30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-capacity">Capacity</Label>
                <Input
                  id="course-capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capacity: parseInt(e.target.value) || 0,
                      seats_left: editingCourse
                        ? form.seats_left
                        : parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-seats">Seats Left</Label>
                <Input
                  id="course-seats"
                  type="number"
                  value={form.seats_left}
                  onChange={(e) =>
                    setForm({ ...form, seats_left: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourse} disabled={saving || !form.title}>
              {saving ? "Saving…" : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteCourse(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
