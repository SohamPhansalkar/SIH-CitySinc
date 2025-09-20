// console.log("Hello world");

const realButton = document.getElementById("realButton"); // actual hidden file input (normal)
const uploadButton = document.getElementById("uploadButton"); // for our custom upload button
const customText = document.getElementById("customText"); // name of file selected

let uploaded_img = ""; // stores uploaded image

// When the custom upload button is clicked, it's gonna trigger the hidden file input

uploadButton.addEventListener("click", function () {
  realButton.click();
});

// When a file is selected, shows its name uk

realButton.addEventListener("change", function () {
  if (realButton.value) {
    customText.innerText = realButton.value;
  } else {
    customText.innerText = "No file chosen";
  }

  const reader = new FileReader();

  // Once the file is uploaded, show the pic on screen

  reader.addEventListener("load", () => {
    uploaded_img = reader.result;
    const display = document.getElementById("displayImg");

    display.style.display = "block"; 
    display.style.width = "250px"; 
    display.style.height = "250px"; 
    display.style.backgroundImage = `url(${uploaded_img})`; 
  });

  reader.readAsDataURL(this.files[0]);
});
