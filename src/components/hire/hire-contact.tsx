"use client";

import { Mail, MapPin, Send } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { XIcon } from "@/components/icon";
import { SiteButton } from "@/components/site/SiteButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import cvdata from "@/data/cvdata.json";
import type { HireContent } from "@/lib/hire-content";
import { lcvMustShow } from "@/lib/lab-lcv";

type FormStatus = "idle" | "loading" | "error" | "success";

type HireContactProps = {
  content: Pick<HireContent, "contactLead" | "contactAside" | "formPlaceholder">;
  layoutClass: string;
};

export function HireContact({ content, layoutClass }: HireContactProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const subject = `Hiring note from ${formData.name}`;
    const body = `Hello,\n\n${formData.message}\n\nFrom: ${formData.email}\n\nBest regards,\n${formData.name}`;
    const mailtoUrl = `mailto:${cvdata.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setStatus("success");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const channels: Array<{
    icon: ComponentType<{ className: string }>;
    label: string | null;
    value: string;
    href: string;
    external?: boolean;
  }> = [
    {
      icon: XIcon,
      label: null,
      value: cvdata.cv_social_links.x_handle,
      href: cvdata.cv_social_links.x,
      external: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: cvdata.contact.email,
      href: `mailto:${cvdata.contact.email}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: cvdata.home.current_location,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cvdata.home.current_location)}`,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="hire-phi__section hire-phi__contact"
      aria-labelledby="hire-contact-heading"
    >
      <div className="phi-route-band">
        <header className="hire-phi__section-header">
          <h2 id="hire-contact-heading" className="hire-phi__section-title" {...lcvMustShow}>
            Get in touch
          </h2>
          {content.contactLead ? (
            <p className="hire-phi__section-lead">{content.contactLead}</p>
          ) : null}
        </header>

        <div className={layoutClass}>
          <div className="hire-phi__contact-form">
            <h3 className="hire-phi__contact-form-title">Send a message</h3>
            <form onSubmit={handleSubmit} data-status={status} className="hire-phi__form-fields">
              <div>
                <label htmlFor="hire-name" className="hire-phi__label">
                  Your name
                </label>
                <Input
                  id="hire-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="hire-email" className="hire-phi__label">
                  Email address
                </label>
                <Input
                  id="hire-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jane@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="hire-message" className="hire-phi__label">
                  Message
                </label>
                <Textarea
                  id="hire-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={content.formPlaceholder}
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>
              <SiteButton type="submit" className="w-full" disabled={status === "loading"}>
                <span className="inline-flex items-center gap-2">
                  Send message
                  <Send className="w-4 h-4" aria-hidden="true" />
                </span>
              </SiteButton>
              <p role="status" aria-live="polite" className="text-sm text-text2 min-h-5">
                {status === "success" ? "Opening your email client…" : null}
              </p>
            </form>
          </div>

          <aside className="hire-phi__contact-aside">
            {content.contactAside ? (
              <p className="hire-phi__section-lead">{content.contactAside}</p>
            ) : null}
            <h3 className="hire-phi__contact-form-title">Direct channels</h3>
            <address className="hire-phi__channels not-italic">
              {channels.map((ch) => (
                <a
                  key={ch.href}
                  href={ch.href}
                  className="hire-phi__channel"
                  {...(ch.external
                    ? { target: "_blank", rel: "nofollow noreferrer noopener" }
                    : {})}
                >
                  <span className="hire-phi__channel-icon" aria-hidden="true">
                    <ch.icon className="size-4" />
                  </span>
                  {ch.label ? <span className="hire-phi__channel-label">{ch.label}</span> : null}
                  <span className="hire-phi__channel-value">{ch.value}</span>
                </a>
              ))}
            </address>
          </aside>
        </div>
      </div>
    </section>
  );
}
