import UniversalRouter from 'universal-router';
import {createRouter} from '../src';

const createRouterTest = () => {
  describe('createRouter', () => {
    it('should create Universal Router instance', () => {
      const router = createRouter({});
      expect(router).toEqual(jasmine.any(UniversalRouter));
    });
  });
};

export default createRouterTest;
