export function wrapEventWithTarget<E extends Event>(event: E, eventTarget: any): E {
  const handler: ProxyHandler<E> = {
    get(target, prop, _) {
      if (prop === "target" || prop === "currentTarget") {
        return eventTarget;
      } else {
        return (<any>target)[<string>prop];
      }
    }
  }
  return new Proxy(event, handler);
}