// tslint:disable:no-floating-promises

import schedule from '../src/scheduler';

const testScheduler = () => {
  describe('schedule', () => {
    it('uses single requestAnimationFrame for all nested tasks', () => {
      const taskSpy = jasmine.createSpy('task');

      const raf = spyOn(window, 'requestAnimationFrame').and
        .callFake((callback: () => void) => {
          callback();
        });

      let nesting = 0;

      const task = () => {
        taskSpy();

        if (nesting === 2) {
          return;
        }

        schedule(task);
        nesting += 1;
      };

      schedule(task);

      expect(taskSpy).toHaveBeenCalledTimes(3);
      expect(raf).toHaveBeenCalledTimes(1);
    });

    it('consistently rejects rendering promises until the top one', async () => {
      const rejectSpy = jasmine.createSpy('onCatch');

      let nesting = 0;

      const task = () => {
        if (nesting === 2) {
          throw new Error('foo');
        }

        schedule(task).catch(() => {
          rejectSpy();
        });

        nesting += 1;
      };

      try {
        await schedule(task);
      } catch (e) {
        expect(e.message).toBe('foo');
        expect(rejectSpy).toHaveBeenCalledTimes(2);
      }
    });
  });
};

export default testScheduler;
