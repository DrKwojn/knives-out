
export class AssetManager {
    static jsonAssets = new Map();
    static bufferAssets = new Map();
    static imageAssets = new Map();

    static async getJson(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.jsonAssets.has(url.href)) {
            return this.jsonAssets.get(url.href);
        }

        const json = await fetch(url).then(response => response.json()).catch(error => console.log(error));
        this.jsonAssets.set(url.href, json);

        return this.jsonAssets.get(url.href);
    }

    static async getBuffer(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.bufferAssets.has(url.href)) {
            return this.bufferAssets.get(url.href);
        }

        const buffer = await fetch(url).then(response => response.arrayBuffer()).catch(error => console.log(error));
        this.bufferAssets.set(url.href, buffer);
        
        return this.bufferAssets.get(url.href);
    }

    static async getImage(path) {
        const url = path instanceof URL ? path : new URL(path, window.location);
        if (this.imageAssets.has(url.href)) {
            return this.imageAssets.get(url.href);
        }

        const image = await new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = url;
        });

        this.imageAssets.set(url.href, image);
        
        return this.imageAssets.get(url.href);
    }
}