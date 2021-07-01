console.log("--[ LOADED ADMINPANNEL.JS ]--");

async function GetEntries() {
    const query = {
        query: {
            name:"joel"
        }
    }
    console.log("TRY QUERY");
    var http = new XMLHttpRequest();
    var url = 'http://localhost:3000/query';
    var params = "query=" + JSON.stringify(query);
    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(JSON.parse(http.responseText));
            return http.responseText;
        }
    }
    http.send(params);
}

async function LoadForFirstTime() {
    const data = await GetEntries();
    console.log(data);
}

LoadForFirstTime();