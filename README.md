# spatial-sqlite-api

> Testing spatial queries in Node using spatialite using the node-spatialite (which uses sqlite3).

## Notes

- GeoPackage is not working
- Save as Spatialite from QGIS
- use FTS to enable fast full-text search

```SQL
CREATE VIRTUAL TABLE search USING fts5(address, id, GEOMETRY UNINDEXED);

INSERT INTO search
SELECT address, ogc_fid, GEOMETRY
FROM parcels;

SELECT * FROM search LIMIT 10;
```

## References

- Spatialite Functions - http://www.gaia-gis.it/gaia-sins/spatialite-sql-4.2.0.html
- Data: https://geonames.usgs.gov/docs/stategaz/NationalFile.zip
