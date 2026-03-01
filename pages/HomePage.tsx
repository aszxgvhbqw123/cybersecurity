import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import Logo from '../components/Logo';
import { GoogleGenAI } from '@google/genai';

// Particle Background Component
const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: Particle[] = [];
        const particleCount = 50;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }

            update() {
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX;
                this.y += this.speedY;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = 'rgba(0, 191, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const particle of particles) {
                particle.update();
                particle.draw();
            }
            connect();
            animationFrameId = requestAnimationFrame(animate);
        };

        const connect = () => {
            if (!ctx) return;
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const distance = Math.sqrt(
                        (particles[a].x - particles[b].x) ** 2 +
                        (particles[a].y - particles[b].y) ** 2
                    );
                    if (distance < (canvas.width / 7)) {
                        opacityValue = 1 - (distance / 150);
                        ctx.strokeStyle = `rgba(0, 255, 127, ${opacityValue})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        resizeCanvas();
        init();
        animate();
        
        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

// Typing Effect Component
const TypingEffect: React.FC<{ text: string; className: string }> = ({ text, className }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) {
                clearInterval(intervalId);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, [text]);

    return <h1 className={className}>{displayedText}<span className="animate-ping">_</span></h1>;
};

// Daily Tech Tip Component
const DailyTechTip: React.FC = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: "Generate one unique, insightful, and concise tech tip (under 200 characters) related to either cybersecurity, artificial intelligence, or IT. Format it as a single sentence.",
                });
                setTip(response.text);
            } catch (error) {
                console.error("Failed to fetch tech tip:", error);
                setTip("Always use two-factor authentication on your critical accounts.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTip();
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-secondary p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-accent-green mb-4">Daily Tech Tip</h2>
                {isLoading ? (
                    <div className="h-6 bg-gray-700 rounded-full w-3/4 mx-auto animate-pulse"></div>
                ) : (
                    <p className="text-lg text-text-secondary italic">"{tip}"</p>
                )}
            </div>
        </section>
    );
};


const HomePage: React.FC = () => {
    const { courses, siteSettings } = useAppContext();
    const featuredCourses = courses.slice(0, 3);

    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <section className="bg-secondary relative">
                <ParticleBackground />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center relative z-10">
                    <div className="flex justify-center mb-8">
                       <Logo className="h-20 w-auto" />
                    </div>
                    <TypingEffect text={siteSettings.heroTitle} className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight min-h-[80px] md:min-h-[90px]" />
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-text-secondary">
                        {siteSettings.heroSubtitle}
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            to="/courses"
                            className="inline-block bg-accent-blue text-primary font-bold py-3 px-8 rounded-md hover:bg-opacity-80 transition-transform transform hover:scale-105"
                        >
                            Explore Courses
                        </Link>
                        <Link
                            to="/tools"
                            className="inline-block bg-secondary text-accent-blue font-bold py-3 px-8 rounded-md border border-accent-blue hover:bg-accent-blue/10 transition"
                        >
                            Cyber Tools
                        </Link>
                    </div>
                </div>
            </section>

             {/* Daily Tip Section */}
            <DailyTechTip />

            {/* Featured Courses Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Featured Courses</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;