const fs = require("fs");
module.exports = {
    DatabaseWorker: class DatabaseWorker {
        databasePath = "functions/database";
        DatabaseWorker() {}
    
        // Returns a JSON containing a list of the items
        async Find(query = {}, method = "STRICT", start = 0, limit = -1) {
            const _files = await fs.readdirSync(this.databasePath + "/", { withFileTypes: true });
            const files = _files.filter(el => el.isFile()).map(el => el.name);
            let result = {
                lastId: -1,
                data: {}
            };
            let i;
            for(i = start; i < files.length && (Object.keys(result.data).length + 1 <= limit || limit == -1); i++) {
                const file = files[i];
                const fileContent = await fs.readFileSync(`${this.databasePath}/${file}`);
                const content = JSON.parse(fileContent,"utf-8"); // <-- Read file
                const matches = this.DataQuerier(content, query, method); // <-- Accomplishes?
                if(matches) result.data[file.replace(".json","")] = content;
            }
            result.lastId = i;
            return result;
        }
        async Merge(json, id) {} // <-- Not implemented
        async Create(json, fileData) {
            try { 
                const id = this.GiveID().toString();
                await this.Write(`${this.databasePath}/${id}.json`, json);
                if(fileData) {
                    // File worker
                    fs.rename(fileData.path, this.databasePath + "/files/" + id + (fileData.originalname.includes(".") ? "." + fileData.originalname.split(".")[1] : ""),() => {});
                }
            } catch(e) {
                console.log(`Error: ${e}`);
            }
        }

        async Write(where, json) {
            // Write JSON data onto a file
            json = this.SignJson(json); // <-- Sign the entry
            fs.writeFile(where,JSON.stringify(json),(err) => {
                if(err) throw err;
            });
        }
        async Delete(file) {
            await fs.unlinkSync(this.databasePath + "/" + file + ".json");
            let cv = null;
            for(const _file of await fs.readdirSync("functions/database/files")) {
                if(_file.split(".")[0] == file) {
                    cv = _file;
                    break;
                }
            }
            if(cv) await fs.unlinkSync(this.databasePath + "/files/" + cv);
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