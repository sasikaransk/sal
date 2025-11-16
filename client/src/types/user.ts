export type User = {
  id: string;
  displayName: string;
  email: string;
  token: string;
  rolePermissions?: 'Customer' | 'Staff' | 'Admin' | 'ServiceProvider' | 'ThirdParty';
  imageUrl?: string;
};

export type LoginCreds = {
  email: string;
  password: string;
};

export type RegisterCreds = {
  email: string;
  password: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string | null; // ISO or null
  // legacy field kept for compatibility if used elsewhere
  displayName?: string;
  // defaults set on submit
  rolePermissions?: 'Customer' | 'Staff' | 'Admin';
  isActive?: boolean;
  status?: 'Active' | 'Inactive' | 'Suspended';
};
