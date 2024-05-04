import { writable } from "svelte/store";
import { CalendarDate } from "@internationalized/date";

export const isUnlocked = writable(false);

export const selectedDate = (function () {
  const { subscribe, set: setDate } = writable<CalendarDate | undefined>();

  return {
    subscribe,
    set: function (v: CalendarDate | undefined) {
      setDate(v);
    }
  };
})();
