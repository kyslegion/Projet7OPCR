import React, { useEffect, useState } from 'react';

import {
  BrowserRouter, Navigate, Route, Routes,
} from 'react-router-dom';
import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';
import Home from './pages/Home/Home';
import Book from './pages/Book/Book';
import { APP_ROUTES } from './utils/constants';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AddBook from './pages/AddBook/AddBook';
import UpdateBook from './pages/updateBook/UpdateBook';
import { useUser } from './lib/customHooks';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  const [user, setUser] = useState(null);
  const { connectedUser } = useUser();
// console.log(user,"usser");
  useEffect(() => {
    setUser(connectedUser);
  }, [connectedUser]);
  console.log(connectedUser,"connectedUser dans app");
  return (
    <BrowserRouter>
      <div>
        <ScrollToTop />
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route index element={<Home setUser={setUser} />} />
          <Route path={APP_ROUTES.SIGN_IN} element={<SignIn setUser={setUser} />} />
          <Route path={APP_ROUTES.SIGN_UP} element={<SignUp setUser={setUser}/>} />
          {/* <Route path="/test" element={<AddBook />} /> */}
          <Route path={APP_ROUTES.BOOK} element={<Book />} />
          <Route path={APP_ROUTES.UPDATE_BOOK} element={<UpdateBook />} />
          <Route path={APP_ROUTES.ADD_BOOK} element={user ? <AddBook setUser={setUser} /> : <Navigate to={APP_ROUTES.SIGN_IN} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
