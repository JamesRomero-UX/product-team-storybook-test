# Internal Audit Taxonomy - User Guide

## Overview

The Internal Audit Taxonomy feature allows organizations to define custom rating scales specifically for internal audit assessments, separate from the standard risk management ratings used throughout the RiskSmart platform.

**By default, all organizations use the standard rating taxonomy.** Internal audit ratings are only applied when explicitly configured.

## Key Features

### Customizable Rating Scales

Organizations can override specific rating types with internal audit-specific scales:

- **Effectiveness Ratings**: Define control effectiveness assessment scales
- **Likelihood Ratings**: Customize risk likelihood terminology
- **Impact Ratings**: Adjust impact assessment granularity
- **Risk Controlled/Uncontrolled**: Customize residual and inherent risk scales
- **Performance Ratings**: Define assessment performance and result scales
- **Design Effectiveness**: Customize control design assessment terminology
- **Assessment Outcome**: Define overall audit assessment outcomes

### Automatic Context Switching

When internal audit ratings are configured, the system automatically detects internal audit assessments and applies the appropriate rating scales.

## Configuring Internal Audit Ratings

### Default Behavior

**Without configuration, all assessments use the standard rating taxonomy.** Internal audit ratings only activate when:

- Assessment mode contains "internal_audit"
- Internal audit taxonomy has been configured for your organization
- Examples: `internal_audit_assessment`, `internal_audit_review`

### Configuration Requirements

To enable internal audit ratings, your organization's internal audit taxonomy file must define custom scales for the rating types you want to override.

## Customizable Rating Types

### Effectiveness Ratings

**Purpose**: Control effectiveness assessment
**Standard Behavior**: Uses standard priority/likelihood ratings
**Custom Options**: Define organization-specific effectiveness terminology

Example configuration:

```json
"effectiveness": [
  { "color": "#ff0000", "label": "Ineffective", "value": 1 },
  { "color": "#ff8000", "label": "Partially Effective", "value": 2 },
  { "color": "#00ff00", "label": "Effective", "value": 3 }
]
```

Alternative examples:

- **Compliance-focused**: "Non-Compliant" → "Partially Compliant" → "Fully Compliant"
- **Performance-based**: "Inadequate" → "Developing" → "Optimized"
- **Maturity model**: "Initial" → "Managed" → "Optimized"

### Likelihood Ratings

**Purpose**: Risk likelihood assessment
**Standard Behavior**: Uses standard 3-level likelihood scale
**Custom Options**: Adjust terminology to match internal audit methodology

Example configuration:

```json
"likelihood": [
  { "color": "#00ff00", "label": "Low", "value": 1 },
  { "color": "#ff8000", "label": "Medium", "value": 2 },
  { "color": "#ff0000", "label": "High", "value": 3 }
]
```

Alternative examples:

- **Frequency-based**: "Rare" → "Occasional" → "Frequent"
- **Probability**: "Unlikely" → "Possible" → "Probable"
- **Time-based**: "Long-term" → "Medium-term" → "Immediate"

### Impact Ratings

**Purpose**: Risk impact assessment  
**Standard Behavior**: Uses standard 3-level impact scale
**Custom Options**: Increase granularity or adjust terminology

Example configuration (5-level):

```json
"impact": [
  { "color": "#00ff00", "label": "Very Low", "value": 1 },
  { "color": "#80ff00", "label": "Low", "value": 2 },
  { "color": "#ff8000", "label": "Medium", "value": 3 },
  { "color": "#ff4000", "label": "High", "value": 4 },
  { "color": "#ff0000", "label": "Very High", "value": 5 }
]
```

Alternative examples:

- **Financial**: "Minimal" → "Minor" → "Moderate" → "Major" → "Severe"
- **Operational**: "Negligible" → "Limited" → "Moderate" → "Significant" → "Critical"
- **Regulatory**: "No Impact" → "Minor Breach" → "Moderate Breach" → "Major Breach" → "Severe Violation"

### Risk Controlled/Uncontrolled Ratings

**Purpose**: Residual and inherent risk assessment
**Standard Behavior**: Uses complex matrix-based risk calculations
**Custom Options**: Simplify risk ratings to match internal audit methodology

Example configuration (risk_controlled):

```json
"risk_controlled": [
  { "color": "#00ff00", "label": "Low", "value": 1 },
  { "color": "#ff8000", "label": "Medium", "value": 2 },
  { "color": "#ff0000", "label": "High", "value": 3 }
]
```

Alternative examples:

