import Link from '@risksmart-app/components/src/link';
import { colours } from '@risksmart-app/components/src/utils/colours';
import { LinkExternal01 } from '@untitled-ui/icons-react';
import type { FC } from 'react';

import SimpleRatingBadge from '../simple-rating-badge';

export interface Props {
  id: string;
  onClick?: (id: string) => void;
}

const InformationBox: FC<Props> = ({ id }) => {
  return (
    <div
      className={
        'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2 text-xs'
      }
      key={`lr-${id}`}
    >
      <div className={'grid grid-cols-2 gap-4 w-full'}>
        <div className={'col-span-2 w-full'}>
          <SimpleRatingBadge
            rating={{
              label: 'Updated',
              color: colours['light-green'].backgroundColor,
            }}
          />
        </div>

        <span className={'font-semibold text-gray-400'}>
          {'Regulatory body: '}
        </span>
        <span className={'flex justify-end'}>
          <SimpleRatingBadge
            rating={{
              label: 'FCA',
              color: colours['light-gray'].backgroundColor,
            }}
          />
        </span>

        <span className={'font-semibold text-gray-400'}>{'Rule number: '}</span>
        <Link
          className={'!flex !justify-end !text-xs'}
          href={`${id}`}
          target={'_blank'}
        >
          {'I7 CFR 2014-92 '}&nbsp; <LinkExternal01 width={14} height={14} />
        </Link>

        <span className={'font-semibold text-gray-400'}>
          {'Effective date: '}
        </span>
        <span className={'flex justify-end'}>{'01/01/2024'}</span>
      </div>
    </div>
  );
};

export const SourceRegulationInformation: FC<Props> = ({ onClick, id }) => {
  return (
    <div
      className={`p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
    >
      <span className={'m-0 font-semibold text-grey500'}>
        {'Source Regulation Information'}
      </span>
      <InformationBox onClick={onClick} id={id} />
    </div>
  );
};

export default SourceRegulationInformation;
