console.log("--[ LOADED ADMINPANNEL.JS ]--");
//const sess = getCookie("session");
console.log(sess);
if(!sess) window.location.replace(hostingURL + "/login");
var query = {
    limit: 20,
    start: 0,
    method: "LIKE",
    query: {
        
    }
};
var keys = [];

async function GetEntries(method) {;
    var http = new XMLHttpRequest();
    var url = serverURL + '/query';
    var params = "query=" + JSON.stringify(query) + "&sess=" + sess;
    http.open('POST', url, true);
    console.log(query);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.send(params);

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            const data = JSON.parse(http.responseText);
            console.log(data);
            if(data.response == "401") {
                sessionStorage.removeItem("sess");
                window.location.replace(hostingURL + "/login");
            }
            query.start = data.lastId;
            if(method == "CLEAR") {
                ConstructUI(data, false);
            } else {
                ConstructUI(data, true);
            }
        }
    }
}

async function LoadForFirstTime() {
    GetEntries("CLEAR");
}

LoadForFirstTime();

// ---[ UI CONSTRUCTORS ]---

const entryList = document.getElementById("entryList");

function ConstructUI(data, append) {
    if(!append) entryList.innerHTML = "";
    let lastEntry;
    for(const key of Object.keys(data.data)) {
        const entry = data.data[key];
        entryList.innerHTML += CreateCard(key,entry);
        lastEntry = entry;
    }
    keys = Object.keys(lastEntry || {});

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
            <span class="material-icons text-danger" onclick="AskDelete('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Borrar entrada">delete</span>
            <span class="material-icons text-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Ver currículum"><a href="http://localhost:3000/view-cv/${id}?sess=${sess}" target="_blank">description</a></span>
            </div>
        </div>
        <br>
        `;

        function Empty(text) {
            return `<span class="text-danger">${text}</span>`
        }
    }
}

function Sanitize(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return text.replace(reg, (match)=>(map[match]));
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
        "interested":"Interesado en",
        "language":"Idiomas",
        "tu-puesto":"Tu puesto",
        "upload-file":"Currículum"
    }
    return values[text] || text;
}

function ResetFilters() {
    query.query = {};
    query.start = 0;
    document.getElementById("appliedFilters").innerHTML = "";
    GetEntries("CLEAR");
}
function LoadMore() {
    GetEntries("APPEND");
}

// ---[ FILTERS ]---
const addFilterModal = new bootstrap.Modal(document.getElementById('filterModal'), {});
const filterBtn = document.getElementById("filterBtnModal");
filterBtn.addEventListener('click',() => {
    // Generate list of filyters
    let options = "";
    for(let key of keys) {
        if(["signature"].includes(key) || Object.keys(query.query).includes(key)) continue;
        options += `<option value="${Sanitize(key)}">${Sanitize(Translate(key))}</option>`;
    }
    document.getElementById("filter_select").innerHTML = options;
});

const addFilterBtn = document.getElementById("addFilter");
addFilterBtn.addEventListener('click',() => {
    const filterValue = document.getElementById("filterValue").value;
    const filterName = document.getElementById("filter_select").value;
    const tag = GenerateFilterTag(Sanitize(filterName), Sanitize(filterValue));
    document.getElementById("appliedFilters").innerHTML += tag;
    query.query[filterName] = filterValue;
    query.start = 0;
    GetEntries("CLEAR");
    addFilterModal.hide();
});

function RemoveFilter(tagName) {
    delete query.query[tagName];
    query.start = 0;
    GetEntries("CLEAR");
}

function GenerateFilterTag(tagName, tagValue) {
    return `<div class="alert alert-primary alert-dismissible fade show" role="alert">
    <strong>${Translate(tagName)}: </strong>${tagValue}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="RemoveFilter('${tagName}')"></button>
</div>`;
}

// ---[ ACTIONS ]---
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {});
function AskDelete(id) {
    document.getElementById("confirmDelete").setAttribute("onclick",`Delete(${id})`);
    deleteModal.show();
}
function Delete(id) {
    var http = new XMLHttpRequest();
    var url =  serverURL + '/action';
    var params = "data=" + JSON.stringify({action:"delete",id:id, sess:sess});
    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.send(params);

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            const data = JSON.parse(http.responseText);
            if(data.response == "done") {
                document.getElementById("entryID_" + id).remove();
                deleteModal.hide();
            }
        }
    }
}