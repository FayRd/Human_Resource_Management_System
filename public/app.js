function updateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0'); // Add leading 0 for single-digit days
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  const timeElement = document.getElementById("timeNow");
  timeElement.textContent = formattedTime;
}

updateTime();
setInterval(updateTime, 1000);