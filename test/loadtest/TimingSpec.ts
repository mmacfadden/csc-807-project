import {expect} from 'chai';
import {Timing} from "../../src/loadtest/Timing";

describe('DocumentGenerator', () => {
  describe('readStart', () => {
    it( "start end end create a duration", () => {
     Timing.readStart(1);
     const duration = Timing.readEnd(1);
     expect(duration).to.be.gt(0);
    });
  });

  describe('writeStart', () => {
    it( "start end end create a duration", () => {
      Timing.writeStart(1);
      const duration = Timing.writeEnd(1);
      expect(duration).to.be.gt(0);
    });
  });

  describe('startMeasurementSession', () => {
    it( "clears read time", () => {
      Timing.readStart(1);
      const duration = Timing.readEnd(1);
      expect(duration).to.be.gt(0);
      expect(Timing.getTotalReadTime()).to.be.gt(0);

      Timing.startMeasurementSession();
      expect(Timing.getTotalReadTime()).to.eq(0);
    });

    it( "clears write time", () => {
      Timing.writeStart(1);
      const duration = Timing.writeEnd(1);
      expect(duration).to.be.gt(0);
      expect(Timing.getTotalWriteTime()).to.be.gt(0);

      Timing.startMeasurementSession();
      expect(Timing.getTotalWriteTime()).to.eq(0);
    });
  });
});