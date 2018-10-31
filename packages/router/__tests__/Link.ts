import {Link} from '../src';

const linkTest = () => {
  describe('Link', () => {
    let historyPushStateSpy: jasmine.Spy;
    let historyStateSpy: jasmine.Spy;
    let link: Link;

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

    it("should be accessible through 'document.createElement'", () => {
      expect(link).toEqual(jasmine.any(Link));
    });

    it('should dispatch PopStateEvent with current history state by click', (done) => {
      document.body.appendChild(link);
      const listener = (e: PopStateEvent) => {
        expect(e.state).toEqual('/test');

        window.removeEventListener('popstate', listener);
        done();
      };

      window.addEventListener('popstate', listener);

      link.click();
    });

    it('should prevent default action for a anchor element', (done) => {
      document.body.appendChild(link);
      link.addEventListener('click', (e) => {
        expect(e.defaultPrevented).toBeTruthy();
        done();
      });

      link.click();
    });
  });
};

export default linkTest;
