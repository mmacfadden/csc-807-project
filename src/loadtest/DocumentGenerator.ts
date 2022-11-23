import mocker from "mocker-data-generator";

export class DocumentGenerator {
  public static SCHEMA_NAME = 'test_document';

  public static generateDocument(schema: any): object {
    const m = mocker().schema(DocumentGenerator.SCHEMA_NAME, schema, 1);
    const result = m.buildSync();
    return result[DocumentGenerator.SCHEMA_NAME][0];
  }
}