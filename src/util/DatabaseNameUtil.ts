export class DatabaseNameUtil {
  private static readonly _SEPARATOR = "_";

  public static unprefixName(name: string): string {
    return name.slice(name.indexOf(DatabaseNameUtil._SEPARATOR) + 1);
  }
  public static prefixName(prefix: string, name: string): string {
    return `${prefix}${DatabaseNameUtil._SEPARATOR}${name}`;
  }
}