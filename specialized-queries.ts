import { Course, User, Enrollment, Progress, Payment, Certificate, AdminLog, Category } from './types';
import * as db from './db';

// User-related specialized queries
export const getUserWithEnrollments = async (userId: number): Promise<{ user?: User; enrollments?: Enrollment[]; error?: string }> => {
  try {
    const users = await db.dbGetAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    const enrollments = await db.dbGetEnrollmentsByUser(userId);
    
    return { user, enrollments };
  } catch (error) {
    return { error: 'Failed to fetch user data' };
  }
};

export const getUserProgressSummary = async (userId: number): Promise<{ 
  totalEnrollments: number; 
  completedCourses: number; 
  activeCourses: number; 
  totalWatchTime: number;
  certificates: number;
  error?: string 
}> => {
  try {
    const enrollments = await db.dbGetEnrollmentsByUser(userId);
    const progress = await db.dbGetProgressByUser(userId);
    const certificates = await db.dbGetCertificatesByUser(userId);
    
    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const activeCourses = enrollments.filter(e => e.status === 'active').length;
    const totalWatchTime = progress.reduce((total, p) => total + p.watchTime, 0);
    
    return {
      totalEnrollments,
      completedCourses,
      activeCourses,
      totalWatchTime,
      certificates: certificates.length
    };
  } catch (error) {
    return { totalEnrollments: 0, completedCourses: 0, activeCourses: 0, totalWatchTime: 0, certificates: 0, error: 'Failed to fetch progress summary' };
  }
};

// Course-related specialized queries
export const getCourseWithStats = async (courseId: number): Promise<{ 
  course?: Course; 
  enrollments: number; 
  completions: number; 
  revenue: number; 
  averageRating: number;
  error?: string 
}> => {
  try {
    const courses = await db.dbGetAllCourses();
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      return { enrollments: 0, completions: 0, revenue: 0, averageRating: 0, error: 'Course not found' };
    }
    
    const enrollments = await db.dbGetEnrollmentsByCourse(courseId);
    const payments = await db.dbGetAllPayments();
    const coursePayments = payments.filter(p => p.courseId === courseId && p.status === 'completed');
    
    const enrollmentCount = enrollments.length;
    const completionCount = enrollments.filter(e => e.status === 'completed').length;
    const revenue = coursePayments.reduce((total, p) => total + p.amount, 0);
    
    // Calculate average rating
    const totalRating = (course.reviews || []).reduce((total, review) => total + review.rating, 0);
    const averageRating = course.reviews && course.reviews.length > 0 ? totalRating / course.reviews.length : 0;
    
    return {
      course,
      enrollments: enrollmentCount,
      completions: completionCount,
      revenue,
      averageRating
    };
  } catch (error) {
    return { enrollments: 0, completions: 0, revenue: 0, averageRating: 0, error: 'Failed to fetch course stats' };
  }
};

export const getCoursesByCategory = async (category: Category): Promise<{ courses?: Course[]; error?: string }> => {
  try {
    const courses = await db.dbGetAllCourses();
    const filteredCourses = courses.filter(c => c.category === category);
    
    return { courses: filteredCourses };
  } catch (error) {
    return { error: 'Failed to fetch courses by category' };
  }
};

export const getFreeCourses = async (): Promise<{ courses?: Course[]; error?: string }> => {
  try {
    const courses = await db.dbGetAllCourses();
    const freeCourses = courses.filter(c => c.price === 0);
    
    return { courses: freeCourses };
  } catch (error) {
    return { error: 'Failed to fetch free courses' };
  }
};

export const getPaidCourses = async (): Promise<{ courses?: Course[]; error?: string }> => {
  try {
    const courses = await db.dbGetAllCourses();
    const paidCourses = courses.filter(c => c.price > 0);
    
    return { courses: paidCourses };
  } catch (error) {
    return { error: 'Failed to fetch paid courses' };
  }
};

// Search and filter functions
export const searchCourses = async (query: string): Promise<{ courses?: Course[]; error?: string }> => {
  try {
    const courses = await db.dbGetAllCourses();
    const lowercaseQuery = query.toLowerCase();
    
    const filteredCourses = courses.filter(course => 
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.category.toLowerCase().includes(lowercaseQuery)
    );
    
    return { courses: filteredCourses };
  } catch (error) {
    return { error: 'Failed to search courses' };
  }
};

export const searchUsers = async (query: string): Promise<{ users?: User[]; error?: string }> => {
  try {
    const users = await db.dbGetAllUsers();
    const lowercaseQuery = query.toLowerCase();
    
    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
    
    return { users: filteredUsers };
  } catch (error) {
    return { error: 'Failed to search users' };
  }
};

// Analytics and reporting functions
export const getPlatformStats = async (): Promise<{ 
  totalUsers: number; 
  totalCourses: number; 
  totalEnrollments: number; 
  totalRevenue: number; 
  totalCertificates: number;
  error?: string 
}> => {
  try {
    const users = await db.dbGetAllUsers();
    const courses = await db.dbGetAllCourses();
    const enrollments = await db.dbGetAllEnrollments();
    const payments = await db.dbGetAllPayments();
    const certificates = await db.dbGetAllCertificates();
    
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((total, p) => total + p.amount, 0);
    
    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalRevenue,
      totalCertificates: certificates.length
    };
  } catch (error) {
    return { totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0, totalCertificates: 0, error: 'Failed to fetch platform stats' };
  }
};

