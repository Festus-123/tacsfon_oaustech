"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormData } from "@/lib/validation/schemas";
import { FellowshipEvent } from "@/data/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Link as LinkIcon,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface EventFormProps {
  initialData?: FellowshipEvent;
  isEdit?: boolean;
}

export function EventForm({ initialData, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [flyerPreview, setFlyerPreview] = React.useState<string>(
    initialData?.image_url || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      event_date: initialData?.event_date
        ? new Date(initialData.event_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      event_time: initialData?.event_time || "",
      location: initialData?.location || "TACSFON Center, Igodan Methodist Primary School, Okitipupa",
      image_url: initialData?.image_url || "",
      external_url: initialData?.external_url || "",
      category: initialData?.category || "Fellowship Service",
      published: initialData?.published !== undefined ? initialData.published : true,
    },
  });

  const publishedValue = watch("published");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload image");
        return;
      }

      setValue("image_url", data.url, { shouldValidate: true });
      setFlyerPreview(data.url);
      toast.success("Event flyer uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image due to network error");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (formData: EventFormData) => {
    setIsSubmitting(true);

    try {
      const endpoint = isEdit && initialData?.id
        ? `/api/admin/events/${initialData.id}`
        : "/api/admin/events";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to save event");
        return;
      }

      toast.success(
        isEdit ? "Event updated successfully!" : "New event published successfully!"
      );

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error("A network error occurred while saving the event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="rounded-2xl border border-forest-800/15 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="event-title">
            Event Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="event-title"
            placeholder="e.g. Sunday Worship Service / All-Night Vigil"
            {...register("title")}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Date, Time, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="event-date"
              type="date"
              {...register("event_date")}
              aria-invalid={!!errors.event_date}
            />
            {errors.event_date && (
              <p className="text-xs text-red-600">{errors.event_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-time">Time</Label>
            <Input
              id="event-time"
              placeholder="e.g. 5:30 PM Prompt"
              {...register("event_time")}
            />
            {errors.event_time && (
              <p className="text-xs text-red-600">{errors.event_time.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-category">Category</Label>
            <Input
              id="event-category"
              placeholder="e.g. Sunday Service, Prayer, Outreach"
              {...register("category")}
            />
            {errors.category && (
              <p className="text-xs text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Location & External URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-location">Venue / Location</Label>
            <Input
              id="event-location"
              placeholder="e.g. Igodan Methodist Primary School"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-ext-url">External Link (Optional)</Label>
            <Input
              id="event-ext-url"
              type="url"
              placeholder="https://..."
              {...register("external_url")}
            />
            {errors.external_url && (
              <p className="text-xs text-red-600">{errors.external_url.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="event-description">
            Event Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="event-description"
            rows={5}
            placeholder="Detailed description of the program, expectations, and invitation..."
            {...register("description")}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Flyer Upload & Preview */}
        <div className="space-y-2 pt-2 border-t border-forest-100">
          <Label>Event Flyer / Image</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-forest-100 text-forest-900 text-xs font-semibold hover:bg-forest-200 transition-colors border border-forest-200">
                  <Upload className="h-4 w-4 text-forest-800" />
                  <span>Upload Flyer to Supabase</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                  />
                </label>
                {uploadingImage && (
                  <span className="flex items-center gap-1.5 text-xs text-forest-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-forest-600">
                  Or enter image URL / local path directly:
                </span>
                <Input
                  placeholder="/assets/sunday-service.jpg or https://..."
                  {...register("image_url")}
                  onChange={(e) => {
                    register("image_url").onChange(e);
                    setFlyerPreview(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Flyer Preview Box */}
            <div className="rounded-xl border border-forest-200 bg-forest-50/50 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-forest-600 block mb-2">
                Flyer Preview
              </span>
              {flyerPreview ? (
                <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden border border-forest-200 bg-white">
                  <Image
                    src={flyerPreview}
                    alt="Event flyer preview"
                    fill
                    sizes="300px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="py-8 text-xs text-forest-400">
                  No flyer selected yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Publish Status Toggle */}
        <div className="pt-4 border-t border-forest-100 flex items-center justify-between">
          <div>
            <Label htmlFor="published-toggle" className="cursor-pointer">
              Publish Status
            </Label>
            <p className="text-xs text-forest-600">
              When published, this event will be visible to the public on the website.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="published-toggle"
              checked={publishedValue}
              onChange={(e) => setValue("published", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-forest-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-forest-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-800" />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || uploadingImage}
          className="bg-forest-800 text-white min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Saving Event...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create & Publish Event"
          )}
        </Button>
      </div>
    </form>
  );
}
