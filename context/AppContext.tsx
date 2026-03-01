
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Course, CartItem, User, Review, SiteSettings } from '../types';
import { 
  initDB, 
  dbGetAllCourses, 
  dbAddCourse, 
  dbUpdateCourse, 
  dbDeleteCourse, 
  dbGetAllUsers,
  dbAddUser,
  dbUpdateUser,
  dbDeleteUser,
  dbGetSiteSettings,
  dbUpdateSiteSettings
} from '../db';

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  // User Auth
  currentUser: User | null;
  users: User[];
  loginUser: (email: string, password: string) => string;
  logoutUser: () => void;
  registerUser: (name: string, email: string, password: string) => Promise<string>;
  deleteUser: (userId: number) => void;
  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'reviews'>) => void;
  updateCourse: (updatedCourse: Course) => void;
  deleteCourse: (courseId: number) => void;
  addReview: (courseId: number, review: Omit<Review, 'id'>) => void;
  enrollInCourse: (courseId: number) => void;
  // Cart
  cart: CartItem[];
  addToCart: (course: Course) => void;
  clearCart: () => void;
  cartTotal: number;
  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useSessionStorageState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) return savedTheme;
        return 'dark'; // Default to dark
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useSessionStorageState('isAdminAuthenticated', false);
  
  // User State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useSessionStorageState<User | null>('currentUser', null);

  // Course State
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle: 'Loading...',
    heroSubtitle: 'Please wait while we prepare the content.',
  });

  // Load all data from IndexedDB on initial render
  useEffect(() => {
    const loadData = async () => {
        await initDB();
        const [loadedCourses, loadedUsers, loadedSettings] = await Promise.all([
            dbGetAllCourses(),
            dbGetAllUsers(),
            dbGetSiteSettings()
        ]);
        setCourses(loadedCourses);
        setUsers(loadedUsers);
        if(loadedSettings) setSiteSettings(loadedSettings);
        setIsDBInitialized(true);
    };
    loadData();
  }, []);


  // Admin Auth
  const adminPassword = '779AszxGhvbMohammed]';

  const loginAdmin = (password: string): boolean => {
    if (password === adminPassword) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };
  
  // User Auth
  const loginUser = (email: string, password: string): string => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return "Success";
    }
    return "Invalid email or password.";
  };
  
  const logoutUser = () => {
    setCurrentUser(null);
  };
  
  const registerUser = async (name: string, email: string, password: string): Promise<string> => {
    if (users.some(u => u.email === email)) {
      return "An account with this email already exists.";
    }
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newUser: User = {
      id: maxId + 1,
      name,
      email,
      password, // In a real app, hash this!
      enrolledCourses: [],
    };
    await dbAddUser(newUser);
    const updatedUsers = await dbGetAllUsers();
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    return "Success";
  };

  const deleteUser = async (userId: number) => {
    await dbDeleteUser(userId);
    const updatedUsers = await dbGetAllUsers();
    setUsers(updatedUsers);
  };
  
  // Course Management
  const addCourse = async (courseData: Omit<Course, 'id' | 'reviews'>) => {
    const maxId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) : 0;
    const newCourse: Course = {
      ...courseData,
      id: maxId + 1,
      reviews: [],
    };
    await dbAddCourse(newCourse);
    const updatedCourses = await dbGetAllCourses();
    setCourses(updatedCourses);
  };

  const updateCourse = async (updatedCourse: Course) => {
    await dbUpdateCourse(updatedCourse);
    const updatedCourses = await dbGetAllCourses();
    setCourses(updatedCourses);
  };

  const deleteCourse = async (courseId: number) => {
    await dbDeleteCourse(courseId);
    const updatedCourses = await dbGetAllCourses();
    setCourses(updatedCourses);
  };

  const addReview = async (courseId: number, reviewData: Omit<Review, 'id'>) => {
    const courseToUpdate = courses.find(c => c.id === courseId);
    if (courseToUpdate) {
      const newReview: Review = {
        ...reviewData,
        id: courseToUpdate.reviews ? courseToUpdate.reviews.length + 1 : 1,
      };
      const updatedCourse = {
        ...courseToUpdate,
        reviews: [newReview, ...(courseToUpdate.reviews || [])],
      };
      await dbUpdateCourse(updatedCourse);
      const updatedCourses = await dbGetAllCourses();
      setCourses(updatedCourses);
    }
  };
  
  const enrollInCourse = async (courseId: number) => {
    if (!currentUser) return;

    const userIsEnrolled = currentUser.enrolledCourses.includes(courseId);
    if (userIsEnrolled) return;
    
    const updatedUser = {
      ...currentUser,
      enrolledCourses: [...currentUser.enrolledCourses, courseId],
    };

    await dbUpdateUser(updatedUser);
    setCurrentUser(updatedUser);
    const updatedUsers = await dbGetAllUsers();
    setUsers(updatedUsers);
  };

  // Cart Management
  const addToCart = (course: Course) => {
    if (course.price === 0) return; // Don't add free courses to cart

    setCart(prev => {
        const existingItem = prev.find(item => item.id === course.id);
        if (existingItem) {
            return prev;
        }
        return [...prev, { ...course, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Site Settings Management
  const updateSiteSettings = async (settings: SiteSettings) => {
    await dbUpdateSiteSettings(settings);
    const updatedSettings = await dbGetSiteSettings();
    setSiteSettings(updatedSettings);
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,
      currentUser,
      users,
      loginUser,
      logoutUser,
      registerUser,
      deleteUser,
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      addReview,
      enrollInCourse,
      cart,
      addToCart,
      clearCart,
      cartTotal,
      siteSettings,
      updateSiteSettings
    }}>
      {isDBInitialized ? children : 
        <div className="flex items-center justify-center min-h-screen bg-primary text-text-primary">
            <p>Loading Platform...</p>
        </div>
      }
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
