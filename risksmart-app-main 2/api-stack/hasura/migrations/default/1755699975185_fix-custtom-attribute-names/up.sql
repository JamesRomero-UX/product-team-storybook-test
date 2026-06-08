/* Fix form_field_configuration ids that are custom attributes without the CustomAttributeData prefix */
update risksmart.form_field_configuration
set "FieldId" = 'CustomAttributeData.' || "FieldId",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "FieldId" ~ '[0-9]_'
    AND "FieldId" not like 'CustomAttributeData.%';