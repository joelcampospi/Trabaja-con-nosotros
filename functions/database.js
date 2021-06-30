const fs = require("fs");
module.exports = {
    DatabaseWorker: class DatabaseWorker {
        databasePath = "database";
        DatabaseWorker() {}
    
        // Returns a JSON containing a list of the items
        async Find(query, method = "SRICT", start = 0, limit = -1) {
            const files = await fs.readdirSync(this.databasePath);
            console.log("QUERY");
            let result = {
                lastId: -1,
                data: []
            };
            let i;
            for(i = start; i < files.length; i++) {
                const file = files[i];
                console.log("CHECKING: " + file);
                const content = JSON.parse(await fs.readFileSync(`${this.databasePath}/${file}`,"utf-8")); // <-- Read file
                const matches = this.DataQuerier(content, method);
                result.data.push(content);
                if(limit != -1 && limit < i) break;
            }
            if(limit != -1) result.lastId = i;
            return result;
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

        DataQuerier(json, method) {
            
        }
    }
}