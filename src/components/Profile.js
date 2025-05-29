import { Container, Grid, Typography, Box, Avatar, Button, Modal, TextField, IconButton, Select, MenuItem, FormControl, Chip, CircularProgress, Rating, Alert } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { getConferences, getUserById, getCurrentUser, updateUser, getInterests, getRatings, submitRating } from '../api';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const themeRef = useRef();

  const [userData, setUserData] = useState(null);
  const [userMeetings, setUserMeetings] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openName, setOpenName] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const [openInterests, setOpenInterests] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [openEducation, setOpenEducation] = useState(false);
  const [openMeetingModal, setOpenMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [participantRatings, setParticipantRatings] = useState({});
  const [tempParticipantRatings, setTempParticipantRatings] = useState({});

  const [newName, setNewName] = useState('');
  const [newInterests, setNewInterests] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  const [nameError, setNameError] = useState('');
  const [interestsError, setInterestsError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [educationError, setEducationError] = useState('');

  const meetingHistoryRef = useRef(null);
  const dateRefs = useRef({});

  // Custom scrollbar styles
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: themeRef.current?.palette.neutral?.light || '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: themeRef.current?.palette.primary?.main || '#888',
      borderRadius: '4px',
      '&:hover': {
        background: themeRef.current?.palette.primary?.dark || '#555',
      },
    },
  };

  // Fetch current user data
  useEffect(() => {
      const fetchUserData = async () => {
      try {
        setLoading(true);
        // const [userResponse] = await Promise.all([
        //   getCurrentUser(),
        //   // getInterests(),
        // ]);
        console.log("user")
        const userResponse = await getCurrentUser();
        console.log(userResponse.data)
        setUserData(userResponse.data);
        setNewName(userResponse.data.name);
        setNewInterests(userResponse.data.interests || []);
        setNewDescription(userResponse.data.description || '');
        setNewEducation(userResponse.data.education || '');
        setNewAvatar(userResponse.data.avatar || '');

        const interestsResponse = await getInterests();
        setAvailableInterests(interestsResponse.data.interests || []);
        setError('');
      } catch (err) {
        setError('Failed to load user data or interests. Please try again.');
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
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Fetch meetings and participant data
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!userData) return;
      try {
        setLoading(true);
        const userMeetingsData = await getConferences();
        console.log(userMeetingsData);
        // Filter meetings where the current user is a participant
        // const filteredMeetings = response.data.filter((meeting) =>
        //   meeting.participants.includes(userData.id)
        // );
        // Fetch participant details for each meeting
        const meetingsWithParticipants = await Promise.all(
          userMeetingsData.data.map(async (meeting) => {
            console.log(userData);
            const user_index = meeting.participants.indexOf(userData.id);
            const numParticipants = meeting.participants.length;
            if (user_index > -1) {
              meeting.participants.splice(user_index, 1);
            }
            const participantsData = await Promise.all(
              meeting.participants.map(async (userId) => {
                try {
                  const userResponse = await getUserById(userId);
                  console.log(userResponse.data)
                  return userResponse.data;
                } catch (err) {
                  console.error(`Error fetching user ${userId}:`, err);
                  return {
                    id: userId,
                    name: 'Unknown User',
                    avatar: '',
                    interests: [],
                    education: 'N/A',
                    description: 'N/A',
                  };
                }
              })
            );
            return { ...meeting, participantsData, numParticipants };
          })
        );
        setUserMeetings(meetingsWithParticipants);
        setError('');
      } catch (err) {
        setError('Failed to load meetings. Please try again.');
        console.error('Error fetching meetings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [userData]);

  // Track changes to user data
  useEffect(() => {
    if (!userData) return;
    const isChanged =
      userData.name !== newName ||
      userData.avatar !== newAvatar ||
      JSON.stringify(userData.interests) !== JSON.stringify(newInterests) ||
      userData.description !== newDescription ||
      userData.education !== newEducation;

    setHasChanges(isChanged);
  }, [userData, newName, newAvatar, newInterests, newDescription, newEducation]);

  const handleOpenName = () => {
    setNameError('');
    setOpenName(true);
  };
  const handleOpenInterests = () => {
    setInterestsError('');
    setOpenInterests(true);
  };
  const handleOpenDescription = () => {
    setDescriptionError('');
    setOpenDescription(true);
  };
  const handleOpenAvatar = () => {
    setOpenAvatar(true);
  };
  const handleOpenEducation = () => {
    setEducationError('');
    setOpenEducation(true);
  };

  const handleCloseName = () => setOpenName(false);
  const handleCloseInterests = () => setOpenInterests(false);
  const handleCloseDescription = () => setOpenDescription(false);
  const handleCloseAvatar = () => setOpenAvatar(false);
  const handleCloseEducation = () => setOpenEducation(false);
  const handleCloseMeetingModal = () => {
    setOpenMeetingModal(false);
    setSelectedMeeting(null);
    setTempParticipantRatings({});
  };

  const validateName = (name) => {
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 16) return 'Name cannot be longer than 16 characters';
    return '';
  };

  const validateInterests = (interests) => {
    if (interests.length < 1) return 'Select at least 1 interest';
    return '';
  };

  const validateDescription = (description) => {
    if (description.length > 300) return 'Description cannot be longer than 300 characters';
    return '';
  };

  const validateEducation = (education) => {
    if (education.length > 100) return 'Education cannot be longer than 100 characters';
    return '';
  };

  const handleSaveName = () => {
    const error = validateName(newName);
    if (error) {
      setNameError(error);
      return;
    }
    setUserData((prev) => ({ ...prev, name: newName }));
    handleCloseName();
  };

  const handleSaveInterests = () => {
    const error = validateInterests(newInterests);
    if (error) {
      setInterestsError(error);
      return;
    }
    setUserData((prev) => ({ ...prev, interests: newInterests }));
    handleCloseInterests();
  };

  const handleSaveDescription = () => {
    const error = validateDescription(newDescription);
    if (error) {
      setDescriptionError(error);
      return;
    }
    setUserData((prev) => ({ ...prev, description: newDescription }));
    handleCloseDescription();
  };

  const handleSaveEducation = () => {
    const error = validateEducation(newEducation);
    if (error) {
      setEducationError(error);
      return;
    }
    setUserData((prev) => ({ ...prev, education: newEducation }));
    handleCloseEducation();
  };

  const handleSelectAvatar = (avatarUrl) => {
    setNewAvatar(avatarUrl);
    setUserData((prev) => ({ ...prev, avatar: avatarUrl }));
    handleCloseAvatar();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await updateUser({
        name: newName,
        avatar: newAvatar,
        interests: newInterests,
        description: newDescription,
        education: newEducation,
      });
      setHasChanges(false);
      setError('');
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingClick = async (meeting) => {
    setSelectedMeeting(meeting);
    try {
      setLoading(true);
      // Fetch existing ratings for the conference
      const ratingsResponse = await getRatings(meeting.conference_id);
      const initialRatings = ratingsResponse.data.reduce((acc, rating) => {
        acc[rating.reviewee_id] = rating.rating;
        return acc;
      }, {});
      setTempParticipantRatings(initialRatings);
    } catch (err) {
      setError('Failed to load ratings. Please try again.');
      console.error('Error fetching ratings:', err);
      setTempParticipantRatings({});
    } finally {
      setLoading(false);
    setOpenMeetingModal(true);
    }
  };

  const handleRatingChange = (participantId, newValue) => {
    setTempParticipantRatings((prev) => ({
      ...prev,
      [participantId]: newValue,
    }));
  };

  const handleSaveRatings = async () => {
    try {
      setLoading(true);
      for (const [participantId, rating] of Object.entries(tempParticipantRatings)) {
        await submitRating({
          reviewee_id: participantId,
          conference_id: selectedMeeting.conference_id,
          rating: rating,
          comment: '', // Optional, add if needed
        });
      }
      setError('');
      console.log('Ratings submitted:', tempParticipantRatings);
    } catch (err) {
      setError('Failed to submit ratings. Please try again.');
      console.error('Error submitting ratings:', err);
    } finally {
      setLoading(false);
    handleCloseMeetingModal();
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const groupedMeetings = userMeetings.reduce((acc, meeting) => {
    const dateParts = meeting.scheduled_at.split('T')[0];
    const dateKey = dateParts;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meeting);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedMeetings).sort((a, b) => new Date(b) - new Date(a));
  const nearestDate = sortedDates.reduce((nearest, date) => {
    const diffCurrent = Math.abs(new Date(date) - today);
    const diffNearest = nearest ? Math.abs(new Date(nearest) - today) : Infinity;
    return diffCurrent < diffNearest ? date : nearest;
  }, null);

  useEffect(() => {
    if (nearestDate && dateRefs.current[nearestDate] && meetingHistoryRef.current) {
      const scrollToNearest = () => {
        const container = meetingHistoryRef.current;
        const targetElement = dateRefs.current[nearestDate];

        if (targetElement && container) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const offsetTop = targetRect.top - containerRect.top + container.scrollTop - 24;

          container.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      };

      const rafId = requestAnimationFrame(scrollToNearest);
      return () => cancelAnimationFrame(rafId);
    }
  }, [nearestDate]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const todayNormalized = new Date(today);
    if (date.toDateString() === todayNormalized.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading && !userData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !userData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        mt: 2,
        mb: 4,
        px: { xs: 2, sm: 4 },
        maxWidth: '100%',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: '600',
            color: 'text.primary',
          }}
        >
          Your Profile
        </Typography>
        <Button
          variant="text"
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            color: 'text.primary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: 2,
          }}
        >
          Logout
        </Button>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={handleOpenAvatar}>
            <Avatar
              src={userData.avatar}
              sx={(theme) => ({
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                border: `2px solid ${theme.palette.primary.main}`,
                transition: 'opacity 0.3s',
                '&:hover': {
                  opacity: 0.7,
                },
              })}
            />
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                backgroundColor: theme.palette.neutral?.dark || 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                transition: 'opacity 0.3s',
                '&:hover': {
                  opacity: 0.5,
                },
              })}
            >
              <EditIcon sx={(theme) => ({ color: theme.palette.neutralWHITE || '#fff', fontSize: { xs: 20, sm: 30 } })} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: '600',
                wordBreak: 'break-word',
                flex: 1,
                color: 'text.primary',
              }}
            >
              {userData.name}
            </Typography>
            <IconButton
              color="primary"
              onClick={handleOpenName}
              sx={(theme) => ({
                '&:hover': { color: theme.palette.secondary.main },
                p: { xs: 0.5, sm: 1 },
              })}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: '600',
                color: 'text.primary',
              }}
            >
              Interests:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(userData.interests || []).map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  sx={(theme) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.neutralWHITE || '#fff',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 24, sm: 28 },
                    borderRadius: 1,
                  })}
                />
              ))}
            </Box>
          </Box>
          <IconButton
            color="primary"
            onClick={handleOpenInterests}
            sx={(theme) => ({
              '&:hover': { color: theme.palette.secondary.main },
              p: { xs: 0.5, sm: 1 },
            })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.6,
                color: 'text.primary',
              }}
            >
              <Box component="span" sx={{ fontWeight: '600' }}>Description:</Box>{' '}
              {userData.description || 'N/A'}
            </Typography>
          </Box>
          <IconButton
            color="primary"
            onClick={handleOpenDescription}
            sx={(theme) => ({
              '&:hover': { color: theme.palette.secondary.main },
              p: { xs: 0.5, sm: 1 },
            })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                wordBreak: 'break-word',
                lineHeight: 1.6,
                color: 'text.primary',
              }}
            >
              <Box component="span" sx={{ fontWeight: '600' }}>Education:</Box>{' '}
              {userData.education || 'N/A'}
            </Typography>
          </Box>
          <IconButton
            color="primary"
            onClick={handleOpenEducation}
            sx={(theme) => ({
              '&:hover': { color: theme.palette.secondary.main },
              p: { xs: 0.5, sm: 1 },
            })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            disabled={!hasChanges || loading}
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: 3,
              py: 1,
              borderRadius: 1,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        </Box>
      </Box>

      <Box
        ref={meetingHistoryRef}
        sx={{
          mt: 4,
          p: { xs: 2, sm: 3 },
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          maxHeight: 500,
          overflowY: 'auto',
          ...scrollbarStyles,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.75rem' },
            fontWeight: '600',
            mb: 2,
            color: 'text.primary',
          }}
        >
          Meetings
        </Typography>
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const meetings = groupedMeetings[date].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
            return (
              <Box
                key={date}
                sx={{ mb: 3 }}
                ref={(el) => (dateRefs.current[date] = el)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  {date === nearestDate && (
                    <Box
                      sx={(theme) => ({
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: `0 0 4px ${theme.palette.neutral?.dark || 'rgba(0,0,0,0.2)'}`,
                      })}
                    />
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontWeight: '600',
                      color: date === nearestDate ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {formatDate(date)}
                  </Typography>
                </Box>
                <Box sx={(theme) => ({ borderBottom: `2px solid ${theme.palette.neutral?.medium || '#ddd'}`, mb: 2 })} />
                <Box
                  sx={{
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {meetings.map((meeting, index) => (
                    <Box
                      key={meeting.conference_id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 1, sm: 1.5 },
                        mb: 0,
                        backgroundColor: 'background.default',
                        borderTopLeftRadius: index === 0 ? 4 : 0,
                        borderTopRightRadius: index === 0 ? 4 : 0,
                        borderBottomLeftRadius: index === meetings.length - 1 ? 4 : 0,
                        borderBottomRightRadius: index === meetings.length - 1 ? 4 : 0,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.secondary',
                            mb: 0.5,
                          }}
                        >
                          {formatTime(meeting.scheduled_at)}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: '500',
                            wordBreak: 'break-word',
                            maxWidth: '80%',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            color: 'text.primary',
                          }}
                        >
                          {meeting.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.secondary',
                          }}
                        >
                          {meeting.numParticipants} participants
                        </Typography>
                        <IconButton
                          onClick={() => handleMeetingClick(meeting)}
                          sx={(theme) => ({
                            padding: { xs: '4px', sm: '6px' },
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: theme.palette.primary?.transparent || 'rgba(0,0,0,0.1)',
                            },
                          })}
                        >
                          <ArrowForwardIosIcon
                            sx={(theme) => ({
                              fontSize: { xs: '12px', sm: '14px' },
                              color: 'text.secondary',
                              '&:hover': {
                                color: theme.palette.primary.main,
                              },
                            })}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontStyle: 'italic' }}
          >
            You have no meetings yet.
          </Typography>
        )}
      </Box>

      <Modal open={openName} onClose={handleCloseName}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 2,
            ...scrollbarStyles,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            Edit Name
          </Typography>
          <TextField
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            margin="normal"
            error={!!nameError}
            helperText={nameError}
            InputLabelProps={{ style: { color: (theme) => theme.palette.text.secondary } }}
            sx={{ input: { color: (theme) => theme.palette.text.primary } }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseName}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveName}
              sx={{ borderRadius: 1 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openInterests} onClose={handleCloseInterests}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 2,
            ...scrollbarStyles,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            Edit Interests
          </Typography>
          <FormControl fullWidth margin="normal" error={!!interestsError}>
            <Select
              multiple
              value={newInterests}
              onChange={(e) => setNewInterests(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={(theme) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.neutralWHITE || '#fff',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 },
                        borderRadius: 1,
                      })}
                    />
                  ))}
                </Box>
              )}
              sx={(theme) => ({
                '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral?.medium || '#ddd' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                ...scrollbarStyles,
              })}
            >
              {availableInterests.map((interest) => (
                <MenuItem key={interest} value={interest}>
                  {interest}
                </MenuItem>
              ))}
            </Select>
            {interestsError && (
              <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
                {interestsError}
              </Typography>
            )}
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseInterests}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveInterests}
              sx={{ borderRadius: 1 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openDescription} onClose={handleCloseDescription}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 2,
            ...scrollbarStyles,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            Edit Description
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={newDescription}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                setNewDescription(e.target.value);
                setDescriptionError('');
              }
            }}
            helperText={`${newDescription.length} / 300 characters`}
            error={!!descriptionError}
            inputProps={{ maxLength: 300 }}
            sx={(theme) => ({
              '.MuiTextField-root': { borderRadius: 1 },
              '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral?.medium || '#ddd' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
            })}
          />
          {descriptionError && (
            <Typography color="error" variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              {descriptionError}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseDescription}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveDescription}
              disabled={newDescription.length > 300}
              sx={{ borderRadius: 1 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openEducation} onClose={handleCloseEducation}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 2,
            ...scrollbarStyles,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            Edit Education
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={newEducation}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewEducation(e.target.value);
                setEducationError('');
              }
            }}
            helperText={`${newEducation.length} / 100 characters`}
            error={!!educationError}
            inputProps={{ maxLength: 100 }}
            InputLabelProps={{ style: { color: (theme) => theme.palette.text.secondary } }}
            sx={{
              input: { fontSize: (theme) => theme.palette.text.primary },
              '.MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.neutral?.medium || '#ddd' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.primary.main },
            }}
          />
          {educationError && (
            <Typography color="error" variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              {educationError}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseEducation}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEducation}
              disabled={newEducation.length > 100}
              sx={{ borderRadius: 1 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openAvatar} onClose={handleCloseAvatar}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 2,
            ...scrollbarStyles,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              mb: 2,
              color: 'text.primary',
            }}
          >
            Edit Avatar
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            placeholder="Enter avatar URL"
            margin="normal"
            InputLabelProps={{ style: { color: (theme) => theme.palette.text.secondary } }}
            sx={{
              input: { color: (theme) => theme.palette.text.primary },
              '.MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.neutral?.medium || '#ddd' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.primary.main },
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseAvatar}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSelectAvatar(newAvatar)}
              disabled={!newAvatar}
              sx={{ borderRadius: 1 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openMeetingModal} onClose={handleCloseMeetingModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 900 },
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            borderRadius: '2',
            boxShadow: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
            ...scrollbarStyles,
          }}
        >
          {selectedMeeting && (
            <>
              <Box
                sx={(theme) => ({
                  backgroundColor: 'example.palette.background.default',
                  p: 2,
                  mb: '2',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.neutral?.medium || '#ddd'}`,
                })}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', sm: '1.5rem' },
                    mb: 1,
                    color: 'text.primary',
                    fontWeight: '600',
                  }}
                >
                  {selectedMeeting.title}
                </Typography>
                <Box
                  sx={(theme) => ({
                    borderTop: `1px solid ${theme.palette.neutral?.medium || '#ddd'}`,
                    my: 1,
                  })}
                />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: 'text.primary',
                        flex: '1 1 auto',
                      }}
                    >
                      Topic: {selectedMeeting.topic}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: 'text.primary',
                      }}
                    >
                      {formatDate(selectedMeeting.scheduled_at)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: 'text.primary',
                      }}
                    >
                      • {formatTime(selectedMeeting.scheduled_at)}
                    </Typography>
                  </Box>
                  {selectedMeeting.url && (
                    <Box
                      sx={(theme) => ({
                        backgroundColor: theme.palette.primary?.transparent || 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'hidden',
                        wordBreak: 'break-all',
                        border: `1px solid ${theme.palette.primary.main}`,
                      })}
                    >
                      <Typography
                        variant="body1"
                        sx={(theme) => ({
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          color: theme.palette.primary.main,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            color: theme.palette.primary.dark,
                          },
                        })}
                        onClick={() => window.open(selectedMeeting.url, '_blank')}
                      >
                        {selectedMeeting.url}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.neutral?.medium || '#ddd'}`,
                  })}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      mb: 2,
                      color: 'text.primary',
                      fontWeight: '600',
                    }}
                  >
                    Rate Meeting Participants:
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, minmax(0, 1fr))',
                      },
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    {selectedMeeting.participantsData.map((participant, index) => (
                      <Box
                        key={index}
                          sx={(theme) => ({
                            borderRadius: 4,
                            width: '100%',
                            height: { xs: '120px', sm: '220px' },
                            transition: 'all 0.3s ease',
                            background: theme.palette.neutral?.transparent || 'rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.neutral?.medium || '#ddd'}`,
                            boxShadow: `0 8px 32px ${theme.palette.neutral?.shadow || 'rgba(0,0,0,0.1)'}`,
                            '&:hover': {
                              transform: { xs: 'none', sm: 'translateY(-5px)' },
                              boxShadow: `0 12px 40px ${theme.palette.neutral?.shadowHover || 'rgba(0,0,0,0.2)'}`,
                              background: theme.palette.neutral?.semiTransparent || 'rgba(255,255,255,0.2)',
                            },
                          })}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'row', sm: 'column' },
                              alignItems: { xs: 'center', sm: 'center' },
                              textAlign: { xs: 'left', sm: 'center' },
                              p: { xs: 2, sm: 3 },
                              height: '100%',
                              boxSizing: 'box-sizing',
                              gap: { xs: 2, sm: 0 },
                            }}
                          >
                            <Avatar
                              src={participant.avatar}
                              sx={(theme) => ({
                                width: { xs: 70, sm: 80 },
                                height: { xs: 70, sm: 80 },
                                mb: { xs: 0, sm: 2 },
                                border: `3px solid ${theme.palette.neutral?.avatarBorder || '#ddd'}`,
                                boxShadow: `0 4px 20px ${theme.palette.neutral?.shadow || 'rgba(0,0,0,0.1)'}`,
                                flexShrink: 0,
                              })}
                            />
                            <Box
                              sx={{
                                flexGrow: { xs: 1, sm: 0 },
                                minWidth: 0,
                                overflow: 'hidden',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={(theme) => ({
                                  fontSize: { xs: '1.2rem', sm: '1.3rem' },
                                  fontWeight: '600',
                                  mb: { xs: 0.5, sm: 1 },
                                  color: 'text.primary',
                                  textShadow: `0 2px 4px ${theme.palette.neutral?.textShadow || 'rgba(0,0,0,0.1)'}`,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                })}
                              >
                                {participant.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: { xs: 'flex-start', sm: 'center' },
                                  mt: { xs: 0, sm: 1 },
                                }}
                              >
                                <Rating
                                  value={tempParticipantRatings[participant.id] || 0}
                                  onChange={(event, newValue) => handleRatingChange(participant.id, newValue)}
                                  precision={1}
                                  sx={{
                                    fontSize: {
                                      xs: '6vw',
                                      sm: `calc(20px + 0.5vw)`,
                                    },
                                    justifyContent: { xs: 'flex-start', sm: 'center' },
                                    '& .MuiRating-iconFilled': {
                                      color: '#FFD700',
                                    },
                                    '& .MuiRating-iconEmpty': {
                                      color: '#D0D0D0',
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCloseMeetingModal}
                      sx={{ borderRadius: 1 }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveRatings}
                      sx={{ borderRadius: 1 }}
                    >
                      Save
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>
        </Container>
      );
    }
    export default Profile;