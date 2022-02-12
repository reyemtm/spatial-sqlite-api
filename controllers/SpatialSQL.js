const sqlite = require("spatialite");
const places = new sqlite.Database(
  "./db/world_places.sqlite",
  sqlite.OPEN_READONLY
);
const parcels = new sqlite.Database(
  "./db/parcels_san_diego.sqlite",
  sqlite.OPEN_READONLY
);

const g73_properties = new sqlite.Database(
  "./db/g73_properties.sqlite",
  sqlite.OPEN_READONLY
);

let spatialite_version;
//takes  ~ 30 seconds WHERE Intersects(GEOMETRY, ST_Buffer(SetSRID(MakePoint(-117.126322,32.733018), 4326), 0.001))
(() => {
  parcels.spatialite(function (err) {
    if (err) throw new Error(err);
    parcels.all(`select spatialite_version() as version`, function (err, rows) {
      if (err) throw new Error(err);
      if (!rows) console.log("no rows");
      spatialite_version = rows[0].version;
    });
  });

  // parcels.spatialite(function (err) {
  //   if (err) throw new Error(err);
  //   const sql = `SELECT ogc_fid
  //     FROM parcels
  //   WHERE Intersects( GEOMETRY, ST_Buffer(SetSRID(MakePoint(-117.126322,32.733018), 4326),0.0001) )`;
  //   parcels.all(sql, function (err, rows) {
  //     if (err) throw new Error(err);
  //     if (!rows) console.log("no rows");
  //     console.log(rows);
  //   });
  // });
})();

const { name, version } = require("../package.json");

// DB.loadExtension("./spatialite/dist/win32/x64/mod_spatialite");
// const listTables = (database) => {
//   database.serialize(function () {
//     database.all(
//       "SELECT name FROM sqlite_schema WHERE type='table';",
//       function (err, tables) {
//         console.log("tables", tables);
//       }
//     );
//   });
// };

class Point {
  constructor(props, coords) {
    delete props._x;
    delete props._y;
    this.type = "Feature";
    this.properties = props;
    this.geometry = {
      type: "Point",
      coordinates: coords,
    };
  }
}

const GetPropertiesByDistance = (request, reply) => {
  
  const { lng, lat, query } = request.query;
  console.log(lng, lat, query)
  const sql = `SELECT fuse,
      ST_Distance(Transform(GEOMETRY,3857), Transform(SetSRID(MakePoint(${Number(lng)},${Number(lat)}),4326),3857)) / 1000 as dist_km
    FROM
        search
    WHERE
        search MATCH ? ORDER BY dist_km, rank
    LIMIT 100`;

  g73_properties.spatialite(function (err) {
    if (err) return reply(err);
    const queryValue = [query + "*"];
    console.log(queryValue)
    g73_properties.all(sql, queryValue, function (err, rows) {
      if (err) throw new Error(err);

      reply.send({
        data: rows,
        meta: {
          api: name.split("-").join(" ").toUpperCase() + " Version " + version,
          response_time: Number(reply.getResponseTime().toFixed(2)),
          spatialite_version: spatialite_version,
          date_accessed: new Date(),
        },
      });
    });
  });
};

const GetNearest = (request, reply) => {
  
  parcels.spatialite((err) => {
    if (err) throw new Error(err);

    const bydist = `
    SELECT address
    FROM parcels
    WHERE ST_Within(GEOMETRY, ST_Buffer(SetSRID(MakePoint(-117.148723,32.735292),4326), 0.01))
    ORDER BY ST_Distance(GEOMETRY, SetSRID(MakePoint(-117.148723,32.735292),4326))
    LIMIT 1;`;

    const mbr = `
      SELECT address
      from parcels
      WHERE MbrIntersects(GEOMETRY, ST_Buffer(SetSRID(MakePoint(-117.148723,32.735292),4326), 0.00001))
      LIMIT 1;
    `;
    parcels.all(mbr, (err, rows) => {
      if (err) throw new Error(err);
      reply.send({
        data: rows,
        meta: {
          api: name.split("-").join(" ").toUpperCase() + " Version " + version,
          response_time: Number(reply.getResponseTime().toFixed(2)),
          spatialite_version: spatialite_version,
          date_accessed: new Date(),
        },
      });
    });
  });
};

