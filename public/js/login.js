async function Login() {;
    var http = new XMLHttpRequest();
    var url = serverURL + '/login';
    var params = `password=${document.getElementById("password").value}&username=${document.getElementById("username").value}`;
    http.open('POST', url, true);

    // Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.send(params);

    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            const data = JSON.parse(http.responseText);
            console.log(data);
            if(data.error != false) {
                alert(data.error);
                return;
            }
            //document.cookie = "session=" + data.sessid;
            sessionStorage.setItem("sess",data.sessid);
            Redirect();
        }
    }
}

function Redirect() {
    window.location.replace(hostingURL + "/admin-pannel");
}
if(sess) Redirect();