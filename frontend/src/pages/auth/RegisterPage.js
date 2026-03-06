import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, MenuItem, CircularProgress, Link, Divider
} from '@mui/material';
import { SupportAgent } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../features/auth/authSlice';
import axios from 'axios';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'employee'
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name, email: form.email,
        password: form.password, role: form.role,
      });
      dispatch(loginSuccess(res.data));
      const role = res.data.user.role;
      if (role === 'engineer') navigate('/engineer/dashboard');
      if (role === 'employee') navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1117 0%, #1A1D2E 50%, #0F1117 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
            mb: 2, boxShadow: '0 8px 32px rgba(79,142,247,0.4)',
          }}>
            <SupportAgent sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} color="white">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Join IT HelpDesk today
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TextField label="Full Name" fullWidth
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ mb: 2 }} />

            <TextField label="Email Address" type="email" fullWidth
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ mb: 2 }} />

            <TextField label="I am a..." select fullWidth
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              sx={{ mb: 2 }}>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="engineer">IT Engineer</MenuItem>
            </TextField>

            <TextField label="Password" type="password" fullWidth
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 2 }} />

            <TextField label="Confirm Password" type="password" fullWidth
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              sx={{ mb: 3 }} />

            <Button variant="contained" fullWidth size="large"
              onClick={handleRegister} disabled={loading}
              sx={{
                py: 1.5, fontSize: '1rem', mb: 3,
                background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
                '&:hover': { background: 'linear-gradient(135deg, #3B7EF6, #6D28D9)' },
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">OR</Typography>
            </Divider>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Already have an account?{' '}
              <Link onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer', fontWeight: 600, color: 'primary.main' }}>
                Sign in
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}