
import { Course, User, SiteSettings, Category, Enrollment, Progress, Payment, Certificate, AdminLog } from './types';
import { MOCK_COURSES } from './constants';

const DB_NAME = 'MSecPlatformDB';
const DB_VERSION = 3;

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = (event.target as IDBOpenDBRequest).result;
      
      // Create tables if they don't exist
      if (!tempDb.objectStoreNames.contains('courses')) {
        const courseStore = tempDb.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
        courseStore.createIndex('category', 'category', { unique: false });
        courseStore.createIndex('price', 'price', { unique: false });
        courseStore.createIndex('title', 'title', { unique: false });
      }
      if (!tempDb.objectStoreNames.contains('users')) {
        const userStore = tempDb.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('name', 'name', { unique: false });
      }
      if (!tempDb.objectStoreNames.contains('siteSettings')) {
        tempDb.createObjectStore('siteSettings', { keyPath: 'id' });
      }
      
      // Enhanced enrollments table with composite indexes
      if (!tempDb.objectStoreNames.contains('enrollments')) {
        const enrollmentStore = tempDb.createObjectStore('enrollments', { keyPath: 'id', autoIncrement: true });
        enrollmentStore.createIndex('userId', 'userId', { unique: false });
        enrollmentStore.createIndex('courseId', 'courseId', { unique: false });
        enrollmentStore.createIndex('status', 'status', { unique: false });
        enrollmentStore.createIndex('enrolledAt', 'enrolledAt', { unique: false });
        enrollmentStore.createIndex('completedAt', 'completedAt', { unique: false });
        // Composite index for user+course (unique enrollment per user per course)
        enrollmentStore.createIndex('userCourse', ['userId', 'courseId'], { unique: true });
      }
      
      // Enhanced progress table with better indexing
      if (!tempDb.objectStoreNames.contains('progress')) {
        const progressStore = tempDb.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
        progressStore.createIndex('userId', 'userId', { unique: false });
        progressStore.createIndex('courseId', 'courseId', { unique: false });
        progressStore.createIndex('lessonId', 'lessonId', { unique: false });
        progressStore.createIndex('completedAt', 'completedAt', { unique: false });
        progressStore.createIndex('watchTime', 'watchTime', { unique: false });
        // Composite index for user+course+lesson (unique progress per lesson)
        progressStore.createIndex('userCourseLesson', ['userId', 'courseId', 'lessonId'], { unique: true });
      }
      
      // Enhanced payments table with transaction tracking
      if (!tempDb.objectStoreNames.contains('payments')) {
        const paymentStore = tempDb.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
        paymentStore.createIndex('userId', 'userId', { unique: false });
        paymentStore.createIndex('courseId', 'courseId', { unique: false });
        paymentStore.createIndex('status', 'status', { unique: false });
        paymentStore.createIndex('transactionId', 'transactionId', { unique: true });
        paymentStore.createIndex('createdAt', 'createdAt', { unique: false });
        paymentStore.createIndex('amount', 'amount', { unique: false });
        paymentStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
      }
      
      // Enhanced certificates table with verification
      if (!tempDb.objectStoreNames.contains('certificates')) {
        const certificateStore = tempDb.createObjectStore('certificates', { keyPath: 'id', autoIncrement: true });
        certificateStore.createIndex('userId', 'userId', { unique: false });
        certificateStore.createIndex('courseId', 'courseId', { unique: false });
        certificateStore.createIndex('verificationCode', 'verificationCode', { unique: true });
        certificateStore.createIndex('issuedAt', 'issuedAt', { unique: false });
        // Composite index for user+course (unique certificate per user per course)
        certificateStore.createIndex('userCourse', ['userId', 'courseId'], { unique: true });
      }
      
      // Enhanced admin logs table with better tracking
      if (!tempDb.objectStoreNames.contains('adminLogs')) {
        const logStore = tempDb.createObjectStore('adminLogs', { keyPath: 'id', autoIncrement: true });
        logStore.createIndex('adminId', 'adminId', { unique: false });
        logStore.createIndex('entityType', 'entityType', { unique: false });
        logStore.createIndex('entityId', 'entityId', { unique: false });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
        logStore.createIndex('action', 'action', { unique: false });
        // Composite index for admin+timestamp for chronological admin activity
        logStore.createIndex('adminTimestamp', ['adminId', 'timestamp'], { unique: false });
        // Composite index for entity+timestamp for entity history
        logStore.createIndex('entityTimestamp', ['entityType', 'entityId', 'timestamp'], { unique: false });
      }
    };
  });
};

export const initDB = async () => {
  const db = await openDB();
  
  // Seed courses if the store is empty
  const courseTx = db.transaction('courses', 'readonly');
  const courseStore = courseTx.objectStore('courses');
  const courseCountRequest = courseStore.count();

  courseCountRequest.onsuccess = () => {
    if (courseCountRequest.result === 0) {
      const addTx = db.transaction('courses', 'readwrite');
      const addStore = addTx.objectStore('courses');
      MOCK_COURSES.forEach(course => {
        const { id, ...rest } = course;
        // Use put instead of add to avoid "Key already exists" error if race conditions occur
        addStore.put({ ...rest, id: course.id });
      });
    }
  };

  // Seed settings if empty
   const settingsTx = db.transaction('siteSettings', 'readonly');
   const settingsStore = settingsTx.objectStore('siteSettings');
   const settingsCountRequest = settingsStore.count();

   settingsCountRequest.onsuccess = () => {
    if (settingsCountRequest.result === 0) {
        const addTx = db.transaction('siteSettings', 'readwrite');
        const addStore = addTx.objectStore('siteSettings');
        addStore.put({
            id: 'main',
            heroTitle: 'Unlock the Future of Tech.',
            heroSubtitle: 'Master Cybersecurity, AI, and IT with industry-leading courses designed for the next generation of tech experts.',
        });
    }
   }
};

