import React, { useContext } from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from '../context/AppContext';

function NavBar() {
    const navigate = useNavigate();
	const { user } = useContext(AppContext);

    return (
        <AppBar position="static" sx={{ backgroundColor: '#131313' }}>
            <Toolbar>
                <Button color="inherit" onClick={() => navigate("/")}>
                    Home
                </Button>
                <Button color="inherit" onClick={() => navigate("/about")}>
                    About
                </Button>
                <Button color="inherit" onClick={() => navigate("/about2")}>
                    About2
                </Button>
                <Button color="inherit" onClick={() => navigate("/about3")}>
                    About3
                </Button>
				<Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'right' }}>
                    {user.User ? `Welcome, ${user.User}` : 'Not logged in'}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;

