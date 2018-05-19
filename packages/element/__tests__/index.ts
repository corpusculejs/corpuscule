import './decorators';
import lifecycle from './lifecycle';
import observableFields from './observableFields';

const timeRemaining = () => 1;

describe('CorpusculeElement', () => {
  beforeAll(() => {
    spyOn(window as any, 'requestIdleCallback').and.callFake((next: Function) => {
      next({timeRemaining});
    });
  });

  afterEach(() => {
    const {body} = document;

    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });

  lifecycle();
  observableFields();
});
