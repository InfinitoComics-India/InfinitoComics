import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { addUser, removeUser } from './redux/userSlice';

import Body from './components/Body';
import ShopMain from './pages/ShopMain/ShopMain';
import ShopCategory from './pages/ShopCategory/ShopCategory';
import ShopProduct from './pages/ShopProduct/ShopProduct';
import Cart from './pages/Cart/Cart';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const MAIN_URL =
      import.meta.env.VITE_FRONTEND_BASE_URL || 'https://infinitohq.com';

    // Load cached user immediately so we don't flash a logged-out UI.
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        dispatch(addUser(JSON.parse(cachedUser)));
      } catch {}
    }

    // Auth-bridge iframe pulls the user session from the main site,
    // matching the pattern used by Research and Foundation.
    const iframe = document.createElement('iframe');
    iframe.src = `${MAIN_URL}/auth-bridge.html`;
    iframe.style.cssText =
      'display:none;width:0;height:0;border:none;position:absolute;';
    document.body.appendChild(iframe);

    const handleMessage = (event) => {
      if (event.data?.type === 'auth-bridge') {
        if (event.data.user) {
          try {
            const userData = JSON.parse(event.data.user);
            dispatch(addUser(userData));
            localStorage.setItem('user', event.data.user);
          } catch {}
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('authtoken');
          localStorage.removeItem('token');
          dispatch(removeUser());
        }
        if (event.data.token) {
          localStorage.setItem('authtoken', event.data.token);
        }
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }

      // Legacy postMessage support (matches Research)
      if (event.data?.type === 'user-data' && event.data?.payload) {
        try {
          const userData = JSON.parse(event.data.payload);
          dispatch(addUser(userData));
          localStorage.setItem('user', event.data.payload);
        } catch {}
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    };
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter basename="/shop">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<ShopMain />} />
            <Route path="category/:categoryName" element={<ShopCategory />} />
            <Route path="product/:productId" element={<ShopProduct />} />
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
