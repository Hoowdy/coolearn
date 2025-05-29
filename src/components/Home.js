import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/recommendations');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
        Start exploring recommendations now!
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleStartClick}>
          Start
        </Button>
      </Box>
    </Container>
  );
}

export default Home;