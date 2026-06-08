ALTER TABLE risksmart."aggregation_org"
ADD COLUMN "Config" jsonb;

insert into risksmart.risk_scoring_model ("Value", "Comment")
values (
        'number_of_controls_with_gaps',
        'Number of controls with gaps'
    );