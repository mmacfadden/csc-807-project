import fs from "fs";
import {ILoadTestResult} from "../../src";
import {createTableBody, getColumnValue, getModuleLabel} from "./ultis";

const testDir = "./testing/text_5000_all_modules";
const schemaName = "Text 5000";

const nodeResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/node.json`, {encoding: 'utf8', flag: 'r'}));

const chromeResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/chrome.json`, {encoding: 'utf8', flag: 'r'}));

const firefoxResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/firefox.json`, {encoding: 'utf8', flag: 'r'}));

const safariResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/safari.json`, {encoding: 'utf8', flag: 'r'}));

const edgeResults =
    JSON.parse(fs.readFileSync(`${testDir}/results/edge.json`, {encoding: 'utf8', flag: 'r'}));

function findResultForModule(moduleId: string, schemaName: string, results: ILoadTestResult[]) {
  return results.find(s => s.moduleId === moduleId && s.schemaName === schemaName);
}

function createRow(moduleId: string, schemaName: string, property: string): string[] {
  const nodeResult = findResultForModule(moduleId, schemaName, nodeResults);
  const chromeResult = findResultForModule(moduleId, schemaName, chromeResults);
  const firefoxResult = findResultForModule(moduleId, schemaName, firefoxResults);
  const safariResult = findResultForModule(moduleId, schemaName, safariResults);
  const edgeResult = findResultForModule(moduleId, schemaName, edgeResults);

  return [
    getModuleLabel(moduleId) + " & " +
    getColumnValue(nodeResult, property, 1),
    getColumnValue(chromeResult, property, 1),
    getColumnValue(firefoxResult, property, 1),
    getColumnValue(safariResult, property, 1),
    getColumnValue(edgeResult, property, 1)
  ];
}


function createTableBodies(schema: string, properties: string[]): string {
  let tableBodies = "";
  properties.forEach(p => {
    tableBodies += p + "\n";
    tableBodies += createTableBody(nodeResults, schema, p, createRow) + "\n\n";
  });

  return tableBodies;
}

const properties = ["averageWriteTimeMs", "averageReadTimeMs", "avgWriteThroughputKbps", "avgReadThroughputKbps"]

const result = createTableBodies(schemaName, properties);

console.log(result);