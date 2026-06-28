import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { contactService } from '../services/api';
import './StaticPage.css';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please add your name, email, and message.');
      return;
    }

    setSending(true);
    try {
      await contactService.sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'NewsHub contact',
        message: form.message.trim(),
      });
      setForm(initialForm);
      setNotice('Message sent successfully.');
    } catch (submitError) {
      setError('Message could not be sent right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box className="static-page-wrapper">
      <Container maxWidth="lg">
        <Box className="static-page-shell">
          <Typography className="static-eyebrow">Contact</Typography>
          <Typography component="h1" className="static-title">
            Contact NewsHub
          </Typography>
          <Typography className="static-lead">
            Use this form for story suggestions, correction requests, product feedback,
            source issues, or anything that helps us make NewsHub clearer and more useful.
          </Typography>

          <Box className="contact-grid">
            <Box className="contact-details">
              <Box className="contact-detail-item">
                <Typography className="contact-label">About NewsHub</Typography>
                <Typography className="contact-value">
                  NewsHub collects timely stories, summaries, topic filters, weather,
                  market updates, and saved reading tools in one simple news experience.
                </Typography>
              </Box>
              <Box className="contact-detail-item">
                <Typography className="contact-label">Response Time</Typography>
                <Typography className="contact-value">
                  We usually review messages within 24 to 48 hours. Urgent corrections
                  and broken-source reports are prioritized first.
                </Typography>
              </Box>
              <Box className="contact-detail-item">
                <Typography className="contact-label">What To Include</Typography>
                <Typography className="contact-value">
                  Add the article title, page link, topic, or category when relevant.
                  Clear details help us understand and respond faster.
                </Typography>
              </Box>
              <Box className="contact-detail-item">
                <Typography className="contact-label">How It Works</Typography>
                <Typography className="contact-value">
                  Your message is sent securely to our internal review channel. We use
                  your email only if a reply is needed.
                </Typography>
              </Box>
            </Box>

            <Box component="form" className="contact-form" onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={updateField}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                fullWidth
              />
              <TextField
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={updateField}
                fullWidth
              />
              <TextField
                label="Message"
                name="message"
                value={form.message}
                onChange={updateField}
                required
                fullWidth
                multiline
                minRows={5}
              />
              <Button
                type="submit"
                variant="contained"
                className="contact-submit"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar open={Boolean(notice || error)} autoHideDuration={4000} onClose={() => { setNotice(''); setError(''); }}>
        <Alert severity={notice ? 'success' : 'error'} variant="filled" onClose={() => { setNotice(''); setError(''); }}>
          {notice || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
