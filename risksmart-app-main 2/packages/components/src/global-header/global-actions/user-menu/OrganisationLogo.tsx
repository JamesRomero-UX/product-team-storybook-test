import type { FC } from 'react';
import { useCallback, useState } from 'react';

interface Props {
  logoKey: string | undefined;
  customLogoUrl?: () => Promise<string>;
  size?: 'small' | 'large';
}

const OrganisationLogo: FC<Props> = ({ logoKey, customLogoUrl, size }) => {
  const [src, setSrc] = useState(
    () =>
      window.sessionStorage.getItem('logo') ??
      `/organisation/${logoKey}/logo.jpg`
  );

  const getCustomLogo = useCallback(async () => {
    window.sessionStorage.removeItem('logo');
    // use this as fallback if customLogoUrl fails
    setSrc(`/organisation/default/logo.jpg`);
    try {
      if (!customLogoUrl) {
        return;
      }
      const cached = window.sessionStorage.getItem('logo');
      if (cached) {
        setSrc(cached);
      } else {
        const customSrc = await customLogoUrl();
        window.sessionStorage.setItem('logo', customSrc);
        setSrc(customSrc);
      }
    } catch (e) {
      console.error("Couldn't get custom logo", e);
    }
  }, [customLogoUrl]);

  if (!logoKey) {
    return <></>;
  }

  const sizeClasses = size === 'small' ? 'size-8' : 'w-[44px] h-[44px]';

  return (
    <div className={sizeClasses}>
      <img
        alt={'Organisation logo'}
        src={src}
        className={`w-full h-full rounded-full object-cover`}
        onError={getCustomLogo}
      />
    </div>
  );
};

export default OrganisationLogo;
