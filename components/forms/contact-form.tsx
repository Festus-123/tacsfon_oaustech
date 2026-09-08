"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

interface ContactFormProps {
  className?: string;
  isCompact?: boolean;
}

export function ContactForm({ className = "", isCompact = false }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error || "We couldn't send your message right now. Please try again."
        );
        return;
      }

      setSubmitSuccess(true);
      reset();
    } catch (err) {
      console.error("Contact submit error:", err);
      setErrorMessage(
        "A network error occurred. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={`p-6 rounded-xl bg-forest-900/40 border border-gold-400/30 text-white ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-gold-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-semibold text-white">
              Message Sent Successfully!
            </h4>
            <p className="text-sm text-forest-100/90 leading-relaxed">
              Thank you for reaching out to TACSFON (OAUSTECH). A confirmation email has been dispatched to your inbox, and our fellowship leadership will get back to you shortly.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmitSuccess(false)}
              className="mt-3 text-white border-white/20 hover:bg-white/10"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${className}`}
      noValidate
    >
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={isCompact ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        <div className="space-y-1.5">
          <Label htmlFor="contact-name" className="text-forest-100 text-[11px]">
            Your Full Name <span className="text-gold-400">*</span>
          </Label>
          <Input
            id="contact-name"
            placeholder="Brother / Sister Name"
            {...register("name")}
            aria-invalid={!!errors.name}
            className="bg-forest-950/50 border-forest-700/60 text-white placeholder:text-forest-400/50 focus-visible:ring-gold-400"
          />
          {errors.name && (
            <p className="text-[11px] text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email" className="text-forest-100 text-[11px]">
            Email Address <span className="text-gold-400">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="student@oaustech.edu.ng"
            {...register("email")}
            aria-invalid={!!errors.email}
            className="bg-forest-950/50 border-forest-700/60 text-white placeholder:text-forest-400/50 focus-visible:ring-gold-400"
          />
          {errors.email && (
            <p className="text-[11px] text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className={isCompact ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone" className="text-forest-100 text-[11px]">
            Phone Number <span className="text-forest-400 text-[10px] normal-case">(Optional)</span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="e.g. 09140809527"
            {...register("phone")}
            className="bg-forest-950/50 border-forest-700/60 text-white placeholder:text-forest-400/50 focus-visible:ring-gold-400"
          />
          {errors.phone && (
            <p className="text-[11px] text-red-400">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-subject" className="text-forest-100 text-[11px]">
            Subject / Inquiry <span className="text-gold-400">*</span>
          </Label>
          <Input
            id="contact-subject"
            placeholder="e.g. Fellowship inquiry, Prayer request"
            {...register("subject")}
            aria-invalid={!!errors.subject}
            className="bg-forest-950/50 border-forest-700/60 text-white placeholder:text-forest-400/50 focus-visible:ring-gold-400"
          />
          {errors.subject && (
            <p className="text-[11px] text-red-400">{errors.subject.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message" className="text-forest-100 text-[11px]">
          Message <span className="text-gold-400">*</span>
        </Label>
        <Textarea
          id="contact-message"
          rows={isCompact ? 3 : 4}
          placeholder="How can we assist you or pray with you?"
          {...register("message")}
          aria-invalid={!!errors.message}
          className="bg-forest-950/50 border-forest-700/60 text-white placeholder:text-forest-400/50 focus-visible:ring-gold-400"
        />
        {errors.message && (
          <p className="text-[11px] text-red-400">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="gold"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 h-10 font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-1.5" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
