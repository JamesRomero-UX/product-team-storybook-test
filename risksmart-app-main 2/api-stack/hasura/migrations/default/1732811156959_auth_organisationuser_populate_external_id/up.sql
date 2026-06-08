-- only include SCIM enabled orgs (as of 28/11/2024)
UPDATE auth.organisationuser
SET "External_Id" = u."External_Id",
    "ModifiedAtTimestamp" = 'now()',
    "ModifiedByUser" = 'SYSTEM'
FROM auth.user u
WHERE auth.organisationuser."User_Id" = u."Id"
    AND auth.organisationuser."OrgKey" IN (
        'org_GFLk571Qp3AHqTLE',
        'org_g2CzhmnkGC0t9FTW',
        'org_dEudDMmt1nRFuba5',
        'org_toPJ7YG7mwZJdodA',
        'org_Qbkd6bDrGRUIUSug',
        'org_zM9IzTccdJDClroS',
        'org_0BTtVVx4BtaQruTI',
        'org_Qlmwmczj3fc0bDFC',
        'org_Km5vsacBcEiZ0oYn',
        'org_lvskQVkB4F02keth',
        'org_HLsIYjJ2JDRbToiq',
        'org_f1JdOIzjEuKmPUT6',
        'org_uspBqg49a0exSL71',
        'org_iCkotTHrWThpludm',
        'org_EqlsSc2cv8Xgmeop',
        'org_cgPglPSoxO76tIuV',
        'org_g14487y1em5jQDCj',
        'org_dlZTZm0A0MabjdBG',
        'org_TIdGjPYLqfr21oae',
        'org_TqQKEb10DV15QMTn',
        'org_4MMGzjfhwmqpv7ww',
        'org_VCbCinCOron1yB7z',
        'org_xa0TNeDvvrxMDLae',
        'org_HEJnfalGCv1BtLuC'
    );