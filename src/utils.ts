import '@types/node'

export const isTestEnv = () =>
  typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  