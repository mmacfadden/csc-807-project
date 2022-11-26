import {PRNG} from "./PRNG";

export class HGD {
  /**
   * Random variates from the hypergeometric distribution.
   *
   * Returns the number of white balls drawn when kk balls
   * are drawn at random from an urn containing nn1 white
   * and nn2 black balls.
   * nn1 -- good
   * nn2 -- bad
   */
  public static rhyper(kk: number, nn1: number, nn2: number, coins: Iterator<number>): number {
    const prng = new PRNG(coins)
    if (kk > 10) {
      return HGD.hypergeometric_hrua(prng, nn1, nn2, kk)
    } else {
      return HGD.hypergeometric_hyp(prng, nn1, nn2, kk)
    }
  }

  public static hypergeometric_hyp(prng: PRNG, good: number, bad: number, sample: number) {
    const d1 = bad + good - sample;
    const d2 = Math.min(bad, good);

    let Y = d2;
    let K = sample;
    while (Y > 0.0) {
      const U = prng.draw();
      Y -= Math.round(Math.floor(U + Y / (d1 + K)));
      K -= 1;
      if (K == 0) {
        break;
      }

    }
    let Z = Math.round(d2 - Y)
    if (good > bad) {
      Z = sample - Z;
    }

    return Z;
  }

  public static hypergeometric_hrua(prng: PRNG, good: number, bad: number, sample: number) {
    const D1 = 1.7155277699214135;
    const D2 = 0.8989161620588988;
    // long mingoodbad, maxgoodbad, popsize, m, d9;
    // double d4, d5, d6, d7, d8, d10, d11;
    // long Z;
    // double T, W, X, Y;

    let T: number;
    let W: number;
    let X: number;
    let Y: number;
    let Z: number;

    const mingoodbad = Math.min(good, bad);
    const popsize = good + bad;
    const maxgoodbad = Math.max(good, bad);
    const m = Math.min(sample, popsize - sample);
    const d4 = mingoodbad / popsize;
    const d5 = 1.0 - d4;
    const d6 = m * d4 + 0.5;
    const d7 = Math.sqrt((popsize - m) * sample * d4 * d5 / (popsize - 1) + 0.5);
    const d8 = D1 * d7 + D2;
    const d9 = Number(Math.floor((m + 1) * (mingoodbad + 1) / (popsize + 2)));
    const d10 = HGD.loggam(d9 + 1) + HGD.loggam(mingoodbad - d9 + 1) + HGD.loggam(m - d9 + 1) + HGD.loggam(maxgoodbad - m + d9 + 1);
    const d11 = Math.min(Math.min(m, mingoodbad) + 1.0, Math.floor(d6 + 16 * d7));
    // 16 for 16-decimal-digit precision in D1 and D2

    while (true) {
      X = prng.draw();
      Y = prng.draw();
      W = d6 + d8 * (Y - 0.5) / X;

      // fast rejection:
      if (W < 0.0 || W >= d11) {
        continue;
      }

      Z = Number(Math.floor(W));
      T = d10 - (HGD.loggam(Z + 1) + HGD.loggam(mingoodbad - Z + 1) + HGD.loggam(m - Z + 1) + HGD.loggam(maxgoodbad - m + Z + 1));

      // fast acceptance:
      if ((X * (4.0 - X) - 3.0) <= T) {
        break;
      }

      // fast rejection:
      if (X * (X - T) >= 1) {
        continue;
      }

      // acceptance:
      if (2.0 * Math.log(X) <= T) {
        break;
      }
    }

    // this is a correction to HRUA* by Ivan Frohne in rv.py
    if (good > bad) {
      Z = m - Z;
    }

    // another fix from rv.py to allow sample to exceed popsize/2
    if (m < sample) {
      Z = good - Z;
    }

    return Z;
  }

  public static loggam(x: number) {
    let gl, gl0, xp;
    const a = [
      0.08333333333333333,
      -0.002777777777777778,
      0.0007936507936507937,
      -0.0005952380952380952,
      0.0008417508417508418,
      -0.001917526917526918,
      0.00641025641025641,
      -0.02955065359477124,
      0.1796443723688307,
      -1.3924322169059];

    let x0 = x;
    let n = 0;

    if (x === 1.0 || x === 2.0) {
      return 0.0;
    } else {
      if (x <= 7.0) {
        n = 7 - x;
        x0 = x + n;
      }
    }

    const x2 = 1.0 / (x0 * x0);
    xp = 2 * Math.PI;
    gl0 = a[9];

    for (let k = 8; k > -1; k--) {
      gl0 = gl0 * x2;
      gl0 += a[k];
    }

    gl = gl0 / x0 + 0.5 * Math.log(xp) + (x0 - 0.5) * Math.log(x0) - x0;

    if (x <= 7.0) {
      for (let k = 1; k < n + 1; k++) {
        gl -= Math.log(x0 - 1.0);
        x0 -= 1.0;
      }
    }

    return gl;
  }
}
