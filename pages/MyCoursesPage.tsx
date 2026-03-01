import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateCertificate } from '../utils/certificateGenerator';
import { Course } from '../types';

// A modified course card for this page
const EnrolledCourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const { currentUser } = useAppContext();

    const handleGenerateCertificate = () => {
        if (currentUser) {
            generateCertificate(currentUser, course);
        }
    };
    
    return (
        <div className="bg-secondary rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
            <img className="w-full md:w-1/3 h-48 md:h-auto object-cover" src={course.imageUrl} alt={course.title} />
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <span className="inline-block bg-accent-blue/10 text-accent-blue text-xs font-semibold px-2 py-1 rounded-full mb-2">{course.category}</span>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{course.title}</h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Link to={`/course/${course.id}`} className="flex-1 text-center bg-accent-blue text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300">
                        Go to Course
                    </Link>
                    <button 
                        onClick={handleGenerateCertificate}
                        className="flex-1 bg-accent-green text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300"
                    >
                        Generate Certificate
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyCoursesPage: React.FC = () => {
    const { currentUser, courses } = useAppContext();

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-text-primary">Please Log In</h1>
                <p className="text-text-secondary mt-4">You need to be logged in to view your courses.</p>
                <Link to="/login" className="mt-8 inline-block bg-accent-blue text-primary font-bold py-3 px-8 rounded-md hover:bg-opacity-80 transition">
                    Login
                </Link>
            </div>
        );
    }

    const enrolledCourses = courses.filter(course => currentUser.enrolledCourses.includes(course.id));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-text-primary mb-2">My Learning Dashboard</h1>
            <p className="text-lg text-text-secondary mb-12">Welcome back, {currentUser.name}! Here are the courses you're enrolled in.</p>
            
            {enrolledCourses.length > 0 ? (
                <div className="space-y-8">
                    {enrolledCourses.map(course => (
                       <EnrolledCourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-secondary rounded-lg">
                    <h3 className="text-2xl font-semibold text-text-primary">You haven't enrolled in any courses yet.</h3>
                    <p className="text-text-secondary mt-2 mb-6">Start your learning journey today!</p>
                    <Link to="/courses" className="bg-accent-blue text-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition">
                        Explore Courses
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;
