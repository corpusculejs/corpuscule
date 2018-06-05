import createContext from "@corpuscule/context";

export const consumer: ReturnType<typeof createContext>["consumer"];
export const provider: ReturnType<typeof createContext>["provider"];
export const store: ReturnType<typeof createContext>["value"];

export const storedMap: unique symbol;
