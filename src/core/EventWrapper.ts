/**
 * A helper class to wrap an event in a proxy that will essentially
 * update the target and current target of the event.
 *
 * @param event
 *   The event to wrap.
 *
 * @param eventTarget
 *   The event target to overwrite.
 *
 * @returns
 *   The wrapped event.
 */
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