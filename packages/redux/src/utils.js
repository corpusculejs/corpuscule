import {getDescriptorChainValues, getPropertyChainDescriptors} from "@corpuscule/utils/propertyChain";

export const getDescriptors =
  (object, propertyKey) =>
    getDescriptorChainValues(getPropertyChainDescriptors(object, propertyKey), {merge: true});
