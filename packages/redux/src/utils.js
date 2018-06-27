import {getDescriptorChainValues, getPropertyChainDescriptors} from "@corpuscule/utils/lib/propertyChain";

export const getDescriptors =
  (object, propertyKey) =>
    getDescriptorChainValues(getPropertyChainDescriptors(object, propertyKey), {merge: true});
