import { t } from 'i18next';
import { beforeEach, describe, expect, it } from 'vitest';

import { init, mergeCustomI18n } from './i18n';

describe('i18n', () => {
  beforeEach(async () => {
    await init();
  });

  it('can retrieve a common translation', () => {
    const result = t('yesOrNo.true');
    expect(result).toEqual('Yes');
  });

  it('common translations are deeply merged', () => {
    mergeCustomI18n({
      Library: null,
      Rating: null,
      Taxonomy: null,
      InternalAuditRating: null,
      Common: {
        yesOrNo: {
          true: 'Yes siree',
        },
      },
    });

    const result1 = t('yesOrNo.true');
    expect(result1).toEqual('Yes siree');

    const result2 = t('yesOrNo.false');
    expect(result2).toEqual('No');
  });
});