- **Simplified matrix**: "Acceptable" → "Tolerable" → "Unacceptable"
- **Audit-focused**: "Within tolerance" → "Requires monitoring" → "Requires action"
- **Regulatory**: "Compliant" → "Minor deviation" → "Material breach"

### Performance Ratings

**Purpose**: Assessment performance and result evaluation
**Standard Behavior**: Uses standard performance result scales
**Custom Options**: Define internal audit-specific performance terminology

Example configuration (performance_result):

```json
"performance_result": [
  { "color": "#ff0000", "label": "Unsatisfactory", "value": 1 },
  { "color": "#ff8000", "label": "Needs Improvement", "value": 2 },
  { "color": "#00ff00", "label": "Satisfactory", "value": 3 }
]
```

Alternative examples:

- **Compliance-based**: "Non-compliant" → "Partially compliant" → "Fully compliant"
- **Maturity-based**: "Ad-hoc" → "Repeatable" → "Optimized"
- **Grade-based**: "Failing" → "Acceptable" → "Excellent"

### Design Effectiveness Ratings

**Purpose**: Control design assessment
**Standard Behavior**: Uses standard design effectiveness scales
**Custom Options**: Customize control design evaluation terminology

Example configuration:

```json
"design_effectiveness": [
  { "color": "#ff0000", "label": "Poorly Designed", "value": 1 },
  { "color": "#ff8000", "label": "Adequately Designed", "value": 2 },
  { "color": "#00ff00", "label": "Well Designed", "value": 3 }
]
```

Alternative examples:

- **Architectural**: "Inadequate" → "Sufficient" → "Robust"
- **Compliance**: "Non-compliant design" → "Minimally compliant" → "Fully compliant"
- **Risk-based**: "High risk design" → "Moderate risk" → "Low risk design"

### Assessment Outcome Ratings

**Purpose**: Overall audit assessment results
**Standard Behavior**: Not available in standard taxonomy
**Custom Options**: Define comprehensive assessment outcomes

Example configuration:

```json
"assessment_outcome": [
  { "color": "#ff0000", "label": "Ineffective", "value": 1 },
  { "color": "#ff8000", "label": "Partially Effective", "value": 2 },
  { "color": "#00ff00", "label": "Effective", "value": 3 }
]
```

Alternative examples:

- **Opinion-based**: "Adverse" → "Qualified" → "Unqualified"
- **Action-required**: "Immediate action" → "Management attention" → "No action required"
- **Assurance-level**: "Limited assurance" → "Reasonable assurance" → "High assurance"

## Implementation Guidelines

### Configuration Best Practices

1. **Start with standard ratings**: Most organizations should begin with the default standard taxonomy
2. **Identify specific needs**: Only override rating types that require internal audit-specific terminology
3. **Maintain consistency**: Use consistent color coding and value ranges within your organization
4. **Consider reporting**: Ensure custom scales support your reporting requirements

### Color Coding Guidelines

