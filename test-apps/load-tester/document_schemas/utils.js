export function parseConfig(c) {
  return eval(`(${c})`);
}

export function parseSchema(s) {
  const {name, enabledByDefault, config} = s;
  return {
    name, enabledByDefault, config: parseConfig(config)
  };
}
