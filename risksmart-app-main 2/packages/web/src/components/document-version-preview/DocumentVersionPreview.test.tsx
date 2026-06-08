import type { GetDocumentFileByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetDocumentFileByIdResponse } from 'src/testing/mock-data/mockedGetDocumentFileByIdResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useChangeRequests } from '@/hooks/useChangeRequests';

import DocumentVersionPreview from './DocumentVersionPreview';

vi.mock('@/hooks/useChangeRequests');

const useChangeRequestsMock = vi.mocked(useChangeRequests);

describe('DocumentVersionPreview', () => {
  const documentId = '9eb8a4a5-8d71-4bd8-b513-70e7f68fb64a';
  const documentFileId = '839116b7-b130-47c8-a8ef-dadac3292074';

  const defaultDocumentFile: GetDocumentFileByIdQuery['document_file'][number] =
    {
      CustomAttributeData: null,
      CreatedAtTimestamp: '2024-03-04T17:42:20.943159+00:00',
      CreatedByUser: 'auth0|64415100c3a961d2784456ce',
      FileId: null,
      Id: documentFileId,
      ModifiedAtTimestamp: '2024-06-21T13:21:26.652156+00:00',
      ModifiedByUser: 'auth0|64415100c3a961d2784456ce',
      NextReviewDate: null,
      ParentDocumentId: '0d3a9abc-dd17-4036-ab52-47d13db75128',
      ReasonForReview: null,
      ReviewDate: null,
      ReviewedBy: null,
      Status: 'archived',
      Summary: null,
      Version: '1.4',
      Type: 'html',
      __typename: 'document_file',
      Content:
        '<h1>Cryptographic Control Policy</h1>\n<h2>Purpose</h2>\n<p>This Policy defines the ways in which the confidentiality, integrity and availability of the Organisations information is protected by applying an appropriate level of cryptographic control.</p>\n<h2>Responsibilities</h2>\n<p>This Policy applies to all employees. All employees are obliged to adhere to this and any other security Policy. Failure to comply with this Policy may be regarded as a disciplinary matter and will be dealt with in line with the Organisation’s Disciplinary Policy with possible sanctions up to and including summary dismissal (or termination of contract for temporary workers).</p>\n<p>The Policy applies to all electronic data which is either:</p>\n<ol>\n<li>Owned by the Organisation</li>\n<li>Temporarily in the possession of the Organisation e.g., clients.</li>\n</ol>\n<p>and which can be regarded as critical or sensitive, where:</p>\n<ol>\n<li>Critical is defined as relating to information which is of commercial, strategic or significant monetary value to the Organisation</li>\n<li>Sensitive is defined as relating to information which would either contravene the Data Protection Act or cause measurable damage to the Organisations reputation or that of its clients, or other stakeholders if it were to fall into the public domain.</li>\n</ol>\n<h2>Objectives</h2>\n<ol>\n<li>To ensure permanent and temporary employees are aware of their responsibilities in:</li>\n<li>The protection of electronic data within the scope defined above</li>\n<li>The protection of the reputation of the Organisation.</li>\n<li>To provide high-level guidance on the appropriate use of cryptographic controls.</li>\n</ol>\n<h2>Principles</h2>\n<ol>\n<li>This Policy exists to set out the principles and requirements for the use of cryptographic controls.</li>\n<li>Information system resources are important business assets that are vulnerable to access by unauthorised individuals or unauthorised remote electronic processes. Sufficient precautions are required to prevent unwanted access by applying a level of encryption to critical and sensitive data which is proportionate to the business risk.</li>\n</ol>\n<h2>Scope</h2>\n<p>Confidential and personal information processed, stored, or transmitted on or in company owned, managed, and controlled systems and applications deemed in scope by the ISO 27001 scope statement.</p>\n<p>All employees and third-party users.</p>\n<h2>Principle</h2>\n<p>Information is protected by controls based on classification as set out in the Information Classification and Handling Policy and based on risk assessment.</p>\n<p>Only company approved encryption technology and processes are used.</p>\n<p>The export of encryption technologies or encrypted data may be restricted by regulation. Personnel will seek guidance from the legal department should export of cryptographic technologies or encrypted data be required.</p>\n<h2>Encryption Algorithm Requirement’s</h2>\n<p>Symmetric encryption: AES-256bit</p>\n<p>Asymmetric encryption: RSA (2048 bit recommended, at least 1200 bits required).</p>\n<p>Hash functions: SHA2 (four sizes, 256 bits is recommended).</p>\n<p>Digital signatures: RSA (2048 bit recommended, at least 1200 bits is required).</p>\n<h2>Mobile, Laptop and Removable Media Encryption</h2>\n<p>Mobile devices, laptops and removable media are having disk encryption implemented at either the hardware and / or operating system level propriety to the manufacturer.</p>\n<p>Device encryption must never be disabled.</p>\n<p>Where generic passwords are used to access encrypted storage, a secondary unique login, must be in place to access the device itself.</p>\n<p>Only company owned and provided removable media encrypted devices may be used to store confidential data.</p>\n<h2>General</h2>\n<ol>\n<li>All critical or sensitive data transferred outside of the Organisation is encrypted.</li>\n<li>All removable media, including memory sticks, is encrypted.</li>\n<li>Laptop hard drives are whole-disk encrypted utilising a 2048-bit encryption key for any laptops which leave the premises of the Organisation.</li>\n<li>All remote access is to take place via encrypted VPN or an equally secure alternative.</li>\n<li>WPA2 encryption is mandatory for all wireless networks carrying data (including domestic networks where remote working is undertaken).</li>\n<li>Client access to web-based applications is encrypted using TLS encryption.</li>\n<li>Suitable cryptographic protocols are to be found in the NIST SP 800-175B REV. 1</li>\n</ol>\n<h2>Email Encryption</h2>\n<p>Email should not be used to transfer confidential or personal data in an unencrypted format in line with the Information Transfer Policy.</p>\n<p>Where required, an encrypted file should be attached with a key length that meets the Encryption Algorithm Requirements.</p>\n<h2>Web / Cloud Services Encryption</h2>\n<p>Web and cloud services that require the exchange of confidential, personal, or sensitive data must implement TLS 1.2 at a minimum to protect the data in transit over the internet.</p>\n<p>All servers must have a valid certificate issued by a recognised Certificate Authority. It is the System Owner’s responsibility to renew the certificate and ensure that the systems are updated.</p>\n<h2>Wireless Encryption</h2>\n<p>WEP must not be used as a security control for wireless networks.</p>\n<p>WPA or WPA2 Enterprise mode with 802.1X authentication and AES encryption is implemented for WLAN networks.</p>\n<p>Centralised management systems that can control and configure distributed wireless networks are implemented.</p>\n<p>If required, it is recommended that WPA2 Personal mode be used with a minimum 13-character random passphrase and AES encryption.</p>\n<h2>Card Holder Data Encryption</h2>\n<p>Store secret and private keys always used to encrypt/decrypt cardholder data in one (or more) of the following forms:</p>\n<ul>\n<li>Encrypted with a key-encrypting key that is at least as strong as the data-encrypting key, and that is stored separately from the data-encrypting key</li>\n<li>Within a secure cryptographic device (such as a hardware (host) security module (HSM) or PTS-approved point-of-interaction device)</li>\n<li>As at least two full-length key components or key shares, in accordance with an industry-accepted method</li>\n</ul>\n<p>Note: It is not required that public keys be stored in one of these forms.</p>\n<h2>Backup Encryption</h2>\n<p>Backups are encrypted using the manufacture propriety back up technology.</p>\n<h2>Database Encryption</h2>\n<p>Database containing confidential information or personal data are encrypted at rest at either the Database Application Layer or the Disk Layer.</p>\n<h2>Data in Motion Encryption</h2>\n<p>The Data Handling Procedures require the transfer of confidential and personal information through a secure channel. A secure channel is an encrypted network connection.</p>\n<p>Various methods of encryption are available and generally built-into the application. The user should be aware of the data connection being used to transmit sensitive data and if encryption is enabled for that connection.</p>\n<p>Encryption is required for</p>\n<ul>\n<li>The transport of sensitive files (SSL or SCP usage to encrypt sensitive data for network file access of unencrypted files).</li>\n<li>All network traffic for remote access to the virtual desktop environment</li>\n<li>Transport of sensitive data that is part of a database query or web service call (examples SQL query to retrieve or send data from database or a web service call to retrieve or send data from a cloud application).</li>\n<li>Privileged access to network or server equipment for system management purposes, i.e., SSH</li>\n</ul>\n<h2>Encryption of Data in Transit</h2>\n<ol>\n<li>Sensitive or critical data in transit must always be encrypted.</li>\n<li>Data which is already in the public domain (or would be of no adverse significance if it were to be so) may be sent unencrypted.</li>\n</ol>\n<p>Key Management</p>\n<ol>\n<li>\n<p>Key management within AWS done through AWS KMS.</p>\n</li>\n</ol>\n<h2>Roles and Responsibilities</h2>\n<p>All individuals are responsible for ensuring that sensitive or critical data is encrypted before leaving the premises.</p>\n<h2>Encryption for Data Exported Outside the UK</h2>\n<p>Regulatory controls for any country to which data is exported outside the UK are checked to ensure that cryptographic legislation will not be contravened. This will require the guidance of appropriate legal and risk advisors.</p>\n<h3><strong>General</strong></h3>\n<p>This Policy applies to all employees with access rights to the Organisation’s network systems and will be reviewed at not greater than annual intervals.</p>\n<h2>Bluetooth Encryption</h2>\n<p>Bluetooth is not approved as a communication method for unencrypted confidential, personal, or otherwise sensitive data.</p>\n<p>See the Information Transfer Policy for the use of Bluetooth.</p>\n<h1>Policy Compliance</h1>\n<h2>Compliance Measurement</h2>\n<p>The information security management team will verify compliance to this policy through various methods, including but not limited to, business tool reports, internal and external audits, and feedback to the policy owner.</p>\n<h2>Exceptions</h2>\n<p>Any exception to the policy must be approved and recorded by the Information Security Manager in advance and reported to the Management Review Team.</p>\n<h2>Non-Compliance</h2>\n<p>An employee found to have violated this policy may be subject to disciplinary action, up to and including termination of employment.</p>\n<h2>Continual Improvement</h2>\n<p>The policy is updated and reviewed as part of the continual improvement process.</p>\n<p>&nbsp;</p>',
      Link: null,
      file: null,
      parent: {
        Id: '0d3a9abc-dd17-4036-ab52-47d13db75128',
        Title: 'Anti-Discrimination',
        ownerGroups: [],
        owners: [
          {
            UserId: 'auth0|64415100c3a961d2784456ce',
            user: {
              FriendlyName: 'user1',
              Id: 'auth0|64415100c3a961d2784456ce',
              __typename: 'user',
            },
            __typename: 'owner',
          },
        ],
        __typename: 'document',
      },
      changeRequests: [],
    };

  it('returns nothing if document version not found', async () => {
    useChangeRequestsMock.mockReturnValue({
      pendingChangeRequests: [],
      pendingDeleteRequests: [],
      isActiveApprover: vi.fn(),
      activeLevelId: vi.fn(),
      canAmendChangeRequest: vi.fn(),
      changeRequests: [],
      loading: false,
      getCurrentApprovers: vi.fn(),
      getNextApprovers: vi.fn(),
      getCurrentLevel: vi.fn(),
      getMaxLevel: vi.fn(),
    });
    const { container } = render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              { document_file: [] }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('shows the version status', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Published,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Published')).toBeDefined();
  });

  it('shows the title as Latest draft if draft', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Draft,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest draft')).toBeDefined();
  });

  it('shows the title as Latest draft if pending approval', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.PendingApproval,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest draft')).toBeDefined();
  });

  it('shows the title as Latest published if published', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Published,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest published')).toBeDefined();
  });

  it('shows the title as Latest published if archived', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Archived,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest published')).toBeDefined();
  });

  it('shows the publish button if draft with no change requests', async () => {
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetOrganisation(),
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Draft,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest draft')).toBeInTheDocument();

    expect(await screen.findByText('Publish')).toBeInTheDocument();
  });

  it('hides the publish button if draft with change requests', async () => {
    useChangeRequestsMock.mockReturnValue({
      pendingChangeRequests: [
        {
          Id: '1',
          ParentId: '',
          Type: '',
          CreatedAtTimestamp: '',
          ModifiedAtTimestamp: '',
          ChangeRequestStatus: 'pending',
          Comment: '',
          contributors: [],
          responses: [],
          requestedFileChanges: [],
        },
      ],
      pendingDeleteRequests: [],
      isActiveApprover: vi.fn(),
      activeLevelId: vi.fn(),
      canAmendChangeRequest: vi.fn(),
      changeRequests: [],
      loading: false,
      getCurrentApprovers: vi.fn(),
      getNextApprovers: vi.fn(),
      getCurrentLevel: vi.fn(),
      getMaxLevel: vi.fn(),
    });
    render(
      <DocumentVersionPreview
        document={{
          Id: documentId,
          ancestorContributors: [],
        }}
        documentFileId={documentFileId}
      />,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetOrganisation(),
            mockedGetDocumentFileByIdResponse(
              { id: documentFileId },
              {
                document_file: [
                  {
                    ...defaultDocumentFile,
                    Status: Version_Status_Enum.Draft,
                  },
                ],
              }
            ),
          ],
          'trpc',
          'graphql',
          'router',
          'features'
        ),
      }
    );
    expect(await screen.findByText('Latest draft')).toBeInTheDocument();

    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });
});
