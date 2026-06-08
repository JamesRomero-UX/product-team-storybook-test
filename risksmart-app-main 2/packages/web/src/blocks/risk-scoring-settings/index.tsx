import {
  Alert,
  AlertDescription,
  AlertHeader,
  AlertInfo,
  AlertStatus,
  AlertSubtitle,
  AlertTitle,
  Badge,
  Button,
  cn,
  Icon,
  RatingItem,
  RatingItemAction,
  RatingItemBadge,
  RatingItemContent,
  RatingItemDescription,
  RatingItemTitle,
  RatingsAccordion,
  RatingsAccordionContent,
  RatingsAccordionItem,
  RatingsAccordionTrigger,
  RatingsMatrix,
  SelectableCard,
  SelectableCardAction,
  SelectableCardDescription,
  SelectableCardFooter,
  SelectableCardHeader,
  SelectableCardStatus,
  SelectableCardTitle,
  Separator,
  Switch,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from '@risksmart-app/atomic-ui';

import type {
  RiskScoringSettingsActions,
  RiskScoringSettingsLang,
  RiskScoringSettingsState,
} from './types';

export interface RiskScoringSettingsProps {
  lang: RiskScoringSettingsLang;
  state: RiskScoringSettingsState;
  actions: RiskScoringSettingsActions;
}

function RiskScoringSettings({
  lang,
  state,
  actions,
}: RiskScoringSettingsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-6')}>
      <Alert
        className={'col-span-2'}
        variant={state.changeStatus !== 'none' ? 'warning' : 'active'}
      >
        <AlertStatus
          variant={state.changeStatus !== 'none' ? 'warning' : 'active'}
        />
        <AlertHeader>
          <AlertTitle>{lang.alert.title}</AlertTitle>
          <AlertSubtitle>
            {state.selectedMethodology === 'multi-impact'
              ? lang.alert.subtitle.multiImpact
              : lang.alert.subtitle.impactLikelihood}
          </AlertSubtitle>
        </AlertHeader>
        <AlertDescription>
          {state.changeStatus === 'structural'
            ? lang.alert.description.pendingNewVersion
            : state.changeStatus === 'cosmetic'
              ? lang.alert.description.pending
              : lang.alert.description.default}
        </AlertDescription>
      </Alert>

      <div className={'flex flex-col gap-0.5 col-span-2'}>
        <Text preset={'heading-sm'} className={'text-primary'}>
          {lang.page.header}
        </Text>
        <Text className={'text-muted-foreground'}>{lang.page.description}</Text>
      </div>

      <SelectableCard
        enabled={true}
        selected={state.selectedMethodology === 'impact-likelihood'}
        onClick={() => actions.onSelectedMethodologyChange('impact-likelihood')}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {lang.impactLikelihoodCard.title}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {lang.impactLikelihoodCard.description}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge
              size={'sm'}
              variant={state.isImpactLikelihoodComplete ? 'success' : 'warning'}
            >
              {state.isImpactLikelihoodComplete
                ? lang.impactLikelihoodCard.selectedBadge
                : lang.impactLikelihoodCard.setupBadge}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <div className={'flex flex-col gap-4'}>
          <Separator />
          <SelectableCardFooter>
            <AlertStatus variant={'active'} />
            <SelectableCardStatus>
              {lang.impactLikelihoodCard.selectedAlert}
            </SelectableCardStatus>
          </SelectableCardFooter>
        </div>
      </SelectableCard>

      <SelectableCard
        enabled={state.isMultiImpactEnabled}
        selected={state.selectedMethodology === 'multi-impact'}
        onClick={() => actions.onSelectedMethodologyChange('multi-impact')}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {lang.multiImpactCard.title}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {lang.multiImpactCard.description}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge
              size={'sm'}
              variant={
                !state.isMultiImpactEnabled
                  ? 'muted'
                  : state.isMultiImpactComplete
                    ? 'success'
                    : 'warning'
              }
            >
              {!state.isMultiImpactEnabled
                ? lang.multiImpactCard.unselectedBadge
                : state.isMultiImpactComplete
                  ? lang.multiImpactCard.selectedBadge
                  : lang.multiImpactCard.setupBadge}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus
            variant={state.isMultiImpactEnabled ? 'active' : 'inactive'}
          />
          <SelectableCardStatus>
            {state.isMultiImpactEnabled
              ? lang.multiImpactCard.selectedAlert
              : lang.multiImpactCard.unselectedAlert}
          </SelectableCardStatus>
          <Switch
            checked={state.isMultiImpactEnabled}
            onCheckedChange={(checked) => {
              actions.onMultiImpactEnabledChange(checked);
              actions.onSelectedMethodologyChange(
                checked ? 'multi-impact' : 'impact-likelihood'
              );
            }}
            aria-label={'Toggle Configure multi impacts'}
            size={'lg'}
          />
        </SelectableCardFooter>
      </SelectableCard>

      {state.selectedMethodology === 'multi-impact' && (
        <RatingsAccordion
          className={'col-span-2'}
          defaultValue={['multi-impact-categories']}
        >
          <RatingsAccordionItem value={'multi-impact-categories'}>
            <RatingsAccordionTrigger
              title={lang.impactCategories.title}
              itemCount={state.impactCategories.length}
              isComplete={state.isImpactCategoriesComplete}
              description={lang.impactCategories.description}
            />
            <RatingsAccordionContent>
              <div className={'flex flex-col gap-4'}>
                <ImpactAggregationToggle
                  lang={lang}
                  value={state.impactAggregation}
                  onValueChange={actions.onImpactAggregationChange}
                />
                <div className={'flex flex-col gap-2'}>
                  {state.impactCategories.map((category) => (
                    <CategoryRow
                      key={category.name}
                      name={category.name}
                      color={category.color}
                      onEdit={() => actions.onEditImpactCategory(category)}
                      onDelete={() =>
                        actions.onDeleteImpactCategory(category.name)
                      }
                    />
                  ))}
                  <Button
                    style={'dashed'}
                    radius={'xl'}
                    elevated
                    onClick={actions.onAddImpactCategory}
                    className={
                      'border-secondary bg-secondary-minimal h-[60px] w-full'
                    }
                  >
                    <Icon name={'plus'} />
                    {lang.impactCategories.addButton}
                  </Button>
                </div>
              </div>
            </RatingsAccordionContent>
          </RatingsAccordionItem>
        </RatingsAccordion>
      )}

      {state.selectedMethodology === 'impact-likelihood' && (
        <RatingsAccordion
          className={'col-span-2'}
          defaultValue={['likelihood-levels']}
        >
          <RatingsAccordionItem value={'likelihood-levels'}>
            <RatingsAccordionTrigger
              title={lang.likelihoodLevels.title}
              itemCount={state.likelihoodLevels.length}
              isComplete={state.isLikelihoodLevelsComplete}
              description={lang.likelihoodLevels.description}
            />
            <RatingsAccordionContent>
              <div className={'flex flex-col gap-2'}>
                {state.likelihoodLevels.map((level) => (
                  <RatingRow
                    key={level.value}
                    value={level.value}
                    title={level.title}
                    description={level.description}
                    color={level.color}
                    onDelete={() =>
                      actions.onDeleteLikelihoodLevel(level.value)
                    }
                    onEdit={() => actions.onEditLikelihoodLevel(level)}
                  />
                ))}
                <Button
                  style={'dashed'}
                  radius={'xl'}
                  elevated
                  onClick={actions.onAddLikelihoodLevel}
                  className={
                    'border-secondary bg-secondary-minimal h-[60px] w-full'
                  }
                >
                  <Icon name={'plus'} />
                  {lang.likelihoodLevels.addButton}
                </Button>
              </div>
            </RatingsAccordionContent>
          </RatingsAccordionItem>

          <RatingsAccordionItem value={'impact-levels'}>
            <RatingsAccordionTrigger
              title={lang.impactLevels.title}
              itemCount={state.impactLevels.length}
              isComplete={state.isImpactLevelsComplete}
              description={lang.impactLevels.description}
            />
            <RatingsAccordionContent>
              <div className={'flex flex-col gap-2'}>
                {state.impactLevels.map((level) => (
                  <RatingRow
                    key={level.value}
                    value={level.value}
                    title={level.title}
                    description={level.description}
                    color={level.color}
                    onDelete={() => actions.onDeleteImpactLevel(level.value)}
                    onEdit={() => actions.onEditImpactLevel(level)}
                  />
                ))}
                <Button
                  style={'dashed'}
                  radius={'xl'}
                  elevated
                  onClick={actions.onAddImpactLevel}
                  className={
                    'border-secondary bg-secondary-minimal h-[60px] w-full'
                  }
                >
                  <Icon name={'plus'} />
                  {lang.impactLevels.addButton}
                </Button>
              </div>
            </RatingsAccordionContent>
          </RatingsAccordionItem>

          <Separator className={'my-4'} />

          <RatingsAccordionItem value={'risk-matrix'}>
            <RatingsAccordionTrigger
              title={lang.matrix.title}
              isComplete={state.isMatrixComplete}
              description={lang.matrix.description}
            />
            <RatingsAccordionContent>
              <div className={'flex flex-col gap-4'}>
                <Alert variant={'active'} size={'sm'}>
                  <AlertInfo />
                  <AlertHeader>
                    <AlertTitle>{lang.matrix.alert.description}</AlertTitle>
                  </AlertHeader>
                </Alert>
                <InvertMatrixToggle
                  lang={lang}
                  checked={state.isMatrixInverted}
                  onCheckedChange={actions.onInvertMatrixChange}
                />
                <RatingsMatrix
                  likelihoodRatings={state.likelihoodLevels.map((l) => ({
                    title: l.title,
                    value: l.value,
                    color: l.color,
                  }))}
                  impactRatings={state.impactLevels.map((i) => ({
                    title: i.title,
                    value: i.value,
                    color: i.color,
                  }))}
                  matrix={state.matrix}
                  inverted={state.isMatrixInverted}
                  onCellClick={actions.onEditMatrixCell}
                />
              </div>
            </RatingsAccordionContent>
          </RatingsAccordionItem>
        </RatingsAccordion>
      )}
    </div>
  );
}