// Generic CRUD functions
const getAll = <T,>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

const add = <T,>(storeName: string, item: T): Promise<IDBValidKey> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        // Using put instead of add prevents 'Key already exists' errors by updating if the key exists.
        // This is safer when manually managing IDs or dealing with race conditions.
        const request = store.put(item);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

const update = <T,>(storeName: string, item: T): Promise<IDBValidKey> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};


const remove = (storeName: string, key: IDBValidKey): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

// Courses
export const dbGetAllCourses = () => getAll<Course>('courses');
export const dbAddCourse = (course: Course) => add<Course>('courses', course);
export const dbUpdateCourse = (course: Course) => update<Course>('courses', course);
export const dbDeleteCourse = (courseId: number) => remove('courses', courseId);

// Users
export const dbGetAllUsers = () => getAll<User>('users');
export const dbAddUser = (user: User) => add<User>('users', user);
export const dbUpdateUser = (user: User) => update<User>('users', user);
export const dbDeleteUser = (userId: number) => remove('users', userId);

// Site Settings
export const dbGetSiteSettings = (): Promise<SiteSettings> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('siteSettings', 'readonly');
        const store = transaction.objectStore('siteSettings');
        const request = store.get('main'); // We only have one settings object

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbUpdateSiteSettings = (settings: SiteSettings) => {
    return update<SiteSettings & {id: string}>('siteSettings', {...settings, id: 'main'});
}

// Enrollments
export const dbGetAllEnrollments = () => getAll<Enrollment>('enrollments');
export const dbAddEnrollment = (enrollment: Enrollment) => add<Enrollment>('enrollments', enrollment);
export const dbUpdateEnrollment = (enrollment: Enrollment) => update<Enrollment>('enrollments', enrollment);
export const dbDeleteEnrollment = (enrollmentId: number) => remove('enrollments', enrollmentId);
export const dbGetEnrollmentsByUser = (userId: number): Promise<Enrollment[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('enrollments', 'readonly');
        const store = transaction.objectStore('enrollments');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbGetEnrollmentsByCourse = (courseId: number): Promise<Enrollment[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('enrollments', 'readonly');
        const store = transaction.objectStore('enrollments');
        const index = store.index('courseId');
        const request = index.getAll(courseId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

// Progress
export const dbGetAllProgress = () => getAll<Progress>('progress');
export const dbAddProgress = (progress: Progress) => add<Progress>('progress', progress);
export const dbUpdateProgress = (progress: Progress) => update<Progress>('progress', progress);
export const dbDeleteProgress = (progressId: number) => remove('progress', progressId);
export const dbGetProgressByUser = (userId: number): Promise<Progress[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('progress', 'readonly');
        const store = transaction.objectStore('progress');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbGetProgressByCourse = (courseId: number): Promise<Progress[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('progress', 'readonly');
        const store = transaction.objectStore('progress');
        const index = store.index('courseId');
        const request = index.getAll(courseId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

// Payments
export const dbGetAllPayments = () => getAll<Payment>('payments');
export const dbAddPayment = (payment: Payment) => add<Payment>('payments', payment);
export const dbUpdatePayment = (payment: Payment) => update<Payment>('payments', payment);
export const dbDeletePayment = (paymentId: number) => remove('payments', paymentId);
export const dbGetPaymentsByUser = (userId: number): Promise<Payment[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('payments', 'readonly');
        const store = transaction.objectStore('payments');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbGetPaymentByTransactionId = (transactionId: string): Promise<Payment> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('payments', 'readonly');
        const store = transaction.objectStore('payments');
        const index = store.index('transactionId');
        const request = index.get(transactionId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

// Certificates
export const dbGetAllCertificates = () => getAll<Certificate>('certificates');
export const dbAddCertificate = (certificate: Certificate) => add<Certificate>('certificates', certificate);
export const dbUpdateCertificate = (certificate: Certificate) => update<Certificate>('certificates', certificate);
export const dbDeleteCertificate = (certificateId: number) => remove('certificates', certificateId);
export const dbGetCertificatesByUser = (userId: number): Promise<Certificate[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('certificates', 'readonly');
        const store = transaction.objectStore('certificates');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbGetCertificateByVerificationCode = (verificationCode: string): Promise<Certificate> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('certificates', 'readonly');
        const store = transaction.objectStore('certificates');
        const index = store.index('verificationCode');
        const request = index.get(verificationCode);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

// Admin Logs
export const dbGetAllAdminLogs = () => getAll<AdminLog>('adminLogs');
export const dbAddAdminLog = (log: AdminLog) => add<AdminLog>('adminLogs', log);
export const dbDeleteAdminLog = (logId: number) => remove('adminLogs', logId);
export const dbGetLogsByAdmin = (adminId: number): Promise<AdminLog[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('adminLogs', 'readonly');
        const store = transaction.objectStore('adminLogs');
        const index = store.index('adminId');
        const request = index.getAll(adminId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};
export const dbGetLogsByEntity = (entityType: string, entityId: number): Promise<AdminLog[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction('adminLogs', 'readonly');
        const store = transaction.objectStore('adminLogs');
        const entityTypeIndex = store.index('entityType');
        const request = entityTypeIndex.getAll(entityType);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const allLogs = request.result;
            const filteredLogs = allLogs.filter(log => log.entityId === entityId);
            resolve(filteredLogs);
        };
    });
};
