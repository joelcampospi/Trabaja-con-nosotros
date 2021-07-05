console.log("--[ LOADED ADMINPANNEL.JS ]--");
var query = {
    query: {

    }
};

async function GetEntries(method) {
    var http = new XMLHttpRequest();
    var url = 'http://localhost:3000/query';
    var params = "query=" + JSON.stringify(query);
    http.open('POST', url, true);
    console.log(query);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.send(params);

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            const data = JSON.parse(http.responseText);
            if(method == "CLEAR") {
                lastIndex = data.lastId;
                ConstructUI(data);
            }
        }
    }
}

var lastIndex = 0;
async function LoadForFirstTime() {
    GetEntries("CLEAR");
}

LoadForFirstTime();

// ---[ UI CONSTRUCTORS ]---

const entryList = document.getElementById("entryList");

function ConstructUI(data) {
    entryList.innerHTML = "";
    for(const key of Object.keys(data.data)) {
        const entry = data.data[key];
        entryList.innerHTML += CreateCard(key,entry);
    }

    function CreateCard(id, entry) {
        var elements = "";
        for(const key of Object.keys(entry)) {
            if(key == "signature") continue;
            const value = entry[key];
            if(value == "" || value == []) continue;
            if(typeof(value) == typeof("")) elements += `<li><b>${Translate(Sanitize(key))}:</b> ${Sanitize(value)}</li>`;
            else if(typeof(value) == typeof([])) {
                let temp = "";
                for(const i in value) {
                    const val = value[i];
                    temp += `<li>${val}</li>`;
                }
                elements += `<li><b>${Translate(Sanitize(key))}</b>:<ul>` + temp + "</ul></li>";
            }
        }
        return `
        <div class="card" style="width: 100%;" id="entryID_${id}">
            <div class="card-body">
            <h5 class="card-title">${entry.name === null ? Empty("Sin nombre") : entry.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">ID: ${id}</h6>
            <hr>
            <div class="accordion accordion-flush" id="accordion_for_${id}">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingOne_${id}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne_${id}" aria-expanded="false" aria-controls="flush-collapseOne_${id}">
                        Valores del formulario
                    </button>
                    </h2>
                    <div id="flush-collapseOne_${id}" class="accordion-collapse collapse" aria-labelledby="flush-headingOne_${id}" data-bs-parent="#accordion_for_${id}">
                    <div class="accordion-body">
                        <ul class="card-text" class="list-unstyled card-columns">${elements}</ul>
                    </div>
                    </div>
                </div>
            </div>
            <hr>
            <a href="#" class="card-link">Card link</a>
            </div>
        </div>
        <br>
        `;

        function Empty(text) {
            return `<span class="text-danger">${text}</span>`
        }
    }

    function Sanitize(text) {
        return text;
    }
    function Translate(text) {
        const values = {
            "name":"Nombre",
            "dni":"DNI",
            "email":"Email",
            "adress":"Dirección",
            "postal_code":"Código postal",
            "lastname":"Apellido",
            "date":"Fecha",
            "phone":"Teléfono",
            "country":"País",
            "driver_license":"Permiso de conducción",
            "vehicle":"Vehículo",
            "formation":"Formación",
            "specify_which_formation":"Especifica la formación",
            "specify_which_language":"Especifica idiomas",
            "interested[]":"Interesado en",
            "language[]":"Idiomas",
            "tu-puesto":"Tu puesto",
            "upload-file":"Currículum"
        }
        return values[text] || text;
    }
}

// ---[ FILTERS ]---
const queryBtn = document.getElementById("queryBtn");
queryBtn.addEventListener('click',() => {
    lastIndex = 0;
    GetEntries("CLEAR");
});

const nameQuery = document.getElementById("query_name");
nameQuery.addEventListener("input",(val) => {
    if(nameQuery.value.length > 0) query.query.name = nameQuery.value || "";
    else delete(query.query.name);
});