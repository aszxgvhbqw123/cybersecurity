import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const ManageUsersPage: React.FC = () => {
    const { users, deleteUser } = useAppContext();

    const handleDelete = (userId: number, userName: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            deleteUser(userId);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Manage Users</h1>
            <div className="bg-secondary rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary/50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">User ID</th>
                            <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Name</th>
                            <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Email</th>
                            <th className="p-4 text-center text-sm font-semibold text-text-secondary tracking-wider">Courses Enrolled</th>
                            <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.length > 0 ? users.map(user => (
                            <tr key={user.id} className="hover:bg-primary/50 transition-colors">
                                <td className="p-4 text-sm text-text-secondary">{user.id}</td>
                                <td className="p-4 font-medium text-text-primary">{user.name}</td>
                                <td className="p-4 text-text-secondary">{user.email}</td>
                                <td className="p-4 text-center font-bold text-text-primary">{user.enrolledCourses.length}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            to={`/admin/users/${user.id}`}
                                            className="px-3 py-1 text-sm font-medium bg-accent-blue/20 text-accent-blue rounded-md hover:bg-accent-blue/40 transition"
                                        >
                                            View Details
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(user.id, user.name)} 
                                            className="px-3 py-1 text-sm font-medium bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-text-secondary">No users have registered yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsersPage;