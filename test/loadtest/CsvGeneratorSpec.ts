import {expect} from 'chai';
import {Timing} from "../../src/loadtest/Timing";
import {CsvGenerator, ILoadTestResult} from "../../src";

describe('CsvGenerator', () => {
  describe('generateCsv', () => {
    it( "handles an empty result set", () => {
     const csv = CsvGenerator.generateCsv([]);
     expect(csv.split("\n").length).to.eq(1);
    });

    it( "throws if the results are not an array", () => {
      expect( () => CsvGenerator.generateCsv(null as any as ILoadTestResult[])).to.throw();
    });

    it( "handles multiple rows", () => {
      const result: ILoadTestResult = {
        averageDocumentSize: 1,
        averageReadTimeMs: 2,
        averageReadWriteTimeMs: 3,
        averageWriteTimeMs: 4,
        avgReadThroughputKbps: 5,
        avgWriteThroughputKbps: 6,
        moduleId: "7",
        operationCount: 8,
        reads: [],
        schemaName: "9",
        totalTimeMs: 10,
        writes: []
      }
      const csv = CsvGenerator.generateCsv([result]);
      const rows = csv.split("\n")
      expect(rows.length).to.eq(2);
      const fields = rows[1].split(",");
      CsvGenerator.Columns.forEach((col, i) => {
        expect(fields[i]).to.eq("" + (result as any)[col.field]);
      })
    });
  });
});