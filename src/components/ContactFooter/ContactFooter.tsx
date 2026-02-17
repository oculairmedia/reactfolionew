import React, { useState } from "react";
import * as emailjs from "emailjs-com";
import { Link } from "@tanstack/react-router";
import { contactConfig, contactPage } from "../../content_option";
import { useToast } from "../Toast";
import type { ContactFormData } from "../../types";

export const ContactFooter = () => {
  const { addToast } = useToast();
  const [formData, setFormdata] = useState<ContactFormData>({
    email: "",
    name: "",
    message: "",
    loading: false,
    show: false,
    alertmessage: "",
    variant: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormdata({ ...formData, loading: true });

    const templateParams = {
      from_name: formData.email,
      user_name: formData.name,
      to_name: contactConfig.YOUR_EMAIL,
      message: formData.message,
    };

    emailjs
      .send(
        contactConfig.YOUR_SERVICE_ID,
        contactConfig.YOUR_TEMPLATE_ID,
        templateParams,
        contactConfig.YOUR_PUBLIC_KEY,
      )
      .then(
        () => {
          // Show success toast
          addToast(
            contactPage.successMessage || "Message sent successfully!",
            "success",
            5000,
          );
          // Reset form
          setFormdata({
            email: "",
            name: "",
            message: "",
            loading: false,
            alertmessage: "",
            variant: "",
            show: false,
          });
        },
        (error: { text: string }) => {
          // Show error toast
          addToast(`Failed to send message: ${error.text}`, "error", 7000);
          setFormdata({
            ...formData,
            loading: false,
          });
        },
      );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormdata({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <footer
      id="contact-footer"
      className="footer bg-base-200 border-t-2 border-base-content/10 py-16"
    >
      {/* Loading Progress Bar */}
      {formData.loading && (
        <div className="fixed top-0 left-0 right-0 z-[99999]">
          <progress className="progress progress-primary w-full h-[3px]"></progress>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info Card */}
          <div className="lg:col-span-5">
            <div className="card bg-base-300 shadow-none">
              <div className="card-body p-6">
                <h3 className="card-title font-heading text-xl font-bold uppercase tracking-tight text-base-content">
                  {contactPage.sectionTitle || "Get In Touch"}
                </h3>

                <div className="divider my-2"></div>

                <address className="not-italic space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="badge badge-primary badge-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <a
                      href={`mailto:${contactConfig.YOUR_EMAIL}`}
                      className="link link-hover font-mono text-sm text-base-content/80"
                    >
                      {contactConfig.YOUR_EMAIL}
                    </a>
                  </div>

                  {contactConfig.YOUR_FONE && (
                    <div className="flex items-center gap-3">
                      <div className="badge badge-primary badge-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span className="font-mono text-sm text-base-content/80">
                        {contactConfig.YOUR_FONE}
                      </span>
                    </div>
                  )}
                </address>

                <p className="font-body text-sm text-base-content/70 leading-relaxed mt-4">
                  {contactConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend font-mono text-xs uppercase tracking-wider">
                    Name
                  </legend>
                  <label className="input input-bordered w-full flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <input
                      type="text"
                      id="footer-name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      required
                      onChange={handleChange}
                      className="grow font-body text-sm placeholder:text-base-content/40"
                    />
                  </label>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend font-mono text-xs uppercase tracking-wider">
                    Email
                  </legend>
                  <label className="input input-bordered w-full flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="email"
                      id="footer-email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      required
                      onChange={handleChange}
                      className="grow font-body text-sm placeholder:text-base-content/40"
                    />
                  </label>
                </fieldset>
              </div>

              {/* Message */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend font-mono text-xs uppercase tracking-wider">
                  Message
                </legend>
                <textarea
                  id="footer-message"
                  name="message"
                  placeholder="Write your message here..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="textarea textarea-bordered w-full font-body text-sm placeholder:text-base-content/40 resize-none"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50 font-mono text-xs">
                    I'll get back to you as soon as possible
                  </span>
                </label>
              </fieldset>

              {/* Submit Button */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="btn btn-primary font-mono text-xs uppercase tracking-widest px-8"
                  disabled={formData.loading}
                >
                  {formData.loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {contactPage.sendingText || "Sending..."}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      {contactPage.submitButton || "Send Message"}
                    </>
                  )}
                </button>

                {formData.loading && (
                  <span className="text-base-content/50 font-mono text-xs uppercase tracking-wider animate-pulse">
                    Please wait...
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="divider my-8"></div>

        {/* Secondary Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
          {[
            { to: "/", label: "Home" },
            { to: "/portfolio", label: "Portfolio" },
            { to: "/about", label: "About" },
            { to: "/blog", label: "Blog" },
            { to: "/links", label: "Links" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="font-mono text-xs uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-base-content/50">
          <p className="font-mono text-xs uppercase tracking-wider">
            © {new Date().getFullYear()} All rights reserved
          </p>
          <div className="flex items-center gap-2">
            <span className="status status-success"></span>
            <span className="font-mono text-xs uppercase tracking-wider">
              Available for work
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
