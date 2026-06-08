-- Delete any department that does not have a corresponding department type
DELETE FROM risksmart.department
WHERE NOT EXISTS (
	SELECT department_type."DepartmentTypeId"
		FROM risksmart.department_type
	WHERE department."DepartmentTypeId" = department_type."DepartmentTypeId"
);

-- Add foreign key constraint to ensure data consistency so it doesn't happen in the future
ALTER TABLE risksmart.department
	ADD FOREIGN KEY ("DepartmentTypeId")
	REFERENCES risksmart.department_type("DepartmentTypeId")
	ON DELETE CASCADE;
