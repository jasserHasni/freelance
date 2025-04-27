const traitement = "En Cours De Révision";
function checkRequestWaiting() {
  fetch("/api/check-request-waiting")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.hasRequest) {
        document.getElementById("paimentButton").disabled = true;
        document.getElementById("paimentButton").innerText = traitement;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Call the function to check the request status
checkRequestWaiting();
