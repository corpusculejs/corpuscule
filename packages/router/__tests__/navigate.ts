import {navigate} from '../src';

describe('@corpuscule/router', () => {
  describe('navigate', () => {
    let historyPushStateSpy: jasmine.Spy;
    let historyStateSpy: jasmine.Spy;

    afterAll(() => {
      historyStateSpy.and.callThrough();
      historyPushStateSpy.and.callThrough();
    });

    beforeEach(() => {
      historyPushStateSpy = spyOn(history, 'pushState');
      historyStateSpy = spyOnProperty(history, 'state').and.returnValue('/test');
    });

    it('should push new state to history', () => {
      navigate('/test');
      // tslint:disable-next-line:no-unbound-method
      expect(history.pushState).toHaveBeenCalledWith('/test', '', '/test');
      expect(historyStateSpy).toHaveBeenCalled();
    });

    it('should allow to add title to a page', () => {
      navigate('/test', 'Test');
      // tslint:disable-next-line:no-unbound-method
      expect(history.pushState).toHaveBeenCalledWith('/test', 'Test', '/test');
    });

    it("should dispatch 'popstate' event", done => {
      const listener = (e: PopStateEvent) => {
        expect(e.state).toEqual('/test');

        window.removeEventListener('popstate', listener);
        done();
      };

      window.addEventListener('popstate', listener);

      navigate('/test');
    });
  });
});
