import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Fab,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { getUsers, getUserById, createConference, getMatches, getInterests } from '../api';

// const availableTopics = [
//   'Project Planning',
//   'Code Review',
//   'Team Sync',
//   'Brainstorming',
//   'Sprint Retrospective',
//   'Technical Discussion',
//   'Design Review',
//   'Training Session',
//   'Client Meeting',
// ];

function Recommendations() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isConfirmActive, setIsConfirmActive] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [topicError, setTopicError] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await getUsers();
  //       setUsers(response.data);
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //       setError('Failed to load users');
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  // const sortedUsers = [...users].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    useEffect(() => {
      
      const fetchInterests = async () => {
      try {
        const interests = await getInterests();
        // console.log(interests);
        setAvailableTopics(interests.data.interests);
      } catch (error) {
        setError('Failed to load interests');
      }
    };
      
    
    const fetchUsersAndScores = async () => {
        try {
          const matches = await getMatches();
          console.log(matches);
          
          const sortedScores = matches.data.sort((a, b) => b.score - a.score);
          console.log(sortedScores);
  
          const userPromises = sortedScores.map(async ({ user_id, score }) => {
            console.log(user_id)
            try {
              const response = await getUserById(user_id);
              return response.data;
            } catch (err) {
              console.error(`Error fetching user:`, err);
              return null;
            }
          });
  
          const userData = await Promise.all(userPromises);
          setUsers(userData.filter((user) => user !== null));
        } catch (error) {
          console.error('Error fetching users:', error);
          setError('Failed to load users');
        }
      };
      fetchInterests();
      fetchUsersAndScores();
    }, []);

  const handleProfileClick = (user) => {
    if (selectionMode) {
      if (selectedUsers.find((u) => u.id === user.id)) {
        removeUser(user.id);
      } else {
        setSelectedUsers((prev) => [...prev, user]);
      }
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  const removeUser = (id) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleSelectionMode = () => {
    console.log("Toggling selection mode")
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setIsOverlayOpen(true);
      setIsConfirmActive(false);
    } else {
      setIsConfirmActive(false);
      setIsOverlayOpen(false);
      setMeetingName('');
      setMeetingTopic('');
      setMeetingDate(new Date());
      setNameError('');
      setTopicError('');
      setError('');
    }
  };

  const validateMeetingName = (name) => {
    if (!name) return 'Meeting name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 50) return 'Name cannot exceed 50 characters';
    return '';
  };

  const validateMeetingTopic = (topic) => {
    if (!topic) return 'Please select a topic';
    return '';
  };

  // const handleConfirmSelection = async () => {
  //   console.log("Confirm selection");
  //   console.log(isConfirmActive);
  //   if (!isConfirmActive) {
  //     console.log("Open conference confirm modal");
  //     const nameValidationError = validateMeetingName(meetingName);
  //     const topicValidationError = validateMeetingTopic(meetingTopic);
  //     if (nameValidationError || topicValidationError) {
  //       console.log("Error in confirm selection");
  //       setNameError(nameValidationError);
  //       setTopicError(topicValidationError);
  //       console.log("meetingName:", meetingName, "nameError:", nameValidationError);
  //       console.log("meetingTopic:", meetingTopic, "topicError:", topicValidationError);
  //       return;
  //     }
  //     setIsConfirmActive(true);
  //     setIsOverlayOpen(true);
  //   } else {
  //     try {
  //       await createConference({
  //         name: meetingName,
  //         topic: meetingTopic,
  //         date: meetingDate.toISOString(),
  //         participants: selectedUsers.map((u) => u.id),
  //       });
  //       setIsOverlayOpen(false);
  //       setIsConfirmActive(false);
  //       setSelectedUsers([]);
  //       setSelectionMode(false);
  //       setMeetingName('');
  //       setMeetingTopic('');
  //       setMeetingDate(new Date());
  //       setNameError('');
  //       setTopicError('');
  //       setError('');
  //     } catch (error) {
  //       console.error('Error creating meeting:', error);
  //       setError(error.response?.data?.error || 'Failed to schedule meeting');
  //     }
  //   }
  // };
  const handleConfirmSelection = async () => {
    console.log("Confirm selection");
    const nameValidationError = validateMeetingName(meetingName);
    const topicValidationError = validateMeetingTopic(meetingTopic);
    console.log("meetingName:", meetingName, "nameError:", nameValidationError);
    console.log("meetingTopic:", meetingTopic, "topicError:", topicValidationError);

    if (nameValidationError || topicValidationError) {
      console.log("Error in confirm selection");
      setNameError(nameValidationError);
      setTopicError(topicValidationError);
      return;
    }

    try {
      await createConference({
        title: meetingName,
        topic: meetingTopic,
        scheduled_at: meetingDate.toISOString(),
        participants: selectedUsers.map((u) => u.id),
      });
      // On success, reset everything and close the overlay
      setIsOverlayOpen(false);
      setIsConfirmActive(false);
      setSelectionMode(false);
      setSelectedUsers([]);
      setMeetingName('');
      setMeetingTopic('');
      setMeetingDate(new Date());
      setNameError('');
      setTopicError('');
      setError('');
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError(error.response?.data?.error || 'Failed to schedule meeting');
    }
  };

  const handleOverlayClose = () => {
    setIsOverlayOpen(false);
    setIsConfirmActive(false);
    setSelectionMode(false);
    setMeetingName('');
    setMeetingTopic('');
    setMeetingDate(new Date());
    setNameError('');
    setTopicError('');
    setError('');
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isSelected = (userId) => selectedUsers.find((u) => u.id === userId);

  return (
    <>
      <Container sx={{ mt: 4, mb: 4 }}>
        {error && !isOverlayOpen && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <Grid container spacing={3} justifyContent="center">
          {users.map((user) => {
            const selected = isSelected(user.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card
                  onClick={() => handleProfileClick(user)}
                  sx={(theme) => ({
                    borderRadius: 4,
                    width: { xs: '320px', sm: '300px' },
                    height: { xs: '120px', sm: '300px' },
                    mx: 'auto',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: selected && selectionMode
                      ? theme.palette.neutral.gradient.overlay
                      : theme.palette.neutral.transparent,
                    backdropFilter: 'blur(10px)',
                    border: selected && selectionMode
                      ? `2px solid ${theme.palette.primary.border}`
                      : `1px solid ${theme.palette.neutral.border}`,
                    boxShadow: selected && selectionMode
                      ? `0 8px 32px ${theme.palette.primary.semiTransparent}`
                      : `0 8px 32px ${theme.palette.neutral.shadow}`,
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' },
                      boxShadow: `0 12px 40px ${theme.palette.neutral.shadowHover}`,
                      background: selectionMode
                        ? selected
                          ? theme.palette.neutral.gradient.overlayHover
                          : theme.palette.neutral.transparent
                        : theme.palette.neutral.semiTransparent,
                    },
                  })}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      alignItems: { xs: 'center', sm: 'center' },
                      textAlign: { xs: 'left', sm: 'center' },
                      p: { xs: 2, sm: 3 },
                      height: '100%',
                      boxSizing: 'border-box',
                      gap: { xs: 2, sm: 0 },
                    }}
                  >
                    <Avatar
                      src={user.avatar}
                      sx={(theme) => ({
                        width: { xs: 70, sm: 80 },
                        height: { xs: 70, sm: 80 },
                        mb: { xs: 0, sm: 2 },
                        border: `3px solid ${theme.palette.neutral.avatarBorder}`,
                        boxShadow: `0 4px 20px ${theme.palette.neutral.shadow}`,
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
                          fontWeight: 600,
                          mb: { xs: 0.5, sm: 1 },
                          color: theme.palette.text.primary,
                          textShadow: `0 2px 4px ${theme.palette.neutral.textShadow}`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        })}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({
                          mb: { xs: 0.5, sm: 1 },
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          whiteSpace: 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 1, sm: 2 },
                          WebkitBoxOrient: 'vertical',
                        })}
                      >
                        {user.interests.slice(0, 5).join(', ')}
                        {user.interests.length > 5 && ' ...'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({
                          color: theme.palette.text.disabled,
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 1, sm: 2 },
                          WebkitBoxOrient: 'vertical',
                        })}
                      >
                        {truncateText(user.education || 'No education info', 50)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {isOverlayOpen && (
        <Box
          sx={(theme) => ({
            position: 'fixed',
            top: { xs: '50%', sm: 'auto' },
            bottom: { xs: 'auto', sm: 0 },
            right: { xs: 'auto', sm: 76 },
            left: { xs: '50%', sm: 'auto' },
            transform: { xs: 'translate(-50%, -50%)', sm: 'none' },
            width: { xs: '90%', sm: 400 },
            maxHeight: { xs: '80vh', sm: '80vh' },
            bgcolor: theme.palette.background.overlay,
            backdropFilter: 'blur(10px)',
            boxShadow: 24,
            p: 3,
            zIndex: 1200,
            overflowY: 'auto',
            borderRadius: { xs: 2, sm: '8px 8px 0 0' },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.neutral.light,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.primary.dark,
              },
            },
          })}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={(theme) => ({ color: theme.palette.text.primary })}>
              Schedule Meeting
            </Typography>
            <IconButton
              onClick={handleOverlayClose}
              sx={(theme) => ({
                p: 0,
                color: theme.palette.neutral.white,
              })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </IconButton>
          </Box>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            label="Meeting Name"
            value={meetingName}
            onChange={(e) => {
              setMeetingName(e.target.value);
              setNameError(validateMeetingName(e.target.value));
            }}
            fullWidth
            margin="normal"
            error={!!nameError}
            helperText={nameError}
            sx={(theme) => ({
              input: { color: theme.palette.text.primary },
              label: { color: theme.palette.text.secondary },
              mb: 3,
              '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
            })}
          />
          <FormControl fullWidth margin="normal" error={!!topicError}>
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                mb: 1,
              })}
            >
              Meeting Topic
            </Typography>
            <Select
              value={meetingTopic}
              onChange={(e) => {
                setMeetingTopic(e.target.value);
                setTopicError(validateMeetingTopic(e.target.value));
              }}
              displayEmpty
              sx={(theme) => ({
                color: theme.palette.text.primary,
                '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral.border },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                mb: 3,
              })}
            >
              <MenuItem value="" disabled>
                Select a topic
              </MenuItem>
              {availableTopics.map((topic) => (
                <MenuItem key={topic} value={topic}>
                  {topic}
                </MenuItem>
              ))}
            </Select>
            {topicError && (
              <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
                {topicError}
              </Typography>
            )}
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date & Time"
              value={meetingDate}
              onChange={(newValue) => setMeetingDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  sx={(theme) => ({
                    input: { color: theme.palette.text.primary },
                    label: { color: theme.palette.text.secondary },
                    mb: 3,
                    '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.neutral.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                  })}
                />
              )}
            />
          </LocalizationProvider>
          <Typography variant="h6" sx={(theme) => ({ mt: 3, color: theme.palette.text.primary, mb: 2 })}>
            Selected Users:
          </Typography>
          {selectedUsers.length === 0 ? (
            <Typography sx={(theme) => ({ color: theme.palette.text.secondary, mb: 3 })}>
              No Selected Users
            </Typography>
          ) : (
            <List
              sx={{
                maxHeight: 150,
                overflowY: 'auto',
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
              }}
            >
              {selectedUsers.map((user) => (
                <ListItem key={user.id} sx={{ mb: 1 }}>
                  <ListItemText primary={user.name} sx={(theme) => ({ color: theme.palette.text.primary })} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeUser(user.id)}
                      sx={(theme) => ({
                        color: theme.palette.neutral.white,
                      })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: { xs: '50%', sm: 16 },
          left: { xs: '50%', sm: 'auto' },
          transform: { xs: 'translateX(-50%)', sm: 'none' },
          zIndex: 1300,
          width: { xs: 'auto', sm: 'auto' },
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'column' },
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fab
          onClick={toggleSelectionMode}
          aria-label="Toggle selection mode"
          sx={(theme) => ({
            height: 40,
            width: 40,
            minWidth: 40,
            borderRadius: '8px',
            background: theme.palette.neutral.dark,
            color: theme.palette.neutral.white,
            '&:hover': {
              background: theme.palette.neutral.darker,
            },
            '@media (max-width: 600px)': {
              flex: '0 0 auto',
              height: 40,
              width: 40,
              minWidth: 40,
            },
            '@media (min-width: 601px)': {
              height: 40,
              width: 40,
              minWidth: 40,
              padding: 0,
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          {selectionMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          )}
        </Fab>
        <Fab
          onClick={handleConfirmSelection}
          disabled={selectedUsers.length === 0}
          aria-label="Confirm selection"
          sx={(theme) => ({
            height: 40,
            width: 40,
            minWidth: 40,
            borderRadius: '8px',
            background: theme.palette.neutral.gradient.button,
            color: theme.palette.neutral.white,
            '&:hover': {
              background: theme.palette.neutral.gradient.buttonHover,
            },
            '&:disabled': {
              background: theme.palette.neutral.gradient.buttonDisabled,
              opacity: 0.5,
            },
            '@media (max-width: 600px)': {
              flex: '0 0 auto',
              height: 40,
              width: 40,
              minWidth: 40,
            },
            '@media (min-width: 601px)': {
              height: 40,
              width: 40,
              minWidth: 40,
              padding: 0,
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          {isConfirmActive ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 13 9 18 20 7" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l6-6-6-6" />
              <path d="M3 12h17" />
              <path strokeLinecap="round" d="M21 12h-1" />
            </svg>
          )}
        </Fab>
      </Box>
    </>
  );
}

export default Recommendations;