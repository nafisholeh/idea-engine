# PowerShell script to start both the frontend and backend servers

# Start the backend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD; node server.js"

# Wait a moment for the backend to initialize
Start-Sleep -Seconds 2

# Start the frontend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD\frontend; npm start"

Write-Host "Starting servers..."
Write-Host "Backend server running at: http://localhost:3000"
Write-Host "Frontend server will be available at: http://localhost:3000"
Write-Host "Press Ctrl+C in the respective windows to stop the servers" 