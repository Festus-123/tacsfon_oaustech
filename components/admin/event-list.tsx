"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FellowshipEvent } from "@/data/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit3,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface EventListProps {
  initialEvents: FellowshipEvent[];
}

export function EventList({ initialEvents }: EventListProps) {
  const router = useRouter();
  const [events, setEvents] = React.useState<FellowshipEvent[]>(initialEvents);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/events/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete event");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success("Event removed successfully");
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error while deleting event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-forest-950">
            Fellowship Programs & Events
          </h2>
          <p className="text-xs text-forest-700 mt-0.5">
            Manage upcoming services, Bible study seminars, vigils, and outreach announcements.
          </p>
        </div>

        <Link href="/admin/events/new">
          <Button variant="default" size="sm" className="bg-forest-800 text-white font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create New Event</span>
          </Button>
        </Link>
      </div>

      {/* Events Table / Card List */}
      <div className="rounded-2xl border border-forest-800/15 bg-white overflow-hidden shadow-2xs">
        {events.length > 0 ? (
          <div className="divide-y divide-forest-100">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-forest-50/40 transition-colors"
              >
                <div className="flex items-start gap-4 max-w-2xl">
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-forest-100 border border-forest-200 shrink-0">
                    {evt.image_url ? (
                      <Image
                        src={evt.image_url}
                        alt={evt.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px] text-forest-400 uppercase font-semibold">
                        No Flyer
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-forest-950 font-serif sm:text-base">
                        {evt.title}
                      </span>
                      {evt.published ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-forest-600 text-[10px]">
                          <XCircle className="h-3 w-3 mr-1" />
                          Draft / Hidden
                        </Badge>
                      )}
                      {evt.category && (
                        <Badge variant="gold" className="text-[10px]">
                          {evt.category}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-forest-700 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-forest-600" />
                        {new Date(evt.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {evt.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-forest-600" />
                          {evt.event_time}
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 text-forest-600 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link href={`/admin/events/${evt.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(evt.id)}
                    className="h-8 px-2.5 text-xs text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-forest-700">
            <p className="text-sm">No events found. Click "Create New Event" to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg">Delete Event Confirmation</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-forest-700">
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
