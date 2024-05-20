/* eslint-disable camelcase */

const TABLE_NAME = "games";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createType("game_status", ["Waiting", "In Progress", "Completed"]);
  pgm.createTable(TABLE_NAME, {
    id: "id",
    game_socket_id: {
      type: "varchar",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    status: {
      type: "game_status"
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: "true",
    },
    is_initialized: {
      type: "boolean",
      notNull: true,
      default: "false",
    },
    current_turn: {
      type: "int",
    },
    winner_id: {
      type: "int"
    }
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
