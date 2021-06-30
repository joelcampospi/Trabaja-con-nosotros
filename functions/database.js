const fs = require("fs");
module.exports = {
    DatabaseWorker: class DatabaseWorker {
        databasePath = "database";
        DatabaseWorker() {}
    
        async Find(query) {

        }
        async Merge(json, id) {}
        async Create(json) {
            try {
                const id = this.GiveID().toString();
                await this.Write(`${this.databasePath}/${id}.json`, json);
            } catch(e) {
                console.log(`Error: ${e}`);
            }
        }

        async Write(where, json) {
            // Write JSON data onto a file
            json = this.SignJson(json); // <-- Sign the entry
            fs.writeFile(where,JSON.stringify(json),(err) => {
                if(err) throw err;
                console.log("CREATED " + where);
            });
        }

        SignJson(json) {
            json.signature = {};
            json.signature.created = Date.now();
            return json;
        }

        GiveID() {
            return new Date().getTime();
        }
    }
}