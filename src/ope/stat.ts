import {HGD} from "./HGD";
import {ValueRange} from "./ValueRange";
import {assert} from "./errors";

/**Z
 * Get a sample from the hypergeometric distribution, using the provided bit list as a source of randomness
 * @param in_range
 * @param out_range
 * @param nsample
 * @param seed_coins
 */
export function sample_hgd(in_range: ValueRange, out_range: ValueRange, nsample: number, seed_coins: Iterator<number>) {
  const in_size = in_range.size();
  const out_size = out_range.size();
  assert(in_size > 0 && out_size > 0);
  assert(in_size <= out_size);
  assert(out_range.contains(nsample));

  // 1-based index of nsample in out_range
  const nsample_index = nsample - out_range.start + 1;
  if (in_size == out_size) {
    // Input and output domains have equal size
    return in_range.start + nsample_index - 1;
  }

  const in_sample_num = HGD.rhyper(nsample_index, in_size, out_size - in_size, seed_coins)
  if (in_sample_num == 0) {
    return in_range.start;
  } else {
    const in_sample = in_range.start + in_sample_num - 1
    assert(in_range.contains(in_sample))
    return in_sample;
  }

}


/**
 * Uniformly select a number from the range using the bit list as a source of randomness
 * @param in_range
 * @param seed_coins
 */
export function sample_uniform(in_range: ValueRange, seed_coins: number[] | Iterator<number>): number {
  let seed_coins_iter: Iterator<number>;

  if (Array.isArray(seed_coins)) {
    seed_coins_iter = seed_coins.values()
  } else {
    seed_coins_iter = seed_coins;
  }

  const cur_range = in_range.copy()
  assert(cur_range.size() != 0)

  while (cur_range.size() > 1) {
    const mid = Math.floor((cur_range.start + cur_range.end) / 2)
    const bit = seed_coins_iter.next().value
    if (bit === 0)
      cur_range.end = mid
    else if (bit === 1)
      cur_range.start = mid + 1
    else if (bit === undefined || bit === null)
      throw new Error("Not enough coins");
    else
      throw new Error("Invalid coin")
  }

  assert(cur_range.size() == 1)
  return cur_range.start;
}

