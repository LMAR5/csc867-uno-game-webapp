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
    style: {
      type: "varchar(20)"
    },
  });

  //const sql = `INSERT INTO ${TABLE_NAME} (suit, value) VALUES`;
  const sql = `INSERT INTO ${TABLE_NAME} (suit, type, value, name, style) VALUES`;
  const values = [];

  // Adding number and action cards
  for (let suit = 0; suit < 4; suit++) {
    for (let type = 0; type < 2; type++) {
      for (let value = 0; value < 13; value++) {
        if (type === 0 && value < 10) {
          switch (suit) {
            case 0:
              values.push(`(${suit}, ${type}, ${value}, '${value} red', 'R red${value}')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} red', 'R red${value}')`);
              }
              break;
            case 1:
              values.push(`(${suit}, ${type}, ${value}, '${value} yellow', 'Y yellow${value}')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} yellow', 'Y yellow${value}')`);
              }
              break;
            case 2:
              values.push(`(${suit}, ${type}, ${value}, '${value} blue', 'B blue${value}')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} blue', 'B blue${value}')`);
              }
              break;
            default:
              values.push(`(${suit}, ${type}, ${value}, '${value} green', 'G green${value}')`);
              if (value > 0) {
                values.push(`(${suit}, ${type}, ${value}, '${value} green', 'G green${value}')`);
              }
              break;
          }
        } else if (type === 1 && value > 9) {
          switch (suit) {
            case 0:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 red', 'R redDraw2')`);
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 red', 'R redDraw2')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'Reverse red', 'R redRev')`);
                values.push(`(${suit}, ${type}, ${value}, 'Reverse red', 'R redRev')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'Skip red', 'R redSkip')`);
                values.push(`(${suit}, ${type}, ${value}, 'Skip red', 'R redSkip')`);
              }
              break;
            case 1:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 yellow', 'Y yellowDraw2')`);
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 yellow', 'Y yellowDraw2')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'Reverse yellow', 'Y yellowRev')`);
                values.push(`(${suit}, ${type}, ${value}, 'Reverse yellow', 'Y yellowRev')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'Skip yellow', 'Y yellowSkip')`);
                values.push(`(${suit}, ${type}, ${value}, 'Skip yellow', 'Y yellowSkip')`);
              }
              break;
            case 2:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 blue', 'B blueDraw2')`);
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 blue', 'B blueDraw2')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'Reverse blue', 'B blueRev')`);
                values.push(`(${suit}, ${type}, ${value}, 'Reverse blue', 'B blueRev')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'Skip blue', 'B blueSkip')`);
                values.push(`(${suit}, ${type}, ${value}, 'Skip blue', 'B blueSkip')`);
              }
              break;
            default:
              if (value === 10) {
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 green', 'G greenDraw2')`);
                values.push(`(${suit}, ${type}, ${value}, 'Draw 2 green', 'G greenDraw2')`);
              } else if (value === 11) {
                values.push(`(${suit}, ${type}, ${value}, 'Reverse green', 'G greenRev')`);
                values.push(`(${suit}, ${type}, ${value}, 'Reverse green', 'G greenRev')`);
              } else {
                values.push(`(${suit}, ${type}, ${value}, 'Skip green', 'G greenSkip')`);
                values.push(`(${suit}, ${type}, ${value}, 'Skip green', 'G greenSkip')`);
              }
              break;
          }
        }
      }
    }
  }

  // Adding wild cards
  values.push(`(0, 2, 13, 'Wild red', 'W red13')`);
  values.push(`(1, 2, 13, 'Wild yellow', 'W yellow13')`);  
  values.push(`(2, 2, 13, 'Wild blue', 'W blue13')`);
  values.push(`(3, 2, 13, 'Wild green', 'W green13')`);
  values.push(`(0, 2, 14, 'Wild draw 4 red', 'W red14')`);
  values.push(`(1, 2, 14, 'Wild draw 4 yellow', 'W yellow14')`);  
  values.push(`(2, 2, 14, 'Wild draw 4 blue', 'W blue14')`);
  values.push(`(3, 2, 14, 'Wild draw 4 green', 'W green14')`);

  const query = `${sql} ${values.join(",")}`;

  pgm.sql(query);
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
