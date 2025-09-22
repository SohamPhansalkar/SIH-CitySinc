document.addEventListener("DOMContentLoaded", () => {
    
  // --- LOGIC FOR STEP 1: CATEGORY SELECTION & AUTO-NAVIGATE ---
  const categoryGrid = document.querySelector(".category-grid");
  if (categoryGrid) {
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Set active class for visual feedback
        card.classList.add("active");
        
        // Store selected category in session storage
        sessionStorage.setItem("reportCategory", card.dataset.category);
        
        // Navigate to the next page after a short delay to show feedback
        setTimeout(() => {
            window.location.href = 'report_step2.html';
        }, 200); // 200ms delay
      });
    });
  }

  // --- LOGIC FOR STEP 2: DETAILS & PHOTO UPLOAD ---
  const realButton = document.getElementById("realButton");
  const uploadButton = document.getElementById("uploadButton");
  const customText = document.getElementById("customText");
  const probDescriptionInput = document.getElementById("probDescription");
  const displayImg = document.getElementById("displayImg");
  const nextButtonStep2 = document.getElementById("nextButtonStep2");
  const photoWarning = document.getElementById("photo-warning");

  if (uploadButton) { // This block only runs on Step 2
    const savedDesc = sessionStorage.getItem("reportDescription");
    const savedImg = sessionStorage.getItem("reportImage");

    if (savedDesc) probDescriptionInput.value = savedDesc;
    
    if (savedImg) {
      displayImg.style.backgroundImage = `url(${savedImg})`;
      displayImg.style.display = "block";
      customText.innerText = "Image loaded from previous step.";
    }

    uploadButton.addEventListener("click", () => realButton.click());

    realButton.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        // When a user selects a file, hide the warning.
        photoWarning.style.display = "none";
        uploadButton.classList.remove("has-error");

        const file = this.files[0];
        customText.innerText = file.name;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const result = reader.result;
          displayImg.style.backgroundImage = `url(${result})`;
          displayImg.style.display = "block";
          sessionStorage.setItem("reportImage", result);
        });
        reader.readAsDataURL(file);
      }
    });

    probDescriptionInput.addEventListener("keyup", () => {
      sessionStorage.setItem("reportDescription", probDescriptionInput.value);
    });

    // Add validation check to the Next button
    if(nextButtonStep2) {
      nextButtonStep2.addEventListener("click", () => {
        const isImageUploaded = sessionStorage.getItem("reportImage");
  
        if (!isImageUploaded) {
          // If no image, show the warning and add error styling
          photoWarning.style.display = "block";
          uploadButton.classList.add("has-error");
        } else {
          // If image exists, proceed to the next page
          window.location.href = 'report_step3.html';
        }
      });
    }
  }

  // --- LOGIC FOR STEP 3: SUMMARY PAGE ---
  const summaryCategory = document.getElementById("summary-category");
  if (summaryCategory) {
    const category = sessionStorage.getItem("reportCategory") || "Not provided";
    const description = sessionStorage.getItem("reportDescription") || "Not provided";
    const image = sessionStorage.getItem("reportImage");

    document.getElementById("summary-category").textContent = category;
    document.getElementById("summary-description").textContent = description;
    
    const imageContainer = document.getElementById("summary-image");
    if (image) {
        imageContainer.innerHTML = `<img src="${image}" alt="Reported problem" id="summary-image-preview">`;
    } else {
        imageContainer.innerHTML = "<p>No photo was uploaded.</p>";
    }
  }

  // --- LOGIC FOR FINAL SUBMISSION & CLEANUP ---
  const successOkBtn = document.getElementById("successOkBtn");
  if (successOkBtn) {
    successOkBtn.addEventListener("click", () => {
      sessionStorage.clear(); // Clear all session data
      window.location.href = "../homeScreen/home_page.html"; // Adjust this path if necessary
    });
  }
});

function logout() {
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("email");
  window.location.href = "../loginPage/index.html";
}

if (sessionStorage.getItem("userName") === null) {
  window.location.href = "../loginPage/index.html";
}
