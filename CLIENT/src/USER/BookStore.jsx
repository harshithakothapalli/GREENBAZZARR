import React, { useState, useEffect } from 'react';
import axiosInstance from '../AuthenticationPages/axiosConfig';
import { toast } from 'react-toastify';

const FarmConnectMarketplace = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1); // New state for order quantity
  const [placingOrder, setPlacingOrder] = useState(false); // New state for order placement loading

  // Get unique farmers and categories for filters
  const farmers = [...new Set(crops.map(crop => crop.farmerId?.name || 'Unknown Farmer'))];
  const categories = [...new Set(crops.map(crop => crop.category || 'Vegetable'))];

  useEffect(() => {
    fetchCrops();
    const userData = localStorage.getItem('UserData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    filterCrops();
  }, [crops, searchTerm, selectedFarmer, selectedCategory]);

  const fetchCrops = async () => {
    try {
      const response = await axiosInstance.get('/crops/');
      setCrops(response.data.crops);
      setFilteredCrops(response.data.crops);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setLoading(false);
    }
  };

  const filterCrops = () => {
    let result = crops;

    if (searchTerm) {
      result = result.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFarmer) {
      result = result.filter(crop => crop.farmerId?.name === selectedFarmer);
    }

    if (selectedCategory) {
      result = result.filter(crop => crop.category === selectedCategory);
    }

    setFilteredCrops(result);
  };

  const openCropDetails = (crop) => {
    setSelectedCrop(crop);
    setQuantity(1); // Reset quantity to 1 when opening a new crop
    setIsModalOpen(true);
  };

  const closeCropDetails = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
    setQuantity(1); // Reset quantity when closing modal
  };

  const handleLogout = () => {
    localStorage.removeItem('UserData');
    localStorage.removeItem('token');
    setUser(null);
    window.location.reload();
    toast.success("Logout Successfully..");
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  // New function to handle placing an order
  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    if (quantity < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (quantity > selectedCrop.quantityAvailable) {
      toast.error(`Only ${selectedCrop.quantityAvailable} ${selectedCrop.unit} available`);
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await axiosInstance.post('/order/', {
        cropId: selectedCrop._id,
        quantity: quantity
      });

      toast.success("Order placed successfully!");
      closeCropDetails();
      // Refresh crops to update available quantities
      fetchCrops();
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.msg || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Greenbazzar</h1>

          {/* <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Home</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Vegetables</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Fruits</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Grains</a>
          </nav> */}

          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* User profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-green-100">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-green-100">
                        <p className="text-sm font-medium text-gray-800">Hello, {user.name}</p>
                      </div>
                      <a href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">Profile</a>
                      <a href="/user/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">My Orders</a>
                      <div className="border-t border-green-100"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLogin}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        Login
                      </button>
                      <button
                        onClick={handleRegister}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white border-b border-green-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center">
            <h3 className="text-lg font-semibold text-gray-800">Filters:</h3>

            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Farmers</option>
              {farmers.map(farmer => (
                <option key={farmer} value={farmer}>{farmer}</option>
              ))}
            </select>

            {/* <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select> */}

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFarmer('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Fresh Farm Produce</h2>

        {filteredCrops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No crops found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCrops.map((crop) => (
              <div key={crop._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-green-100">
                <div className="h-48 overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{crop.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {crop.farmerId?.name || 'Local Farmer'}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {crop.category || 'Vegetable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <span className="text-green-600 font-bold">${crop.price}/{crop.unit}</span>
                      <p className="text-xs text-gray-500">{crop.quantityAvailable} available</p>
                    </div>
                    <button
                      onClick={() => openCropDetails(crop)}
                      className="text-xs px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Crop Detail Modal */}
      {isModalOpen && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedCrop.name}</h2>
                <button
                  onClick={closeCropDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={selectedCrop.image}
                    alt={selectedCrop.name}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>

                <div className="md:w-2/3">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Crop Details</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Farmer</p>
                        <p className="font-medium">{selectedCrop.farmerId?.name || 'Local Farmer'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium text-green-600">${selectedCrop.price}/{selectedCrop.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{selectedCrop.category || 'Vegetable'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available Quantity</p>
                        <p className="font-medium">{selectedCrop.quantityAvailable} {selectedCrop.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Added On</p>
                        <p className="font-medium">{new Date(selectedCrop.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium">{new Date(selectedCrop.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{selectedCrop.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Form Section */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Place Your Order</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center">
                        <label htmlFor="quantity" className="mr-2 text-sm font-medium text-gray-700">Quantity:</label>
                        <input
                          type="number"
                          id="quantity"
                          min="1"
                          max={selectedCrop.quantityAvailable}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{selectedCrop.unit}</span>
                      </div>
                      <div className="text-sm font-medium">
                        Total: <span className="text-green-600">${(selectedCrop.price * quantity).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          placingOrder 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {placingOrder ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full">
                        Fresh from the farm
                      </span>
                    </div>
                    <button
                      onClick={() => openCropDetails(selectedCrop)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Contact Farmer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmConnectMarketplace;