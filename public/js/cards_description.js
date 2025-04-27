async function fetchDescription() {
  const option2 = localStorage.getItem("option2");
  const option3 = localStorage.getItem("option3");

  try {
    const response = await fetch(
      `/api/matieres_description/?option2=${encodeURIComponent(
        option2
      )}&option3=${encodeURIComponent(option3)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch description");
    }

    const data = await response.json();
    const descriptions = data.description || [];
    const descriptionList = document.getElementById("description_byoption");
    descriptionList.innerHTML = "";

    descriptions.forEach((desc) => {
      const li = document.createElement("li");
      li.textContent = desc;
      descriptionList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching description:", error);
  }
}

fetchDescription();