function RatingRow({
  value,
  title,
  description,
  color,
  onDelete,
  onEdit,
}: {
  value: number;
  title: string;
  description: string;
  color: string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className={'flex gap-2'}>
      <RatingItem color={color} onClick={onEdit}>
        <RatingItemBadge>{value}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{title}</RatingItemTitle>
          <RatingItemDescription>{description}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'md'} />
        </RatingItemAction>
      </RatingItem>
      <Button
        variant={'destructive'}
        style={'outline'}
        radius={'xl'}
        className={'size-[60px]'}
        onClick={onDelete}
        aria-label={`Delete ${title}`}
      >
        <Icon name={'trash-01'} size={'md'} />
      </Button>
    </div>
  );
}

function CategoryRow({
  name,
  color,
  onEdit,
  onDelete,
}: {
  name: string;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={'flex gap-2'}>
      <RatingItem color={color} onClick={onEdit}>
        <RatingItemContent>
          <RatingItemTitle className={'text-lg'}>{name}</RatingItemTitle>
        </RatingItemContent>
        <RatingItemAction className={'cursor-pointer'}>
          <Icon name={'pencil-01'} size={'md'} />
        </RatingItemAction>
      </RatingItem>
      <Button
        variant={'destructive'}
        style={'outline'}
        radius={'xl'}
        className={'size-[60px]'}
        onClick={onDelete}
        aria-label={`Delete ${name}`}
      >
        <Icon name={'trash-01'} size={'md'} />
      </Button>
    </div>
  );
}

