import express from 'express';
import helmet from 'helmet';

import { logger } from '../utils/logger';

const app = express();
const PORT = 8020;

app.use(helmet());
app.use(express.json());

// In-memory store for connections and org-connection mappings
const connections = new Map<
  string,
  { id: string; name: string; strategy: string; enabled_clients: string[] }
>();
const orgConnections = new Map<
  string,
  {
    connection_id: string;
    assign_membership_on_login: boolean;
    show_as_button: boolean;
  }
>();

const orgConnectionKey = (orgId: string, connectionId: string) =>
  `${orgId}:${connectionId}`;

app.get('/healthz', (_, res) => {
  res.send('Server is healthy');
});

/* Auth0 token endpoint */
app.post('/oauth/token', (_, res) => {
  res.json({
    access_token: 'stub-access-token',
    expires_in: 86400,
    token_type: 'Bearer',
  });
});

/* Connections */

/* Create connection - POST /api/v2/connections */
app.post('/api/v2/connections', (req, res) => {
  // Express types req.body as any; cast to the known request body shape for this endpoint.
  const body = req.body as {
    name: string;
    strategy: string;
    options?: Record<string, unknown>;
  };
  const { name, strategy } = body;
  const id = `con_stub_${Date.now()}`;
  const connection = { id, name, strategy, enabled_clients: [] };
  connections.set(id, connection);
  logger.info({ id, name, strategy }, 'Stub Auth0: created connection');
  res.status(201).json({
    id,
    name,
    strategy,
    enabled_clients: [],
    options: body.options ?? {},
  });
});

/* Delete connection - DELETE /api/v2/connections/:id */
app.delete('/api/v2/connections/:id', (req, res) => {
  const { id } = req.params;
  if (!connections.has(id)) {
    logger.info({ id }, 'Stub Auth0: connection not found for delete');
    res.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'Connection not found',
    });

    return;
  }
  connections.delete(id);
  logger.info({ id }, 'Stub Auth0: deleted connection');
  res.status(204).send();
});

/* Get enabled clients - GET /api/v2/connections/:id/clients */
app.get('/api/v2/connections/:id/clients', (req, res) => {
  const { id } = req.params;
  const connection = connections.get(id);
  if (!connection) {
    res.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'Connection not found',
    });

    return;
  }
  res.json({
    clients: connection.enabled_clients.map((clientId) => ({
      client_id: clientId,
    })),
  });
});

/* Update enabled clients - PATCH /api/v2/connections/:id/clients */
app.patch('/api/v2/connections/:id/clients', (req, res) => {
  const { id } = req.params;
  const connection = connections.get(id);
  if (!connection) {
    res.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'Connection not found',
    });

    return;
  }
  // Express types req.body as any; cast to the known request body shape for this endpoint.
  const updates = req.body as Array<{ client_id: string; status: boolean }>;
  for (const { client_id, status } of updates) {
    if (status && !connection.enabled_clients.includes(client_id)) {
      connection.enabled_clients.push(client_id);
    } else if (!status) {
      connection.enabled_clients = connection.enabled_clients.filter(
        (c) => c !== client_id
      );
    }
  }
  logger.info(
    { id, enabled_clients: connection.enabled_clients },
    'Stub Auth0: updated enabled clients'
  );
  res.json({
    clients: connection.enabled_clients.map((clientId) => ({
      client_id: clientId,
    })),
  });
});

/* Organizations */

/* Add enabled connection - POST /api/v2/organizations/:orgId/enabled_connections */
app.post('/api/v2/organizations/:orgId/enabled_connections', (req, res) => {
  const { orgId } = req.params;
  const { connection_id, assign_membership_on_login, show_as_button } =
    // Express types req.body as any; cast to the known request body shape for this endpoint.
    req.body as {
      connection_id: string;
      assign_membership_on_login: boolean;
      show_as_button: boolean;
    };
  const key = orgConnectionKey(orgId, connection_id);
  orgConnections.set(key, {
    connection_id,
    assign_membership_on_login,
    show_as_button,
  });
  logger.info({ orgId, connection_id }, 'Stub Auth0: created org connection');
  res.status(201).json({
    connection: {
      id: connection_id,
      name: connections.get(connection_id)?.name ?? connection_id,
    },
    assign_membership_on_login,
    show_as_button,
  });
});

/* Get enabled connection - GET /api/v2/organizations/:orgId/enabled_connections/:connectionId */
app.get(
  '/api/v2/organizations/:orgId/enabled_connections/:connectionId',
  (req, res) => {
    const { orgId, connectionId } = req.params;
    const key = orgConnectionKey(orgId, connectionId);
    const orgConn = orgConnections.get(key);
    if (!orgConn) {
      res.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: 'Organization connection not found',
      });

      return;
    }
    res.json({
      connection: {
        id: connectionId,
        name: connections.get(connectionId)?.name ?? connectionId,
      },
      assign_membership_on_login: orgConn.assign_membership_on_login,
      show_as_button: orgConn.show_as_button,
    });
  }
);

/* Delete enabled connection - DELETE /api/v2/organizations/:orgId/enabled_connections/:connectionId */
app.delete(
  '/api/v2/organizations/:orgId/enabled_connections/:connectionId',
  (req, res) => {
    const { orgId, connectionId } = req.params;
    const key = orgConnectionKey(orgId, connectionId);
    if (!orgConnections.has(key)) {
      res.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: 'Organization connection not found',
      });

      return;
    }
    orgConnections.delete(key);
    logger.info({ orgId, connectionId }, 'Stub Auth0: deleted org connection');
    res.status(204).send();
  }
);

app.listen(PORT, () => {
  logger.info(`Auth0 stub API running on port ${PORT}`);
});
