import { Course, Category } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Advanced Penetration Testing',
    description: 'Master ethical hacking techniques and secure modern infrastructures.',
    category: Category.CyberSecurity,
    price: 199.99,
    imageUrl: 'https://picsum.photos/seed/cyber1/600/400',
    reviews: [
      { id: 1, userName: 'Jane Doe', rating: 5, comment: 'This course was incredibly comprehensive and practical. Highly recommended!' },
      { id: 2, userName: 'John Smith', rating: 4, comment: 'Great content, but could use more hands-on labs.' },
    ],
  },
  {
    id: 2,
    title: 'Machine Learning for Security',
    description: 'Apply AI models to detect threats and anomalies in real-time.',
    category: Category.AI,
    price: 249.99,
    imageUrl: 'https://picsum.photos/seed/ai1/600/400',
    reviews: [
      { id: 3, userName: 'Emily White', rating: 5, comment: 'A fantastic dive into the intersection of AI and security.' },
    ],
  },
  {
    id: 3,
    title: 'Cloud Security Architecture (AWS/Azure)',
    description: 'Design and implement secure cloud environments from the ground up.',
    category: Category.IT,
    price: 179.99,
    imageUrl: 'https://picsum.photos/seed/it1/600/400',
    reviews: [],
  },
  {
    id: 4,
    title: 'Digital Forensics & Incident Response',
    description: 'Learn to investigate cybercrimes and respond to security breaches effectively.',
    category: Category.InfoSec,
    price: 219.99,
    imageUrl: 'https://picsum.photos/seed/infosec1/600/400',
    reviews: [
      { id: 4, userName: 'Michael Brown', rating: 5, comment: 'Essential skills for anyone in an InfoSec role.' },
    ],
  },
  {
    id: 5,
    title: 'Deep Learning and Neural Networks',
    description: 'An in-depth guide to building and training complex AI models.',
    category: Category.AI,
    price: 299.99,
    imageUrl: 'https://picsum.photos/seed/ai2/600/400',
    reviews: [],
  },
  {
    id: 6,
    title: 'Reverse Engineering Malware',
    description: 'Dissect malicious software to understand its behavior and build defenses.',
    category: Category.CyberSecurity,
    price: 259.99,
    imageUrl: 'https://picsum.photos/seed/cyber2/600/400',
    reviews: [],
  },
  {
    id: 7,
    title: 'Introduction to Cybersecurity',
    description: 'A beginner-friendly introduction to the core concepts of cyber security. Learn about threats, vulnerabilities, and the measures to protect systems.',
    category: Category.CyberSecurity,
    price: 0, // Free course
    imageUrl: 'https://picsum.photos/seed/cyberfree/600/400',
    reviews: [
      { id: 5, userName: 'Alex Ray', rating: 5, comment: 'Perfect for beginners! This gave me a solid foundation.' },
    ],
  },
];
