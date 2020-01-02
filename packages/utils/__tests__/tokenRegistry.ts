import createTokenRegistry from '../src/tokenRegistry';

describe('@corpuscule/utils', () => {
  describe('createTokenRegistry', () => {
    it('creates token creator and a store connected with it', () => {
      const [createToken, tokenRegistry] = createTokenRegistry(() => []);

      const token = createToken();
      expect(tokenRegistry.get(token)).toEqual(jasmine.any(Array));
    });

    it('allows inheritance for token creators', () => {
      const [createToken1, tokenRegistry1] = createTokenRegistry(() => []);
      const [createToken2, tokenRegistry2] = createTokenRegistry(
        () => ({}),
        createToken1,
      );

      const token = createToken2();

      expect(tokenRegistry1.get(token)).toEqual(jasmine.any(Array));
      expect(tokenRegistry2.get(token)).toEqual(jasmine.any(Object));
    });
  });
});
