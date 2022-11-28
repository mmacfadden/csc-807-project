import {expect} from 'chai';
import {wrapEventWithTarget} from "../../src/core/EventWrapper";

describe('wrapEventWithTarget', () => {
  it("override target and currentTarget", () => {
    const target = {} as EventTarget;
    const newTarget = {} as EventTarget;

    const event = {
      target: target,
      currentTarget: target
    } as Event;

    const wrapped = wrapEventWithTarget(event, newTarget);
    expect(wrapped.target).to.eq(newTarget);
    expect(wrapped.currentTarget).to.eq(newTarget);
  });

  it("does not override other properties", () => {
    const target = {} as EventTarget;
    const newTarget = {} as EventTarget;

    const event = {
      target: target,
      currentTarget: target,
      type: "value"
    } as Event;

    const wrapped = wrapEventWithTarget(event, newTarget);
    expect(wrapped.type).to.eq(event.type);
  });
});