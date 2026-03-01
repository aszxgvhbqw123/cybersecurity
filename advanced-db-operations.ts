import { Course, User, Enrollment, Progress, Payment, Certificate, AdminLog } from './types';
import * as db from './db';
import * as utils from './database-utils';

// Enhanced User Operations
export const createUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  const errors = utils.validateUser(userData);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  try {
    // Check if email already exists
    const existingUsers = await db.dbGetAllUsers();
    if (existingUsers.some(user => user.email === userData.email)) {
      return { success: false, errors: ['Email already exists'] };
    }
    
    const userId = await db.dbAddUser(userData as User);
    const users = await db.dbGetAllUsers();
    const newUser = users.find(u => u.id === userId);
    
    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, errors: ['Failed to create user'] };
  }
};

export const updateUser = async (userId: number, userData: Partial<User>): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  try {
    const users = await db.dbGetAllUsers();
    const existingUser = users.find(u => u.id === userId);
    
    if (!existingUser) {
      return { success: false, errors: ['User not found'] };
    }
    
    // Validate email if being updated
    if (userData.email && userData.email !== existingUser.email) {
      if (!utils.validateEmail(userData.email)) {
        return { success: false, errors: ['Invalid email format'] };
      }
      
      // Check if new email already exists
      if (users.some(u => u.email === userData.email && u.id !== userId)) {
        return { success: false, errors: ['Email already exists'] };
      }
    }
    
    const updatedUser = { ...existingUser, ...userData };
    await db.dbUpdateUser(updatedUser);
    
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, errors: ['Failed to update user'] };
  }
};

// Enhanced Course Operations
export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<{ success: boolean; course?: Course; errors?: string[] }> => {
  const errors = utils.validateCourse(courseData);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  try {
    const courseId = await db.dbAddCourse(courseData as Course);
    const courses = await db.dbGetAllCourses();
    const newCourse = courses.find(c => c.id === courseId);
    
    return { success: true, course: newCourse };
  } catch (error) {
    return { success: false, errors: ['Failed to create course'] };
  }
};

// Enhanced Enrollment Operations
export const enrollUserInCourse = async (userId: number, courseId: number): Promise<{ success: boolean; enrollment?: Enrollment; errors?: string[] }> => {
  const enrollmentData: Omit<Enrollment, 'id'> = {
    userId,
    courseId,
    enrolledAt: utils.getCurrentTimestamp(),
    status: 'active'
  };
  
  const errors = await utils.validateEnrollmentIntegrity(enrollmentData);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  try {
    const enrollmentId = await db.dbAddEnrollment(enrollmentData as Enrollment);
    const enrollments = await db.dbGetAllEnrollments();
    const newEnrollment = enrollments.find(e => e.id === enrollmentId);
    
    // Update user's enrolled courses array for backward compatibility
    const users = await db.dbGetAllUsers();
    const user = users.find(u => u.id === userId);
    if (user && !user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await db.dbUpdateUser(user);
    }
    
    return { success: true, enrollment: newEnrollment };
  } catch (error) {
    return { success: false, errors: ['Failed to create enrollment'] };
  }
};

export const completeCourse = async (userId: number, courseId: number): Promise<{ success: boolean; enrollment?: Enrollment; errors?: string[] }> => {
  try {
    const enrollments = await db.dbGetEnrollmentsByUser(userId);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    
    if (!enrollment) {
      return { success: false, errors: ['Enrollment not found'] };
    }
    
    if (enrollment.status === 'completed') {
      return { success: false, errors: ['Course already completed'] };
    }
    
    const updatedEnrollment = {
      ...enrollment,
      status: 'completed' as const,
      completedAt: utils.getCurrentTimestamp()
    };
    
    await db.dbUpdateEnrollment(updatedEnrollment);
    
    return { success: true, enrollment: updatedEnrollment };
  } catch (error) {
    return { success: false, errors: ['Failed to complete course'] };
  }
};

// Enhanced Payment Operations
export const createPayment = async (paymentData: Omit<Payment, 'id'>): Promise<{ success: boolean; payment?: Payment; errors?: string[] }> => {
  // Generate transaction ID if not provided
  if (!paymentData.transactionId) {
    paymentData.transactionId = utils.generateTransactionId();
  }
  
  // Set creation date if not provided
  if (!paymentData.createdAt) {
    paymentData.createdAt = utils.getCurrentTimestamp();
  }
  
  const errors = await utils.validatePaymentIntegrity(paymentData);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  try {
    const paymentId = await db.dbAddPayment(paymentData as Payment);
    const payments = await db.dbGetAllPayments();
    const newPayment = payments.find(p => p.id === paymentId);
    
    return { success: true, payment: newPayment };
  } catch (error) {
    return { success: false, errors: ['Failed to create payment'] };
  }
};

export const completePayment = async (transactionId: string): Promise<{ success: boolean; payment?: Payment; errors?: string[] }> => {
  try {
    const payment = await db.dbGetPaymentByTransactionId(transactionId);
    
    if (!payment) {
      return { success: false, errors: ['Payment not found'] };
    }
    
    if (payment.status === 'completed') {
      return { success: false, errors: ['Payment already completed'] };
    }
    
    const updatedPayment = {
      ...payment,
      status: 'completed' as const
    };
    
    await db.dbUpdatePayment(updatedPayment);
    
    // Auto-enroll user in course if payment is completed
    await enrollUserInCourse(payment.userId, payment.courseId);
    
    return { success: true, payment: updatedPayment };
  } catch (error) {
    return { success: false, errors: ['Failed to complete payment'] };
  }
};

