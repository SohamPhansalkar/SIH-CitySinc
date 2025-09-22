const serverUrl = "http://localhost:3000";

async function loginClicked() {
  const userName = document.getElementById("nameInp").value;
  const password = document.getElementById("passInp").value;

  try {
    const response = await fetch(serverUrl + "/getUser?id=" + userName, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    console.log("✅ User fetched:", data);

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Check if password matches
    if (data.password !== password) {
      alert("Invalid password");
      return;
    }

    // Store session data
    sessionStorage.setItem("userName", data.userName);
    sessionStorage.setItem("email", data._id);

    // Redirect
    window.location.href = "../TanmayFrontend/test.html";
  } catch (err) {
    console.error("❌ Error logging in:", err);
    alert("Server error");
  }
}
