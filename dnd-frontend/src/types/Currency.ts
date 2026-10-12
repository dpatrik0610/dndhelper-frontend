/** A stack of one currency. `type` is "gp", "sp", ... or any custom name ("Mammon"); matched case-insensitively. */
export interface Currency {
  type: string;
  amount: number;
}
