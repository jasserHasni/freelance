document.addEventListener("DOMContentLoaded", function () {
  const option2 = localStorage.getItem("option2");
  const option3 = localStorage.getItem("option3");
  let driveUrl = ""; // Store the link globally

  async function fetchlink() {
    try {
      const response = await fetch(
        `/api/matieres_link/?option2=${encodeURIComponent(
          option2
        )}&option3=${encodeURIComponent(option3)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch link");
      }

      const data = await response.json();
      driveUrl = data.link; // Store the link globally
    } catch (error) {
      console.error("Error fetching link:", error);
      // Optionally, disable the access button or show an error message
      document.getElementById("accessButton").disabled = true;
    }
  }

  function checkAccess() {
    fetch("/api/check-request-status")
      .then((response) => response.json())
      .then((data) => {
        let accessGranted = false;

        data.forEach((item) => {
          if (
            item.status === "accepted" &&
            item.option2 === option2 &&
            item.option3 === option3
          ) {
            accessGranted = true;
            document.getElementById("paimentButton").disabled = true;
            document.getElementById("accessButton").disabled = false;
            document.getElementById("paimentButton").innerText = "Payé";
            document.getElementById("accessButton").onclick = function () {
              window.open(driveUrl, "_blank");
            };
            // Exit the loop as we found a matching request
            return;
          }
        });

        if (!accessGranted) {
          document.getElementById("accessButton").disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  fetchlink().then(() => {
    checkAccess();
  });
  document.getElementById("displayOption2").textContent = option2;
  document.getElementById("displayOption3").textContent = option3;

  document
    .getElementById("payment-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form);

      // Convert FormData to JSON
      const jsonObject = {};
      formData.forEach((value, key) => {
        jsonObject[key] = value;
      });

      // Add extra fields to JSON
      jsonObject["option2"] = option2;
      jsonObject["option3"] = option3;

      fetch("/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonObject),
      })
        .then((response) => response.text())
        .then((data) => {
          alert(data); // Handle success message
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
});
