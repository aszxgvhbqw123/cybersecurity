import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Category, Course } from '../../types';

const ManageCoursesPage: React.FC = () => {
    const { addCourse, courses, updateCourse, deleteCourse, users } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [category, setCategory] = useState<Category>(Category.CyberSecurity);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [materialsFile, setMaterialsFile] = useState<File | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [courseToPlay, setCourseToPlay] = useState<Course | null>(null);
    const [viewingStudentsFor, setViewingStudentsFor] = useState<Course | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);
    
    const fileToBase64 = (file: File): Promise<string> => 
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setIsFree(false);
        setCategory(Category.CyberSecurity);
        setVideoUrl('');
        setVideoFile(null);
        setImageUrl('');
        setImageFile(null);
        setImagePreview('');
        setMaterialsFile(null);
        setEditingCourse(null);
    }
    
    const handleFreeCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsFree(checked);
        if (checked) {
            setPrice('0');
        } else {
            setPrice('');
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setImageUrl(''); // Clear URL field when a file is chosen
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setImagePreview(url);
        setImageFile(null); // Clear file when URL is typed
    };

    const handleMaterialsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setMaterialsFile(file || null);
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(''); // Clear URL field when a file is chosen
        }
    };

    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(e.target.value);
        setVideoFile(null); // Clear file when URL is typed
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalImageUrl = imageUrl;
        if (imageFile) {
            finalImageUrl = await fileToBase64(imageFile);
        } else if (!editingCourse && !imageUrl) {
            finalImageUrl = `https://picsum.photos/seed/${title.replace(/\s/g, '')}/600/400`;
        } else if (editingCourse && !imageUrl && !imageFile) {
            finalImageUrl = editingCourse.imageUrl;
        }

        let finalVideoUrl = videoUrl;
        if (videoFile) {
            finalVideoUrl = await fileToBase64(videoFile);
        }

        let courseMaterials: { materialsUrl?: string; materialsFileName?: string } = {};
        if (materialsFile) {
            courseMaterials.materialsUrl = await fileToBase64(materialsFile);
            courseMaterials.materialsFileName = materialsFile.name;
        }

        const courseData = {
            title,
            description,
            price: parseFloat(price || '0'),
            category,
            videoUrl: finalVideoUrl,
            imageUrl: finalImageUrl,
            ...courseMaterials,
        };
        
        if(editingCourse) {
            updateCourse({ 
                ...courseData, 
                id: editingCourse.id, 
                reviews: editingCourse.reviews,
                materialsUrl: courseMaterials.materialsUrl || editingCourse.materialsUrl,
                materialsFileName: courseMaterials.materialsFileName || editingCourse.materialsFileName,
            });
            setSuccessMessage(`Course "${title}" updated successfully!`);
        } else {
            addCourse(courseData);
            setSuccessMessage(`Course "${title}" added successfully!`);
        }
        
        resetForm();
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setTitle(course.title);
        setDescription(course.description);
        setPrice(course.price.toString());
        setIsFree(course.price === 0);
        setCategory(course.category);
        setVideoUrl(course.videoUrl || '');
        setVideoFile(null);
        setImageUrl(course.imageUrl || '');
        setImagePreview(course.imageUrl || '');
        setImageFile(null);
        setMaterialsFile(null);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    const handleDelete = (courseId: number) => {
        if(window.confirm('Are you sure you want to delete this course?')) {
            deleteCourse(courseId);
            setSuccessMessage('Course deleted successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    }

    const openVideoModal = (course: Course) => {
        setCourseToPlay(course);
        setViewingStudentsFor(null);
        setTimeout(() => setIsModalVisible(true), 10);
    };
    
    const openStudentsModal = (course: Course) => {
        setViewingStudentsFor(course);
        setCourseToPlay(null);
        setTimeout(() => setIsModalVisible(true), 10);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setTimeout(() => {
            setCourseToPlay(null);
            setViewingStudentsFor(null);
        }, 300);
    };

    const courseEnrollments = useMemo(() => {
        const counts = new Map<number, number>();
        courses.forEach(course => counts.set(course.id, 0));
        users.forEach(user => {
            user.enrolledCourses.forEach(courseId => {
                counts.set(courseId, (counts.get(courseId) || 0) + 1);
            });
        });
        return counts;
    }, [courses, users]);

    const studentsForCourse = useMemo(() => {
        if (!viewingStudentsFor) return [];
        return users.filter(user => user.enrolledCourses.includes(viewingStudentsFor.id));
    }, [users, viewingStudentsFor]);

    return (
        <>
            <div>
                <h1 className="text-4xl font-bold text-text-primary mb-8">Manage Courses</h1>

                {/* Add/Edit Course Form */}
                <form onSubmit={handleSubmit}>
                <div ref={formRef} className="bg-secondary p-8 rounded-lg shadow-lg mb-12">
                    <h2 className="text-2xl font-bold text-accent-blue mb-6">{editingCourse ? `Editing: ${editingCourse.title}` : 'Add New Course'}</h2>
                    {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4">{successMessage}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                            </div>
                             <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary">Image URL or Upload</label>
                                <div className="mt-1 flex items-stretch gap-2">
                                    <input type="text" id="imageUrl" value={imageUrl} onChange={handleImageUrlChange} placeholder="Paste image URL here" className="flex-grow block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                                    <label htmlFor="imageFile" className="cursor-pointer bg-accent-blue text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center">
                                        Upload
                                    </label>
                                    <input type="file" id="imageFile" onChange={handleImageFileChange} accept="image/*" className="hidden"/>
                                </div>
                            </div>
                        </div>
                        <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Image Preview</label>
                            <img 
                                src={imagePreview || 'https://via.placeholder.com/600x400.png?text=No+Image'} 
                                alt="Course preview" 
                                className="w-full h-48 object-cover rounded-md bg-primary border border-gray-600"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400.png?text=Invalid+URL'; }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-text-secondary">Price ($)</label>
                            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" disabled={isFree} className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue disabled:bg-gray-700 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue">
                                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center mt-6">
                        <input type="checkbox" id="isFree" checked={isFree} onChange={handleFreeCheckboxChange} className="h-4 w-4 rounded border-gray-600 bg-primary text-accent-blue focus:ring-accent-blue" />
                        <label htmlFor="isFree" className="ml-2 block text-sm font-medium text-text-secondary">Mark as Free</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="videoUrl" className="block text-sm font-medium text-text-secondary">Video URL or Upload (optional)</label>
                            <div className="mt-1 flex items-stretch gap-2">
                                <input type="text" id="videoUrl" value={videoUrl} onChange={handleVideoUrlChange} placeholder="Paste video URL here" className="flex-grow block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                                <label htmlFor="videoFile" className="cursor-pointer bg-accent-blue text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center">
                                    Upload
                                </label>
                                <input type="file" id="videoFile" onChange={handleVideoFileChange} accept="video/*" className="hidden"/>
                            </div>
                             {videoFile && <p className="mt-2 text-sm text-text-secondary">Selected file: {videoFile.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="materialsFile" className="block text-sm font-medium text-text-secondary">Course Materials (ZIP, optional)</label>
                             <div className="mt-1 flex items-stretch gap-2">
                                <label htmlFor="materialsFile" className="cursor-pointer bg-accent-green text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center">
                                    Upload File
                                </label>
                                <input type="file" id="materialsFile" onChange={handleMaterialsFileChange} accept=".zip,.rar,.7z" className="hidden"/>
                                <div className="flex-grow flex items-center bg-primary border border-gray-600 rounded-md px-3 text-sm text-text-secondary">
                                    {materialsFile?.name || (editingCourse && editingCourse.materialsFileName) || 'No file selected'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-8">
                        <button type="submit" className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-accent-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-800">
                            {editingCourse ? 'Update Course' : 'Add Course'}
                        </button>
                        {editingCourse && (
                            <button type="button" onClick={resetForm} className="flex-1 flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-primary hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </div>
                </form>

                {/* Course List */}
                <div className="bg-secondary rounded-lg shadow-lg overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary/50">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Course</th>
                                <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Category</th>
                                <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Price</th>
                                <th className="p-4 text-center text-sm font-semibold text-text-secondary tracking-wider">Enrollments</th>
                                <th className="p-4 text-center text-sm font-semibold text-text-secondary tracking-wider">Materials</th>
                                <th className="p-4 text-left text-sm font-semibold text-text-secondary tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {courses.length > 0 ? courses.map(course => (
                                <tr key={course.id} className="hover:bg-primary/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <img src={course.imageUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                            <span className="font-bold text-text-primary">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">{course.category}</td>
                                    <td className="p-4 text-sm">
                                        {course.price > 0 ? (
                                             <span className="text-accent-green">${course.price}</span>
                                        ) : (
                                            <span className="text-accent-green font-bold">Free</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center font-bold text-text-primary">{courseEnrollments.get(course.id) || 0}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {course.videoUrl && <span title="Video available" className="text-accent-blue">&#9654;</span>}
                                            {course.materialsUrl && <span title="File available" className="text-accent-green">&#128190;</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button onClick={() => openStudentsModal(course)} className="px-3 py-1 text-xs font-medium bg-accent-green/20 text-accent-green rounded-md hover:bg-accent-green/40 transition">Students</button>
                                            {course.videoUrl && (
                                                <button onClick={() => openVideoModal(course)} className="px-3 py-1 text-xs font-medium bg-gray-500/20 text-gray-300 rounded-md hover:bg-gray-500/40 transition">Video</button>
                                            )}
                                            <button onClick={() => handleEdit(course)} className="px-3 py-1 text-xs font-medium bg-accent-blue/20 text-accent-blue rounded-md hover:bg-accent-blue/40 transition">Edit</button>
                                            <button onClick={() => handleDelete(course.id)} className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-text-secondary">No courses to display. Add one using the form above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Universal Modal */}
            {(courseToPlay || viewingStudentsFor) && (
                <div 
                    className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeModal}
                >
                    <div 
                        className={`bg-secondary p-4 rounded-lg shadow-xl relative w-full max-w-4xl transform transition-all duration-300 ${isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                         <div className="flex justify-between items-center mb-4 p-2">
                            <h3 className="text-xl font-bold text-text-primary">
                                {courseToPlay ? `Video: ${courseToPlay.title}` : `Students in: ${viewingStudentsFor?.title}`}
                            </h3>
                            <button 
                                onClick={closeModal} 
                                className="h-8 w-8 bg-primary rounded-full text-text-primary hover:bg-gray-700 transition flex items-center justify-center z-10 flex-shrink-0"
                                aria-label="Close modal"
                            >
                               &#x2715;
                            </button>
                        </div>
                        <div className="p-2">
                            {courseToPlay && courseToPlay.videoUrl && (
                                <div className="aspect-video">
                                    <video controls src={courseToPlay.videoUrl} className="w-full h-full rounded-md" autoPlay>
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                            {viewingStudentsFor && (
                                <div className="max-h-[60vh] overflow-y-auto">
                                   {studentsForCourse.length > 0 ? (
                                        <ul className="space-y-2">
                                            {studentsForCourse.map(student => (
                                                <li key={student.id} className="flex justify-between items-center bg-primary p-3 rounded-md">
                                                    <p className="font-medium text-text-primary">{student.name}</p>
                                                    <p className="text-sm text-text-secondary">{student.email}</p>
                                                </li>
                                            ))}
                                        </ul>
                                   ) : (
                                    <p className="text-center text-text-secondary py-8">No students are currently enrolled in this course.</p>
                                   )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageCoursesPage;