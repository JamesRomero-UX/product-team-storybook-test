import { test } from '@playwright/test';

interface Organization {
  name: string;
  orgKey: string;
}

export const OrganizationPool: Organization[] = [
  { name: 'Test Organization 1', orgKey: 'org_Qshp7tYsxxAWwhVa' },
  { name: 'Test Organization 2', orgKey: 'org_Wry1ylTIzMeSDBkT' },
  { name: 'Test Organization 3', orgKey: 'org_weM43nU7Ac58JzHL' },
  { name: 'Test Organization 4', orgKey: 'org_o2dH1p42UjGrBaYU' },
  { name: 'Test Organization 5', orgKey: 'org_3M30tDxIkHGml9Lj' },
  { name: 'Test Organization 6', orgKey: 'org_x1k5b5rI81SrERhj' },
  { name: 'Test Organization 7', orgKey: 'org_CXY5CU84ik89hpme' },
  { name: 'Test Organization 8', orgKey: 'org_xDKQuocuDTTcspRO' },
];

export const getOrganisation = () => {
  const parallelIndex = test.info().parallelIndex;
  const organisation = OrganizationPool[test.info().parallelIndex];
  if (!organisation) {
    throw new Error(
      `Not organisation found for for parallelIndex ${parallelIndex}`
    );
  }

  return organisation;
};