export const getRevenueByMonth = async (year: number): Promise<{ month: string; revenue: number }[]> => {
  try {
    const payments = await db.dbGetAllPayments();
    const completedPayments = payments.filter(p => 
      p.status === 'completed' && 
      p.createdAt.getFullYear() === year
    );
    
    const monthlyRevenue = new Map<string, number>();
    
    // Initialize all months with 0 revenue
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => monthlyRevenue.set(month, 0));
    
    // Aggregate revenue by month
    completedPayments.forEach(payment => {
      const month = payment.createdAt.toLocaleString('default', { month: 'short' });
      const currentRevenue = monthlyRevenue.get(month) || 0;
      monthlyRevenue.set(month, currentRevenue + payment.amount);
    });
    
    return Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({ month, revenue }));
  } catch (error) {
    return [];
  }
};

export const getPopularCourses = async (limit: number = 10): Promise<{ courses?: (Course & { enrollmentCount: number })[]; error?: string }> => {
  try {
    const courses = await db.dbGetAllCourses();
    const enrollments = await db.dbGetAllEnrollments();
    
    // Count enrollments per course
    const enrollmentCounts = new Map<number, number>();
    enrollments.forEach(enrollment => {
      const count = enrollmentCounts.get(enrollment.courseId) || 0;
      enrollmentCounts.set(enrollment.courseId, count + 1);
    });
    
    // Sort courses by enrollment count
    const coursesWithStats = courses
      .map(course => ({
        ...course,
        enrollmentCount: enrollmentCounts.get(course.id) || 0
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, limit);
    
    return { courses: coursesWithStats };
  } catch (error) {
    return { error: 'Failed to fetch popular courses' };
  }
};

// Progress and completion tracking
export const getCourseProgressForUser = async (userId: number, courseId: number): Promise<{ 
  progressPercentage: number; 
  completedLessons: number; 
  totalLessons: number; 
  totalWatchTime: number;
  error?: string 
}> => {
  try {
    const progress = await db.dbGetProgressByUser(userId);
    const courseProgress = progress.filter(p => p.courseId === courseId);
    
    // This is a simplified calculation - in a real app, you'd get total lessons from course data
    const completedLessons = courseProgress.length;
    const totalLessons = 10; // Placeholder - should come from course curriculum
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const totalWatchTime = courseProgress.reduce((total, p) => total + p.watchTime, 0);
    
    return {
      progressPercentage,
      completedLessons,
      totalLessons,
      totalWatchTime
    };
  } catch (error) {
    return { progressPercentage: 0, completedLessons: 0, totalLessons: 0, totalWatchTime: 0, error: 'Failed to fetch course progress' };
  }
};

// Certificate verification
export const verifyCertificate = async (verificationCode: string): Promise<{ 
  valid: boolean; 
  certificate?: Certificate; 
  user?: User; 
  course?: Course; 
  error?: string 
}> => {
  try {
    const certificate = await db.dbGetCertificateByVerificationCode(verificationCode);
    
    if (!certificate) {
      return { valid: false, error: 'Certificate not found' };
    }
    
    const users = await db.dbGetAllUsers();
    const user = users.find(u => u.id === certificate.userId);
    
    const courses = await db.dbGetAllCourses();
    const course = courses.find(c => c.id === certificate.courseId);
    
    return {
      valid: true,
      certificate,
      user,
      course
    };
  } catch (error) {
    return { valid: false, error: 'Failed to verify certificate' };
  }
};

// Admin activity tracking
export const getRecentAdminActivity = async (limit: number = 50): Promise<{ logs?: AdminLog[]; error?: string }> => {
  try {
    const logs = await db.dbGetAllAdminLogs();
    
    // Sort by timestamp (most recent first) and limit
    const recentLogs = logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return { logs: recentLogs };
  } catch (error) {
    return { error: 'Failed to fetch recent admin activity' };
  }
};

export const getEntityHistory = async (entityType: 'user' | 'course' | 'payment' | 'certificate', entityId: number): Promise<{ logs?: AdminLog[]; error?: string }> => {
  try {
    const logs = await db.dbGetLogsByEntity(entityType, entityId);
    
    // Sort by timestamp (most recent first)
    const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return { logs: sortedLogs };
  } catch (error) {
    return { error: 'Failed to fetch entity history' };
  }
};

// Payment analytics
export const getPaymentStats = async (): Promise<{ 
  totalPayments: number; 
  completedPayments: number; 
  pendingPayments: number; 
  failedPayments: number; 
  totalRevenue: number;
  averagePaymentAmount: number;
  error?: string 
}> => {
  try {
    const payments = await db.dbGetAllPayments();
    
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    
    const completedPaymentData = payments.filter(p => p.status === 'completed');
    const totalRevenue = completedPaymentData.reduce((total, p) => total + p.amount, 0);
    const averagePaymentAmount = completedPaymentData.length > 0 ? totalRevenue / completedPaymentData.length : 0;
    
    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      averagePaymentAmount
    };
  } catch (error) {
    return { totalPayments: 0, completedPayments: 0, pendingPayments: 0, failedPayments: 0, totalRevenue: 0, averagePaymentAmount: 0, error: 'Failed to fetch payment stats' };
  }
};