const GetWithin = (request, reply) => {
  parcels.spatialite((err) => {
    if (err) throw new Error(err);

    const mbr = `
      SELECT address, Distance(ST_Transform(GEOMETRY, 3857), ST_Transform(SetSRID(MakePoint(-117.254779,32.717271),4326),3857)) as dist
      from parcels
      WHERE MbrIntersects(GEOMETRY, ST_Buffer(SetSRID(MakePoint(-117.254779,32.717271),4326), 0.0017)) AND dist < 250
      ORDER BY dist
    `;
    parcels.all(mbr, (err, rows) => {
      if (err) throw new Error(err);
      reply.send({
        data: rows,
        meta: {
          api: name.split("-").join(" ").toUpperCase() + " Version " + version,
          response_time: Number(reply.getResponseTime().toFixed(2)),
          spatialite_version: spatialite_version,
          date_accessed: new Date(),
        },
      });
    });
  });
};

const GetParcels = (request, reply) => {
  const { t, q } = request.query;
  const table = !t ? "parcels" : t === "parcels" ? "parcels" : "search";
  const sql = `SELECT address,
    X(Centroid(GEOMETRY)) as _x,
    Y(Centroid(GEOMETRY)) as _y,
    ST_Distance(Transform(GEOMETRY,3857), Transform(SetSRID(MakePoint(-117.148723,32.735292),4326),3857)) / 1000 as dist_km
  FROM
      ${table}
    WHERE
      ${
        table === "parcels"
          ? "address like ? ORDER BY dist_km asc"
          : table + " MATCH ? ORDER BY dist_km, rank"
      }
    LIMIT 100`;

  parcels.spatialite(function (err) {
    if (err) return reply(err);
    const queryValue =
      table === "parcels" ? ["%" + q.toUpperCase() + "%"] : [q + "*"];
    parcels.all(sql, queryValue, function (err, rows) {
      if (err) throw new Error(err);

      reply.send({
        data: rows,
        meta: {
          api: name.split("-").join(" ").toUpperCase() + " Version " + version,
          response_time: Number(reply.getResponseTime().toFixed(2)),
          spatialite_version: spatialite_version,
          date_accessed: new Date(),
        },
      });
    });
  });
};

const GetByDistance = (request, reply) => {
  const { lat, lng, q } = request.query;
  if (!lat || !lng || !Number(lat) || !Number(lng)) throw new Error();

  const sql = `SELECT name, state_alpha as state, county_name as county, "country code" as country,
      X(GEOMETRY) as _x,
      Y(GEOMETRY) as _y,
      Distance( Transform(GEOMETRY,3857), Transform(SetSRID(MakePoint(-82.5974,39.71205),4326),3857) ) * 0.00062137 AS dist
    FROM
      places
    WHERE
      name like ? AND _x IS NOT NULL
    ORDER BY 
      dist ASC
    LIMIT 10000`;

  places.spatialite(function (err) {
    if (err) return reply(err);
    places.all(sql, ["%" + q + "%"], function (err, rows) {
      if (err) throw new Error(err);

      const geojson = {
        type: "FeatureCollection",
        features: [],
      };

      const data = rows.slice(0, 50);

      data.forEach((row) => {
        geojson.features.push(new Point(row, [row._x, row._y]));
      });

      reply.send({
        data: geojson,
        meta: {
          api: name.split("-").join(" ").toUpperCase() + " Version " + version,
          response_time: Number(reply.getResponseTime().toFixed(2)),
          spatialite_version: spatialite_version,
          date_accessed: new Date(),
        },
      });
    });
  });
};

module.exports = {
  GetPropertiesByDistance,
  GetByDistance,
  GetParcels,
  GetNearest,
  GetWithin,
};
