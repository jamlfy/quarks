import { storeUse } from './use';

describe('storeUse', () => {
  it('should work', () => {
    expect(storeUse()).toEqual('store/use');
  });
});
