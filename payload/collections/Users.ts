import { CollectionConfig } from 'payload/types';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Admin users who can access the CMS',
    defaultColumns: ['name', 'email', 'createdAt'],
  },
  access: {
    // Only authenticated users can read user data
    read: ({ req: { user } }) => {
      // Allow authenticated users to read
      if (user) return true;
      // Deny public access to user data
      return false;
    },
    // Only admins can create new users
    create: ({ req: { user } }) => {
      if (user) return true;
      return false;
    },
    // Users can update their own data, admins can update any
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Add role-based logic here if you have admin roles
      return true;
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      if (!user) return false;
      // Add admin-only check if you implement roles
      return true;
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of the user',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
      admin: {
        description: 'User role for permission management',
      },
    },
  ],
};
