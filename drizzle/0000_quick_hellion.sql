CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" text NOT NULL,
	"img" text,
	"roles" jsonb DEFAULT '["USER_ROLE"]'::jsonb NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
