import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton, CircularProgress, Link
} from '@mui/material';
import { Visibility, VisibilityOff, SupportAgent } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../features/auth/authSlice';
import axios from 'axios';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      dispatch(loginSuccess(res.data));
      const role = res.data.user.role;
      if (role === 'admin')    navigate('/admin/dashboard');
      if (role === 'engineer') navigate('/engineer/dashboard');
      if (role === 'employee') navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #F5F3FF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            mb: 2, boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
          }}>
            <SupportAgent sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} color="#1E1B4B">
            IT HelpDesk
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to your workspace
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TextField
              label="Email Address" type="email" fullWidth
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password" type={showPass ? 'text' : 'password'} fullWidth
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button variant="contained" fullWidth size="large"
              onClick={handleLogin} disabled={loading}
              sx={{
                py: 1.5, fontSize: '1rem', mb: 3,
                background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                '&:hover': { background: 'linear-gradient(135deg, #6D28D9, #9162F0)' },
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Don't have an account?{' '}
              <Link onClick={() => navigate('/register')}
                sx={{ cursor: 'pointer', fontWeight: 600, color: '#7C3AED' }}>
                Create account
              </Link>
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" textAlign="center"
          sx={{ display: 'block', mt: 3 }}>
          Admin access is managed separately
        </Typography>
      </Box>
    </Box>
  );
}