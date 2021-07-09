function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const sess = sessionStorage.getItem("sess");

const serverURL = "http://localhost:3000";
const hostingURL = "http://localhost:8080";