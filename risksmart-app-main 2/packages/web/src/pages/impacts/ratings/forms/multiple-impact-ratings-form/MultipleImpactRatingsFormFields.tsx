import { useQuery } from '@apollo/client';
import Container from '@risk-smart/themed-cloudscape-components/container';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetImpactListQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetImpactListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import parse from 'html-react-parser';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { numberTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useRiskSmartForm } from 'src/components/form/form/customisable-form/RiskSmartFormContext';

import { TestIds } from './MultipleImpactRatingsFormFieldsTestIds';
import type { ImpactRatingsFormFieldData } from './MultipleImpactRatingsFormSchema';
import RadioBar from './radio-bar/RadioBar';
import styles from './style.module.scss';

const MultipleImpactRatingsFormFields: FC = () => {
  const { control, watch } = useFormContext<ImpactRatingsFormFieldData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatingsMultiple',
  });
  const ratings = watch('Ratings');

  const { data: impactData, loading } = useQuery(GetImpactListDocument);
  const impacts = impactData?.impact;
  const impactLookup = useMemo(
    () =>
      (impactData?.impact ?? []).reduce(
        (previous, current) => {
          previous[current.Id] = current;

          return previous;
        },
        {} as { [id: string]: GetImpactListQuery['impact'][number] }
      ),
    [impactData?.impact]
  );
  const [selectedImpactId, setSelectedImpactId] = useState<null | string>(null);
  const [hasRatingGuidance, setHasRatingGuidance] = useState<boolean>(false);

  useEffect(() => {
    if (impacts && impacts.length > 0) {
      setSelectedImpactId(impacts[0].Id);
    }
  }, [impacts]);

  const selectedImpact = selectedImpactId
    ? impactLookup[selectedImpactId]
    : null;

  const sanitisedRatingGuidance = useMemo(() => {
    setHasRatingGuidance(!!selectedImpact?.RatingGuidance);

    return parse(sanitizeHtml(selectedImpact?.RatingGuidance ?? ''));
  }, [selectedImpact]);

  const { options } = useRating('impact');
  const ratingsOptions = options.map((option) => ({
    ...option,
    value: String(option.value),
  }));

  const { options: likelihoodOptions } = useRating('likelihood');
  const likelihoodRadioOptions = likelihoodOptions.map((option) => ({
    ...option,
    value: String(option.value),
  }));

  const { editMode } = useRiskSmartForm();
  const editModePadding = editMode ? 'p-0' : 'pb-6';

  return (
    <>
      {loading ? (
        <div className={'flex w-full h-[53vh] items-center justify-center'}>
          <Spinner size={'large'} />
        </div>
      ) : (
        <CustomisableFieldWrapper>
          <ControlledGroupAndUserSelect
            testId={TestIds.CompletedBy}
            key={'completion-by'}
            defaultRequired={true}
            name={'CompletedBy'}
            label={st('fields.CompletedBy')}
            description={st('fields.CompletedBy_help')}
            control={control}
            includeGroups={false}
            addEmptyOption={true}
          />

          <ControlledDatePicker
            testId={TestIds.TestDate}
            key={'testDate'}
            forceRequired={true}
            name={'TestDate'}
            label={st('fields.TestDate')}
            description={st('fields.TestDate_help')}
            control={control}
          />
          <div
            className={
              'pb-5 mb-5 border-0 border-b-[1.5px] border-solid border-grey150'
            }
            key={'Likelihood'}
          >
            <RadioBar label={st('fields.Likelihood')}>
              <ControlledRadioGroup<ImpactRatingsFormFieldData, number>
                testId={TestIds.Likelihood}
                label={''}
                hideLabel={true}
                forceRequired={true}
                name={'Likelihood'}
                control={control}
                transform={numberTransform}
                items={likelihoodRadioOptions}
              />
            </RadioBar>
          </div>
          <div
            className={`flex flex-col w-full ${editModePadding} gap-y-6`}
            key={'ratings'}
          >
            <div className={styles.radioList}>
              {ratings.map((rating, index) => (
                <RadioBar
                  label={impactLookup[rating.ImpactId].Name}
                  onClick={() => setSelectedImpactId(rating.ImpactId)}
                  key={`impact-rating-${index}`}
                >
                  <ControlledRadioGroup<ImpactRatingsFormFieldData, number>
                    testId={`${TestIds.Ratings}-${index}`}
                    key={`impact-rating-${index}`}
                    label={''}
                    hideLabel={true}
                    forceRequired={true}
                    name={`Ratings.${index}.Rating`}
                    control={control}
                    transform={numberTransform}
                    items={ratingsOptions}
                  />
                </RadioBar>
              ))}
            </div>
            {selectedImpact ? (
              <Container>
                <div className={styles.expandable}>
                  <ExpandableSection
                    headerText={`${st('rating_guidance_description')}: ${
                      selectedImpact.Name
                    }`}
                    defaultExpanded={true}
                  >
                    <div className={'pt-4 px-3'}>
                      <TextContent>
                        {hasRatingGuidance
                          ? sanitisedRatingGuidance
                          : st('no_rating_guidance')}
                      </TextContent>
                    </div>
                  </ExpandableSection>
                </div>
              </Container>
            ) : null}
          </div>
        </CustomisableFieldWrapper>
      )}
    </>
  );
};

export default MultipleImpactRatingsFormFields;
