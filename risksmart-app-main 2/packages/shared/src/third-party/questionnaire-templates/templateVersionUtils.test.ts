import { nextTemplateVersion } from './templateVersionUtils';

describe('fileVersionUtils', () => {
  describe('nextTemplateVersion', () => {
    it('returns 0.1 if no previous version exists', () => {
      const nextVersion = nextTemplateVersion(undefined);
      expect(nextVersion).toEqual('0.1');
    });

    it('returns "" if the previous version is not a number', () => {
      const nextVersion = nextTemplateVersion('current');
      expect(nextVersion).toEqual('');
    });

    it('return 0.1 more then the previous version if its a number', () => {
      const nextVersion = nextTemplateVersion('6.6');
      expect(nextVersion).toEqual('6.7');
    });
  });
});
