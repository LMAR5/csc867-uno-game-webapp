/* eslint-disable camelcase */

const TABLE_NAME = "users";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */

exports.up = (pgm) => {
    pgm.addColumn("users", {
        first_name: {
            type: "varchar(255)",
            notNull: true,
            default: " "
        },
    });

    pgm.addColumn("users", {
        last_name: {
            type: "varchar(255)",
            notNull: true,
            default: " "
        },
    });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */

exports.down = (pgm) => {
    pgm.dropColumn("users", "first_name");
    pgm.dropColumn("users", "last_name");
};
