import UniversalRouter, {Route} from 'universal-router';
import {createSimpleContext} from '../../../test/utils';
import {gear, outlet, provider} from '../src';

interface RoutingChainElement {
  readonly result: unknown;
  readonly route: Route;
}

describe('@corpuscule/router', () => {
  describe('context', () => {
    let route: Route;
    let router: jasmine.SpyObj<UniversalRouter>;
    let resolvedChain: readonly RoutingChainElement[];

    beforeEach(() => {
      route = {};
      router = jasmine.createSpyObj('router', ['resolve']);
      resolvedChain = [{result: 'Foo', route}];
      router.resolve.and.callFake(async () => resolvedChain);
    });

    it('resolves route at the provider and sends data down to outlets', async () => {
      @provider({initialPath: '/'})
      class Provider extends HTMLElement {
        @gear public router: UniversalRouter = router;
      }

      @outlet([route])
      class Outlet extends HTMLElement {
        @gear public output!: string;
      }

      const [, outletElement] = await createSimpleContext(Provider, Outlet);

      expect(router.resolve).toHaveBeenCalledWith({
        chain: [],
        pathname: '/',
      });

      expect(outletElement.output).toBe('Foo');
    });

    it('re-resolves route on popstate event', async () => {
      @provider({initialPath: '/'})
      class Provider extends HTMLElement {
        @gear public router: UniversalRouter = router;
      }

      @outlet([route])
      class Outlet extends HTMLElement {
        @gear public output!: string;
      }

      await createSimpleContext(Provider, Outlet);
      router.resolve.calls.reset();

      window.dispatchEvent(new PopStateEvent('popstate', {state: '/foo/bar'}));

      expect(router.resolve).toHaveBeenCalledWith({
        chain: [],
        pathname: '/foo/bar',
      });
    });

    it('changes nothing if there is no fitting route in outlet list', async () => {
      const outputSpy = jasmine.createSpy('output');

      @provider({initialPath: '/'})
      class Provider extends HTMLElement {
        @gear public router: UniversalRouter = router;
      }

      @outlet([])
      class Outlet extends HTMLElement {
        private _output?: string;

        @gear
        public get output(): string | undefined {
          return this._output;
        }

        public set output(value: string | undefined) {
          this._output = value;
          outputSpy(value);
        }
      }

      await createSimpleContext(Provider, Outlet);
      window.dispatchEvent(new PopStateEvent('popstate', {state: '/foo/bar'}));

      expect(outputSpy).not.toHaveBeenCalled();
    });
  });
});
