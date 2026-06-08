import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertControlParents } from '../clients/controlParentClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildControl } from '../data/control';
import { buildControlParent } from '../data/controlParent';
import { buildRisk, buildUpdateChildRisk } from '../data/risk';
import { buildTestResult } from '../data/testResult';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('node ancestors', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('should return inserted item with id for both Id and AncestorId (so items without parents can still be viewed!)', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      const nodeAncestors = await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      const nodeAncestorArray = nodeAncestors.node_ancestor.map((nd) => [
        nd.Id,
        nd.AncestorId,
      ]);

      expect(nodeAncestorArray).toEqual([[risk.Id, risk.Id]]);
    });

    it('should return a record for child parent relationships', async () => {
      const parentRisk = buildRisk({});

      const childRisk = buildRisk({
        ParentRiskId: parentRisk.Id,
        Tier: 2,
      });
      await apiClient.insertRisk({ objects: parentRisk });
      await apiClient.insertRisk({ objects: childRisk });

      const nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      expect(nodeAncestors.node_ancestor.length).toEqual(3);
      // child & child
      // parent & parent
      // child & parent

      const childParentRelationship = nodeAncestors.node_ancestor.find(
        (na) => na.Id === childRisk.Id && na.AncestorId === parentRisk.Id
      );
      expect(childParentRelationship).toBeDefined();
    });

    it('should return a record for child ancestor relationships', async () => {
      const parentRisk = buildRisk({});

      const childRisk = buildRisk({
        ParentRiskId: parentRisk.Id,
        Tier: 2,
      });

      const grandChildRisk = buildRisk({
        ParentRiskId: childRisk.Id,
        Tier: 3,
      });
      await apiClient.insertRisk({ objects: parentRisk });
      await apiClient.insertRisk({ objects: childRisk });
      await apiClient.insertRisk({ objects: grandChildRisk });

      const nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });

      const grandChildParentRelationship = nodeAncestors.node_ancestor.find(
        (na) => na.Id === grandChildRisk.Id && na.AncestorId === parentRisk.Id
      );
      expect(grandChildParentRelationship).toBeDefined();
    });

    it('should join two separate hierarchy trees', async () => {
      // Separate tree
      const parentRiskOther = buildRisk({});
      const childRiskOther = buildRisk({
        ParentRiskId: parentRiskOther.Id,
        Tier: 2,
      });

      const grandChildRiskOther = buildRisk({
        ParentRiskId: childRiskOther.Id,
        Tier: 3,
      });
      await apiClient.insertRisk({ objects: parentRiskOther });
      await apiClient.insertRisk({ objects: childRiskOther });
      await apiClient.insertRisk({
        objects: grandChildRiskOther,
      });

      // Tree 1
      const parentRisk = buildRisk({});
      const childRisk = buildRisk({
        ParentRiskId: parentRisk.Id,
        Tier: 2,
      });

      const grandChildRisk = buildRisk({
        ParentRiskId: childRisk.Id,
        Tier: 3,
      });
      await apiClient.insertRisk({ objects: parentRisk });
      await apiClient.insertRisk({ objects: childRisk });
      await apiClient.insertRisk({ objects: grandChildRisk });

      // Tree 2
      const control = buildControl();
      await apiClient.insertControl({ objects: control });

      const testResult = buildTestResult({ ParentControlId: control.Id });
      await apiClient.insertTestResults({ objects: testResult });

      // Join the trees
      await insertControlParents({
        objects: [
          buildControlParent({
            ControlId: control.Id,
            ParentId: grandChildRisk.Id,
          }),
        ],
      });

      const nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });

      const testResultParentRisk = nodeAncestors.node_ancestor.find(
        (na) => na.Id === testResult.Id && na.AncestorId === parentRisk.Id
      );
      expect(testResultParentRisk).toBeDefined();

      const testResultParentRiskOther = nodeAncestors.node_ancestor.find(
        (na) => na.Id === testResult.Id && na.AncestorId === parentRiskOther.Id
      );
      expect(testResultParentRiskOther).not.toBeDefined();
    });

    it('Removes records joining descendants and ancestors of a deleted link where no other link between nodes exist', async () => {
      const parentRisk = buildRisk({});
      const childRisk = buildRisk({
        ParentRiskId: parentRisk.Id,
        Tier: 2,
      });

      const grandChildRisk = buildRisk({
        ParentRiskId: childRisk.Id,
        Tier: 3,
      });
      await apiClient.insertRisk({ objects: parentRisk });
      await apiClient.insertRisk({ objects: childRisk });
      await apiClient.insertRisk({ objects: grandChildRisk });

      const control = buildControl();
      await apiClient.insertControl({ objects: control });
      await insertControlParents({
        objects: [
          buildControlParent({
            ControlId: control.Id,
            ParentId: grandChildRisk.Id,
          }),
        ],
      });

      let nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      expect(nodeAncestors.node_ancestor.length).toEqual(10);

      let grandChildLink = nodeAncestors.node_ancestor.find(
        (na) => na.Id === grandChildRisk.Id && na.AncestorId === childRisk.Id
      );
      expect(grandChildLink).toBeDefined();

      let controlToTier1 = nodeAncestors.node_ancestor.find(
        (na) => na.Id === control.Id && na.AncestorId === parentRisk.Id
      );
      expect(controlToTier1).toBeDefined();

      await apiClient.updateChildRisk(
        {
          object: buildUpdateChildRisk({
            Id: grandChildRisk.Id!,
            ParentRiskId: null,
            Tier: 1,
            Title: 'updated',
            Description: 'Description updated',
          }),
        },
        { user: riskManagerUser1 }
      );

      nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      expect(nodeAncestors.node_ancestor.length).toEqual(6);

      grandChildLink = nodeAncestors.node_ancestor.find(
        (na) => na.Id === grandChildRisk.Id && na.AncestorId === childRisk.Id
      );
      // Direct link broken
      expect(grandChildLink).toBeUndefined();

      controlToTier1 = nodeAncestors.node_ancestor.find(
        (na) => na.Id === control.Id && na.AncestorId === parentRisk.Id
      );

      // Indirect links broken
      expect(controlToTier1).toBeUndefined();
    });

    it('Does NOT removed links between descendants and ancestors of a deleted link where another link between nodes exist', async () => {
      const parentRisk = buildRisk({});
      const childRisk = buildRisk({
        ParentRiskId: parentRisk.Id,
        Tier: 2,
      });

      const grandChildRisk = buildRisk({
        ParentRiskId: childRisk.Id,
        Tier: 3,
      });
      const grandChildRisk2 = buildRisk({
        ParentRiskId: childRisk.Id,
        Tier: 3,
      });
      await apiClient.insertRisk({ objects: parentRisk });
      await apiClient.insertRisk({ objects: childRisk });
      await apiClient.insertRisk({ objects: grandChildRisk });
      await apiClient.insertRisk({ objects: grandChildRisk2 });

      const control = buildControl();
      await apiClient.insertControl({ objects: control });
      await insertControlParents({
        objects: [
          buildControlParent({
            ControlId: control.Id,
            ParentId: grandChildRisk.Id,
          }),
          buildControlParent({
            ControlId: control.Id,
            ParentId: grandChildRisk2.Id,
          }),
        ],
      });

      let nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      expect(nodeAncestors.node_ancestor.length).toEqual(14);

      let grandChildLink = nodeAncestors.node_ancestor.find(
        (na) => na.Id === grandChildRisk.Id && na.AncestorId === childRisk.Id
      );
      expect(grandChildLink).toBeDefined();

      let controlToTier1 = nodeAncestors.node_ancestor.find(
        (na) => na.Id === control.Id && na.AncestorId === parentRisk.Id
      );
      expect(controlToTier1).toBeDefined();

      await apiClient.updateChildRisk(
        {
          object: buildUpdateChildRisk({
            Id: grandChildRisk.Id!,
            ParentRiskId: null,
            Tier: 1,
            Title: 'updated',
            Description: 'Description updated',
          }),
        },
        { user: riskManagerUser1 }
      );

      nodeAncestors = await await apiClient.getNodeAncestors({
        orgKey: getDefaultOrgId(),
      });
      expect(nodeAncestors.node_ancestor.length).toEqual(12);

      grandChildLink = nodeAncestors.node_ancestor.find(
        (na) => na.Id === grandChildRisk.Id && na.AncestorId === childRisk.Id
      );
      // Direct link broken
      expect(grandChildLink).toBeUndefined();

      controlToTier1 = nodeAncestors.node_ancestor.find(
        (na) => na.Id === control.Id && na.AncestorId === parentRisk.Id
      );

      // Indirect links NOT broken
      expect(controlToTier1).toBeDefined();
    });
  });
});
