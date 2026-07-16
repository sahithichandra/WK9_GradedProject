import app from "./src/app.js";

let server = null;

export async function startServer() {
    try {
        const port = process.env.PORT || 3000;
        server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

export async function stopServer() {
    try {
        // Stop the server
        if (server) {
            server.close(() => {
                console.log('Server stopped');
            });
        }
    } catch (error) {
        console.error('Error stopping server:', error);
    }
}   
