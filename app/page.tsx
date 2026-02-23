'use client'

import { Container, Typography, Box } from '@mui/material'
import Link from 'next/link'
import { Button } from '@mui/material'

export default function Home() {
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
