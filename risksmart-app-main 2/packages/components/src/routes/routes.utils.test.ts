import { useParams } from 'react-router';
import { describe, test, vi } from 'vitest';

import { isGuid, useGetNumberParam, useGetUserIdParam } from './routes.utils';

vi.mock('react-router');

const mockedUseParams = vi.mocked(useParams);

describe('isGuid', () => {
  test.each([
    // Valid GUIDs
    ['cc4a7afd-3ff4-d0ca-0431-ebaf4f310afa', true],
    ['158e0225-33d5-eefc-f260-5bec4187f791', true],
    ['7cd2c3d6-96b1-9eed-17dd-bd68843e43a3', true],
    ['857e8cf4-f39e-38b2-f1df-065263e41484', true],
    ['42c57123-ee7a-acbe-641d-0c4175ad7536', true],
    ['e16a6b7c-320d-f124-eb44-51dfda65b765', true],
    ['b63eeabc-debe-66fa-9b40-a10da18ea008', true],
    ['f1cac702-5bb6-7ce7-fa0f-87bfef3e8fbd', true],
    ['71a884f6-a64f-512a-5a5e-4d1e1ca96bca', true],
    ['f63652f1-42c6-b20c-f5bd-481f15a85f7a', true],
    ['dc221267-ded7-11d8-557a-410ab97e02bd', true],
    ['0677df9f-899c-f1fc-034d-c8014e385bdc', true],
    ['8bb862c6-70d1-2c25-48cd-7f7c09597654', true],
    ['6e9a29ca-ea8e-486b-d3bf-35ac591e87b1', true],
    ['5f422e36-d2ff-e209-1218-af1478069af3', true],
    ['04c97b93-ab51-9ff0-0341-0981e05f1ab2', true],
    ['1c9f5d38-c3d5-8af8-142a-6ae14f8e7223', true],
    ['aaaa5d38-c3d5-8af8-142a-6ae14f8e7223', true],
    ['70103a85-bcc5-4fb5-b6d2-bf88a5786836', true],
    ['7c88ab27-b318-4248-9b96-5bf04672b9e9', true],
    ['7e5cca4e-245e-4362-8b06-5605f010238d', true],
    ['17ef2841-6845-4116-8638-0c1d50462767', true],
    ['cfbcf3fa-bf47-4e1f-afad-714f53e2bdc1', true],
    ['ad901d05-ace1-4501-a98d-03b09ad3d797', true],
    ['3a1bdcae-8fa4-4acd-b3c4-43a47d955d3a', true],
    ['1a3eaaeb-111a-4648-82e2-902ccefae700', true],
    ['c8e5d710-afb8-4dcd-b6d0-3bffed1f945a', true],
    ['05c95c47-5261-4463-bc05-cea28bafea95', true],
    ['94f1f96a-a2e6-4d34-93fd-17040a9cec1d', true],
    ['506ec862-5a5d-4bd6-9796-870863b20fab', true],
    ['8b9f1a58-eae0-4d4d-9b2c-5e6a09749f9c', true],
    ['69e5e25f-5f0e-456c-8493-ddc9786d7fe3', true],
    ['fc39a5dc-d976-4972-bd35-ed6f50fde7d9', true],
    ['6912935e-7e61-4fa5-855e-d4a38f96e4e6', true],
    ['599fbea9-913c-4c4e-8c64-2b0de58b0a7c', true],
    ['bfea1a28-d25b-4a8e-8d3b-2f0b8992b770', true],
    ['ef9e4fe0-977e-4d49-96ef-6f653d07bdbe', true],
    ['180d548c-a153-4253-b29e-c1b80cb5e196', true],
    ['aaf65d1c-1be2-47e3-84e2-1d12c71d7001', true],
    ['0cf7f059-61ec-4441-a52d-8f4494c72672', true],
    ['60fe264b-3aea-4d54-aac4-cbe26ed29888', true],
    ['02094fc8-d6f4-4886-b72b-2c2d0c38d57c', true],
    ['f85667f1-5c8e-4d22-a0c8-16699115f137', true],
    ['9e17b81a-9426-4eef-8a36-3b9c800ae659', true],
    ['f492990f-9239-4536-881f-14d7b39d1769', true],
    ['12339dad-83c8-444f-bff6-d69083acd40a', true],
    ['769f1f6f-c012-432c-a643-4428c1f29a83', true],
    ['752b5e02-88b3-4fe9-800a-bd164f9061a6', true],
    ['008f0e28-5939-4f65-9f5a-997e354e7fc6', true],
    ['938bb4d3-eb14-4ba9-8a85-dd9474b7f2f1', true],
    ['68e54806-152d-439c-8b10-9abfb3379a8f', true],
    ['b2cdcb47-1d3b-4fab-a812-b738607a94f1', true],
    ['c0f086a8-f58a-4fcd-a952-4dfbd39a8dc8', true],
    ['da611de9-4000-4f03-be85-c3afba86fdbc', true],
    ['0b1df969-b841-4aac-9cb2-4ecf619873d5', true],
    ['bdca9b21-58bd-444a-bd81-66853488e4b6', true],
    ['4645c8f3-29e2-4af4-802f-2922f9ee09a5', true],
    ['315d7446-e5f2-4a19-95e3-00828f802154', true],
    ['6a4e0e62-5ab7-4f72-9917-03024bbf3582', true],
    ['8c70abd1-81f7-4f5e-9e23-441ef1d91610', true],
    ['fb2a7535-9210-46c9-b5e5-ee264b53943d', true],
    ['88ed88dd-8733-4002-9b35-e80d46b2ee5b', true],
    ['b1381157-2a5f-41a9-ba44-91d6bab01eff', true],
    ['81e38117-4870-41c1-90b1-85ac883579a5', true],
    ['0ec4ec5e-7791-4ccb-93fa-40ed31d6fe19', true],
    ['724171ca-ecfb-415b-a0d0-8f6f43d5a7a8', true],
    ['2ad0b8a4-11ff-4109-94a1-a647a3e78764', true],
    ['173f9d72-44ae-476f-a2dc-e9d4331fdf71', true],
    ['a69b55f8-2d1d-48a5-8752-7279c0a5ee2c', true],
    ['23886f80-016f-400e-a801-2074b31bd5f8', true],
    ['6a4559a5-a6b6-4361-bfd6-77682b9f50d2', true],
    ['252e34c6-6466-447b-b921-59502b268512', true],
    ['f1e75eaa-90ce-4f76-a3d6-0630bf095198', true],
    ['a2686ab1-0434-4725-a5fa-564e2141ef4c', true],
    ['b3a3e675-c8ee-4896-b634-1f2e4e311713', true],
    ['e5bb1885-7b6f-4641-bc42-e6d04deed137', true],
    ['16f297e9-461e-424c-bb4d-76cd3096564d', true],
    ['f1b97392-ae18-436a-b383-e5e01680eb13', true],
    ['dc5b3f00-1143-479c-9a87-4f9e2c2efe94', true],
    ['cfa07781-0c61-4f73-b4dd-2ce497556550', true],
    ['7f128323-1e62-4f23-8a36-1275277a9d09', true],
    ['69908f5d-7a13-4e97-8fb4-1e87275fbaf3', true],
    ['218ce277-834f-4feb-bd31-6dae3e19ba88', true],
    ['9b15d7ce-c684-4e65-9c09-a54cac23612e', true],
    ['4113d15c-657f-4a5d-ac92-e29ffbbaae37', true],
    ['7b5614a7-c12b-4d2a-a659-f881b2644979', true],
    ['f763acd2-d696-497b-8a41-8eb371a791c9', true],
    ['e008f98a-7fb9-4fc8-9f19-fc8a694498fe', true],
    ['37a3e8f1-a2c9-4e34-8cd7-4af2be8e634e', true],
    ['b2aac4a5-b48d-40bc-99da-649b839030eb', true],
    ['8a98274a-6766-47e2-8deb-c83b002ecf51', true],
    ['a10a1e34-4445-4c32-b7cf-232dbc93ff7b', true],
    ['32865056-caa7-46fe-a2cd-85cc819f3b35', true],
    ['971e0c54-0684-430f-b3af-b1dc44312212', true],
    ['40daeca5-d816-44fd-8bf9-2dd15102a149', true],
    ['bff02703-b89e-4404-a25a-4c750250dd1a', true],
    ['e5829f1b-a540-4eaa-87ba-845f9f33cbd0', true],
    ['bd66303f-4f1e-44bd-ba3f-168d7f9bf845', true],
    ['b18c4cdc-a6c8-44fa-beda-bf7b5aa25985', true],
    ['638c21a8-45bf-4638-ad23-add5ee258ad1', true],
    ['8e07192b-b973-4d0f-a4ef-6f153bbde322', true],
    ['a6c93067-4c1c-41df-8e0c-e16c95b286ab', true],
    ['e4f7af35-dbc6-4954-b52a-88ba2883b352', true],
    ['49e716a5-1186-4d6a-81b8-d143cab6ad4d', true],
    ['3f4e75db-56eb-495d-9ddb-0cdc91337b9a', true],
    ['6bf93a6c-29cd-4232-999a-61ddc0207174', true],
    ['0425fe00-f60a-40dd-bba9-703d3b44bcac', true],
    ['493d6695-2800-4093-878c-b9e8056b124d', true],
    ['b0d6381b-df61-4e36-83d0-01361d165ec4', true],
    ['52bd49d2-d133-425d-b097-7f8f408a7f95', true],
    ['72e70630-6978-4f4f-aaa9-4156010c60f1', true],
    ['9c34801a-1a95-44f3-89dd-a333d4266825', true],
    ['b8d4d1f2-c0b7-4c15-a7f6-9679635850e9', true],
    ['550e8a3c-27ab-419e-a862-660bff8d9647', true],
    ['8625e47e-ba89-45ac-bd8f-435317168894', true],
    ['72a9a335-a50b-4597-970c-cac88a57227f', true],
    ['8065989d-8cad-4ee9-84fc-afe5ddf4dcea', true],
    ['4ed4dfce-3d24-4462-872e-6ab4ded96cf5', true],
    ['be352786-6770-4aa8-bc1b-397fc3dfa1e5', true],
    ['fd733a1f-c8a0-4eaa-bb14-0f5a3b498430', true],
    ['01571eae-65a6-43b2-a302-60bdde6f7e3e', true],
    ['f1165243-7ba7-4c5e-9a8e-d4b749c75d38', true],
    ['99cbb991-55aa-4104-8fd2-0b2da48cb7af', true],
    ['88d2d6c8-86c0-4a74-b105-9512238e9b30', true],
    ['30126960-7767-42bd-9fa4-f5de4b8e8d6c', true],
    ['7c05e6b8-f51f-42ba-9b84-841a22cebbd6', true],
    ['08af656c-53a2-41ac-96af-aacee40afb27', true],
    ['edf18749-801e-48fa-b4dc-ce0c98ef19bb', true],
    ['671e2576-2e7d-47a9-9d91-b1b222264cbd', true],

    // Invalid GUIDs
    ['123', false],
    ['abc', false],
    ['', false],
    ['123-abc', false],
    ['123-abc-123-abc-123', false],
    ['notaguid', false],
    ['12345678-abcd-1234-5678-abcd', false],
    ['abcdefgh-ijkl-mnop-qrst-uvwxyz123456', false],
    ['12345678-abcd-efgh-ijkl-1234567890', false],
    ['12345678-abcd-efgh-ijkl-mnop', false],
  ])(`isGuid(%s) should return %s`, (input, expected) => {
    expect(isGuid(input)).toBe(expected);
  });
});

