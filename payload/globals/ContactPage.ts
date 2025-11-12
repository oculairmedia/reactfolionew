import { GlobalConfig } from 'payload/types';

const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
      defaultValue: 'Contact Me',
    },
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Get in touch',
    },
    {
      name: 'submitButton',
      type: 'text',
      label: 'Submit Button Text',
      defaultValue: 'Send',
    },
    {
      name: 'sendingText',
      type: 'text',
      label: 'Sending Text',
      defaultValue: 'Sending...',
    },
    {
      name: 'successMessage',
      type: 'text',
      label: 'Success Message',
      defaultValue: 'SUCCESS! Thank you for your message',
    },
    {
      name: 'errorMessage',
      type: 'text',
      label: 'Error Message',
      defaultValue: 'Failed to send message. Please try again.',
    },
    {
      name: 'meta_title',
      type: 'text',
      label: 'SEO Title',
      admin: {
        description: 'Optional: Override page title for SEO',
      },
    },
    {
      name: 'meta_description',
      type: 'textarea',
      label: 'SEO Description',
      admin: {
        description: 'Optional: Override description for SEO',
      },
    },
  ],
};

export default ContactPage;
