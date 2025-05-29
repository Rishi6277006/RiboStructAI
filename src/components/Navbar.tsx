import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';

export const Navbar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <ScienceIcon sx={{ mr: 2 }} />
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    RiboStructAI
                </Typography>
                <Box>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                    >
                        Home
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/about"
                    >
                        About
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}; 