function InvertMatrixToggle({
  lang,
  checked,
  onCheckedChange,
}: {
  lang: RiskScoringSettingsLang;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={
        'flex items-center justify-between rounded-lg border border-neutral-border px-3 gap-2 h-[50px]'
      }
    >
      <span className={'text-base font-bold text-primary'}>
        {lang.invertMatrixToggle.title}
      </span>
      <span className={'flex-1 text-base font-medium text-neutral-active'}>
        {checked
          ? lang.invertMatrixToggle.checked
          : lang.invertMatrixToggle.unchecked}
      </span>
      <Switch
        size={'md'}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={'Invert Axis'}
      />
    </div>
  );
}

function ImpactAggregationToggle({
  lang,
  value,
  onValueChange,
}: {
  lang: RiskScoringSettingsLang;
  value: 'average' | 'maximum';
  onValueChange: (aggregation: 'average' | 'maximum') => void;
}) {
  return (
    <div className={'flex flex-col gap-2'}>
      <Text preset={'heading-sm'} className={'text-lg text-primary'}>
        {lang.impactAggregation.title}
      </Text>
      <div
        className={
          'flex items-center justify-between rounded-lg border border-neutral-border px-3 gap-2 h-[64px]'
        }
      >
        <span className={'flex-1 text-base font-bold text-primary'}>
          {value === 'average'
            ? lang.impactAggregation.description.average
            : lang.impactAggregation.description.maximum}
        </span>
        <ToggleGroup
          value={[value]}
          onValueChange={(newValue) => {
            if (newValue.length > 0) {
              onValueChange(newValue[0] as 'average' | 'maximum');
            }
          }}
        >
          <ToggleGroupItem value={'average'}>
            {lang.impactAggregation.averageLabel}
          </ToggleGroupItem>
          <ToggleGroupItem value={'maximum'}>
            {lang.impactAggregation.maximumLabel}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

export type { MatrixCell } from '@risksmart-app/atomic-ui';

export { RiskScoringSettings };
