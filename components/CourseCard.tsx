import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { useAppContext } from '../context/AppContext';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { addToCart, cart, currentUser, enrollInCourse } = useAppContext();
  const navigate = useNavigate();

  const isCourseInCart = cart.some(item => item.id === course.id);
  const isEnrolled = currentUser?.enrolledCourses.includes(course.id);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (course.price > 0) {
      addToCart(course);
    }
  };
  
  const handleEnroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
    } else {
      enrollInCourse(course.id);
    }
  };

  return (
    <Link to={`/course/${course.id}`} className="block bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 group">
      <img className="w-full h-48 object-cover" src={course.imageUrl} alt={course.title} />
      <div className="p-6">
        <span className="inline-block bg-accent-blue/10 text-accent-blue text-xs font-semibold px-2 py-1 rounded-full mb-2">{course.category}</span>
        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-blue transition-colors">{course.title}</h3>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex justify-between items-center">
          {course.price > 0 ? (
            <span className="text-2xl font-bold text-accent-green">${course.price}</span>
          ) : (
            <span className="text-2xl font-bold text-accent-green">Free</span>
          )}

          {course.price > 0 ? (
            <button 
              onClick={handleAddToCart}
              disabled={isCourseInCart}
              className="bg-accent-blue text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed z-10 relative"
            >
              {isCourseInCart ? 'In Cart' : 'Add to Cart'}
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={!!isEnrolled}
              className="bg-accent-green text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed z-10 relative"
            >
              {isEnrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
