import {navigate} from '../src';

describe('@corpuscule/router', () => {
  describe('navigate', () => {
    let historyPushStateSpy: jasmine.Spy;
    let data: object;

    afterAll(() => {
      historyPushStateSpy.and.callThrough();
    });

    beforeEach(() => {
      data = {};
      historyPushStateSpy = spyOn(history, 'pushState');
    });

    it('pushes the new state to the history', () => {
      navigate('/test', data);
      // tslint:disable-next-line:no-unbound-method
      expect(history.pushState).toHaveBeenCalledWith(
        {data, path: '/test'},
        '',
        '/test',
      );
    });

    it("dispatches the 'popstate' event", done => {
      const listener = (e: PopStateEvent) => {
        expect(e.state).toEqual({data, path: '/test'});

        window.removeEventListener('popstate', listener);
        done();
      };

      window.addEventListener('popstate', listener);

      navigate('/test', data);
    });
  });
});
