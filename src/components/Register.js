import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { checkLogin, checkEmail, registerUser, getInterests } from '../api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Chip,
  InputLabel,
} from '@mui/material';

// const availableInterests = [
//   'Programming',
//   'Mathematics',
//   'Physics',
//   'Data Science',
//   'English',
//   'Design',
//   'History',
//   'Biology',
//   'Economics',
// ];

function Register() {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [errors, setErrors] = useState({});

  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const interestsResponse = await getInterests();
        console.log(interestsResponse.data.interests);
        setAvailableInterests(interestsResponse.data.interests);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          general: 'Failed to load interests. Using defaults.',
        }));
        setAvailableInterests([
          'Programming',
          'Mathematics',
          'Physics',
          'Data Science',
          'English',
          'Design',
          'History',
          'Biology',
          'Economics',
        ]); // Fallback interests
      }
    };
    fetchInterests();
  }, []);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const isLoginTaken = async (loginToCheck) => {
    try {
      const response = await checkLogin(loginToCheck);
      return response.data.isTaken;
    } catch (error) {
      console.error('Error checking login:', error);
      return false;
    }
  };

  const isEmailTaken = async (emailToCheck) => {
    try {
      const response = await checkEmail(emailToCheck);
      return response.data.isTaken;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const validate = async () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const loginPattern = /^[a-zA-Z0-9]{3,16}$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!login.trim()) {
      newErrors.login = 'Login is required';
    } else if (!loginPattern.test(login)) {
      newErrors.login = 'Login must be 3-16 letters or digits';
    } else if (await isLoginTaken(login)) {
      newErrors.login = 'This login is already taken';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Invalid email format';
    } else if (await isEmailTaken(email)) {
      newErrors.email = 'This email is already registered';
    }

    if (!passwordPattern.test(password)) {
      newErrors.password =
        'Password must be at least 8 characters, including letters, digits, and special characters';
    }

    if (interests.length < 1) {
      newErrors.interests = 'Select at least 1 interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (await validate()) {
      try {
        await registerUser({ login, email, password, interests });
        await authLogin({ loginOrEmail: login, password });
        // Redirect to the intended page or /profile
        const from = location.state?.from?.pathname || '/profile';
        navigate(from, { replace: true });
      } catch (error) {
        setErrors({ general: error.response?.data?.error || 'Registration failed' });
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location.state?.from } });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, mt: 8 }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        {errors.general && (
          <Typography color="error" sx={{ mt: 1 }}>
            {errors.general}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            fullWidth
            error={Boolean(errors.login)}
            helperText={errors.login || ''}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email || ''}
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
          <FormControl fullWidth margin="normal" error={Boolean(errors.interests)}>
            <InputLabel id="interests-label" sx={{ color: (theme) => theme.palette.text.secondary }}>
              Interests
            </InputLabel>
            <Select
              labelId="interests-label"
              label="Interests"
              multiple
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={(theme) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.neutral.white,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 },
                        borderRadius: 1,
                      })}
                    />
                  ))}
                </Box>
              )}
              sx={(theme) => ({
                '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral.medium },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: (theme) => theme.palette.neutral.light,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: (theme) => theme.palette.primary.main,
                  borderRadius: '4px',
                  '&:hover': {
                    background: (theme) => theme.palette.primary.dark,
                  },
                },
              })}
            >
              {availableInterests.map((interest) => (
                <MenuItem key={interest} value={interest}>
                  {interest}
                </MenuItem>
              ))}
            </Select>
            {errors.interests && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  color: 'error.main',
                  textAlign: 'left',
                  fontSize: { xs: '0.75rem', sm: '0.75rem' },
                }}
              >
                {errors.interests}
              </Typography>
            )}
          </FormControl>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Button variant="contained" color="primary" onClick={handleRegister}>
              Register
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleLoginRedirect}>
              Log In
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Register;