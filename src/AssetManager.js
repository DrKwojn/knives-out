
export class AssetManager {
    static jsonAssets = new Map();
    static bufferAssets = new Map();
    static imageAssets = new Map();

    static async getJson(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.jsonAssets.has(url)) {
            return this.jsonAssets.get(url);
        }

        const json = await fetch(url).then(response => response.json()).catch(error => console.log(error));
        this.jsonAssets.set(url, json);

        return this.jsonAssets.get(url);
    }

    static async getBuffer(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.bufferAssets.has(url)) {
            return this.bufferAssets.get(url);
        }

        const buffer = await fetch(url).then(response => response.arrayBuffer()).catch(error => console.log(error));
        this.bufferAssets.set(url, buffer);
        
        return this.bufferAssets.get(url);
    }

    static async getImage(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.imageAssets.has(url)) {
            return this.imageAssets.get(url);
        }

        const image = await new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = url;
        });

        this.imageAssets.set(url, image);
        
        return this.imageAssets.get(url);
    }
}