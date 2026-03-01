export enum Category {
  CyberSecurity = 'Cyber Security',
  AI = 'Artificial Intelligence',
  IT = 'Information Technology',
  InfoSec = 'Information Security',
}

export interface Review {
  id: number;
  userName: string;
  rating: number; // 1-5
  comment: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: Category;
  price: number;
  imageUrl: string;
  videoUrl?: string;
  reviews?: Review[];
  materialsUrl?: string;
  materialsFileName?: string;
}

export interface CartItem extends Course {
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password; // Hashed in a real app
  enrolledCourses: number[]; // Array of course IDs
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'dropped';
}

export interface Progress {
  id: number;
  userId: number;
  courseId: number;
  lessonId: string;
  completedAt: Date;
  watchTime: number; // in seconds
}

export interface Payment {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

export interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  issuedAt: Date;
  certificateUrl: string;
  verificationCode: string;
}

export interface AdminLog {
  id: number;
  adminId: number;
  action: string;
  entityType: 'user' | 'course' | 'payment' | 'certificate';
  entityId: number;
  details: string;
  timestamp: Date;
}
