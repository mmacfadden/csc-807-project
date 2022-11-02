export function parseConfig(c) {
  return eval(`(${c})`);
}

export function parseSchema(s) {
  const {name, enabledByDefault, schema, keyPath} = s;
  return {
    name, enabledByDefault, keyPath, schema: parseConfig(schema)
  };
}
