'use client'

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const theme = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Frontend Project
          </Link>
        </Typography>
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {user?.email}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                borderColor: alpha(theme.palette.text.primary, 0.3),
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
        {!isAuthenticated && (
          <Button
            variant="contained"
            component={Link}
            href="/login"
            sx={{
              backgroundColor: theme.palette.primary.main,
              fontWeight: 600,
              px: 2.5,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
