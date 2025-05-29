import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
} from '@mui/material';

function Login() {
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const loginPattern = /^[a-zA-Z0-9]{3,16}$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!loginOrEmail.trim()) {
      newErrors.loginOrEmail = 'Login or email is required';
    } else if (loginOrEmail.includes('@')) {
      if (!emailPattern.test(loginOrEmail)) {
        newErrors.loginOrEmail = 'Invalid email format';
      }
    } else {
      if (!loginPattern.test(loginOrEmail)) {
        newErrors.loginOrEmail = 'Login must be 3-16 letters or digits';
      }
    }

    if (!passwordPattern.test(password)) {
      newErrors.password =
        'Password must be at least 8 characters, including letters, digits, and special characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        await login({ loginOrEmail, password });
        // Redirect to the intended page or /profile
        const from = location.state?.from?.pathname || '/profile';
        navigate(from, { replace: true });
      } catch (error) {
        setErrors({ general: error.response?.data?.error || 'Login failed' });
      }
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, mt: 8 }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {errors.general && (
          <Typography color="error" sx={{ mt: 1 }}>
            {errors.general}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Login or Email"
            value={loginOrEmail}
            onChange={(e) => setLoginOrEmail(e.target.value)}
            fullWidth
            error={Boolean(errors.loginOrEmail)}
            helperText={errors.loginOrEmail || ''}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            error={Boolean(errors.password)}
            helperText={errors.password || ''}
          />
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Button variant="contained" color="primary" onClick={handleLogin}>
              Log In
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleRegisterRedirect}>
              Register
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;