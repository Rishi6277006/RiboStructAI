import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, createTheme } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AboutPage } from './pages/AboutPage';
import { HelpPage } from './pages/HelpPage';

const getTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00bfae', // more vibrant teal
      },
      secondary: {
        main: '#00e5ff', // brighter accent
      },
      background: {
        default: darkMode ? '#181c1f' : '#eaf7fa', // lighter, fresher background
        paper: darkMode ? '#23272a' : '#fff',
      },
      success: {
        main: '#43a047', // brighter green
      },
      error: {
        main: '#e53935',
      },
      warning: {
        main: '#ffb300',
      },
      info: {
        main: '#00b0ff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.7rem',
        fontWeight: 700,
        letterSpacing: 1,
      },
      h2: {
        fontSize: '2.2rem',
        fontWeight: 700,
        letterSpacing: 0.5,
      },
    },
  });

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((d) => !d)} />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
          </Container>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
