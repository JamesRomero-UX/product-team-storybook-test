import { type ComponentProps } from 'react';

import { Badge } from '../../components/badge';
import type { BorderVariant } from '../../components/badge/variants';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Text } from '../../components/text';

interface BadgeCardProps {
  variant?: BorderVariant;
  title?: string;
  badgeLabel: string;
  description?: string;
}

function BadgeCard({
  variant,
  title,
  badgeLabel,
  description,
}: ComponentProps<'div'> & BadgeCardProps) {
  return (
    <Card variant={variant} className={'h-full'}>
      <CardHeader variant={variant}>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Badge variant={variant} border={true}>
            {badgeLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text>{description}</Text>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

export { BadgeCard };
export type { BadgeCardProps };
