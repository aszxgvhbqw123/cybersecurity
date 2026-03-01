import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateCertificate } from '../utils/certificateGenerator';

const StarRating: React.FC<{ rating: number, setRating?: (r: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-6 h-6 ${setRating ? 'cursor-pointer' : ''} ${
                        (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    onClick={() => setRating && setRating(star)}
                    onMouseEnter={() => setRating && setHoverRating(star)}
                    onMouseLeave={() => setRating && setHoverRating(0)}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { courses, addToCart, cart, currentUser, addReview, enrollInCourse } = useAppContext();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const course = courses.find(c => c.id === Number(courseId));

    const avgRating = useMemo(() => {
        if (!course?.reviews || course.reviews.length === 0) return 0;
        const total = course.reviews.reduce((acc, review) => acc + review.rating, 0);
        return total / course.reviews.length;
    }, [course]);

    if (!course) {
        return (
            <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-text-primary">Course Not Found</h1>
                <p className="text-text-secondary mt-4">We couldn't find the course you were looking for.</p>
                <Link to="/courses" className="mt-8 inline-block bg-accent-blue text-primary font-bold py-3 px-8 rounded-md hover:bg-opacity-80 transition">
                    Back to Courses
                </Link>
            </div>
        );
    }
    
    const isCourseInCart = cart.some(item => item.id === course.id);
    const isEnrolled = currentUser?.enrolledCourses.includes(course.id);

    const handleAddToCart = () => {
        if (course.price > 0) {
            addToCart(course);
        }
    };

    const handleEnroll = () => {
        if (!currentUser) {
          navigate('/login');
        } else {
          enrollInCourse(course.id);
        }
    };

    const handleGenerateCertificate = () => {
        if (currentUser && course) {
            generateCertificate(currentUser, course);
        }
    };
    
    const handleDownloadMaterials = () => {
        if (!course.materialsUrl || !course.materialsFileName) return;
        const link = document.createElement('a');
        link.href = course.materialsUrl;
        link.download = course.materialsFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || rating === 0 || !comment.trim()) return;
        addReview(course.id, { userName: currentUser.name, rating, comment });
        setRating(0);
        setComment('');
    };

    const enrolledActions = (
        <div className="flex flex-col gap-2">
            <button 
                onClick={handleGenerateCertificate}
                className="w-full bg-accent-green text-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300"
            >
                Generate Certificate
            </button>
            {course.materialsUrl && (
                 <button 
                    onClick={handleDownloadMaterials}
                    className="w-full bg-secondary text-accent-blue font-bold py-3 px-4 rounded-md border border-accent-blue hover:bg-accent-blue/10 transition"
                >
                    Download Materials
                </button>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => navigate(-1)} className="mb-8 text-accent-blue hover:underline">
                &larr; Back to Courses
            </button>

            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-3">
                    <h1 className="text-4xl font-extrabold text-text-primary mb-2">{course.title}</h1>
                    <span className="inline-block bg-accent-blue/10 text-accent-blue text-sm font-semibold px-3 py-1 rounded-full mb-4">{course.category}</span>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-yellow-400 font-bold">{avgRating.toFixed(1)}</span>
                        <StarRating rating={avgRating} />
                        <span className="text-text-secondary text-sm">({course.reviews?.length || 0} ratings)</span>
                    </div>
                    
                    <div className="prose prose-invert prose-lg text-text-secondary max-w-none">
                        <p>{course.description}</p>
                    </div>
                </div>

                {/* Right Column: Video & Purchase */}
                <div className="lg:col-span-2">
                    <div className="bg-secondary rounded-lg shadow-lg sticky top-24 overflow-hidden">
                        {course.videoUrl ? (
                            <div className="aspect-video bg-black">
                                <video controls src={course.videoUrl} className="w-full h-full" autoPlay>
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <img src={course.imageUrl} alt={course.title} className="w-full h-auto object-cover" />
                        )}
                        <div className="p-6">
                            {course.price > 0 ? (
                                <>
                                    <span className="text-4xl font-bold text-accent-green block mb-4">${course.price}</span>
                                    {isEnrolled ? (
                                        enrolledActions
                                    ) : (
                                        <button 
                                            onClick={handleAddToCart}
                                            disabled={isCourseInCart}
                                            className="w-full bg-accent-blue text-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {isCourseInCart ? 'Already in Cart' : 'Add to Cart'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-4xl font-bold text-accent-green block mb-4">Free</span>
                                     {isEnrolled ? (
                                        enrolledActions
                                    ) : (
                                        <button 
                                            onClick={handleEnroll}
                                            className="w-full bg-accent-green text-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-80 transition-all duration-300"
                                        >
                                            Start Learning Now
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-16">
                 <h2 className="text-3xl font-bold text-text-primary border-b border-gray-700 pb-2 mb-6">Student Reviews</h2>
                 {currentUser ? (
                    <div className="bg-secondary p-6 rounded-lg mb-8">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="text-text-secondary block mb-2">Your Rating</label>
                                <StarRating rating={rating} setRating={setRating} />
                            </div>
                             <div>
                                <label htmlFor="comment" className="text-text-secondary block mb-2">Your Comment</label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
                                    placeholder="Share your thoughts on the course..."
                                ></textarea>
                            </div>
                            <button type="submit" disabled={rating === 0 || !comment.trim()} className="bg-accent-blue text-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Submit Review
                            </button>
                        </form>
                    </div>
                 ) : (
                    <div className="bg-secondary p-6 rounded-lg mb-8 text-center">
                        <p className="text-text-secondary">
                            <Link to="/login" className="text-accent-blue font-bold hover:underline">Log in</Link> to leave a review.
                        </p>
                    </div>
                 )}
                 <div className="space-y-6">
                    {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map(review => (
                            <div key={review.id} className="bg-secondary p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-text-primary">{review.userName}</p>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-text-secondary">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-secondary text-center py-8">No reviews yet. Be the first to leave one!</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
