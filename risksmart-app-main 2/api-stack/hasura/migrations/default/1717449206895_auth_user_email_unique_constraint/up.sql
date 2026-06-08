CREATE UNIQUE INDEX idx_user_email ON auth.user ("Email")
WHERE "Email" IS NOT NULL;