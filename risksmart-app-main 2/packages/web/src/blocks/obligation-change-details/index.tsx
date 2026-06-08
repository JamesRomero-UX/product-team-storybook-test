import {
  Badge,
  BadgeCard,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
} from '@risksmart-app/atomic-ui';

import type {
  ObligationChangeDetailsLang,
  ObligationChangeDetailsState,
} from './types';

export interface ObligationChangeDetailsProps {
  lang: ObligationChangeDetailsLang;
  state: ObligationChangeDetailsState;
}

function ObligationChangeDetails({
  state: {
    currentDescription,
    currentVersion,
    upcomingDescription,
    upcomingVersion,
    effectiveDate,
    status,
    regulatoryBody,
    referenceCode,
    tags,
  },
  lang: {
    cards: { details, current, upcoming },
    status: { unread: unreadLabel, read: readLabel },
    details: {
      status: statusLabel,
      effectiveDate: effectiveDateLabel,
      regulatoryBody: regulatoryBodyLabel,
      referenceCode: referenceCodeLabel,
      tags: tagsLabel,
    },
  },
}: ObligationChangeDetailsProps) {
  return (
    <div className={cn('grid grid-cols-5 gap-6')}>
      {(currentDescription || currentVersion) && (
        <div className={'col-span-2'}>
          <BadgeCard
            title={currentVersion}
            variant={'neutral'}
            badgeLabel={current}
            description={currentDescription}
          />
        </div>
      )}
      <div
        className={
          currentDescription || currentVersion ? 'col-span-2' : 'col-span-4'
        }
      >
        <BadgeCard
          title={upcomingVersion}
          variant={'warning'}
          badgeLabel={upcoming}
          description={upcomingDescription}
        />
      </div>
      <div className={'col-span-1'}>
        <Card>
          <CardHeader>
            <CardTitle>{details}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl
              className={
                'flex flex-col gap-2 [&_dd]:flex [&_dd]:flex-col [&_dd]:gap-2 [&_dd]:w-full [&_dd]:m-0 [&_dt]:font-semibold [&_dt]:text-neutral-500 [&_dd]:bg-neutral-100 [&_dd]:p-2 [&_dd]:rounded [&_dd]:border-solid [&_dd]:border [&_dd]:border-neutral-border'
              }
            >
              <dt>{`${statusLabel}:`}</dt>

              {status === 'read' ? (
                <Badge variant={'success'} border={true}>
                  {readLabel}
                </Badge>
              ) : (
                <Badge variant={'warning'} border={true}>
                  {unreadLabel}
                </Badge>
              )}

              <dt>{`${effectiveDateLabel}:`}</dt>
              <dd>{effectiveDate}</dd>

              <dt>{`${regulatoryBodyLabel}:`}</dt>
              <dd>{regulatoryBody}</dd>

              <dt>{`${referenceCodeLabel}:`}</dt>
              <dd>{referenceCode}</dd>

              <dt>{`${tagsLabel}:`}</dt>
              <dd>{tags?.join(', ')}</dd>
            </dl>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}

export { ObligationChangeDetails };
