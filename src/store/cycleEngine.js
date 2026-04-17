export const FocusState = {
  IDLE: "IDLE",
  LOCK_IN: "LOCK_IN",
  FOCUSED: "FOCUSED",
  EXIT_FRICTION: "EXIT_FRICTION",
  BREAK: "BREAK",
  REENTRY: "REENTRY",
  SUMMARY: "SUMMARY",
};

export const transitionMap = {
  [FocusState.IDLE]: [FocusState.LOCK_IN],
  [FocusState.LOCK_IN]: [FocusState.FOCUSED],
  [FocusState.FOCUSED]: [FocusState.EXIT_FRICTION],
  [FocusState.EXIT_FRICTION]: [FocusState.FOCUSED, FocusState.BREAK],
  [FocusState.BREAK]: [FocusState.REENTRY],
  [FocusState.REENTRY]: [FocusState.FOCUSED, FocusState.SUMMARY],
  [FocusState.SUMMARY]: [FocusState.IDLE],
};

export function canTransition(from, to) {
  const allowed = transitionMap[from] ?? [];
  return allowed.includes(to);
}

export function safeTransition(currentState, nextState) {
  if (!canTransition(currentState, nextState)) {
    return currentState;
  }
  return nextState;
}
