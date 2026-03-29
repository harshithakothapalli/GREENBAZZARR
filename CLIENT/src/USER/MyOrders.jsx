import React, { useState, useEffect } from 'react';
import axiosInstance from '../AuthenticationPages/axiosConfig';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(`/order/customer`);
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet.</p>
              <a href="/" className="text-green-600 hover:text-green-700 font-medium">Continue Shopping</a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Placed</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order #</p>
                      <p className="font-medium">{order._id.substring(order._id.length - 8)}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={order.cropId.image} 
                          alt={order.cropId.name} 
                          className="h-16 w-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">{order.cropId.name}</h3>
                          <p className="text-gray-600">Quantity: {order.quantity} {order.cropId.unit}</p>
                          <p className="text-sm text-gray-500">Farmer: {order.farmerId.name}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0">
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          View Order Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-500">Order #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</p>
                  <p className="text-gray-500">Placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button 
                  onClick={closeOrderDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Farmer Information</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {selectedOrder.farmerId.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {selectedOrder.farmerId.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Address:</span> {selectedOrder.farmerId.address}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Information</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Total Amount:</span> ${selectedOrder.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Item</h3>
                <div className="flex border-b border-gray-200 pb-4">
                  <img 
                    src={selectedOrder.cropId.image} 
                    alt={selectedOrder.cropId.name} 
                    className="h-24 w-24 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-800">{selectedOrder.cropId.name}</h4>
                    <p className="text-gray-600">{selectedOrder.cropId.description}</p>
                    <p className="text-gray-600">Category: {selectedOrder.cropId.category || 'Vegetable'}</p>
                    <p className="text-gray-600">Quantity: {selectedOrder.quantity} {selectedOrder.cropId.unit}</p>
                    <p className="text-gray-600">Price per unit: ${selectedOrder.cropId.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${selectedOrder.cropId.price}/{selectedOrder.cropId.unit}</p>
                    <p className="text-gray-600">Total: ${selectedOrder.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Order Status:</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">Total: ${selectedOrder.totalPrice.toFixed(2)}</p>
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

export default MyOrders;