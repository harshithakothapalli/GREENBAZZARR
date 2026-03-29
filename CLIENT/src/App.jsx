import React from 'react'
import "./App.css"
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './AuthenticationPages/AuthProvider'
import PrivateRoute from './AuthenticationPages/PrivateRoute'
import BookShopLanding from './BookShopLanding'
import FarmConnectDashboard from './FARMER/FarmerDashboard'
import FarmConnectMarketplace from './USER/BookStore'
import MyProfile from './USER/MyProfile'
import MyOrders from './USER/MyOrders'
import ChatBot from './Chatbot'



const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<BookShopLanding />} />
          <Route
            path="/farmer/dashboard"
            element={
              <PrivateRoute>
                <FarmConnectDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/customer/dashboard"
            element={
              <PrivateRoute>
                <FarmConnectMarketplace />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <MyProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/my-orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />

        



        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
          <ChatBot />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
