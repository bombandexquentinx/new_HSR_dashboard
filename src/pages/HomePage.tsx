import React from "react"
import { Container, Typography, Paper } from "@mui/material";

const HomePage:React.FC = () => {
	return (
		<Container maxWidth="sm" sx={{ mt: 8 }}>
			<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h3" component="h1" gutterBottom>
					Home Page
				</Typography>
			</Paper>
		</Container>
	);
};

export default HomePage;