- **Green tones**: Positive/low risk ratings
- **Yellow/Orange**: Medium risk ratings
- **Red tones**: High risk/negative ratings
- **Hex codes**: Use standard web color formats (#RRGGBB)

### Value Assignment

- **Sequential numbering**: Always use consecutive integers starting from 1
- **Consistent ranges**: Match the number of levels to your organization's assessment needs
- **Cross-compatibility**: Ensure values align with existing data if migrating

## Using Internal Audit Ratings

### User Experience

When internal audit ratings are configured and you're working in an internal audit assessment:

1. **Automatic detection**: The system detects the assessment context
2. **Custom dropdowns**: Rating dropdowns show your organization's custom scales
3. **Consistent interface**: Visual design remains consistent with the platform
4. **Clear labeling**: Custom labels appear in dropdown options

### Visual Indicators

- Custom rating labels appear in dropdown menus
- Color coding follows your organization's configuration
- Tooltips and help text reflect custom terminology

## Configuration Management

### Deployment Process

Internal audit taxonomy configuration requires:

1. **Taxonomy file creation**: Define custom rating scales in JSON format
2. **Tenant configuration**: Associate taxonomy with your organization
3. **Validation**: System validates configuration before activation
4. **Testing**: Verify custom ratings appear correctly in assessments

### Multi-Tenant Considerations

- Each organization can have unique internal audit ratings
- Standard ratings remain unchanged across all tenants
- Configuration changes only affect internal audit assessments
- Existing assessments maintain their original rating context

## Data Migration and Compatibility

### Existing Data

- **No impact on historical assessments**: Previous assessments retain their original rating scales
- **Standard assessments unchanged**: Non-internal audit assessments continue using standard ratings
- **Backward compatibility**: No data conversion required when implementing internal audit ratings

### New Assessments

- **Context-aware**: Internal audit assessments automatically use custom scales when configured
- **Database compatibility**: Custom ratings store using the same data structure
- **Cross-context reporting**: Data remains comparable between assessment types

### Migration Considerations

- **Gradual rollout**: Organizations can implement internal audit ratings incrementally
- **Training requirements**: Users should be familiarized with custom rating scales
- **Reporting adjustments**: Update reports to account for custom rating terminology

## For Administrators

### Configuration Setup

To implement internal audit ratings for your organization:

1. **Assessment of needs**: Determine which rating types require customization
2. **Taxonomy design**: Create JSON configuration with custom rating scales
3. **Testing environment**: Validate configuration in development environment
4. **Production deployment**: Apply configuration to production tenant
5. **User training**: Educate users on new rating scales and terminology

### Support and Maintenance

- **Configuration updates**: Rating scales can be modified post-deployment
- **User support**: Provide documentation for custom rating terminology
- **Data integrity**: Monitor assessments to ensure proper rating application
- **Backup procedures**: Maintain configuration backups for disaster recovery

## Technical Details

### Component Architecture

The system uses a context-aware architecture:

- `useRating` hook with optional context parameter
- `useInternalAuditRating` helper for internal audit-specific components
- `ControlledInternalAuditRating` wrapper component
- Automatic context detection in form components

### Database Schema

- Rating values (1-5) are compatible across all contexts
- Internal audit uses distinct, customizable rating scales that can differ in both terminology and granularity
- Database schema includes dedicated InternalAuditRating column for custom taxonomies
- Maintains referential integrity

### Internationalization

- Internal audit ratings support full i18n capabilities
- Separate translation namespace: `internal_audit_ratings`
- Language-specific labels and descriptions
- Consistent with platform translation patterns

## Troubleshooting

### Common Issues

**Q: I don't see custom internal audit ratings in my assessment**
A: Verify that: (1) your assessment mode includes "internal_audit", (2) internal audit taxonomy is configured for your organization, and (3) the specific rating type has been customized.

**Q: Some ratings show standard scales while others show custom scales**
A: This is expected behavior. Only rating types explicitly configured in your internal audit taxonomy will display custom scales. Unconfigured types default to standard ratings.

**Q: Can I modify rating scales after implementation?**
A: Yes, internal audit taxonomy can be updated. Contact your administrator to modify custom rating configurations.

**Q: Do custom ratings affect existing data?**
A: No, existing assessments retain their original rating scales. Only new internal audit assessments use custom ratings.

### Support

If you encounter issues with internal audit ratings:

1. **Verify configuration**: Confirm internal audit taxonomy is configured for your organization
2. **Check assessment context**: Ensure you're working in an internal audit assessment
3. **Review rating types**: Verify the specific rating type has been customized
4. **Contact administrator**: Request assistance with taxonomy configuration or updates

## Best Practices

### Taxonomy Design

- **Align with methodology**: Ensure custom ratings match your internal audit methodology
- **Consider user training**: Choose terminology that's intuitive for your audit team
- **Plan for reporting**: Design scales that support your reporting and analytics needs
- **Maintain consistency**: Use consistent approaches across similar rating types

### Implementation Strategy

- **Pilot testing**: Test custom ratings with a small group before full rollout
- **User feedback**: Gather input from auditors during initial implementation
- **Documentation**: Maintain clear documentation of custom rating definitions
- **Regular review**: Periodically assess whether custom ratings meet organizational needs

### Ongoing Management

- **Monitor usage**: Track how custom ratings are being used in assessments
- **Update as needed**: Modify rating scales based on organizational changes
- **Backup configurations**: Maintain records of taxonomy configurations
- **Train new users**: Ensure new team members understand custom rating scales

## Conclusion

The Internal Audit Taxonomy feature enables organizations to customize rating scales specifically for internal audit assessments while maintaining full compatibility with existing RiskSmart functionality.

**Key benefits:**

- **Flexibility**: Define rating scales that match your internal audit methodology
- **Clarity**: Use terminology familiar to your audit team
- **Consistency**: Maintain standardized assessments across internal audit activities
- **Compatibility**: Seamless integration with existing workflows and data

**Default behavior ensures minimal impact**: Organizations continue using standard ratings unless they specifically configure internal audit customizations. The automatic context switching provides a seamless user experience without requiring changes to established workflows.
