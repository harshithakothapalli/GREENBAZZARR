import React, { useState, useEffect } from "react";
import axiosInstance from "../AuthenticationPages/axiosConfig";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Fetch logged in user from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/users/me");

      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      setErrorMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Save updated data to backend
  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        role: user.role, // required for backend switch-case
      };

      const { data } = await axiosInstance.put(`/${user._id}`, payload);

      setUser(data.updatedUser);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Update failed:", error);
      setErrorMessage("Failed to update profile");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      address: user.address || "",
    });
    setIsEditing(false);
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
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Image */}
            {user?.photo && (
              <div className="flex justify-center mb-6">
                <img
                  src={user.photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                />
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p>{user.mobile || "Not provided"}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p>{user.address || "Not provided"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;