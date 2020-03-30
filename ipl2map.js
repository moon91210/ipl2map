const math3d = require('math3d');
const builder = require('xmlbuilder');
const fs = require('fs').promises;


async function readIPL(path) {
    try {
        let f = await fs.readFile(path);
        if (!f) return;

        let content = f.toString();
        let lines = content.split('\r\n');

        if (!lines) return;

        let start;
        let end;

        for (let i in lines) {
            if (!start && lines[i].trim() == 'inst') {
                start = i;
                break;
            }
        }

        for (let i=start; i < lines.length; i++) {
            if (lines[i].trim() == 'end') {
                end = i;
                break;
            }
        }

        if (!start || !end) return;

        lines = lines.slice(start, end);

        let data = [];

        for (let line of lines){
            let args = line.split(', ');
            if (args.length > 1) {
                let quat = new math3d.Quaternion(Number(args[6]), Number(args[7]), -Number(args[8]), Number(args[9]));
                let rot = quat.eulerAngles;

                data.push({
                    model: args[0],
                    id: args[1],
                    interior: args[2],
                    dimension: 0,
                    scale: 1,
                    posX: args[3],
                    posY: args[4],
                    posZ: args[5],
                    rotX: rot.x == 0 ? rot.x : rot.x.toFixed(5),
                    rotY: rot.y == 0 ? rot.y : rot.y.toFixed(5),
                    rotZ: rot.z == 0 ? rot.z : rot.z.toFixed(5)
                });
            }
        }
        
        return data;
    } catch(e) {
        console.log(e);
    }
}

async function IPL2XML(path) {
    try {
        let data = await readIPL(path);
        if (!data) return;
        
        let xml = builder.create('map');
        for (let d of data) {
            xml.ele('object', d);
        }

        return xml.end({pretty: true});
    } catch(e) {
        console.log(e);
    }
}

module.exports = IPL2XML;