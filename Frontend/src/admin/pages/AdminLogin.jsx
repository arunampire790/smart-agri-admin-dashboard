import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartagri.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@smartagri.com' && password === 'admin123') {
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials. Use demo credentials shown below.');
    }
  };

  return (
    <div className="admin-app-container">
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo">
            <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-plant-2" aria-hidden="true"></i>
            </div>
          </div>
          <div className="login-title">Smart Agriculture</div>
          <div className="login-sub" style={{ marginTop: '2px' }}>Admin Panel · Sign in to continue</div>
          
          <form style={{ marginTop: '20px' }} onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <div className="form-label">Email</div>
              <input 
                className="form-input" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div className="form-label">Password</div>
              <input 
                className="form-input" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px' }}>
              Sign in
            </button>
            <div className="demo-box" style={{ marginTop: '12px' }}>
              <strong>Demo:</strong> admin@smartagri.com / admin123
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
