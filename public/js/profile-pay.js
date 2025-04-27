document
  .getElementById("payment-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/profile-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message
        window.location.href = "/profile"; // Redirect to /profile
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`); // Display error message
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert("An unexpected error occurred");
    }
  });
