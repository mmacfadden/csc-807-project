import fs from "fs";
import {createTableBodies, findResultForModule, getModuleLabel, round} from "./utils";


const testDir = "./testing/key_encryption_testing";
const schemaName = "Text 5000";

const opeResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/ope.json`, {encoding: 'utf8', flag: 'r'}));

const symmetricResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/symmetric.json`, {encoding: 'utf8', flag: 'r'}));

const ptResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/none.json`, {encoding: 'utf8', flag: 'r'}));


function createRow(moduleId: string, schemaName: string, property: string): string[] {
  const ptResult = findResultForModule(moduleId, schemaName, ptResults);
  const symmetricResult = findResultForModule(moduleId, schemaName, symmetricResults);
  const opeResult = findResultForModule(moduleId, schemaName, opeResults);

  const ptValue = ptResult[property];
  const symmetricValue = symmetricResult[property];
  const symDelta = symmetricValue - ptValue;
  const opeValue = opeResult[property];
  const opeDelta = opeValue - ptValue;

  // return [
  //   getModuleLabel(moduleId),
  //   round(ptValue, 1),
  //   `${round(symmetricValue, 1)}  (Δ ${round(symDelta, 1)})` ,
  //   `${round(opeValue, 1)}  (Δ ${round(opeDelta, 1)})`
  // ];

  return [
    getModuleLabel(moduleId),
    round(ptValue, 1),
    round(symmetricValue, 1),
    round(symDelta, 1),
    round(opeValue, 1),
    round(opeDelta, 1)
  ];
}


const properties = ["averageWriteTimeMs"]

const result = createTableBodies(opeResults, schemaName, properties, createRow);

console.log(result);