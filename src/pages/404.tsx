import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFoundPage: React.FC = () => {
    return(
        <Box textAlign="center" mt={10}>
            <Typography variant="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h4" gutterBottom className="text-blue-600 font-bold">
                Oops! Lost in Space
            </Typography>
            <Typography variant="body1" gutterBottom className="text-gray-600 mb-4">
                Looks like you took a wrong turn at Albuquerque.<br />
                This page doesn&apos;t exist (or maybe it&apos;s just hiding).
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/"
                sx={{ mt: 2 }}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600"
            >
                Beam me home!
            </Button>
        </Box>
    );
}

export default NotFoundPage;