describe('useGetUserIdParam', () => {
  beforeEach(() => {
    mockedUseParams.mockClear();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should throw missing param error', () => {
    const param = 'test';

    mockedUseParams.mockReturnValue({});

    expect(() => useGetUserIdParam(param)).toThrow(`Missing ${param} param`);
  });

  it('should return correct value', () => {
    const idString = '644151efc3a961d2784456d9';
    const param = 'test';

    mockedUseParams.mockReturnValue({ test: idString });

    expect(useGetUserIdParam(param)).toEqual(idString);
  });
});

describe('useGetNumberParam', () => {
  beforeEach(() => {
    mockedUseParams.mockClear();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should throw missing param error', () => {
    const param = 'test';

    mockedUseParams.mockReturnValue({});

    expect(() => useGetNumberParam(param)).toThrow(`Missing ${param} param`);
  });

  it('should throw invalid number error', () => {
    const param = 'test';

    mockedUseParams.mockReturnValue({ test: 'abc' });

    expect(() => useGetNumberParam(param)).toThrow(`Invalid ${param} param`);
  });

  it('should return correct value', () => {
    const numberString = '123';
    const param = 'test';

    mockedUseParams.mockReturnValue({ test: numberString });

    expect(useGetNumberParam(param)).toEqual(123);
  });
});
