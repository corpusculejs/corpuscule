// tslint:disable:no-floating-promises
import {createTestingPromise} from '../../../test/utils';
import schedule from '../src/scheduler';

interface TaskObject {
  readonly children: ReadonlyArray<TaskObject>;
  readonly task: () => void;
  readonly throws?: boolean;
}

const testSchedule = () => {
  describe('schedule', () => {
    let raf: jasmine.Spy;
    let taskSpy: jasmine.Spy;

    const createTaskObject = (task: () => void): TaskObject => ({
      children: [
        {
          children: [],
          task,
        },
        {
          children: [
            {
              children: [],
              task,
              throws: true,
            },
            {
              children: [],
              task,
            },
          ],
          task,
        },
      ],
      task,
    });

    beforeEach(() => {
      raf = spyOn(window, 'requestAnimationFrame').and.callFake((callback: () => void) => {
        callback();
      });

      taskSpy = jasmine.createSpy('task');
    });

    it('uses single requestAnimationFrame for all nested tasks', async () => {
      const tree = createTaskObject(function task(this: TaskObject): void {
        taskSpy();
        for (const child of this.children) {
          schedule(child.task.bind(child));
        }
      });

      await schedule(tree.task.bind(tree));

      expect(taskSpy).toHaveBeenCalledTimes(5);
      expect(raf).toHaveBeenCalledTimes(1);
    });

    it('consistently rejects rendering promises until the top one', async () => {
      const rejectSpy = jasmine.createSpy('reject');
      const [promise, resolve] = createTestingPromise();

      const tree = createTaskObject(function task(this: TaskObject): void {
        if (this.throws) {
          throw new Error('foo');
        }

        for (const child of this.children) {
          schedule(child.task.bind(child)).catch(() => {
            rejectSpy();

            if (this === tree) {
              resolve();
            }
          });
        }
      });

      // The testing promise is necessary here because otherwise this catch
      // will be considered as first. It leads to test failure because spies
      // aren't executed yet.
      return Promise.all([schedule(tree.task.bind(tree)), promise]).catch(e => {
        expect(e.message).toBe('foo');
        expect(rejectSpy).toHaveBeenCalledTimes(2);
      });
    });
  });
};

export default testSchedule;
