"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { landingInvite } from "@/data/landing-invite";
import cvdata from "../data/cvdata.json";
import { XIcon } from "./icon";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { SiteButton } from "./site/SiteButton";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const headingId = "contact-heading";

type FormStatus = "idle" | "loading" | "error" | "success";

export function Contact() {
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

  const contactInfo = [
    {
      icon: XIcon,
      title: "XChat",
      value: cvdata.cv_social_links.x_handle,
      href: cvdata.cv_social_links.x,
      external: true,
    },
    {
      icon: Mail,
      title: "Email",
      value: cvdata.contact.email,
      href: `mailto:${cvdata.contact.email}`,
    },
    ...(cvdata.contact.phone && cvdata.contact.phone_public !== false
      ? [
          {
            icon: Phone,
            title: "Phone",
            value: cvdata.contact.phone,
            href: `tel:${cvdata.contact.phone}`,
          },
        ]
      : []),
    {
      icon: MapPin,
      title: "Location",
      value: cvdata.home.current_location,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cvdata.home.current_location)}`,
      external: true,
    },
  ];

  return (
    <SectionShell id="contact" headingId={headingId}>
      <SectionHeading
        id={headingId}
        title="Get in touch"
        description={landingInvite.contactLead}
        showUnderline
      />

      <div className="contact-layout">
        <section className="contact-form-panel min-w-0" aria-labelledby={`${headingId}-form`}>
          <h3 id={`${headingId}-form`} className="subsection-title subsection-heading">
            Send a message
          </h3>
          <form onSubmit={handleSubmit} data-status={status} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-text1">
                Your name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Jane Doe"
                required
                aria-invalid={status === "error" ? true : undefined}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-text1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-text1">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={landingInvite.formPlaceholder}
                rows={5}
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
        </section>

        <aside className="min-w-0" aria-labelledby={`${headingId}-connect`}>
          <div className="contact-aside-intro">
            <h3 id={`${headingId}-connect`} className="subsection-title">
              Direct channels
            </h3>
            <p className="contact-aside-lead">{landingInvite.contactAside}</p>
          </div>

          <address className="contact-channels not-italic">
            {contactInfo.map((info) => (
              <a
                key={info.title}
                href={info.href}
                className="contact-channel"
                {...("external" in info && info.external
                  ? { target: "_blank", rel: "nofollow noreferrer noopener" }
                  : {})}
              >
                <span className="contact-channel__icon" aria-hidden="true">
                  <info.icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="contact-channel__label">{info.title}</span>
                  <span className="contact-channel__value">{info.value}</span>
                </span>
              </a>
            ))}
          </address>

          <nav className="contact-cv-actions" aria-label="CV">
            <SiteButton href="/?cv=view" variant="secondary">
              View CV
            </SiteButton>
          </nav>
        </aside>
      </div>
    </SectionShell>
  );
}
