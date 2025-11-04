// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import app from './api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await app.get('/admin/check-auth');
        console.log(response)
        if (response.status !== 200) {
          throw new Error("Unauthorized");
        }
        else{
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error: "+error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { isAuthenticated, loading };
}