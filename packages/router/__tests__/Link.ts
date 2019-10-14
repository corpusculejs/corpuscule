import {waitForMutationObserverChange} from '../../../test/utils';
import {Link} from '../src';

describe('@corpuscule/router', () => {
  describe('Link', () => {
    const waitForDocumentUpdate = () =>
      waitForMutationObserverChange(document.body, {childList: true, subtree: true});
    let historyPushStateSpy: jasmine.Spy;
    let historyStateSpy: jasmine.Spy;
    let link: Link;

    afterEach(() => {
      document.body.innerHTML = ''; // tslint:disable-line:no-inner-html
    });

    afterAll(() => {
      historyStateSpy.and.callThrough();
      historyPushStateSpy.and.callThrough();
    });

    beforeEach(() => {
      link = document.createElement('a', {is: Link.is}) as Link;
      link.href = '/test';
      historyPushStateSpy = spyOn(history, 'pushState');
      historyStateSpy = spyOnProperty(history, 'state').and.returnValue('/test');
    });

    it("accessible through 'document.createElement'", () => {
      expect(link).toEqual(jasmine.any(Link));
    });

    it('dispatches PopStateEvent with current history state by click', async done => {
      const promise = waitForDocumentUpdate();
      document.body.appendChild(link);

      await promise;

      const listener = (e: PopStateEvent) => {
        expect(e.state).toEqual({data: undefined, path: '/test'});

        window.removeEventListener('popstate', listener);
        done();
      };

      window.addEventListener('popstate', listener);

      link.click();
    });

    it('prevents default action for a anchor element', async done => {
      const promise = waitForDocumentUpdate();
      document.body.appendChild(link);

      await promise;

      link.addEventListener('click', e => {
        expect(e.defaultPrevented).toBeTruthy();
        done();
      });

      link.click();
    });

    it('allows changing the context for the link', async done => {
      const data = {};
      const promise = waitForDocumentUpdate();
      document.body.appendChild(link);

      await promise;

      const listener = (e: PopStateEvent) => {
        expect(e.state).toEqual({data, path: '/test'});

        window.removeEventListener('popstate', listener);
        done();
      };

      window.addEventListener('popstate', listener);

      link.contextData = data;

      link.click();
    });
  });
});
