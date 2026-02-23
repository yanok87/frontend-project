'use client'

import { Container, Typography, Box } from '@mui/material'
import Link from 'next/link'
import { Button } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/posts')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return null
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 4 }}>
          Next.js + TypeScript + Material UI
        </Typography>
        <Link href="/login" passHref>
          <Button variant="contained" size="large">
            Get Started
          </Button>
        </Link>
      </Box>
    </Container>
  )
}
