import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const ManageUserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { users, courses } = useAppContext();
    const navigate = useNavigate();

    const user = users.find(u => u.id === Number(userId));

    if (!user) {
        return (
            <div>
                <h1 className="text-4xl font-bold text-text-primary">User Not Found</h1>
                <Link to="/admin/users" className="mt-4 inline-block text-accent-blue hover:underline">
                    &larr; Back to Users List
                </Link>
            </div>
        );
    }

    const enrolledCourses = courses.filter(course => user.enrolledCourses.includes(course.id));

    return (
        <div>
            <button onClick={() => navigate(-1)} className="mb-8 text-accent-blue hover:underline">
                &larr; Back to Users List
            </button>
            <div className="bg-secondary p-8 rounded-lg shadow-lg">
                <div className="mb-6 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold text-text-primary">{user.name}</h1>
                    <p className="text-md text-text-secondary">{user.email}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-accent-blue mb-4">Enrolled Courses ({enrolledCourses.length})</h2>
                    {enrolledCourses.length > 0 ? (
                        <ul className="space-y-3">
                            {enrolledCourses.map(course => (
                                <li key={course.id} className="flex items-center gap-4 bg-primary p-4 rounded-md">
                                    <img src={course.imageUrl} alt={course.title} className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-text-primary">{course.title}</p>
                                        <p className="text-sm text-text-secondary">{course.category}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary">This user has not enrolled in any courses yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUserDetailsPage;