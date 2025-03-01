const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const buildDir = path.join(__dirname, 'build');
const publicDir = path.join(__dirname, '..', 'public');

// Build the React app
console.log('Building React app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Copy build files to public directory
console.log(`Copying build files to ${publicDir}...`);
try {
  // Ensure the public directory exists
  fs.ensureDirSync(publicDir);
  
  // Copy all files from build to public
  fs.copySync(buildDir, publicDir, {
    overwrite: true,
    filter: (src) => {
      // Skip the index.html file as we'll handle it separately
      return path.basename(src) !== 'index.html';
    }
  });
  
  // Copy index.html to the root directory
  fs.copySync(
    path.join(buildDir, 'index.html'),
    path.join(__dirname, '..', 'index.html'),
    { overwrite: true }
  );
  
  console.log('Files copied successfully.');
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
}

console.log('Deployment completed successfully!'); 