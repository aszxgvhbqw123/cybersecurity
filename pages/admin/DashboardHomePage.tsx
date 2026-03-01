import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="bg-accent-blue/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const DashboardHomePage: React.FC = () => {
    const { courses, users } = useAppContext();
    const totalReviews = courses.reduce((acc, course) => acc + (course.reviews?.length || 0), 0);

    const popularCourses = useMemo(() => {
        const enrollmentCounts = courses.map(course => {
            const count = users.filter(user => user.enrolledCourses.includes(course.id)).length;
            return { ...course, enrollmentCount: count };
        });
        return enrollmentCounts.sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 5);
    }, [courses, users]);

    const recentUsers = useMemo(() => {
        return [...users].sort((a, b) => b.id - a.id).slice(0, 5);
    }, [users]);


    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard 
                    title="Total Courses" 
                    value={courses.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-blue" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.969 11.48a1 1 0 10-1.938.52l7 3.5a1 1 0 00.938 0l7-3.5a1 1 0 10-1.938-.52L11 14.68V9.61l6.606-2.67a1 1 0 000-1.84l-7-3zM10 8.23L4.053 5.5 10 2.77l5.947 2.73L10 8.23z" /></svg>} 
                />
                <StatCard 
                    title="Total Users" 
                    value={users.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-blue" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} 
                />
                 <StatCard 
                    title="Total Reviews" 
                    value={totalReviews} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-blue" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Courses */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Most Popular Courses</h2>
                    <ul className="space-y-3">
                        {popularCourses.map(course => (
                            <li key={course.id} className="flex justify-between items-center bg-primary p-3 rounded-md">
                                <span className="font-medium text-text-primary">{course.title}</span>
                                <span className="text-sm font-bold text-accent-green">{course.enrollmentCount} enrollments</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Recent Registrations */}
                 <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Recent Registrations</h2>
                    <ul className="space-y-3">
                        {recentUsers.map(user => (
                            <li key={user.id} className="flex justify-between items-center bg-primary p-3 rounded-md">
                                <div>
                                    <p className="font-medium text-text-primary">{user.name}</p>
                                    <p className="text-xs text-text-secondary">{user.email}</p>
                                </div>
                                <Link to={`/admin/users/${user.id}`} className="text-sm text-accent-blue hover:underline">View</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default DashboardHomePage;