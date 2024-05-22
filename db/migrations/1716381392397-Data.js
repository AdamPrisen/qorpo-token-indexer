module.exports = class Data1716381392397 {
    name = 'Data1716381392397'

    async up(db) {
        await db.query(`CREATE TABLE "token_owner" ("id" character varying NOT NULL, "owner_address" text NOT NULL, "token_address" text NOT NULL, "blockchain_symbol" character varying(3), "balance" numeric NOT NULL, "user_id" text, "last_update" integer NOT NULL, CONSTRAINT "PK_77fa31a311c711698a0b9443823" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_e5337ba6cb5bdf50b40e42e4e8" ON "token_owner" ("owner_address") `)
        await db.query(`CREATE INDEX "IDX_970bccbff6e336949a82208f05" ON "token_owner" ("token_address") `)
        await db.query(`CREATE INDEX "IDX_6396505dabe05a231e4449bfd1" ON "token_owner" ("blockchain_symbol") `)
        await db.query(`CREATE INDEX "IDX_8984c9dcfd4a6ed2cf5e9275bd" ON "token_owner" ("user_id") `)
        await db.query(`CREATE INDEX "IDX_dd5f1b0439f6f71b939930bc3e" ON "token_owner" ("last_update") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "token_owner"`)
        await db.query(`DROP INDEX "public"."IDX_e5337ba6cb5bdf50b40e42e4e8"`)
        await db.query(`DROP INDEX "public"."IDX_970bccbff6e336949a82208f05"`)
        await db.query(`DROP INDEX "public"."IDX_6396505dabe05a231e4449bfd1"`)
        await db.query(`DROP INDEX "public"."IDX_8984c9dcfd4a6ed2cf5e9275bd"`)
        await db.query(`DROP INDEX "public"."IDX_dd5f1b0439f6f71b939930bc3e"`)
    }
}
