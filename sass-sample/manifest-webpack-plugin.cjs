// FileHashTrackerPlugin.js
const fs = require('fs');
const path = require('path');

class ManifestPlugin {
    buildOutputMap = {};

    constructor({ filePath, types, skip, logLevel}) {
        this.mapFilePath = filePath || path.resolve(__dirname, 'build-output-map.json');
        this.fileTypesToRecord = types;
        this.skip = skip;
        this.logLevel = logLevel || 'all';
    }

    print = (method, ...content) => {
        switch (method) {
            case 'warn':
                if (this.logLevel === 'none') return;
                break;
            case 'error':
                break;
            default:
                if (this.logLevel !== 'all') return;
                break;
        }

        console[method](...content);
    };

    apply = (compiler) => {
        compiler.hooks.assetEmitted.tap('FileHashTrackerPlugin', (filename) => {
            // Store hash for each file in the map object.
            if (this.skip && this.skip(filename)) return;

            const dotSplit = filename.split('.');
            const fileExtension = dotSplit[dotSplit.length - 1];
            if (this.fileTypesToRecord && !this.fileTypesToRecord.includes(fileExtension)) {
                this.print('log', `\nSkipping ${filename}: File extension mismatch. Expected ".${this.fileTypesToRecord.join('" or ".')}".\n`);
                return;
            }
            const contenthash = dotSplit[dotSplit.length - 2];

            const hashlessFilename = dotSplit.slice(0, -2).join('.'); // removes both the hash and the file extension.
            const slashSplit = hashlessFilename.split('/');
            slashSplit.shift(); // removes the path prefix (e.g 'css/').
            let fileEntryKey = slashSplit.join('/') + '.' + fileExtension;
            if (fileEntryKey.startsWith('/')) fileEntryKey = fileEntryKey.substring(1);

            this.buildOutputMap[fileEntryKey] = contenthash;
        });

        compiler.hooks.done.tapAsync('FileHashTrackerPlugin', (_stats, callback) => {
            // Merge current file into the new map object.
            try {
                const currentMapJson = fs.readFileSync(this.mapFilePath, { encoding: 'utf8' });
                this.buildOutputMap = {
                    // Current file content first.
                    ...JSON.parse(currentMapJson),
                    // New map last, so it takes precedence if a key exists in both.
                    ...this.buildOutputMap,
                };
            } catch (error) {
                if (error.code === 'ENOENT') {
                    this.print('log', `\nFile not found! \n(${this.mapFilePath}) \nIt will be created anew.\n`);
                } else {
                    throw error;
                }
            }

            // Save the completed map into a JSON file.
            fs.writeFileSync(this.mapFilePath, JSON.stringify(this.buildOutputMap, null, 4));
            this.print('log', '******\nSuccessfully updated the record of build output files.\n******\n');
            callback();
        });
    };
};

module.exports = ManifestPlugin;
