#!/bin/bash
set -euo pipefail

mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" <<SQL

CREATE DATABASE IF NOT EXISTS keycloak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON keycloak.* TO '${MARIADB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
