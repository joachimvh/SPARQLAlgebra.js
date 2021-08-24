import * as fs from 'fs';
import translate from '../lib/sparqlAlgebra';
import Util from '../lib/util';
import * as Path from 'path';

// WARNING: use this script with caution!
// After running this script, manual inspection of the output is needed to make sure that conversion happened correctly.

function generateJsonFromSparqlInPath(path: string, stack: string[]) {
    if (fs.lstatSync(path).isDirectory()) {
        let files = fs.readdirSync(path);
        for (let file of files) {
            generateJsonFromSparqlInPath(Path.join(path, file), stack.concat([file]));
        }
    } else {
        let sparql = fs.readFileSync(path, 'utf8');

        let filename = stack.pop();
        let name = filename.replace(/\.sparql$/, '');
        for (const blankToVariable of [ false, true ]) {
            let algebra = Util.objectify(translate(sparql, { quads: name.endsWith('(quads)'), sparqlStar: true, blankToVariable }));
            filename = name + '.json';
            let newPath = Path.join(__dirname, 'algebra' + (blankToVariable ? '-blank-to-var' : ''));
            for (let piece of stack) {
                newPath = Path.join(newPath, piece);
                if (!fs.existsSync(newPath))
                    fs.mkdirSync(newPath);
            }

            fs.writeFileSync(Path.join(newPath, filename), JSON.stringify(algebra, null, 2));
        }
    }
}

generateJsonFromSparqlInPath(Path.join(__dirname, 'sparql'), []);
