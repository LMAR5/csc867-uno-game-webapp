/* eslint-disable camelcase */

const TABLE_NAME = "standard_deck_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    id: "id",
    suit: {
      type: "int",
    },
    type: {
      type: "int",
    },
    value: {
      type: "int",
    },
    name: {
      type: "varchar(20)",
    },
  });

  //const sql = `INSERT INTO ${TABLE_NAME} (suit, value) VALUES`;
  const sql = `INSERT INTO ${TABLE_NAME} (suit, type, value, name) VALUES`;
  const values = [];

  // Adding number and action cards
  for (let suit = 0; suit < 4; suit++) {
    for (let type = 0; type < 2; type++) {
      for (let value = 0; value < 13; value++) {
        if (type === 0 && value < 10) {
          switch (suit) {
            case 0:
              values.push(`(${suit}, ${type}, ${value}, '${value} red')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} red')`);
              }
              break;
            case 1:
              values.push(`(${suit}, ${type}, ${value}, '${value} yellow')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} yellow')`);
              }
              break;
            case 2:
              values.push(`(${suit}, ${type}, ${value}, '${value} blue')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} blue')`);
              }
              break;
            default:
              values.push(`(${suit}, ${type}, ${value}, '${value} green')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} green')`);
              }
              break;
          }
        } else if (type === 1 && value > 9) {
          switch (suit) {
            case 0:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 red')`);
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 red')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'reverse red')`);
                values.push(`(${suit}, ${type}, ${value}, 'reverse red')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'skip red')`);
                values.push(`(${suit}, ${type}, ${value}, 'skip red')`);
              }
              break;
            case 1:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 yellow')`);
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 yellow')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'reverse yellow')`);
                values.push(`(${suit}, ${type}, ${value}, 'reverse yellow')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'skip yellow')`);
                values.push(`(${suit}, ${type}, ${value}, 'skip yellow')`);
              }
              break;
            case 2:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 blue')`);
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 blue')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'reverse blue')`);
                values.push(`(${suit}, ${type}, ${value}, 'reverse blue')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'skip blue')`);
                values.push(`(${suit}, ${type}, ${value}, 'skip blue')`);
              }
              break;
            default:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 green')`);
                values.push(`(${suit}, ${type}, ${value}, 'draw 2 green')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'reverse green')`);
                values.push(`(${suit}, ${type}, ${value}, 'reverse green')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'skip green')`);
                values.push(`(${suit}, ${type}, ${value}, 'skip green')`);
              }
              break;
          }
        }
      }
    }
  }

  // Adding wild cards
  values.push(`(4, 2, 13, 'wild')`);
  values.push(`(4, 2, 13, 'wild')`);
  values.push(`(4, 2, 13, 'wild')`);
  values.push(`(4, 2, 13, 'wild')`);
  values.push(`(4, 2, 14, 'wild draw 4')`);
  values.push(`(4, 2, 14, 'wild draw 4')`);
  values.push(`(4, 2, 14, 'wild draw 4')`);
  values.push(`(4, 2, 14, 'wild draw 4')`);

  const query = `${sql} ${values.join(",")}`;

  pgm.sql(query);
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
