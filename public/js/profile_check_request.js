const traitement = "En Cours De Révision";
function checkRequestWaiting() {
  fetch("/api/check-request-balance-waiting")
    .then((response) => response.json())
    .then((data) => {
      if (data.hasRequest) {
        document.getElementById("paimentButton").disabled = true;
        document.getElementById("paimentButton").innerText = traitement;
      } else {
        document.getElementById("paimentButton").disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Call the function to check the request status
checkRequestWaiting();
