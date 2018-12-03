// tslint:disable:readonly-array no-unnecessary-class

export const universalRouterConstructorSpy = jasmine.createSpy('UniversalRouter');

export default class UniversalRouter {
  public constructor(...args: any[]) {
    universalRouterConstructorSpy(...args);
  }
}
