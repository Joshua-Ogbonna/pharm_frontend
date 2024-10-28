// src/lib/auth.ts
interface User {
  email: string;
  role: 'admin' | 'pharmacist' | 'consumer';
  token: string;
}

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch('http://localhost:30299/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  console.log(response)

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const { token } = await response.json();
  
  // Decode token to get user role (assuming JWT contains role)
  const payload = JSON.parse(atob(token.split('.')[1]));
  
  const user: User = {
    email,
    role: payload.role,
    token,
  };

  // Store in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const register = async (email: string, password: string, role: string): Promise<void> => {
  const response = await fetch('http://localhost:30299/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getUser();
};