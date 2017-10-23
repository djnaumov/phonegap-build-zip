const path = require('path');
const process = require('process');
const fs = require('fs');
const JSZip = require('jszip');
const zip = new JSZip();

const getPaths = (source) => {

    const dirs = fs.readdirSync(source);

    let arr = [];

    for (let i = 0; i < dirs.length; i++) {
        const
            dirPath = path.join(source, dirs[i]),
            stat = fs.statSync(dirPath);

        if (stat.isDirectory() && !stat.isFile()) {
            arr = arr.concat(getPaths(dirPath));
        }
        else {
            arr.push(dirPath);
        }
    }
    return arr;
};

const buildZip = (source, destination) => {

    try {
        const
            initCwdPath = process.cwd(),
            processRootPath = path.join(initCwdPath, source);

        process.chdir(processRootPath);

        const
            foundFilesPaths = getPaths('.'),
            root = zip.folder(source);

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
};

module.exports = buildZip;
