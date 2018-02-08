
import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {translate, toSparql, toSparqlJs} from '../index';
import Util from './util';

const rootJson = 'test/algebra';

// https://www.w3.org/2001/sw/DataAccess/tests/r2#syntax-basic-01
// https://www.w3.org/2009/sparql/implementations/
// https://www.w3.org/2009/sparql/docs/tests/
describe('SPARQL Parser', () =>
{
    // dawg/sparql
    let subfolders = fs.readdirSync(rootJson);

    for (let subfolder of subfolders)
        testPath(subfolder, subfolder);
});

function testPath(fileName: string, testName: string): void
{
    let jsonName = path.join(rootJson, fileName);
    if (fs.lstatSync(jsonName).isDirectory())
    {
        for (let sub of fs.readdirSync(jsonName))
            testPath(path.join(fileName, sub), testName + '/' + sub);
    } else {
        let name = testName.replace(/\.json$/, '');
        it (name, () =>
        {
            let sparqlName = path.join('test/sparql', name + '.sparql');
            let sparql = fs.readFileSync(sparqlName, 'utf8');
            console.log(sparql);
            let expected = JSON.parse(fs.readFileSync(jsonName, 'utf8'));
            console.log(require('util').inspect((expected), { depth: null, breakLength: 120 }));
            console.log(require('util').inspect(toSparqlJs(expected), { depth: null, breakLength: 120 }));
            let query = toSparql(expected);
            console.log(query);
            let algebra = Util.objectify(translate(query, { quads: name.endsWith('(quads)') }));
            console.log(require('util').inspect((algebra), { depth: null, breakLength: 120 }));
            console.log(require('util').inspect(toSparqlJs(expected), { depth: null, breakLength: 120 }));
            expect(algebra).to.deep.equal(expected);
        });
    }
}