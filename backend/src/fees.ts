/** Registration fee per team in paise (₹499 / ₹699). Keep in sync with the website's tracks content. */
export const FEES_PAISE = { junior: 49_900, main: 69_900 } as const;
export type Track = keyof typeof FEES_PAISE;
