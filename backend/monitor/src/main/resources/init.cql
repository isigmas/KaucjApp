CREATE KEYSPACE IF NOT EXISTS monitor_db
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE monitor_db;

CREATE TABLE IF NOT EXISTS system_log (
                                      bucket text,
                                      service_name text,
                                      timestamp bigint,
                                      level text,
                                      message text,
                                      PRIMARY KEY ((bucket), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);