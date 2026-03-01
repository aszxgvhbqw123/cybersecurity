import { Course, User, Enrollment, Progress, Payment, Certificate, AdminLog } from './types';
import * as db from './db';

// Data validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUser = (user: Omit<User, 'id'>): string[] => {
  const errors: string[] = [];
  
  if (!user.name || user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!user.email || !validateEmail(user.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!user.password || user.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
};

export const validateCourse = (course: Omit<Course, 'id'>): string[] => {
  const errors: string[] = [];
  
  if (!course.title || course.title.trim().length < 3) {
    errors.push('Course title must be at least 3 characters long');
  }
  
  if (!course.description || course.description.trim().length < 10) {
    errors.push('Course description must be at least 10 characters long');
  }
  
  if (course.price < 0) {
    errors.push('Course price cannot be negative');
  }
  
  if (!course.imageUrl) {
    errors.push('Course image URL is required');
  }
  
  return errors;
};

export const validateEnrollment = (enrollment: Omit<Enrollment, 'id'>): string[] => {
  const errors: string[] = [];
  
  if (!enrollment.userId || enrollment.userId <= 0) {
    errors.push('Valid user ID is required');
  }
  
  if (!enrollment.courseId || enrollment.courseId <= 0) {
    errors.push('Valid course ID is required');
  }
  
  if (!['active', 'completed', 'dropped'].includes(enrollment.status)) {
    errors.push('Invalid enrollment status');
  }
  
  return errors;
};

export const validatePayment = (payment: Omit<Payment, 'id'>): string[] => {
  const errors: string[] = [];
  
  if (!payment.userId || payment.userId <= 0) {
    errors.push('Valid user ID is required');
  }
  
  if (!payment.courseId || payment.courseId <= 0) {
    errors.push('Valid course ID is required');
  }
  
  if (payment.amount <= 0) {
    errors.push('Payment amount must be positive');
  }
  
  if (!payment.currency || payment.currency.length !== 3) {
    errors.push('Valid currency code is required');
  }
  
  if (!['pending', 'completed', 'failed', 'refunded'].includes(payment.status)) {
    errors.push('Invalid payment status');
  }
  
  return errors;
};

// Relationship validation utilities
export const checkUserExists = async (userId: number): Promise<boolean> => {
  try {
    const users = await db.dbGetAllUsers();
    return users.some(user => user.id === userId);
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

export const checkCourseExists = async (courseId: number): Promise<boolean> => {
  try {
    const courses = await db.dbGetAllCourses();
    return courses.some(course => course.id === courseId);
  } catch (error) {
    console.error('Error checking course existence:', error);
    return false;
  }
};

export const checkEnrollmentExists = async (userId: number, courseId: number): Promise<boolean> => {
  try {
    const enrollments = await db.dbGetEnrollmentsByUser(userId);
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  } catch (error) {
    console.error('Error checking enrollment existence:', error);
    return false;
  }
};

export const checkCertificateExists = async (userId: number, courseId: number): Promise<boolean> => {
  try {
    const certificates = await db.dbGetCertificatesByUser(userId);
    return certificates.some(certificate => certificate.courseId === courseId);
  } catch (error) {
    console.error('Error checking certificate existence:', error);
    return false;
  }
};

// Data integrity checks
export const validateEnrollmentIntegrity = async (enrollment: Omit<Enrollment, 'id'>): Promise<string[]> => {
  const errors = validateEnrollment(enrollment);
  
  // Check if user exists
  const userExists = await checkUserExists(enrollment.userId);
  if (!userExists) {
    errors.push('User does not exist');
  }
  
  // Check if course exists
  const courseExists = await checkCourseExists(enrollment.courseId);
  if (!courseExists) {
    errors.push('Course does not exist');
  }
  
  // Check for duplicate enrollment
  const enrollmentExists = await checkEnrollmentExists(enrollment.userId, enrollment.courseId);
  if (enrollmentExists) {
    errors.push('User is already enrolled in this course');
  }
  
  return errors;
};

export const validatePaymentIntegrity = async (payment: Omit<Payment, 'id'>): Promise<string[]> => {
  const errors = validatePayment(payment);
  
  // Check if user exists
  const userExists = await checkUserExists(payment.userId);
  if (!userExists) {
    errors.push('User does not exist');
  }
  
  // Check if course exists
  const courseExists = await checkCourseExists(payment.courseId);
  if (!courseExists) {
    errors.push('Course does not exist');
  }
  
  // Check for duplicate transaction ID
  if (payment.transactionId) {
    try {
      const existingPayment = await db.dbGetPaymentByTransactionId(payment.transactionId);
      if (existingPayment) {
        errors.push('Transaction ID already exists');
      }
    } catch (error) {
      // Payment doesn't exist, which is good
    }
  }
  
  return errors;
};

export const validateCertificateIntegrity = async (certificate: Omit<Certificate, 'id'>): Promise<string[]> => {
  const errors: string[] = [];
  
  // Check if user exists
  const userExists = await checkUserExists(certificate.userId);
  if (!userExists) {
    errors.push('User does not exist');
  }
  
  // Check if course exists
  const courseExists = await checkCourseExists(certificate.courseId);
  if (!courseExists) {
    errors.push('Course does not exist');
  }
  
  // Check if user is enrolled and completed the course
  const enrollments = await db.dbGetEnrollmentsByUser(certificate.userId);
  const enrollment = enrollments.find(e => e.courseId === certificate.courseId);
  if (!enrollment || enrollment.status !== 'completed') {
    errors.push('User must be enrolled and have completed the course');
  }
  
  // Check for duplicate certificate
  const certificateExists = await checkCertificateExists(certificate.userId, certificate.courseId);
  if (certificateExists) {
    errors.push('Certificate already exists for this user and course');
  }
  
  // Check for duplicate verification code
  if (certificate.verificationCode) {
    try {
      const existingCertificate = await db.dbGetCertificateByVerificationCode(certificate.verificationCode);
      if (existingCertificate) {
        errors.push('Verification code already exists');
      }
    } catch (error) {
      // Certificate doesn't exist, which is good
    }
  }
  
  return errors;
};

// Generate unique verification codes
export const generateVerificationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate transaction IDs
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `TXN_${timestamp}_${random}`.toUpperCase();
};

// Date utilities
export const getCurrentTimestamp = (): Date => {
  return new Date();
};

export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};
