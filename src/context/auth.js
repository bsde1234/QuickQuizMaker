/* eslint-disable no-use-before-define */
import React, { useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useToastify } from 'hooks/useToastify';

const API_KEY = process.env.REACT_APP_API_KEY;
const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: '',
    userId: '',
    error: null,
    loading: false,
  });
  const { showToast } = useToastify();

  const authFn = (email, password, method) => {
    setAuthState({
      ...authState,
      loading: true,
    });
    let authUrl =
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
    if (method === 'register') {
      authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=`;
    }
    axios
      .post(authUrl + API_KEY, {
        email,
        password,
        returnSecureToken: true,
      })
      .then((response) => {
        const expirationDate = new Date(
          new Date().getTime() + response.data.expiresIn * 1000,
        );
        localStorage.setItem('expirationDate', expirationDate);
        localStorage.setItem('token', response.data.idToken);
        localStorage.setItem('userId', response.data.localId);
        setAuthExpiration(response.data.expiresIn);
        setAuthState({
          ...authState,
          token: response.data.idToken,
          userId: response.data.localId,
          loading: false,
        });
      })
      .catch((error) => {
        const errorMessage = error.response.data.error.message
          .toLowerCase()
          .split('_')
          .join(' ');
        showToast(errorMessage, 'error');
        setAuthState({
          ...authState,
          loading: false,
        });
      });
  };

  const setAuthExpiration = useCallback((expirationTime) => {
    setTimeout(() => {
      logoutFn();
    }, expirationTime * 1000);
  }, []);

  const logoutFn = () => {
    localStorage.clear();
    setAuthState({
      token: '',
      userId: '',
      error: null,
      loading: false,
    });
  };

  const autoAuthCheck = useCallback(() => {
    setAuthState((oldState) => ({
      ...oldState,
      loading: true,
    }));
    const token = localStorage.getItem('token');
    if (token) {
      const expirationTime = new Date(localStorage.getItem('expirationDate'));
      const userId = localStorage.getItem('userId');
      const expiresIn =
        (expirationTime.getTime() - new Date().getTime()) / 1000;
      if (expirationTime.getTime() > new Date().getTime()) {
        // Login again
        setAuthState((oldState) => ({
          ...oldState,
          token,
          userId,
          loading: false,
        }));
        // setTimeout logout
        setAuthExpiration(expiresIn);
      } else {
        logoutFn();
      }
    } else {
      logoutFn();
    }
  }, [setAuthExpiration]);

  return (
    <AuthContext.Provider
      value={{ authState, authFn, logoutFn, autoAuthCheck }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.instanceOf(Object).isRequired,
};

export default AuthProvider;
