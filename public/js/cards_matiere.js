async function fetchMatieres() {
  const option2 = localStorage.getItem("option2");
  const option3 = localStorage.getItem("option3");
  if (!option2 || !option3) {
    alert("Veuillez remplir tous les détails.");
    window.location.href = "/reaserch"; // Redirect to /research
    return; // Stop further execution
  }
  try {
    const response = await fetch(
      `/api/matieres_name/?option2=${encodeURIComponent(
        option2
      )}&option3=${encodeURIComponent(option3)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch matieres");
    }

    const data = await response.json();

    const matieres = data.Matieres || [];
    const matiereList = document.getElementById("matiereListbyoptions");
    matiereList.innerHTML = "";

    matieres.forEach((matiere) => {
      const span = document.createElement("span");
      span.textContent = matiere;
      matiereList.appendChild(span);
    });
  } catch (error) {
    console.error("Error fetching matieres:", error);
  }
}

fetchMatieres();
