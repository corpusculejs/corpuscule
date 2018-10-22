import {formSubscriptionItems} from "final-form";

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});
