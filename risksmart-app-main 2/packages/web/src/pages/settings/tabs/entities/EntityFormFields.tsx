import { Contributor_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledGroupAndUserContributorMultiSelect } from 'src/components/form/controlled-group-and-user-contributor-multi-select/ControlledGroupAndUserContributorMultiSelect';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';

const EntityFormFields: FC<{
  entities: { value: string; label: string }[] | undefined;
}> = ({ entities }) => {
  const { control } = useFormContext();

  return (
    <>
      <ControlledInput
        testId={'name'}
        name={'Name'}
        control={control}
        label={'Name'}
      />

      <ControlledInput
        name={'Description'}
        control={control}
        label={'Description'}
        testId={'description'}
      />

      <ControlledInput
        name={'Weight'}
        control={control}
        label={'Weight'}
        testId={'weight'}
      />

      <ControlledSelect
        name={'ParentId'}
        control={control}
        label={'Parent Entity'}
        options={entities}
        testId={'parent-entity'}
      />

      <ControlledGroupAndUserContributorMultiSelect
        name={'Owners'}
        control={control}
        label={'Default Owners'}
        includeGroups
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        testId={'default-owners'}
      />
    </>
  );
};

export default EntityFormFields;
