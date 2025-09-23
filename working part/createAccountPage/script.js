// import { setUserName, getUserName, setEmail, getEmail } from "../data.js";

const serverUrl = "http://localhost:3000";

document
  .getElementById("createAccButton")
  .addEventListener("click", createAccClicked);

function changePage() {
  window.location.href = "../loginPage/login.html";
}

async function createAccClicked() {
  const username = document.getElementById("nameInp").value;
  const email = document.getElementById("emailInp").value;
  const password = document.getElementById("passInp").value;

  try {
    const response = await fetch(serverUrl + "/addUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: email,
        userName: username,
        password: password,
      }),
    });

    const data = await response.json();
    console.log("✅ User saved:", data);

    sessionStorage.setItem("userName", data.userName);
    sessionStorage.setItem("email", data._id);
    console.log("Session Storage:", sessionStorage);

    // redirect after successful save
    window.location.href = "../loginPage/test.html";
  } catch (err) {
    console.error("❌ Error creating account:", err);
  }
}