// Enhanced Certificate Operations
export const issueCertificate = async (userId: number, courseId: number): Promise<{ success: boolean; certificate?: Certificate; errors?: string[] }> => {
  const certificateData: Omit<Certificate, 'id'> = {
    userId,
    courseId,
    issuedAt: utils.getCurrentTimestamp(),
    certificateUrl: `/certificates/${userId}_${courseId}.pdf`,
    verificationCode: utils.generateVerificationCode()
  };
  
  const errors = await utils.validateCertificateIntegrity(certificateData);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  try {
    const certificateId = await db.dbAddCertificate(certificateData as Certificate);
    const certificates = await db.dbGetAllCertificates();
    const newCertificate = certificates.find(c => c.id === certificateId);
    
    return { success: true, certificate: newCertificate };
  } catch (error) {
    return { success: false, errors: ['Failed to issue certificate'] };
  }
};

// Enhanced Progress Operations
export const updateProgress = async (userId: number, courseId: number, lessonId: string, watchTime: number): Promise<{ success: boolean; progress?: Progress; errors?: string[] }> => {
  try {
    // Check if user exists
    const userExists = await utils.checkUserExists(userId);
    if (!userExists) {
      return { success: false, errors: ['User does not exist'] };
    }
    
    // Check if course exists
    const courseExists = await utils.checkCourseExists(courseId);
    if (!courseExists) {
      return { success: false, errors: ['Course does not exist'] };
    }
    
    // Check if progress already exists for this lesson
    const existingProgress = await db.dbGetProgressByUser(userId);
    const progressRecord = existingProgress.find(p => p.courseId === courseId && p.lessonId === lessonId);
    
    const progressData: Omit<Progress, 'id'> = {
      userId,
      courseId,
      lessonId,
      completedAt: utils.getCurrentTimestamp(),
      watchTime
    };
    
    let result: Progress;
    
    if (progressRecord) {
      // Update existing progress
      const updatedProgress = { ...progressRecord, ...progressData };
      await db.dbUpdateProgress(updatedProgress);
      result = updatedProgress;
    } else {
      // Create new progress record
      const progressId = await db.dbAddProgress(progressData as Progress);
      const allProgress = await db.dbGetAllProgress();
      result = allProgress.find(p => p.id === progressId)!;
    }
    
    return { success: true, progress: result };
  } catch (error) {
    return { success: false, errors: ['Failed to update progress'] };
  }
};

// Enhanced Admin Log Operations
export const logAdminAction = async (adminId: number, action: string, entityType: 'user' | 'course' | 'payment' | 'certificate', entityId: number, details: string): Promise<{ success: boolean; log?: AdminLog; errors?: string[] }> => {
  try {
    // Check if admin exists
    const userExists = await utils.checkUserExists(adminId);
    if (!userExists) {
      return { success: false, errors: ['Admin user does not exist'] };
    }
    
    const logData: Omit<AdminLog, 'id'> = {
      adminId,
      action,
      entityType,
      entityId,
      details,
      timestamp: utils.getCurrentTimestamp()
    };
    
    const logId = await db.dbAddAdminLog(logData as AdminLog);
    const logs = await db.dbGetAllAdminLogs();
    const newLog = logs.find(l => l.id === logId);
    
    return { success: true, log: newLog };
  } catch (error) {
    return { success: false, errors: ['Failed to log admin action'] };
  }
};

// Batch Operations
export const deleteUserData = async (userId: number): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    const errors: string[] = [];
    
    // Delete user's enrollments
    const enrollments = await db.dbGetEnrollmentsByUser(userId);
    for (const enrollment of enrollments) {
      await db.dbDeleteEnrollment(enrollment.id);
    }
    
    // Delete user's progress
    const progress = await db.dbGetProgressByUser(userId);
    for (const progressRecord of progress) {
      await db.dbDeleteProgress(progressRecord.id);
    }
    
    // Delete user's payments
    const payments = await db.dbGetPaymentsByUser(userId);
    for (const payment of payments) {
      await db.dbDeletePayment(payment.id);
    }
    
    // Delete user's certificates
    const certificates = await db.dbGetCertificatesByUser(userId);
    for (const certificate of certificates) {
      await db.dbDeleteCertificate(certificate.id);
    }
    
    // Delete the user
    await db.dbDeleteUser(userId);
    
    return { success: true };
  } catch (error) {
    return { success: false, errors: ['Failed to delete user data'] };
  }
};

export const deleteCourseData = async (courseId: number): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    const errors: string[] = [];
    
    // Delete course enrollments
    const enrollments = await db.dbGetEnrollmentsByCourse(courseId);
    for (const enrollment of enrollments) {
      await db.dbDeleteEnrollment(enrollment.id);
    }
    
    // Delete course progress
    const progress = await db.dbGetProgressByCourse(courseId);
    for (const progressRecord of progress) {
      await db.dbDeleteProgress(progressRecord.id);
    }
    
    // Delete course payments
    const payments = await db.dbGetAllPayments();
    const coursePayments = payments.filter(p => p.courseId === courseId);
    for (const payment of coursePayments) {
      await db.dbDeletePayment(payment.id);
    }
    
    // Delete course certificates
    const certificates = await db.dbGetAllCertificates();
    const courseCertificates = certificates.filter(c => c.courseId === courseId);
    for (const certificate of courseCertificates) {
      await db.dbDeleteCertificate(certificate.id);
    }
    
    // Delete the course
    await db.dbDeleteCourse(courseId);
    
    return { success: true };
  } catch (error) {
    return { success: false, errors: ['Failed to delete course data'] };
  }
};
