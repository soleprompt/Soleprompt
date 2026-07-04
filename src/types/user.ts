export type UserRole = "buyer" | "seller" | "admin";

export type SellerStatus = "none" | "pending" | "approved" | "rejected";

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface UserProfile {
  username?: string;
  bio?: string;
  country?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface UserMetadata {
  role?: UserRole;
  sellerStatus?: SellerStatus;
  profile?: UserProfile;
}

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: string;
}
