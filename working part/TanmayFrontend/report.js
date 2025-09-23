const APIUrl = "http://localhost:3000"; // backend URL

// Global variable to store selected File object
window.selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {
  // --- STEP 1: Category Selection ---
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      sessionStorage.setItem("reportCategory", card.dataset.category);
      card.classList.add("active");
      setTimeout(() => (window.location.href = "report_step2.html"), 200);
    });
  });

  // --- STEP 2: Description & Image Upload ---
  const realButton = document.getElementById("realButton");
  const uploadButton = document.getElementById("uploadButton");
  const customText = document.getElementById("customText");
  const probDescriptionInput = document.getElementById("probDescription");
  const displayImg = document.getElementById("displayImg");
  const nextButtonStep2 = document.getElementById("nextButtonStep2");
  const photoWarning = document.getElementById("photo-warning");

  if (uploadButton) {
    // Load previously entered description
    const savedDesc = sessionStorage.getItem("reportDescription");
    if (savedDesc) probDescriptionInput.value = savedDesc;

    // Load previously uploaded image preview (Base64)
    const savedImg = sessionStorage.getItem("reportImage");
    if (savedImg) {
      displayImg.style.backgroundImage = `url(${savedImg})`;
      displayImg.style.display = "block";
      customText.innerText = "Image loaded from previous step.";
    }

    // Trigger hidden file input
    uploadButton.addEventListener("click", () => realButton.click());

    // File selection
    realButton.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        photoWarning.style.display = "none";
        uploadButton.classList.remove("has-error");

        const file = this.files[0];
        window.selectedFile = file; // Store File object globally
        customText.innerText = file.name;

        // Show preview
        const reader = new FileReader();
        reader.onload = () => {
          displayImg.style.backgroundImage = `url(${reader.result})`;
          displayImg.style.display = "block";
          sessionStorage.setItem("reportImage", reader.result); // Optional preview storage
        };
        reader.readAsDataURL(file);
      }
    });

    // Store description in sessionStorage
    probDescriptionInput.addEventListener("keyup", () => {
      sessionStorage.setItem("reportDescription", probDescriptionInput.value);
    });

    // Next button validation
    if (nextButtonStep2) {
      nextButtonStep2.addEventListener("click", () => {
        if (!window.selectedFile) {
          photoWarning.style.display = "block";
          uploadButton.classList.add("has-error");
        } else {
          window.location.href = "report_step3.html";
        }
      });
    }
  }

  // --- STEP 3: Summary Page ---
  const summaryCategory = document.getElementById("summary-category");
  if (summaryCategory) {
    const category = sessionStorage.getItem("reportCategory") || "Not provided";
    const description =
      sessionStorage.getItem("reportDescription") || "Not provided";
    const image = sessionStorage.getItem("reportImage");

    document.getElementById("summary-category").textContent = category;
    document.getElementById("summary-description").textContent = description;

    const imageContainer = document.getElementById("summary-image");
    if (image) {
      imageContainer.innerHTML = `<img src="${image}" alt="Reported problem" id="summary-image-preview">`;
    } else {
      imageContainer.innerHTML = "<p>No photo uploaded.</p>";
    }

    // Submit button
    const confirmBtn =
      document.getElementById("submitBtn") ||
      document.getElementById("confirmSubmit");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", submitReport);
    }
  }

  // --- SUCCESS Modal OK ---
  const successOkBtn = document.getElementById("successOkBtn");
  if (successOkBtn) {
    successOkBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "../homeScreen/home_page.html";
    });
  }
});

// --- Function to submit the report ---
async function submitReport() {
  const category = sessionStorage.getItem("reportCategory");
  const description = sessionStorage.getItem("reportDescription");

  if (!window.selectedFile) {
    alert("Please upload an image");
    return;
  }

  const formData = new FormData();
  formData.append("image", window.selectedFile); // actual File object
  formData.append("category", category);
  formData.append("description", description);

  try {
    const res = await fetch(`${APIUrl}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    console.log("✅ Report submitted:", data);

    // Optionally store uploaded file path for future use
    sessionStorage.setItem("reportImage", APIUrl + data.filePath);

    // Show success modal
    const successModal = new bootstrap.Modal(
      document.getElementById("successModal")
    );
    successModal.show();
  } catch (err) {
    console.error("❌ Error submitting report:", err);
    alert("Failed to submit report");
  }
}

// --- Logout ---
function logout() {
  sessionStorage.clear();
  window.location.href = "../loginPage/index.html";
}
