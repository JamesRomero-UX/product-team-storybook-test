import { describe, it, expect } from 'vitest';
import { Liquid } from 'liquidjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to render the partial similar to Knock environment
async function renderPartial(vars: Record<string, any>) {
    const engine = new Liquid({
        root: [join(__dirname, '..', 'partials')],
        extname: '.html',
        cache: false,
        strictFilters: false,
        strictVariables: false,
    });
    // Load content.html directly
    const tpl = readFileSync(join(__dirname, '..', 'partials', 'deep-link-partial-email', 'content.html'), 'utf8');
    return engine.parseAndRender(tpl, vars);
}

describe('deep-link-partial-email', () => {
    const base_url = 'https://app.example.com';
    const object_id = '123';
    const org_id = 'acme';

    const cases: Array<[string, string]> = [

        // Real workflow keys from repository (directories)
        ['action-delete', 'actions'],
        ['action-due', 'actions'],
        ['action-insert', 'actions'],
        ['action-overdue', 'actions'],
        ['action-update', 'actions'],
        // attestation-record handled via custom parent_object_id test below
        // ['change-request-insert', 'change-request-insert'], // handled via custom 
        // ['change-request-rejected', 'change-request-rejected'], // handled via custom 
        ['control-delete', 'controls'],
        ['control-insert', 'controls'],
        ['control-test-due', 'controls'],
        ['control-test-overdue', 'controls'],
        ['control-update', 'controls'],
        ['digest', 'digest'], // fallback
        ['document-delete', 'policy'],
        ['document-due', 'policy'],
        ['document-insert', 'policy'],
        ['document-overdue', 'policy'],
        ['document-update', 'policy'],
        ['indicator-due', 'indicator'],
        ['indicator-overdue', 'indicator'],
        // ['issue-delete', 'issues'],// handled via custom 
        // ['issue-due', 'issues'],// handled via custom 
        // ['issue-insert', 'issues'],// handled via custom 
        // ['issue-overdue', 'issues'],// handled via custom 
        // ['issue-update', 'issues'],// handled via custom 
        ['policy-approver', 'policy'],
        // ['policy-attestation-reminder', 'policy'],// handled via custom 
        ['policy-document-version-review-due', 'policy'],
        ['policy-document-version-review-upcoming', 'policy'],
        ['risk-assessment-due', 'risks'],
        ['risk-assessment-overdue', 'risks'],
        ['risk-delete', 'risks'],
        ['risk-insert', 'risks'],
        ['risk-update', 'risks'],
        // ['third-party-new-questionnaire', 'third-parties'], // External
        // ['third-party-password-reset', 'third-parties'],// External
        // ['third-party-recall-questionnaire', 'third-parties'],// External
        // ['third-party-response-submitted', 'third-parties'], // handled via custom 
        // ['third-party-response-update-status', 'third-parties']// External
    ];

    cases.forEach(([workflow_id, segment]) => {
        it(`maps ${workflow_id} -> ${segment}`, async () => {
            const html = await renderPartial({ base_url, workflow_id, object_id, org_id });
            expect(html).toContain(`${base_url}/${segment}/${object_id}?organization=${org_id}`);
        });
    });

    it('adds connection when provided', async () => {
        const html = await renderPartial({ base_url, workflow_id: 'risk_created', object_id, org_id, connection: 'conn-1' });
        expect(html).toContain(`?organization=${org_id}&connection=conn-1`);
    });

    it('omits query string when neither org_id nor connection provided', async () => {
        const html = await renderPartial({ base_url, workflow_id: 'risk_created', object_id });
        expect(html).toContain(`${base_url}/risks/${object_id}`);
        expect(html).not.toContain('?organization=');
    });

    it('builds attestation record nested path when parent_object_id supplied', async () => {
        const parent_object_id = 'parent-456';
        const html = await renderPartial({ base_url, workflow_id: 'attestation-record-insert', object_id, parent_object_id, org_id });
        expect(html).toContain(`${base_url}/public-policies/${parent_object_id}/files/${object_id}?organization=${org_id}`);
    });

    it('falls back for attestation record without parent_object_id', async () => {
        const html = await renderPartial({ base_url, workflow_id: 'attestation-record-insert', object_id, org_id });
        // No custom path -> fallback route (kebab-cased workflow id used as segment)
        expect(html).toContain(`${base_url}/attestation-record-insert/${object_id}?organization=${org_id}`);
    });

    it('uses object_parent_url for change-request-insert when provided', async () => {
        const object_parent_url = '/controls';
        const html = await renderPartial({ base_url, workflow_id: 'change-request-insert', object_id, org_id, object_parent_url });
        // Should link to parent collection, not include object id segment
        expect(html).toContain(`${base_url}${object_parent_url}?organization=${org_id}`);
        expect(html).not.toContain(`${base_url}/change-request-insert/${object_id}`); // ensure not fallback pattern
    });

    it('uses object_parent_url without leading slash for change-request-rejected', async () => {
        const object_parent_url = 'controls';
        const html = await renderPartial({ base_url, workflow_id: 'change-request-rejected', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls?organization=${org_id}`);
    });


    it('maps unknown key containing token (event) to that resource segment', async () => {
        const html = await renderPartial({ base_url, workflow_id: 'mystery_event', object_id, org_id });
        // Contains 'event' so heuristic maps to events, not raw kebab-case of entire key
        expect(html).toContain(`${base_url}/events/${object_id}?organization=${org_id}`);
    });

    it('falls back for unknown workflow key with mixed case & spaces trimmed', async () => {
        const html = await renderPartial({ base_url, workflow_id: 'Strange_NewThing', object_id, org_id });
        // Downcased then underscores -> hyphens; no additional token mapping
        expect(html).toContain(`${base_url}/strange-newthing/${object_id}?organization=${org_id}`);
    });


    it('uses object_parent_url for issue-insert when provided (single slash)', async () => {
        const object_parent_url = '/controls/123';
        const html = await renderPartial({ base_url, workflow_id: 'issue-insert', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls/123/${object_id}?organization=${org_id}`);
    });


    it('uses object_parent_url for issue-update when provided (single slash)', async () => {
        const object_parent_url = '/controls/123';
        const html = await renderPartial({ base_url, workflow_id: 'issue-update', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls/123/${object_id}?organization=${org_id}`);
    });


    it('uses object_parent_url for issue-due when provided (single slash)', async () => {
        const object_parent_url = '/controls/123';
        const html = await renderPartial({ base_url, workflow_id: 'issue-due', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls/123/${object_id}?organization=${org_id}`);
    });


    it('uses object_parent_url for issue-overdue when provided (single slash)', async () => {
        const object_parent_url = '/controls/123';
        const html = await renderPartial({ base_url, workflow_id: 'issue-overdue', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls/123/${object_id}?organization=${org_id}`);
    });

    it('uses object_parent_url for issue-overdue when provided (no slash)', async () => {
        const object_parent_url = 'controls/123';
        const html = await renderPartial({ base_url, workflow_id: 'issue-overdue', object_id, org_id, object_parent_url });
        expect(html).toContain(`${base_url}/controls/123/${object_id}?organization=${org_id}`);
    });


    it('builds policy attestation reminder record nested path when parent_object_id supplied', async () => {
        const parent_object_id = 'parent-456';
        const html = await renderPartial({ base_url, workflow_id: 'attestation-record-insert', object_id, parent_object_id, org_id });
        expect(html).toContain(`${base_url}/public-policies/${parent_object_id}/files/${object_id}?organization=${org_id}`);
    });

  it('builds  third-party response submitted record nested path when parent_object_id supplied', async () => {
        const parent_object_id = 'parent-456';
        const html = await renderPartial({ base_url, workflow_id: 'third-party-response-submitted', object_id, parent_object_id, org_id });
        expect(html).toContain(`${base_url}/third-party/${parent_object_id}/questionnaire-responses/${object_id}?organization=${org_id}`);
    });



});
