import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../AuthenticationPages/axiosConfig';
import { useNavigate } from 'react-router-dom';

const FarmConnectDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for data from APIs
    const [crops, setCrops] = useState([]);
    const [myCrops, setMyCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [payment, setPayment] = useState([])
    console.log(payment);



    const [history, setHistory] = useState([]);

    // Form states
    const [cropForm, setCropForm] = useState({
        name: '',
        description: '',
        price: '',
        quantityAvailable: '',
        unit: '',
        image: null
    });
    const [orderStatusForm, setOrderStatusForm] = useState({});
    const [showAddCropModal, setShowAddCropModal] = useState(false);
    const [showEditCropModal, setShowEditCropModal] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
                switch (activeTab) {
                    case 'dashboard':
                        await fetchDashboardData();
                        break;
                    case 'crops':
                        await fetchMyCrops();
                        break;
                    case 'orders':
                        await fetchFarmerOrders();
                        break;
                    case 'payments':
                        await fetchPayments();
                        break;
                    case 'history':
                        await fetchOrderHistory();
                        break;
                    default:
                        break;
                }
            } catch (err) {
                setError('Failed to fetch data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);


    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('UserData');
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
        toast.success("Logout Successfully..");
    };



    // API functions
    const fetchDashboardData = async () => {
        try {
            const [cropsRes, ordersRes] = await Promise.all([
                axiosInstance.get(`/crops/my`),
                axiosInstance.get(`/order/farmer`)
            ]);

            setCrops(cropsRes.data.crops || []);
            setOrders(ordersRes.data.orders || []);
        } catch (err) {
            throw new Error(err.response?.data?.msg || 'Failed to fetch dashboard data');
        }
    };

    const fetchMyCrops = async () => {
        try {
            const response = await axiosInstance.get(`/crops/my`);
            setMyCrops(response.data.crops || []);
        } catch (err) {
            throw new Error(err.response?.data?.msg || 'Failed to fetch your crops');
        }
    };

    const fetchFarmerOrders = async () => {
        try {
            const response = await axiosInstance.get(`/order/farmer`);
            setOrders(response.data.orders || []);
        } catch (err) {
            throw new Error(err.response?.data?.msg || 'Failed to fetch orders');
        }
    };


    useEffect(() => {
        const pay = async () => {
            try {
                const response = await axiosInstance.get('/order/total-payment');
                setPayment(response.data); 
                setLoading(false);
            } catch (error) {
                console.error("Error fetching payments:", error);
                setLoading(false);
            }
        };

        pay(); // Call the pay function to fetch payments
    }, []);

    const fetchPayments = async () => {
        try {
            // Fetch data from the API using Axios
            const response = await axiosInstance.get('/order/total-payment');

            // Set the fetched payments data
            setPayments(response.data.paymentData);
        } catch (err) {
            console.error('Error fetching payments:', err);
            throw new Error('Failed to fetch payments');
        }
    };
    const fetchOrderHistory = async () => {
        try {
            const response = await axiosInstance.get(`/order/history`);
            setHistory(response.data.history || []);
        } catch (err) {
            throw new Error(err.response?.data?.msg || 'Failed to fetch order history');
        }
    };

    const addCrop = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', cropForm.name);
            formData.append('description', cropForm.description);
            formData.append('price', cropForm.price);
            formData.append('quantityAvailable', cropForm.quantityAvailable);
            formData.append('unit', cropForm.unit);
            if (cropForm.image) {
                formData.append('image', cropForm.image);
            }

            const response = await axiosInstance.post(`/crops/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Crop added successfully!');
            setShowAddCropModal(false);
            setCropForm({
                name: '',
                description: '',
                price: '',
                quantityAvailable: '',
                unit: '',
                image: null
            });

            // Refresh the crops list
            await fetchMyCrops();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add crop');
        } finally {
            setLoading(false);
        }
    };

    const updateCrop = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            if (cropForm.name) formData.append('name', cropForm.name);
            if (cropForm.description) formData.append('description', cropForm.description);
            if (cropForm.price) formData.append('price', cropForm.price);
            if (cropForm.quantityAvailable) formData.append('quantityAvailable', cropForm.quantityAvailable);
            if (cropForm.unit) formData.append('unit', cropForm.unit);
            if (cropForm.image) {
                formData.append('image', cropForm.image);
            }

            const response = await axios.put(`${API_BASE_URL}/crops/${editingCrop._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Crop updated successfully!');
            setShowEditCropModal(false);
            setEditingCrop(null);
            setCropForm({
                name: '',
                description: '',
                price: '',
                quantityAvailable: '',
                unit: '',
                image: null
            });

            // Refresh the crops list
            await fetchMyCrops();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update crop');
        } finally {
            setLoading(false);
        }
    };

    const deleteCrop = async (id) => {
        if (!window.confirm('Are you sure you want to delete this crop?')) return;

        setLoading(true);
        setError('');

        try {
            await axios.delete(`${API_BASE_URL}/crops/${id}`);
            setSuccess('Crop deleted successfully!');

            // Refresh the crops list
            await fetchMyCrops();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete crop');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            // 1️⃣ Update status
            await axiosInstance.put(`/order/${orderId}/status`, { status });
    
            // 2️⃣ Find the order from current state
            const order = orders.find(o => o._id === orderId);
    
            // 3️⃣ If delivered → send to blockchain
            if (status === "delivered" && order) {
                await axios.post("http://127.0.0.1:8000/api/payment/", {
                    id: order._id,
                    totalPrice: order.totalPrice,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt,
                    status: "delivered",
                });
            }
    
            setSuccess("Order status updated successfully!");
            await fetchFarmerOrders();
    
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update order status");
        } finally {
            setLoading(false);
        }
    };
    

    const handleCropFormChange = (e) => {
        const { name, value } = e.target;
        setCropForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setCropForm(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const openEditCropModal = (crop) => {
        setEditingCrop(crop);
        setCropForm({
            name: crop.name,
            description: crop.description,
            price: crop.price,
            quantityAvailable: crop.quantityAvailable,
            unit: crop.unit,
            image: null
        });
        setShowEditCropModal(true);
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="mr-4 p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-green-700">Greenbazzar</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button className="p-2 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
                            </button>
                        </div>

                        <div className="relative">
                            <button className="flex items-center space-x-2 focus:outline-none">
                                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                                    FC
                                </div>
                                <span className="text-gray-700">Farm Admin</span>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error and Success Messages */}
            {error && (
                <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {success && (
                <div className="mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-64 bg-white shadow-lg z-10">
                        <nav className="mt-6 px-4">
                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer ${activeTab === 'dashboard' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setActiveTab('dashboard')}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="font-medium">Dashboard Overview</span>
                            </div>

                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer ${activeTab === 'crops' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setActiveTab('crops')}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                </svg>
                                <span className="font-medium">Manage Crops</span>
                            </div>

                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer ${activeTab === 'orders' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="font-medium">Manage Orders</span>
                            </div>

                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer ${activeTab === 'payments' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setActiveTab('payments')}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">View Payments</span>
                            </div>

                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer ${activeTab === 'history' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">History</span>
                            </div>
                            <div
                                className={`flex items-center px-4 py-3 rounded-lg mb-2 cursor-pointer`}
                                onClick={handleLogout}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">LogOut</span>
                            </div>
                        </nav>

                        <div className="mt-8 px-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h3 className="text-sm font-medium text-green-800 mb-1">Need help?</h3>
                                <p className="text-xs text-green-600 mb-2">Contact our support team</p>
                                <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
                                    Get Help
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                        </div>
                    )}

                    {/* Dashboard Overview */}
                    {activeTab === 'dashboard' && !loading && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-lg bg-green-100 mr-4">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Total Crops</h3>
                                            <p className="text-2xl font-bold text-gray-800">{crops.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-lg bg-yellow-100 mr-4">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
                                            <p className="text-2xl font-bold text-gray-800">{orders.filter(o => o.status === 'pending').length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-lg bg-blue-100 mr-4">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                                            <p className="text-2xl font-bold text-gray-800">${payment.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                                    <div className="space-y-4">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order._id} className="flex items-start">
                                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">Order #{order._id}</p>
                                                    <p className="text-sm text-gray-600">Status: {order.status}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Status</h3>
                                    <div className="space-y-4">
                                        {crops.slice(0, 3).map(crop => (
                                            <div key={crop._id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-800">{crop.name}</p>
                                                    <p className="text-sm text-gray-600">{crop.quantityAvailable} {crop.unit} available</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${crop.quantityAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {crop.quantityAvailable > 0 ? 'Available' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manage Crops */}
                    {activeTab === 'crops' && !loading && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Manage Crops</h2>
                                <button
                                    onClick={() => setShowAddCropModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add New Crop
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {myCrops.map(crop => (
                                            <tr key={crop._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {crop.image && (
                                                            <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                                                <img src={crop.image} alt={crop.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="font-medium text-gray-900">{crop.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-12">{crop.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${crop.price}/{crop.unit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.quantityAvailable} {crop.unit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${crop.quantityAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {crop.quantityAvailable > 0 ? 'Available' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditCropModal(crop)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCrop(crop._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Manage Orders */}
                    {activeTab === 'orders' && !loading && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{order._id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerId?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        {order.cropId?.image && (
                                                            <img src={order.cropId.image} alt={order.cropId.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                                                        )}
                                                        <span>{order.cropId?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalPrice}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <select
                                                        value={orderStatusForm[order._id] || order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className="text-sm border rounded p-1"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* View Payments */}
                    {activeTab === 'payments' && !loading && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map(payment => (
                                            <tr key={payment._id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{payment._id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.totalPrice}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {payment.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {activeTab === 'history' && !loading && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>

                            <div className="space-y-6">
                                {history.map(item => (
                                    <div key={item._id} className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-medium text-gray-800">{item.action || 'Status Update'}</h3>
                                                <span className="text-sm text-gray-500">{new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 mt-1">
                                                Order #{item.orderId?._id || item.orderId}: {item.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Crop Modal */}
            {showAddCropModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Add New Crop</h3>

                        <form onSubmit={addCrop}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Crop Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={cropForm.name}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={cropForm.description}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={cropForm.price}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantityAvailable">
                                    Quantity Available
                                </label>
                                <input
                                    type="number"
                                    id="quantityAvailable"
                                    name="quantityAvailable"
                                    value={cropForm.quantityAvailable}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit">
                                    Unit
                                </label>
                                <select
                                    id="unit"
                                    name="unit"
                                    value={cropForm.unit}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="g">Gram (g)</option>
                                    <option value="lb">Pound (lb)</option>
                                    <option value="oz">Ounce (oz)</option>
                                    <option value="piece">Piece</option>
                                    <option value="bunch">Bunch</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                                    Crop Image
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleImageChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCropModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Crop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Crop Modal */}
            {showEditCropModal && editingCrop && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Crop</h3>

                        <form onSubmit={updateCrop}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                                    Crop Name
                                </label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={cropForm.name}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                                    Description
                                </label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={cropForm.description}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="edit-price"
                                    name="price"
                                    value={cropForm.price}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-quantityAvailable">
                                    Quantity Available
                                </label>
                                <input
                                    type="number"
                                    id="edit-quantityAvailable"
                                    name="quantityAvailable"
                                    value={cropForm.quantityAvailable}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-unit">
                                    Unit
                                </label>
                                <select
                                    id="edit-unit"
                                    name="unit"
                                    value={cropForm.unit}
                                    onChange={handleCropFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="g">Gram (g)</option>
                                    <option value="lb">Pound (lb)</option>
                                    <option value="oz">Ounce (oz)</option>
                                    <option value="piece">Piece</option>
                                    <option value="bunch">Bunch</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-image">
                                    Crop Image
                                </label>
                                <input
                                    type="file"
                                    id="edit-image"
                                    name="image"
                                    onChange={handleImageChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    accept="image/*"
                                />
                                {editingCrop.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Current Image:</p>
                                        <img src={editingCrop.image} alt={editingCrop.name} className="h-20 w-20 object-cover mt-1 rounded" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditCropModal(false);
                                        setEditingCrop(null);
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Crop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmConnectDashboard;










