import { webhook } from './webhook';

describe('webhook', () => {
  it('should work', () => {
    expect(webhook()).toEqual('webhook');
  });
});
