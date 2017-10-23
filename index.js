import path from 'path';
import process from 'process';
import fs from 'fs';
import JSZip from 'jszip';

export default class {

    constructor() {
        this._zip = new JSZip();
    }

    zip(source, destination) {

        try {
            const
                initCwdPath = process.cwd(),
                processRootPath = path.join(initCwdPath, source);

            process.chdir(processRootPath);

            const
                foundFilesPaths = this.getPathes('.'),
                root = this._zip.folder(source);

            for (let i = 0; i < foundFilesPaths.length; i++) {
                root.file(foundFilesPaths[i], fs.createReadStream(foundFilesPaths[i]));
            }

            process.chdir(initCwdPath);

            return root.generateNodeStream({
                type: "nodebuffer",
                streamFiles: true,
                compression: "DEFLATE"
            })
                .pipe(fs.createWriteStream(destination));

        } catch (e) {
            throw new Error(e.message);
        }
    }

    getPaths(source) {

        const dirs = fs.readdirSync(source);

        let arr = [];

        for (let i = 0; i < dirs.length; i++) {
            const
                dirPath = path.join(source, dirs[i]),
                stat = fs.statSync(dirPath);

            if (stat.isDirectory() && !stat.isFile()) {
                arr = arr.concat(this.getPaths(dirPath));
            }
            else {
                arr.push(dirPath);
            }
        }
        return arr;
    }
}
