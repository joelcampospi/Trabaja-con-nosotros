const fs = require("fs");
module.exports = {
    DatabaseWorker: class DatabaseWorker {
        databasePath = "database";
        DatabaseWorker() {}
    
        // Returns a JSON containing a list of the items
        async Find(query = {}, method = "STRICT", start = 0, limit = -1) {
            const files = await fs.readdirSync(this.databasePath);
            console.log("QUERY");
            let result = {
                lastId: -1,
                data: {}
            };
            let i;
            for(i = start; i < files.length && (Object.keys(result.data).length + 1 <= limit || limit == -1); i++) {
                const file = files[i];
                console.log("CHECKING: " + file);
                const content = JSON.parse(await fs.readFileSync(`${this.databasePath}/${file}`,"utf-8")); // <-- Read file
                const matches = this.DataQuerier(content, query, method); // <-- Accomplishes?
                if(matches) result.data[file.replace(".json","")] = content;
            }
            result.lastId = i;
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

        // Returns a string reducing it to a base text (removing spaces, capital letters, etc)
        LikeConverter(data) {
            data = data.toLowerCase();
            return data;
        }

        DataQuerier(json, query, method) {
            for(const key_q of Object.keys(query)) {
                if(json[key_q] === undefined) return false; // <-- Does not have that key
                const rawField_q = query[key_q];
                const field_q = method == "STRICT" ? rawField_q.toLowerCase() : this.LikeConverter(rawField_q);
                const field = method == "STRICT" ? json[key_q].toLowerCase() : this.LikeConverter(json[key_q]);
                if(field_q !== field) return false;
            }
            return true;
        }
    }
}