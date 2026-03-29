import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from './AuthenticationPages/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './AuthenticationPages/AuthProvider';

const F2CPlatform = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: '',
        role: 'CUSTOMER',
        photo: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        farmers: 1250,
        customers: 8500,
        deliveries: 15000
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [typingIndex, setTypingIndex] = useState(0);
    const [typingText, setTypingText] = useState('');
    const [typingComplete, setTypingComplete] = useState(false);

    const navigate = useNavigate();

    // Real-time stats counter effect
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                farmers: prev.farmers + Math.floor(Math.random() * 3),
                customers: prev.customers + Math.floor(Math.random() * 10),
                deliveries: prev.deliveries + Math.floor(Math.random() * 15)
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Typing animation effect
    useEffect(() => {
        const texts = [
            "Connecting Farmers Directly to Consumers",
            "Fresh Produce. Direct from Farm to Table.",
            "Empowering Farmers. Nourishing Communities."
        ];

        const currentText = texts[typingIndex];

        if (typingText.length < currentText.length) {
            const timeout = setTimeout(() => {
                setTypingText(currentText.substring(0, typingText.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setTypingComplete(true);
                setTimeout(() => {
                    setTypingComplete(false);
                    setTypingText('');
                    setTypingIndex((prev) => (prev + 1) % texts.length);
                }, 2000);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [typingText, typingIndex]);

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`Thank you for subscribing with: ${email}`);
        setEmail('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post(`/users/login`, {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            const userRole = response.data.user.role;
            login(response.data.user, response.data.token);

            if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userRole === 'FARMER') {
                navigate('/farmer/dashboard');
            } else {
                navigate('/customer/dashboard');
            }

            toast.success('Login successful!');
            setShowLogin(false);

            setFormData({
                name: '',
                email: '',
                password: '',
                mobile: '',
                address: '',
                role: 'CUSTOMER',
                photo: null
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axiosInstance.post(`/users/register`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Registration successful! Please login.');
            setShowRegister(false);
            setShowLogin(true);

            setFormData({
                name: '',
                email: '',
                password: '',
                mobile: '',
                address: '',
                role: 'CUSTOMER',
                biography: '',
                dateOfBirth: '',
                nationality: '',
                photo: null
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            photo: e.target.files[0]
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-green-600 flex items-center">
                            <span className="mr-1">🌱</span> Greenbazzar AI
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#features" className="text-gray-700 hover:text-green-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-green-600 transition-colors">How It Works</a>
                            <a href="#testimonials" className="text-gray-700 hover:text-green-600 transition-colors">Testimonials</a>
                            <button
                                onClick={() => setShowLogin(true)}
                                className="text-white font-bold bg-orange-500 hover:bg-orange-600 py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                            >
                                SIGN IN
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden mt-4 bg-white p-4 rounded-lg shadow-lg animate-fadeIn">
                            <a href="#features" className="block py-2 text-gray-700 hover:text-green-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-green-600 transition-colors">How It Works</a>
                            <a href="#testimonials" className="block py-2 text-gray-700 hover:text-green-600 transition-colors">Testimonials</a>
                            <button
                                onClick={() => setShowLogin(true)}
                                className="mt-2 w-full text-white font-bold bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-full transition-colors"
                            >
                                SIGN IN
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 container mx-auto px-6 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight min-h-[180px] md:min-h-[200px]">
                        {typingText}
                        <span className={`inline-block w-1 h-8 bg-green-600 ml-1 align-middle ${typingComplete ? 'opacity-0' : 'animate-pulse'}`}></span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-600">
                    Greenbazzar AI revolutionizes the food supply chain by empowering farmers and providing consumers with fresh, locally sourced produce.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => setShowRegister(true)}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Get Started
                        </button>
                        <button className="px-8 py-3 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 flex items-center">
                            Learn More
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Real-time stats */}
                    <div className="mt-12 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{stats.farmers.toLocaleString()}+</div>
                            <div className="text-sm text-gray-600">Active Farmers</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{stats.customers.toLocaleString()}+</div>
                            <div className="text-sm text-gray-600">Happy Customers</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{stats.deliveries.toLocaleString()}+</div>
                            <div className="text-sm text-gray-600">Deliveries</div>
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Fresh produce"
                            className="rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-md animate-bounce-slow">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-sm font-semibold">Live Marketplace</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose Greenbazzar AI?</h2>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Our platform offers unique advantages for both farmers and consumers</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4a2 2 0 11-4 0 2 2 0 014 0zM4 10a2 2 0 100-4 2 2 0 000 4z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Direct Marketplace</h3>
                            <p className="text-gray-600">Farmers can sell directly to consumers, eliminating middlemen and increasing profits.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Quality Assurance</h3>
                            <p className="text-gray-600">AI-powered quality checks ensure only the freshest produce reaches consumers.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Optimized logistics ensure farm-fresh produce reaches your doorstep within hours.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">How Greenbazzar AI Works</h2>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">A seamless process from farm to table</p>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                                <span className="text-xl font-bold text-green-600">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Farmers List Produce</h3>
                            <p className="text-gray-600">Farmers upload their fresh harvest with quality photos and details.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                                <span className="text-xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Quality Check</h3>
                            <p className="text-gray-600">Our AI system verifies quality and freshness of all produce.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                                <span className="text-xl font-bold text-green-600">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customers Order</h3>
                            <p className="text-gray-600">Customers browse and order fresh produce directly from farmers.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                                <span className="text-xl font-bold text-green-600">4</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Orders are delivered quickly to maintain freshness and quality.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">What Our Users Say</h2>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Hear from our community of farmers and customers</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-200 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-xl">👩‍🌾</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                                    <p className="text-green-600">Regular Customer</p>
                                </div>
                            </div>
                            <p className="text-gray-600">"The quality of produce is exceptional! I love knowing exactly which farm my food comes from."</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-200 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-xl">🧑‍💼</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Michael Rodriguez</h4>
                                    <p className="text-green-600">Local Farmer</p>
                                </div>
                            </div>
                            <p className="text-gray-600">"Greenbazzar AI has transformed my business. I now earn 40% more by selling directly to consumers."</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-200 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-xl">👨‍🍳</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Emma Thompson</h4>
                                    <p className="text-green-600">Restaurant Owner</p>
                                </div>
                            </div>
                            <p className="text-gray-600">"Sourcing fresh ingredients has never been easier. My customers notice the difference in quality!"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-green-600 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Join the Revolution?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of farmers and consumers who are transforming the food supply chain with Greenbazzar AI.</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setShowRegister(true)}
                            className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Sign Up Now
                        </button>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span className="mr-2">🌱</span> Greenbazzar AI
                            </h3>
                            <p className="text-gray-400">Connecting farmers directly to consumers for a sustainable future.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Account</h4>
                            <ul className="space-y-2">
                                <li><button onClick={() => setShowLogin(true)} className="text-gray-400 hover:text-white transition-colors">Sign In</button></li>
                                <li><button onClick={() => setShowRegister(true)} className="text-gray-400 hover:text-white transition-colors">Register</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Subscribe</h4>
                            <p className="text-gray-400 mb-2">Stay updated with our latest news</p>
                            <form onSubmit={handleSubmit} className="flex">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="px-4 py-2 rounded-l-lg text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <button type="submit" className="bg-orange-500 px-4 py-2 rounded-r-lg hover:bg-orange-600 transition-colors duration-300">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>© {new Date().getFullYear()} Greenbazzar AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-gray-10 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-300">
                        <button
                            onClick={() => {
                                setShowLogin(false);
                                setError('');
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="FARMER">Farmer</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLogin(false);
                                        setShowRegister(true);
                                        setError('');
                                    }}
                                    className="text-green-600 text-sm hover:underline transition-colors"
                                >
                                    Create an account
                                </button>
                                <div className="space-x-3 flex">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLogin(false);
                                            setError('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : 'Sign In'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {showRegister && (
                <div className="fixed inset-0 bg-gray-10 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setShowRegister(false);
                                setError('');
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your mobile number"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="FARMER">Farmer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                    placeholder="Enter your address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                                <input
                                    type="file"
                                    name="photo"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 text-gray-800"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRegister(false);
                                        setShowLogin(true);
                                        setError('');
                                    }}
                                    className="text-green-600 text-sm hover:underline transition-colors"
                                >
                                    Already have an account?
                                </button>
                                <div className="space-x-3 flex">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRegister(false);
                                            setError('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Registering...
                                            </>
                                        ) : 'Register'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default F2CPlatform;