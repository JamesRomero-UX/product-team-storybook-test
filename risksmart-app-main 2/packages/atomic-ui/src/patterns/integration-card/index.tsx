import type * as React from 'react';

import { Badge } from '../../components/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { cn } from '../../lib/utils';

export interface IntegrationCardLang {
  getStarted: string;
  comingSoon: string;
  earlyAccess: string;
  contactMessage: string;
}

export interface IntegrationCardProps extends Omit<
  React.ComponentProps<typeof Card>,
  'children' | 'lang'
> {
  name: string;
  description: string;
  content?: string;
  iconUrl: string;
  lang: IntegrationCardLang;
  isComingSoon?: boolean;
  isDisabled?: boolean;
}

function IntegrationCard({
  name,
  description,
  content,
  iconUrl,
  lang,
  isComingSoon,
  isDisabled,
  className,
  ...rest
}: IntegrationCardProps) {
  const isActive = !isComingSoon && !isDisabled;

  const badge = isComingSoon ? (
    <Badge variant={'muted'} size={'md'}>
      {lang.comingSoon}
    </Badge>
  ) : isActive ? (
    <Badge variant={'primary'} size={'md'}>
      {lang.earlyAccess}
    </Badge>
  ) : null;

  return (
    <Card
      className={cn(
        'h-[250px]',
        (isDisabled || isComingSoon) && 'opacity-70',
        isActive && 'cursor-pointer',
        className
      )}
      {...rest}
    >
      <CardHeader>
        <CardTitle className={'text-lg'}>
          <div className={'flex items-center gap-2'}>
            <img
              src={iconUrl}
              alt={''}
              width={28}
              height={28}
              className={'shrink-0'}
            />
            {name}
          </div>
        </CardTitle>
        {badge && <CardAction>{badge}</CardAction>}
        <CardDescription className={'text-base text-foreground/70'}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'flex-1 overflow-hidden text-base',
          isActive ? 'text-foreground/60' : 'text-muted-foreground/60'
        )}
      >
        {content}
      </CardContent>
      <CardFooter>
        {isActive && (
          <span className={'text-base font-medium text-primary'}>
            {lang.getStarted}
          </span>
        )}
        {isDisabled && (
          <p className={'text-xs text-muted-foreground/60'}>
            {lang.contactMessage}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

export { IntegrationCard };
