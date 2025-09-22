// Fetch States & Districts from CoWIN API
async function fetchStates() {
  const res = await fetch(
    "https://cdn-api.co-vin.in/api/v2/admin/location/states",
    {
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );
  const data = await res.json();
  const stateDropdown = document.getElementById("stateDropdown");
  data.states.forEach((state) => {
    const option = document.createElement("option");
    option.value = state.state_id;
    option.textContent = state.state_name;
    stateDropdown.appendChild(option);
  });
}

async function fetchDistricts(stateId) {
  const res = await fetch(
    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );
  const data = await res.json();
  const districtDropdown = document.getElementById("districtDropdown");
  districtDropdown.innerHTML = '<option value="">Select District</option>';
  data.districts.forEach((district) => {
    const option = document.createElement("option");
    option.value = district.district_id;
    option.textContent = district.district_name;
    districtDropdown.appendChild(option);
  });
}

const stateDropdown = document.getElementById("stateDropdown");
const districtDropdown = document.getElementById("districtDropdown");

stateDropdown.addEventListener("change", function () {
  if (this.value) {
    districtDropdown.disabled = false;
    fetchDistricts(this.value);
  } else {
    districtDropdown.disabled = true;
  }
});

fetchStates();

// (Duplicate code removed to fix redeclaration error)