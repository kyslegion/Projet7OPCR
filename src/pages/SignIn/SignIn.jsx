import React, { useState } from 'react';
import axios from 'axios';
import * as PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { API_ROUTES, APP_ROUTES } from '../../utils/constants';
import { useUser } from '../../lib/customHooks';
import { storeInLocalStorage } from '../../lib/common';
import { ReactComponent as Logo } from '../../images/Logo.svg';
import styles from './SignIn.module.css';

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const { user, authenticated } = useUser();
  if (user || authenticated) {
    navigate(APP_ROUTES.DASHBOARD);
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const signIn = async () => {
    try {
      setIsLoading(true);
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        })
      };
  
      fetch('http://localhost:4000/api/auth/login', requestOptions)
        .then((response) => response.json())
        .then((data) =>{
          let token={
            userId: data.userId,
            token: data.token,
          }
          setUser(token);
          localStorage.setItem('token', JSON.stringify(token));
          console.log(data)
          navigate('/');
        } )
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (err) {
      console.log(err);
      setNotification({ error: true, message: err.message });
      console.log('Some error occured during signing in: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  const errorClass = notification.error ? styles.Error : null;
  return (
    <div className={`${styles.SignIn} container`}>
      <Logo />
      <div className={`${styles.Notification} ${errorClass}`}>
        {notification.message.length > 0 && <p>{notification.message}</p>}
      </div>
      <div className={styles.Form}>
        <label htmlFor={email}>
          <p>Adresse email</p>
          <input
            className=""
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
          />
        </label>
        <label htmlFor="password">
          <p>Mot de passe</p>
          <input
            className="border-2 outline-none p-2 rounded-md"
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
          />
        </label>
        <div className={styles.Submit}>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            onClick={signIn}
          >
            {isLoading ? <div className="" /> : null}
            <span>
              Se connecter
            </span>
          </button>
          <span>OU</span>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            // onClick={signUp}
          >
            {
                isLoading
                  ? <div className="mr-2 w-5 h-5 border-l-2 rounded-full animate-spin" /> : null
              }
            <span>
              <a href={APP_ROUTES.SIGN_UP}>{'S\'inscrire'}</a>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

SignIn.propTypes = {
  setUser: PropTypes.func.isRequired,
};
export default SignIn;
