import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUser, FiBook,
  FiShoppingCart, FiList, FiLogOut,
  FiDollarSign, FiBarChart2, FiSettings
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
    { id: 'manageusers', label: 'View All Users', icon: <FiUser />, path: '/admin/view-users' },
    { id: 'managebooks', label: 'Manage Books', icon: <FiBook />, path: '/admin/manage-books' },
    { id: 'vieworders', label: 'View Orders', icon: <FiDollarSign />, path: '/admin/view-orders' },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 />, path: '/admin/analytics' },
  ];

  const userMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/user/dashboard' },
    { id: 'browse', label: 'Browse Books', icon: <FiBook />, path: '/user/browse-books' },
    { id: 'cart', label: 'My Cart', icon: <FiShoppingCart />, path: '/user/my-cart' },
    { id: 'orders', label: 'My Orders', icon: <FiList />, path: '/user/my-orders' },
    { id: 'wishlist', label: 'Wishlist', icon: <FiBook />, path: '/user/wishlist' },
    { id: 'profile', label: 'Profile', icon: <FiUser />, path: '/user/profile' },
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'admin': return adminMenu;
      case 'user': return userMenu;
      default: return [];
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'user': return 'Customer';
      default: return '';
    }
  };

  const menuItems = getMenuItems();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("UserData");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success('Logged out successfully');
    navigate("/");
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 text-gray-900 p-4 h-screen sticky top-0 flex flex-col shadow-sm">
      {/* Header */}
      <div className="mb-6 p-4 flex items-center space-x-3 border-b border-gray-200 pb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-md">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.253V19.253C11.7051 19.2532 11.4127 19.1917 11.144 19.073C10.284 18.723 9.273 19.103 9.073 19.973C8.937 20.583 9.183 20.983 9.663 21.253C10.423 21.693 11.293 21.863 12.003 21.863C12.713 21.863 13.583 21.693 14.343 21.253C15.103 20.813 15.583 20.153 15.583 19.343C15.583 18.533 15.103 17.873 14.343 17.433C13.933 17.203 13.463 17.063 13.003 17.023V5.25303C13.003 4.69303 12.573 4.25303 12.003 4.25303C11.433 4.25303 11.003 4.69303 11.003 5.25303V15.253C11.003 15.813 10.573 16.253 10.003 16.253C9.433 16.253 9.003 15.813 9.003 15.253V7.25303C9.003 6.69303 8.573 6.25303 8.003 6.25303C7.433 6.25303 7.003 6.69303 7.003 7.25303V15.253C7.003 15.813 6.573 16.253 6.003 16.253C5.433 16.253 5.003 15.813 5.003 15.253V10.253C5.003 9.69303 4.573 9.25303 4.003 9.25303C3.433 9.25303 3.003 9.69303 3.003 10.253V15.253C3.003 17.513 4.743 19.253 7.003 19.253C7.573 19.253 8.003 18.813 8.003 18.253C8.003 17.693 7.573 17.253 7.003 17.253C6.433 17.253 6.003 16.813 6.003 16.253V17.253C6.003 17.813 6.433 18.253 7.003 18.253C7.573 18.253 8.003 17.813 8.003 17.253V19.253C8.003 19.813 7.573 20.253 7.003 20.253C5.343 20.253 4.003 18.913 4.003 17.253V11.253H5.003V16.253C5.003 16.813 5.433 17.253 6.003 17.253C6.573 17.253 7.003 16.813 7.003 16.253V15.253H8.003V17.253C8.003 18.373 8.903 19.253 10.003 19.253C10.573 19.253 11.003 18.813 11.003 18.253V6.25303H12.003Z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">BookShop</h3>
          <p className="text-xs text-gray-600 font-medium">{getRoleTitle()} Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                  ? 'bg-gray-100 text-gray-700 border-l-4 border-gray-500 font-medium'
                  : 'hover:bg-gray-50 text-gray-800'
                  }`}
              >
                <span className={`text-lg ${activeTab === item.id ? 'text-gray-600' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 border border-gray-200">
            <FiUser size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">My Account</p>
            <p className="text-xs text-gray-600">{getRoleTitle()}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-gray-800 transition-all duration-200 group"
        >
          <span className="text-lg text-gray-600 group-hover:text-red-500">
            <FiLogOut />
          </span>
          <span className="text-sm font-medium group-hover:text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;