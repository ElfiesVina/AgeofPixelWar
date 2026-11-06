"use strict";
/* Helper bangsa. */
function getNation(e) {
  return NATIONS.find((n) => n.id === e) || NATIONS[0];
}
