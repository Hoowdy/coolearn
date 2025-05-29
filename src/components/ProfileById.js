import { Container, Typography, Box, Avatar, Chip } from '@mui/material';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserById } from '../api';
import { useAuth } from './context/AuthContext';

function ProfileById() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) return; // Skip fetching if not authenticated

    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, authUser]);

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <Container sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 3 }, maxWidth: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 'bold' }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 2, mb: 4, px: { xs: '1', sm: '3' }, maxWidth: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 'bold' }}>
          Пользователь не найден
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        mt: 2,
        mb: 4,
        px: { xs: '1', sm: '3' },
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
            fontWeight: 'bold',
          }}
        >
          Profile
        </Typography>
      </Box>

      <Box
        sx={{
          p: { xs: '2', sm: '3' },
          backgroundColor: 'background.paper',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            flexWrap: 'wrap',
          }}
        >
          <Avatar
            src={user.avatar}
            sx={{
              width: { xs: '60', sm: '80' },
              height: { xs: '60', sm: '80' },
              border: '2px solid #42a5f5',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 'bold',
              wordBreak: 'break-word',
              flex: '1',
            }}
          >
            {user.name}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            sx={{
              mb: '1',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 'bold',
            }}
          >
            Interests:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5' }}>
            {user.interests?.map((interest, index) => (
              <Chip
                key={index}
                label={interest}
                sx={{
                  backgroundColor: '#42a5f5',
                  color: '#fff',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: '24', sm: '32' },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.5',
            }}
          >
            <Box component="span" sx={{ fontWeight: 'bold' }}>Description:</Box>{' '}
            {user.description}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word',
            }}
          >
            <Box component="span" sx={{ fontWeight: 'bold' }}>Education:</Box> {user.education}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default ProfileById;