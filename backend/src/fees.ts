/** Registration fee per team in paise (₹499 / ₹699). Keep in sync with the website's tracks content. */
export const FEES_PAISE = { junior: 49_900, main: 69_900 } as const;
export type Track = keyof typeof FEES_PAISE;

/**
 * Sanity check on `payment.amount`, never the way a team is identified (the email does that).
 * It only stops clearly wrong money from marking a team paid: a ₹1 test, or the other track's fee.
 *
 * GEvents does not charge exactly what we advertise (₹499 / ₹699): it adds 18% GST (₹499.14 / ₹698.56), and GITAM-domain
 * payers pay the fee without GST (₹592 for Main, seen on all 10 such payments in the old export and again live;
 * 592 x 1.18 = 698.56). So each track accepts a RANGE, from the fee without GST up to the advertised fee with GST,
 * and any price variant inside it works without a code change. The two tracks' ranges do not overlap.
 */
const RANGE_PAISE: Record<Track, readonly [number, number]> = { junior: [42_300, 49_914], main: [59_200, 69_900] };
export const feeMatches = (track: Track, amount: number | null) =>
  amount !== null && amount >= RANGE_PAISE[track][0] && amount <= RANGE_PAISE[track][1];
