import {routeNode as node} from ".";

export const routeNode = ({constructor}: any, propertyName: string) => {
  constructor[node] = propertyName;
};
