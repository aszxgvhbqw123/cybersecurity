import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import { Category } from '../types';

const CoursesPage: React.FC = () => {
  const { courses } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Paid' | 'Free'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        if (selectedCategory === 'All') return true;
        return course.category === selectedCategory;
      })
      .filter(course => {
        if (priceFilter === 'Paid') return course.price > 0;
        if (priceFilter === 'Free') return course.price === 0;
        return true;
      })
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [courses, selectedCategory, priceFilter, searchTerm]);
  
  const categories = ['All', ...Object.values(Category)];
  const priceFilters = ['All', 'Paid', 'Free'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-4">Our Courses</h1>
      <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
        Dive into our comprehensive catalog of courses. Find the perfect program to advance your skills and career.
      </p>

      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-gray-600 rounded-full py-2 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-accent-blue focus:outline-none transition"
            aria-label="Search courses"
          />
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-4">
        {priceFilters.map(filter => (
          <button
            key={filter}
            onClick={() => setPriceFilter(filter as 'All' | 'Paid' | 'Free')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              priceFilter === filter
                ? 'bg-accent-green text-primary'
                : 'bg-secondary text-text-secondary hover:bg-gray-700 hover:text-text-primary'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="flex justify-center flex-wrap gap-2 mb-12">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as Category | 'All')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-accent-blue text-primary'
                : 'bg-secondary text-text-secondary hover:bg-gray-700 hover:text-text-primary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-text-primary">No Courses Found</h3>
          <p className="text-text-secondary mt-2">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
