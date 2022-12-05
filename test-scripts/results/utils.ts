import {
  ILoadTestResult,
  ModuleBlowfish, ModuleChaCha20,
  ModuleClearText,
  ModuleCryptoJsAes128, ModuleCryptoJsAes256, ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256, ModuleRC5, ModuleSM4CBC, ModuleTwoFish, ModuleXSalsa20NaCl
} from "../../src";

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

export function getModuleLabel(moduleId: string) {
  return moduleNameMap.get(moduleId);
}

export function round(value: number, decimals: number): string {
  return Number(Math.round(value + 'e' as any as number + decimals) + 'e-' + decimals).toFixed(decimals);
}

export function findResultForModule(moduleId: string, schemaName: string, results: ILoadTestResult[]): any {
  return results.find(s => s.moduleId === moduleId && s.schemaName === schemaName);
}

export function getColumnValue(source: any, property: string, decimals: number = 1): string {
  const value = source[property];
  return round(value, decimals);
}

export type TableRowValueGenerator = (moduleId: string, schemaName: string, property: string) => string[]

export function createTableBody(resultSet: ILoadTestResult[],
                                schema: string,
                                property: string,
                                rowGenerator: TableRowValueGenerator) {
  let tableBody = "";
  resultSet.forEach((result: ILoadTestResult) => {
    const {moduleId, schemaName} = result;
    if (schemaName === schema) {
      const values = rowGenerator(moduleId, schemaName, property);
      const rowString = values.join(" & ") +  " \\\\" + "\n\\hline\n";
      tableBody += rowString
    }
  });

  return tableBody;
}

export function createTableBodies(resultSet: ILoadTestResult[],
                           schema: string,
                           properties: string[],
                           rowGenerator: TableRowValueGenerator): string {
  let tableBodies = "";
  properties.forEach(p => {
    tableBodies += p + "\n";
    tableBodies += createTableBody(resultSet, schema, p, rowGenerator) + "\n\n";
  });

  return tableBodies;
}
