import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import type {
  CommandTypeNames,
  InitiateAsyncRequest,
} from '@risksmart-app/events/src/types/command-types';
import {
  AsyncRequestEvent,
  ObjectEvent,
  PermissionsEvent,
} from '@risksmart-app/events/src/types/common';
import type {
  CreateAssessmentRequest,
  CreateIssueAssessmentRequest,
  CreateIssueRequest,
  DeleteAppetitesRequest,
  DeleteIndicatorResultsRequest,
  DeleteIndicatorsRequest,
  DeleteRiskRequest,
  DeleteTestResultsRequest,
  RequestTypes,
  UpdateAcceptanceRequest,
  UpdateAppetiteRequest,
  UpdateIndicatorRequest,
  UpdateIndicatorResultRequest,
  UpdateRiskRequest,
  UpdateTestResultRequest,
} from '@risksmart-app/events/src/types/request-types';
import type { StateUpdaterInput } from 'src/event-store/db/processor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InputEventTypes } from '../aggregator/inputs';
import type { OutputEventTypes } from '../aggregator/outputs';
import type { RequestState } from '../aggregator/types';
import { RequestStateTaskStatus } from '../aggregator/types';
import { initiateAsyncRequestRule } from './initiate-async-request.rule';

describe('initiateAsyncRequestRule', () => {
  const mockPublish = vi.fn();

  const createMockInput = (
    state: RequestState,
    subType: CommandTypeNames,
    request: RequestTypes
  ): StateUpdaterInput<
    RequestState,
    InputEventTypes,
    OutputEventTypes,
    InitiateAsyncRequest<RequestTypes>
  > => ({
    state,
    current: {
      type: AsyncRequestEvent.InitiateAsyncRequest,
      data: {
        subType,
        request,
      },
      metadata: {
        eventId: 'test-event-id',
        version: '1.0',
        timestamp: '2025-09-30T10:00:00Z',
        domain: 'test',
        service: 'test-service',
        correlationId: 'test-correlation-id',
        userId: 'test-user-id',
        tenant: 'test-tenant',
        orgKey: 'test-org',
      },
    },
    // Add the missing properties with mock values
    pastInboundEvents: [],
    newInboundEvents: [],
    all: [],
    currentIndex: 0,
    stateIndex: 0,
    publish: mockPublish,
  });

  const createMockState = (): RequestState => ({
    correlationId: '',
    tenant: '',
    orgKey: '',
    userId: '',
    tasks: {},
    response: undefined,
    error: undefined,
  });

  const createActionUpdateRequest = (): RequestTypes => ({
    Title: 'Test Action Update',
    Description: 'Test description for action update',
    ParentActionId: 'parent-action-456',
    CustomAttributeData: null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when subType is CREATE_ACTION_UPDATE', () => {
    it('should initialize state with correct metadata', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.correlationId).toBe('test-correlation-id');
      expect(result.tenant).toBe('test-tenant');
      expect(result.orgKey).toBe('test-org');
      expect(result.userId).toBe('test-user-id');
    });

    it('should set up correct tasks for CREATE_ACTION_UPDATE', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
    });

    it('should return the same state reference', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result).toBe(initialState); // Same reference
    });

    it('should preserve existing state properties that are not overwritten', () => {
      // Arrange
      const initialState = createMockState();
      initialState.response = 'existing response';
      initialState.error = 'existing error';
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.response).toBe('existing response');
      expect(result.error).toBe('existing error');
    });

    it('should overwrite existing tasks completely', () => {
      // Arrange
      const initialState = createMockState();
      initialState.tasks = {
        EXISTING_TASK: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectCreated,
        },
        ANOTHER_TASK: {
          status: RequestStateTaskStatus.FAILED,
          eventType: ObjectEvent.ObjectUpdated,
        },
      };
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
      expect(result.tasks).not.toHaveProperty('EXISTING_TASK');
      expect(result.tasks).not.toHaveProperty('ANOTHER_TASK');
    });
  });

  describe('when subType is not in TASK_MAP', () => {
    it('should throw error for unknown subType', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'UNKNOWN_TYPE' as CommandTypeNames,
        request
      );

      // Act & Assert
      expect(() => initiateAsyncRequestRule(input)).toThrow(
        'No task configuration exists for event with type UNKNOWN_TYPE'
      );
    });

    it('should not modify state when subType is unknown', () => {
      // Arrange
      const initialState = createMockState();
      initialState.correlationId = 'original-correlation';
      initialState.tenant = 'original-tenant';
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'UNKNOWN_TYPE' as CommandTypeNames,
        request
      );

      // Act & Assert
      expect(() => initiateAsyncRequestRule(input)).toThrow();
      expect(initialState.correlationId).toBe('original-correlation');
      expect(initialState.tenant).toBe('original-tenant');
    });

    it('should handle various unknown subTypes correctly', () => {
      const testCases = [
        'CREATE_RISK_ASSESSMENT',
        'UPDATE_USER_PROFILE',
        'DELETE_ACTION',
        'INVALID_TYPE',
        'CUSTOM_WORKFLOW',
      ];

      testCases.forEach((subType) => {
        // Arrange
        const initialState = createMockState();
        const request = createActionUpdateRequest();
        const input = createMockInput(
          initialState,
          subType as CommandTypeNames,
          request
        );

        // Act & Assert
        expect(() => initiateAsyncRequestRule(input)).toThrow(
          `No task configuration exists for event with type ${subType}`
        );
      });
    });
  });

  describe('when subType is in TASK_MAP', () => {
    it('should handle CREATE_ACTION subType correctly', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(initialState, 'CREATE_ACTION', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({
        'OBJECT_CREATED:action': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action',
        },
        'PERMISSIONS_UPDATED:action': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action',
        },
      });
    });
  });

  describe('TASK_MAP configuration', () => {
    it('should have correct task configuration for CREATE_ACTION_UPDATE', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:action_update');
      expect(result.tasks['OBJECT_CREATED:action_update']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'action_update',
      });

      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:action_update');
      expect(result.tasks['PERMISSIONS_UPDATED:action_update']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'action_update',
      });
    });

    it('should have correct task configuration for CREATE_ACTION', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(initialState, 'CREATE_ACTION', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:action');
      expect(result.tasks['OBJECT_CREATED:action']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'action',
      });

      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:action');
      expect(result.tasks['PERMISSIONS_UPDATED:action']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'action',
      });
    });

    it('should only have expected tasks for CREATE_ACTION_UPDATE', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
      expect(taskKeys).toContain('OBJECT_CREATED:action_update');
      expect(taskKeys).toContain('PERMISSIONS_UPDATED:action_update');
    });

    it('should only have expected tasks for CREATE_ACTION', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(initialState, 'CREATE_ACTION', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
      expect(taskKeys).toContain('OBJECT_CREATED:action');
      expect(taskKeys).toContain('PERMISSIONS_UPDATED:action');
    });

    it('should have correct task configuration for DELETE_ACCEPTANCES', () => {
      // Arrange
      const initialState = createMockState();
      const request: RequestTypes = {
        Ids: [
          '123e4567-e89b-12d3-a456-426614174010',
          '123e4567-e89b-12d3-a456-426614174011',
        ],
      };
      const input = createMockInput(
        initialState,
        'DELETE_ACCEPTANCES',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert — batch operations create per-ID tasks
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:acceptance:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:acceptance:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:acceptance:123e4567-e89b-12d3-a456-426614174011'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:acceptance:123e4567-e89b-12d3-a456-426614174011'
      );
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(4);
    });

    it('should have correct task configuration for DELETE_APPETITES', () => {
      // Arrange
      const initialState = createMockState();
      const request: DeleteAppetitesRequest = {
        Ids: [
          '123e4567-e89b-12d3-a456-426614174010',
          '123e4567-e89b-12d3-a456-426614174011',
        ],
      };
      const input = createMockInput(initialState, 'DELETE_APPETITES', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert — batch operations create per-ID tasks
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:appetite:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:appetite:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:appetite:123e4567-e89b-12d3-a456-426614174011'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:appetite:123e4567-e89b-12d3-a456-426614174011'
      );
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(4);
    });

    it('should have correct task configuration for DELETE_INDICATORS', () => {
      // Arrange
      const initialState = createMockState();
      const request: DeleteIndicatorsRequest = {
        Ids: [
          '123e4567-e89b-12d3-a456-426614174010',
          '123e4567-e89b-12d3-a456-426614174011',
        ],
      };
      const input = createMockInput(initialState, 'DELETE_INDICATORS', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert — batch operations create per-ID tasks
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:indicator:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:indicator:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:indicator:123e4567-e89b-12d3-a456-426614174011'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:indicator:123e4567-e89b-12d3-a456-426614174011'
      );
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(4);
    });

    it('should have correct task configuration for CREATE_RISK', () => {
      // Arrange
      const initialState = createMockState();
      const request: RequestTypes = { Title: 'Test Risk', Tier: 1 };
      const input = createMockInput(initialState, 'CREATE_RISK', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:risk');
      expect(result.tasks['OBJECT_CREATED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'risk',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:risk');
      expect(result.tasks['PERMISSIONS_UPDATED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'risk',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for DELETE_RISK', () => {
      // Arrange
      const initialState = createMockState();
      const request: DeleteRiskRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
      };
      const input = createMockInput(initialState, 'DELETE_RISK', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_DELETED:risk');
      expect(result.tasks['OBJECT_DELETED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectDeleted,
        objectType: 'risk',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:risk');
      expect(result.tasks['PERMISSIONS_UPDATED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'risk',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for CREATE_APPETITE', () => {
      // Arrange
      const initialState = createMockState();
      const request: RequestTypes = {
        ParentIds: ['123e4567-e89b-12d3-a456-426614174000'],
        AppetiteType: 'risk',
      };
      const input = createMockInput(initialState, 'CREATE_APPETITE', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:appetite');
      expect(result.tasks['OBJECT_CREATED:appetite']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'appetite',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:appetite');
      expect(result.tasks['PERMISSIONS_UPDATED:appetite']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'appetite',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for CREATE_ASSESSMENT', () => {
      // Arrange
      const initialState = createMockState();
      const request: CreateAssessmentRequest = {
        Title: 'Test Assessment',
        Status: 'notstarted',
      };
      const input = createMockInput(initialState, 'CREATE_ASSESSMENT', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:assessment');
      expect(result.tasks['OBJECT_CREATED:assessment']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'assessment',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:assessment');
      expect(result.tasks['PERMISSIONS_UPDATED:assessment']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'assessment',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for CREATE_ISSUE', () => {
      // Arrange
      const initialState = createMockState();
      const request: CreateIssueRequest = {
        Title: 'Test Issue',
        DateOccurred: '2024-01-01',
        DateIdentified: '2024-01-02',
        Type: 'issue',
      };
      const input = createMockInput(initialState, 'CREATE_ISSUE', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:issue');
      expect(result.tasks['OBJECT_CREATED:issue']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'issue',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:issue');
      expect(result.tasks['PERMISSIONS_UPDATED:issue']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'issue',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_ACCEPTANCE', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateAcceptanceRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        Status: AcceptanceStatus.AwaitingClosure,
        Title: 'Title 1',
        Details: 'deets',
      };
      const input = createMockInput(initialState, 'UPDATE_ACCEPTANCE', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:acceptance');
      expect(result.tasks['OBJECT_UPDATED:acceptance']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'acceptance',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:acceptance');
      expect(result.tasks['PERMISSIONS_UPDATED:acceptance']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'acceptance',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_APPETITE', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateAppetiteRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        AppetiteType: 'risk',
      };
      const input = createMockInput(initialState, 'UPDATE_APPETITE', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:appetite');
      expect(result.tasks['OBJECT_UPDATED:appetite']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'appetite',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:appetite');
      expect(result.tasks['PERMISSIONS_UPDATED:appetite']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'appetite',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_RISK', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateRiskRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test Risk',
        Tier: 1,
      };
      const input = createMockInput(initialState, 'UPDATE_RISK', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:risk');
      expect(result.tasks['OBJECT_UPDATED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'risk',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:risk');
      expect(result.tasks['PERMISSIONS_UPDATED:risk']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'risk',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_TEST_RESULT', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateTestResultRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
        OriginalTimestamp: '2024-01-01T00:00:00Z',
      };
      const input = createMockInput(
        initialState,
        'UPDATE_TEST_RESULT',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:test_result');
      expect(result.tasks['OBJECT_UPDATED:test_result']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'test_result',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:test_result');
      expect(result.tasks['PERMISSIONS_UPDATED:test_result']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'test_result',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_INDICATOR_RESULT', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateIndicatorResultRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        ResultDate: '2024-01-01T00:00:00Z',
      };
      const input = createMockInput(
        initialState,
        'UPDATE_INDICATOR_RESULT',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:indicator_result');
      expect(result.tasks['OBJECT_UPDATED:indicator_result']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'indicator_result',
      });
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:indicator_result'
      );
      expect(result.tasks['PERMISSIONS_UPDATED:indicator_result']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'indicator_result',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for UPDATE_INDICATOR', () => {
      // Arrange
      const initialState = createMockState();
      const request: UpdateIndicatorRequest = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test indicator',
        Type: 'number',
      };
      const input = createMockInput(initialState, 'UPDATE_INDICATOR', request);

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_UPDATED:indicator');
      expect(result.tasks['OBJECT_UPDATED:indicator']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectUpdated,
        objectType: 'indicator',
      });
      expect(result.tasks).toHaveProperty('PERMISSIONS_UPDATED:indicator');
      expect(result.tasks['PERMISSIONS_UPDATED:indicator']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'indicator',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });

    it('should have correct task configuration for DELETE_TEST_RESULTS', () => {
      // Arrange
      const initialState = createMockState();
      const request: DeleteTestResultsRequest = {
        Ids: ['123e4567-e89b-12d3-a456-426614174010'],
      };
      const input = createMockInput(
        initialState,
        'DELETE_TEST_RESULTS',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:test_result:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(
        result.tasks[
          'OBJECT_DELETED:test_result:123e4567-e89b-12d3-a456-426614174010'
        ]
      ).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectDeleted,
        objectType: 'test_result',
        objectId: '123e4567-e89b-12d3-a456-426614174010',
      });
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:test_result:123e4567-e89b-12d3-a456-426614174010'
      );
      expect(
        result.tasks[
          'PERMISSIONS_UPDATED:test_result:123e4567-e89b-12d3-a456-426614174010'
        ]
      ).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'test_result',
        objectId: '123e4567-e89b-12d3-a456-426614174010',
      });
    });

    it('should have correct task configuration for DELETE_INDICATOR_RESULTS', () => {
      const initialState = createMockState();
      const request: DeleteIndicatorResultsRequest = {
        Ids: ['test-id-1', 'test-id-2'],
      };
      const input = createMockInput(
        initialState,
        'DELETE_INDICATOR_RESULTS',
        request
      );

      const result = initiateAsyncRequestRule(input);

      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(4);
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:indicator_result:test-id-1'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:indicator_result:test-id-1'
      );
      expect(result.tasks).toHaveProperty(
        'OBJECT_DELETED:indicator_result:test-id-2'
      );
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:indicator_result:test-id-2'
      );
    });

    it('should have correct task configuration for CREATE_ISSUE_ASSESSMENT', () => {
      // Arrange
      const initialState = createMockState();
      const request: CreateIssueAssessmentRequest = {
        ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
      };
      const input = createMockInput(
        initialState,
        'CREATE_ISSUE_ASSESSMENT',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toHaveProperty('OBJECT_CREATED:issue_assessment');
      expect(result.tasks['OBJECT_CREATED:issue_assessment']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'issue_assessment',
      });
      expect(result.tasks).toHaveProperty(
        'PERMISSIONS_UPDATED:issue_assessment'
      );
      expect(result.tasks['PERMISSIONS_UPDATED:issue_assessment']).toEqual({
        status: RequestStateTaskStatus.PENDING,
        eventType: PermissionsEvent.PermissionsUpdated,
        objectType: 'issue_assessment',
      });
      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(2);
    });
  });

  describe('metadata handling', () => {
    it('should handle different metadata values correctly', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const customMetadata = {
        eventId: 'custom-event-id',
        version: '2.0',
        timestamp: '2025-12-31T23:59:59Z',
        domain: 'custom-domain',
        service: 'custom-service',
        correlationId: 'custom-correlation-id',
        userId: 'custom-user-id',
        tenant: 'custom-tenant',
        orgKey: 'custom-org',
      };
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );
      input.current.metadata = customMetadata;

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.correlationId).toBe('custom-correlation-id');
      expect(result.tenant).toBe('custom-tenant');
      expect(result.orgKey).toBe('custom-org');
      expect(result.userId).toBe('custom-user-id');
    });

    it('should handle empty metadata strings', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );
      input.current.metadata.correlationId = '';
      input.current.metadata.tenant = '';
      input.current.metadata.orgKey = '';
      input.current.metadata.userId = '';

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.correlationId).toBe('');
      expect(result.tenant).toBe('');
      expect(result.orgKey).toBe('');
      expect(result.userId).toBe('');
    });
  });

  describe('request data handling', () => {
    it('should handle minimal request data', () => {
      // Arrange
      const initialState = createMockState();
      const minimalRequest: RequestTypes = {
        Title: 'Minimal Action Update',
        Description: 'Minimal description',
        ParentActionId: 'parent-123',
        CustomAttributeData: null,
      };
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        minimalRequest
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete initiation workflow', () => {
      // Arrange
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_ACTION_UPDATE',
        request
      );

      // Act
      const result = initiateAsyncRequestRule(input);

      // Assert - State should be properly initialized
      expect(result.correlationId).toBe('test-correlation-id');
      expect(result.tenant).toBe('test-tenant');
      expect(result.orgKey).toBe('test-org');
      expect(result.userId).toBe('test-user-id');

      // Assert - Tasks should be set up
      expect(result.tasks).toEqual({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
    });

    it('should maintain state consistency across multiple calls', () => {
      // Arrange
      const sharedState = createMockState();
      const request1 = createActionUpdateRequest();
      const request2 = {
        ...createActionUpdateRequest(),
        Title: 'Second Request',
      };

      // Act 1
      const input1 = createMockInput(
        sharedState,
        'CREATE_ACTION_UPDATE',
        request1
      );
      const result1 = initiateAsyncRequestRule(input1);

      // Act 2 - Use the result state for the next call
      const input2 = createMockInput(result1, 'CREATE_ACTION_UPDATE', request2);
      input2.current.metadata.correlationId = 'second-correlation-id';
      const result2 = initiateAsyncRequestRule(input2);

      // Assert - State should be updated with new metadata
      expect(result2.correlationId).toBe('second-correlation-id');
      expect(result2.tasks).toEqual({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
    });
  });
  describe('when subType is CREATE_SSO_CONFIGURATION', () => {
    it('should set up correct tasks for CREATE_SSO_CONFIGURATION', () => {
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_SSO_CONFIGURATION',
        request
      );

      const result = initiateAsyncRequestRule(input);

      expect(result.tasks).toEqual({
        'OBJECT_CREATED:sso_configuration': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'sso_configuration',
        },
      });
    });

    it('should only have expected tasks for CREATE_SSO_CONFIGURATION', () => {
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_SSO_CONFIGURATION',
        request
      );

      const result = initiateAsyncRequestRule(input);

      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(1);
      expect(taskKeys).toContain('OBJECT_CREATED:sso_configuration');
    });

    it('should initialize state with correct metadata', () => {
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'CREATE_SSO_CONFIGURATION',
        request
      );

      const result = initiateAsyncRequestRule(input);

      expect(result.correlationId).toBe('test-correlation-id');
      expect(result.tenant).toBe('test-tenant');
      expect(result.orgKey).toBe('test-org');
      expect(result.userId).toBe('test-user-id');
    });
  });

  describe('when subType is DELETE_SSO_CONFIGURATION', () => {
    it('should set up correct tasks for DELETE_SSO_CONFIGURATION', () => {
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'DELETE_SSO_CONFIGURATION',
        request
      );

      const result = initiateAsyncRequestRule(input);

      expect(result.tasks).toEqual({
        'OBJECT_DELETED:sso_configuration': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'sso_configuration',
        },
      });
    });

    it('should only have expected tasks for DELETE_SSO_CONFIGURATION', () => {
      const initialState = createMockState();
      const request = createActionUpdateRequest();
      const input = createMockInput(
        initialState,
        'DELETE_SSO_CONFIGURATION',
        request
      );

      const result = initiateAsyncRequestRule(input);

      const taskKeys = Object.keys(result.tasks);
      expect(taskKeys).toHaveLength(1);
      expect(taskKeys).toContain('OBJECT_DELETED:sso_configuration');
    });
  });
});
