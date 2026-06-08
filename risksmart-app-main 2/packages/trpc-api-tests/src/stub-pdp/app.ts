import express from 'express';
import helmet from 'helmet';

import { logger } from '../utils/logger';

const app = express();
const PORT = 8010;

app.use(helmet());
app.use(express.json());

app.get('/healthz', (_, res) => {
  res.send('Server is healthy');
});

/* PDP */

/* Is Allowed Bulk - https://pdp-api.permit.io/redoc#tag/Authorization-API/operation/is_allowed_bulk_allowed_bulk_post */
app.post('/allowed/bulk', (req: { body: unknown[] }, res) => {
  res.send({
    allow: req.body.map(() => ({
      allow: true,
    })),
  });
});

/* Permit API */

/* Get API Key Scope - https://api.permit.io/v2/redoc#tag/API-Keys/operation/get_api_key_scope */
app.get('/v2/api-key/scope', (_, res) => {
  res.send({
    organization_id: 'org_123',
    project_id: 'proj_123',
    environment_id: 'env_123',
  });
});

/* Assign Role - https://api.permit.io/v2/redoc#tag/Role-Assignments/operation/assign_role */
app.post('/v2/facts/:projId/:envId/role_assignments', (_, res) => {
  res.send({});
});

/* Unassign Role - https://api.permit.io/v2/redoc#tag/Role-Assignments/operation/unassign_role */
app.delete('/v2/facts/:projId/:envId/role_assignments', (_, res) => {
  res.send({});
});

/* List Resource Instances - https://api.permit.io/v2/redoc#tag/Resource-Instances/operation/list_resource_instances */
app.get('/v2/facts/:projId/:envId/resource_instances', (req, res) => {
  // Express types req.query values as string | ParsedQs | string[] | ParsedQs[] | undefined; narrowing to
  // string | undefined is correct for a single optional query param and avoids unnecessary runtime validation in a stub.
  const search = req.query.search as string | undefined;
  // Return a single matching resource instance so resourceInstanceExists returns true
  res.send(
    search
      ? [{ key: search, resource: 'rs_node', tenant: req.query.tenant }]
      : []
  );
});

/* Create Resource Instance - https://api.permit.io/v2/redoc#tag/Resource-Instances/operation/create_resource_instance */
app.post('/v2/facts/:projId/:envId/resource_instances', (_, res) => {
  res.send({
    resource_id: 'res_123',
  });
});

/* Delete Resource Instance - https://api.permit.io/v2/redoc#tag/Resource-Instances/operation/delete_resource_instance */
app.delete(
  '/v2/facts/:projId/:envId/resource_instances/:instanceId',
  (_, res) => {
    res.send({});
  }
);

/* Create Relationship Tuple - https://api.permit.io/v2/redoc#tag/Relationship-tuples/operation/create_relationship_tuple */
app.post('/v2/facts/:projId/:envId/relationship_tuples', (_, res) => {
  res.send({});
});

/* Delete Relationship Tuple - https://api.permit.io/v2/redoc#tag/Relationship-tuples/operation/delete_relationship_tuple */
app.delete('/v2/facts/:projId/:envId/relationship_tuples', (_, res) => {
  res.send({});
});

/* List Relationship Tuples - https://api.permit.io/v2/redoc#tag/Relationship-tuples/operation/list_relationship_tuples */
app.get('/v2/facts/:projId/:envId/relationship_tuples', (_, res) => {
  res.send([]);
});

/* List Role Assignments - https://api.permit.io/v2/redoc#tag/Role-Assignments/operation/list_role_assignments */
app.get('/v2/facts/:projId/:envId/role_assignments', (_, res) => {
  res.send([]);
});

app.listen(PORT, () => {
  logger.info(`Permit stub API running on port ${PORT}`);
});
