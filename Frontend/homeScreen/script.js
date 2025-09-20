// script.js

// ------- START: Theme Toggle Logic -------
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Function to set the theme and button icon
function setTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '🌙'; // Moon icon for dark mode
  } else {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '☀️'; // Sun icon for light mode
  }
}

// Check for a saved theme in localStorage and apply it
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  // Default to light mode if nothing is saved
  setTheme('light');
}

// Add an event listener to the toggle button
themeToggle.addEventListener('click', () => {
  let newTheme;
  if (body.classList.contains('dark-mode')) {
    newTheme = 'light';
  } else {
    newTheme = 'dark';
  }
  setTheme(newTheme);
  // Save the new theme preference to localStorage
  localStorage.setItem('theme', newTheme);
});
// ------- END: Theme Toggle Logic -------


// ------- START: Image Uploader Logic (Unchanged) -------
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

// Add an event listener to the file input
imageInput.addEventListener('change', function () {
  // Check if the user has selected a file
  if (this.files && this.files[0]) {
    const reader = new FileReader();

    // FileReader is asynchronous, so we listen for it to load
    reader.onload = function (e) {
      // Set the 'src' of the image to the result of the FileReader
      imagePreview.src = e.target.result;
      // Make the image preview visible
      imagePreview.style.display = 'block';
    };

    // Read the file as a Data URL, which is a base64 encoded string
    reader.readAsDataURL(this.files[0]);
  }
});
// ------- END: Image Uploader Logic (Unchanged) -------
