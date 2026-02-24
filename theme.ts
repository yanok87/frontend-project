'use client'

import { createTheme, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

// Dark theme with bright accents (inspired by streaming/crypto dashboard)
const darkPurple = '#1A1127'
const darkPurpleElevated = '#1E1B24'
const sidebarDark = '#150F21'
const cardBg = '#2B2538'

const brightPink = '#E91E8C'
const brightBlue = '#00B4FF'
const brightGreen = '#00E676'
const vibrantOrange = '#FF6D00'

export const themeColors = {
  background: darkPurple,
  backgroundElevated: darkPurpleElevated,
  sidebar: sidebarDark,
  card: cardBg,
  primary: brightPink,
  secondary: brightBlue,
  success: brightGreen,
  warning: vibrantOrange,
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brightPink,
      light: '#FF5BA8',
      dark: '#B7156A',
      contrastText: '#fff',
    },
    secondary: {
      main: brightBlue,
      light: '#69E2FF',
      dark: '#0085CC',
      contrastText: '#fff',
    },
    success: {
      main: brightGreen,
    },
    warning: {
      main: vibrantOrange,
    },
    error: {
      main: '#FF5252',
    },
    background: {
      default: darkPurple,
      paper: darkPurpleElevated,
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: 'rgba(255, 255, 255, 0.08)',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.background.default,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: cardBg,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
        }),
        containedSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: theme.palette.secondary.light,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.text.primary, 0.3),
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
        text: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
            '& fieldset': {
              borderColor: alpha(theme.palette.common.white, 0.15),
            },
            '&:hover fieldset': {
              borderColor: alpha(theme.palette.common.white, 0.3),
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: '1px',
            },
            '&.Mui-focused .MuiInputLabel-root': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.palette.text.secondary,
          },
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.1),
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
        }),
        colorPrimary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          color: theme.palette.primary.main,
          borderColor: alpha(theme.palette.primary.main, 0.4),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
        }),
        standardError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.15),
          borderColor: alpha(theme.palette.error.main, 0.4),
        }),
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            color: theme.palette.primary.main,
          },
        }),
      },
    },
  },
})

export default theme
