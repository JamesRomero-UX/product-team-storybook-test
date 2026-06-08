/**
 * Service context passed between internal services
 * Contains tenant isolation and user identity information
 */
export interface ServiceContext {
  /**
   * Tenant identifier (e.g., 'tenant-123')
   */
  tenant: string;

  /**
   * Organization key for multi-tenant database queries
   */
  orgKey: string;

  /**
   * User ID making the request (for audit and permissions)
   */
  userId: string;

  /**
   * Correlation ID for request tracing (optional, generated if not provided)
   */
  correlationId?: string;
}
