
import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {translate, toSparql, toSparqlJs} from '../index';
import Util from './util';
import Factory from "../lib/Factory";

const rootJson = 'test/algebra';
const factory = new Factory();

// https://www.w3.org/2001/sw/DataAccess/tests/r2#syntax-basic-01
// https://www.w3.org/2009/sparql/implementations/
// https://www.w3.org/2009/sparql/docs/tests/
describe('Recurse function', () =>
{
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
            let expected = JSON.parse(fs.readFileSync(jsonName, 'utf8'));
            let clone = Util.objectify(factory.mapOperation(expected, {}));
            expect(clone).to.deep.equal(expected);
        });
    }
}