import "fake-indexeddb/auto";
import fs from "fs";
import {
  ILoadTestResult, ModuleBlowfish, ModuleChaCha20,
  ModuleClearText,
  ModuleCryptoJsAes128, ModuleCryptoJsAes256, ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256, ModuleRC5, ModuleSM4CBC, ModuleTwoFish, ModuleXSalsa20NaCl
} from "../src";

const moduleNameMap = new Map();
moduleNameMap.set(ModuleClearText.MODULE_ID, "Clear Text");
moduleNameMap.set(ModuleCryptoJsAes128.MODULE_ID, "AES 128 (CJS)");
moduleNameMap.set(ModuleNodeCryptoAes128.MODULE_ID, "AES 128 (NC)");
moduleNameMap.set(ModuleCryptoJsAes256.MODULE_ID, "AES 256 (CJS)");
moduleNameMap.set(ModuleNodeCryptoAes256.MODULE_ID, "AES 256 (NC)");
moduleNameMap.set(ModuleCryptoJsTripleDes.MODULE_ID, "Triple DES");
moduleNameMap.set(ModuleBlowfish.MODULE_ID, "Blowfish");
moduleNameMap.set(ModuleTwoFish.MODULE_ID, "Two Fish");
moduleNameMap.set(ModuleRC5.MODULE_ID, "RC5");
moduleNameMap.set(ModuleSM4CBC.MODULE_ID, "SM4 CBC");
moduleNameMap.set(ModuleXSalsa20NaCl.MODULE_ID, "XSalsa20");
moduleNameMap.set(ModuleChaCha20.MODULE_ID, "ChaCha20");


export function round(value: number, decimals: number): string {
  return Number(Math.round(value + 'e' as any as number + decimals) + 'e-' + decimals).toFixed(decimals);
}

const testDir  = "./testing/text_5000_all_modules";
const schemaName = "Text 5000";

const nodeResults =
    JSON.parse(fs.readFileSync( `${testDir}/results/node.json`, {encoding:'utf8', flag:'r'}));

const chromeResults =
    JSON.parse(fs.readFileSync( `${testDir}/results/chrome.json`, {encoding:'utf8', flag:'r'}));

const firefoxResults =
    JSON.parse(fs.readFileSync( `${testDir}/results/firefox.json`, {encoding:'utf8', flag:'r'}));

const safariResults =
    JSON.parse(fs.readFileSync( `${testDir}/results/safari.json`, {encoding:'utf8', flag:'r'}));

const edgeResults =
    JSON.parse(fs.readFileSync( `${testDir}/results/safari.json`, {encoding:'utf8', flag:'r'}));

function findResultForModule(moduleId: string, schemaName: string, results: ILoadTestResult[]) {
  return results.find(s => s.moduleId === moduleId && s.schemaName === schemaName);
}

function createRow(moduleId: string, schemaName: string, property: string): string {
  const nodeResult = findResultForModule(moduleId, schemaName, nodeResults);
  const chromeResult = findResultForModule(moduleId, schemaName, chromeResults);
  const firefoxResult = findResultForModule(moduleId, schemaName, firefoxResults);
  const safariResult = findResultForModule(moduleId, schemaName, safariResults);
  const edgeResult = findResultForModule(moduleId, schemaName, edgeResults);

  return moduleNameMap.get(moduleId) + " & " +
      getColumn(nodeResult, property, false) +
      getColumn(chromeResult, property, false) +
      getColumn(firefoxResult, property, false) +
      getColumn(safariResult, property, false) +
      getColumn(edgeResult, property, true) + "\n" +
      "\\hline\n";
}

function getColumn(source: any, property: string, last: boolean) {
  const value = source[property];
  const rounded = round(value, 1);

  return last ? rounded + " \\\\" : rounded + " & ";
}


function createTableBody(schema: string, property: string) {
  let tableBody = "";
  nodeResults.forEach((result: ILoadTestResult) => {
    const {moduleId, schemaName} = result;
    if (schemaName === schema) {
      tableBody += createRow(moduleId, schemaName, property);
    }
  });

  return tableBody;
}

function createTableBodies(schema: string, properties: string[]): string {
  let tableBodies = "";
  properties.forEach(p => {
    tableBodies += p + "\n";
    tableBodies += createTableBody(schema, p) + "\n\n";
  });

  return tableBodies;
}

const properties = ["averageWriteTimeMs", "averageReadTimeMs", "avgWriteThroughputKbps", "avgReadThroughputKbps"]

const result = createTableBodies(schemaName, properties);

console.log(result);