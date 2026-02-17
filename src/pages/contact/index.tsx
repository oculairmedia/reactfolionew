import React, { useState } from "react";
import * as emailjs from "emailjs-com";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta, contactConfig, contactPage } from "../../content_option";
import type { ContactFormData } from "../../types";

export const ContactUs: React.FC = () => {
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
          setFormdata({
            ...formData,
            loading: false,
            alertmessage:
              contactPage.successMessage || "Message sent successfully!",
            variant: "success",
            show: true,
          });
        },
        (error: { text: string }) => {
          setFormdata({
            ...formData,
            alertmessage: `Failed to send! ${error.text}`,
            variant: "error",
            show: true,
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

  const getAlertClass = () => {
    switch (formData.variant) {
      case "success":
        return "alert-success";
      case "error":
      case "danger":
        return "alert-error";
      default:
        return "";
    }
  };

  return (
    <HelmetProvider>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Helmet>
          <meta charSet="utf-8" />
          <title>{meta.title} | Contact</title>
          <meta name="description" content={meta.description} />
        </Helmet>

        {/* Loading Bar */}
        {formData.loading && (
          <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] bg-primary animate-[shift-rightwards_1s_ease-in-out_infinite_0.3s]" />
        )}

        <div className="animate-[fadeIn_0.3s_ease_forwards]">
          {/* Header */}
          <div className="mb-10 mt-6 md:pt-6">
            <div className="lg:w-2/3">
              <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                {contactPage.title}
              </h1>
              <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
            </div>
          </div>

          {/* Alert */}
          {formData.show && (
            <div role="alert" className={`alert ${getAlertClass()} mb-8`}>
              <span>{formData.alertmessage}</span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setFormdata({ ...formData, show: false })}
              >
                ✕
              </button>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-5">
              <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                {contactPage.sectionTitle}
              </h3>
              <address className="not-italic space-y-4 mb-6">
                <p className="font-mono text-sm">
                  <strong className="text-base-content">Email:</strong>{" "}
                  <a
                    href={`mailto:${contactConfig.YOUR_EMAIL}`}
                    className="link link-hover text-base-content/70"
                  >
                    {contactConfig.YOUR_EMAIL}
                  </a>
                </p>
                {contactConfig.YOUR_FONE && (
                  <p className="font-mono text-sm">
                    <strong className="text-base-content">Phone:</strong>{" "}
                    <span className="text-base-content/70">
                      {contactConfig.YOUR_FONE}
                    </span>
                  </p>
                )}
              </address>
              <p className="font-body text-sm text-base-content/70 leading-relaxed">
                {contactConfig.description}
              </p>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 flex items-center">
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <fieldset className="fieldset">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="NAME"
                      value={formData.name || ""}
                      required
                      onChange={handleChange}
                      className="input input-bordered w-full font-body text-sm placeholder:font-mono placeholder:text-[0.7rem] placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-base-content/50"
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="EMAIL"
                      value={formData.email || ""}
                      required
                      onChange={handleChange}
                      className="input input-bordered w-full font-body text-sm placeholder:font-mono placeholder:text-[0.7rem] placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-base-content/50"
                    />
                  </fieldset>
                </div>

                {/* Message */}
                <fieldset className="fieldset">
                  <textarea
                    id="message"
                    name="message"
                    placeholder="MESSAGE"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="textarea textarea-bordered w-full font-body text-sm placeholder:font-mono placeholder:text-[0.7rem] placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-base-content/50 resize-none"
                  />
                </fieldset>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary font-mono text-[0.7rem] uppercase tracking-[0.15em] px-8"
                    disabled={formData.loading}
                  >
                    {formData.loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        {contactPage.sendingText || "Sending..."}
                      </>
                    ) : (
                      contactPage.submitButton || "Send"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe for loading bar - add to global styles if not present */}
      <style>{`
        @keyframes shift-rightwards {
          0% { transform: translateX(-100%); }
          40% { transform: translateX(0%); }
          60% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </HelmetProvider>
  );
};
