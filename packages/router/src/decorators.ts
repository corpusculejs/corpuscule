export const routeNode = ({constructor}: any, propertyName: string) => {
  constructor._routeNode = propertyName;
};
