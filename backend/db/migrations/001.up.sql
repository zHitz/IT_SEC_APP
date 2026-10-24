BEGIN;
CREATE SCHEMA asset_inventory;
COMMENT ON SCHEMA asset_inventory IS 'atlas:s0-002:001';
SET LOCAL search_path = asset_inventory, pg_catalog;

-- SRS entity: Host / Server
CREATE TABLE "host" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "hostname" text NOT NULL,
  "host_uuid" text UNIQUE,
  "ip_addresses" inet[] NOT NULL DEFAULT '{}',
  "mac" macaddr,
  "os" text,
  "os_version" text,
  "kernel" text,
  "cpu" text,
  "ram" bigint CHECK (ram >= 0),
  "disk" bigint CHECK (disk >= 0),
  "virtualization" text,
  "cloud_provider" text,
  "agent_status" text,
  "last_boot" timestamptz,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "host" IS 'Host / Server';

-- SRS entity: Workstation
CREATE TABLE "workstation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "hostname" text NOT NULL,
  "os" text,
  "os_major_version" text,
  "assigned_user" text,
  "last_checkin_at" timestamptz,
  "status" text NOT NULL DEFAULT 'online' CHECK (status IN ('online','offline','inactive','missing','retired')),
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "workstation" IS 'Workstation';

-- SRS entity: Site
CREATE TABLE "site" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "name" text NOT NULL,
  "address_summary" text,
  "contact" text,
  "workstation_count" bigint NOT NULL DEFAULT 0 CHECK (workstation_count >= 0),
  "server_count" bigint NOT NULL DEFAULT 0 CHECK (server_count >= 0),
  CHECK (first_seen_at <= last_seen_at),
  CHECK (source = 'manual')
);
COMMENT ON TABLE "site" IS 'Site';

-- SRS entity: Service / Application
CREATE TABLE "service" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "name" text NOT NULL,
  "display_name" text,
  "criticality" text NOT NULL CHECK (criticality IN ('critical','high','medium','low')),
  "repo_url" text,
  "lifecycle" text CHECK (lifecycle IN ('active','deprecated','planned')),
  "description" text,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "service" IS 'Service / Application';

-- SRS entity: Deployment
CREATE TABLE "deployment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "service_id" uuid NOT NULL,
  "host_id" uuid,
  "cluster_id" text,
  "namespace" text,
  "replicas" integer CHECK (replicas >= 0),
  "image_ref" text,
  "image_digest" text,
  "started_at" timestamptz,
  "version_label" text,
  CHECK (first_seen_at <= last_seen_at),
  CHECK (num_nonnulls(host_id, cluster_id) = 1)
);
COMMENT ON TABLE "deployment" IS 'Deployment';

-- SRS entity: Container
CREATE TABLE "container" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "container_id" text NOT NULL UNIQUE,
  "image" text NOT NULL,
  "image_digest" text NOT NULL,
  "runtime" text NOT NULL CHECK (runtime IN ('docker','k8s')),
  "host_id" uuid NOT NULL,
  "deployment_id" uuid,
  "ports" integer[] NOT NULL DEFAULT '{}',
  "mounts" jsonb NOT NULL DEFAULT '[]',
  "privileged" boolean NOT NULL DEFAULT false,
  "run_as_user" text,
  "restart_count" integer NOT NULL DEFAULT 0 CHECK (restart_count >= 0),
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "container" IS 'Container';

-- SRS entity: Image
CREATE TABLE "image" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "repository" text NOT NULL,
  "tag" text,
  "digest" text NOT NULL UNIQUE,
  "os_base" text,
  "size" bigint CHECK (size >= 0),
  "created_at" timestamptz,
  "known_vuln_summary" jsonb,
  "last_scanned_at" timestamptz,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "image" IS 'Image';

-- SRS entity: Package / Library
CREATE TABLE "package" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "name" text NOT NULL,
  "version" text NOT NULL,
  "normalized_version" text NOT NULL,
  "ecosystem" text NOT NULL CHECK (ecosystem IN ('deb','rpm','npm','pip','go','maven','other')),
  "source_host_or_image" uuid NOT NULL,
  "source_kind" text NOT NULL CHECK (source_kind IN ('host','image')),
  "runtime_id" uuid,
  "license" text,
  "is_eol" boolean NOT NULL DEFAULT false,
  "source_host_id" uuid GENERATED ALWAYS AS (CASE WHEN source_kind = 'host' THEN source_host_or_image END) STORED,
  "source_image_id" uuid GENERATED ALWAYS AS (CASE WHEN source_kind = 'image' THEN source_host_or_image END) STORED,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "package" IS 'Package / Library';

-- SRS entity: Runtime / Stack
CREATE TABLE "runtime_stack" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "version" text,
  "eol_date" date,
  "support_status" text,
  "service_id" uuid,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "runtime_stack" IS 'Runtime / Stack';

-- SRS entity: Network Interface / IP
CREATE TABLE "network_interface" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "host_id" uuid NOT NULL,
  "interface" text,
  "ip" inet NOT NULL,
  "cidr" cidr,
  "is_public" boolean NOT NULL DEFAULT false,
  "mac" macaddr,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "network_interface" IS 'Network Interface / IP';

-- SRS entity: Listening Port
CREATE TABLE "listening_port" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "host_id" uuid,
  "container_id" uuid,
  "protocol" text NOT NULL CHECK (protocol IN ('tcp','udp')),
  "port" integer NOT NULL CHECK (port BETWEEN 1 AND 65535),
  "bind_address" inet NOT NULL,
  "process" text,
  "pid" bigint CHECK (pid >= 0),
  "is_exposed" boolean NOT NULL DEFAULT false,
  CHECK (first_seen_at <= last_seen_at),
  CHECK (num_nonnulls(host_id, container_id) = 1)
);
COMMENT ON TABLE "listening_port" IS 'Listening Port';

-- SRS entity: Firewall Rule
CREATE TABLE "firewall_rule" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "host_id" uuid NOT NULL,
  "source_system" text NOT NULL,
  "action" text NOT NULL CHECK (action IN ('allow','deny','reject')),
  "src_cidr" cidr,
  "dst" text,
  "ports" integer[] NOT NULL DEFAULT '{}',
  "direction" text CHECK (direction IN ('ingress','egress')),
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "firewall_rule" IS 'Firewall Rule';

-- SRS entity: Domain
CREATE TABLE "domain" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "fqdn" text NOT NULL UNIQUE,
  "registrar_note" text,
  "is_internal" boolean NOT NULL DEFAULT false,
  "primary_service_id" uuid,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "domain" IS 'Domain';

-- SRS entity: DNS Record
CREATE TABLE "dns_record" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "domain" text NOT NULL,
  "type" text NOT NULL CHECK (type IN ('A','AAAA','CNAME','TXT','MX','NS','SOA','SRV','CAA','PTR','DS','DNSKEY','TLSA','HTTPS','SVCB','NAPTR','URI','CERT','SSHFP','SMIMEA','OPENPGPKEY','LOC','HINFO','RP')),
  "value" text NOT NULL,
  "proxied" boolean NOT NULL DEFAULT false,
  "ttl" integer NOT NULL CHECK (ttl >= 0),
  "network_interface_id" uuid,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "dns_record" IS 'DNS Record';

-- SRS entity: Certificate
CREATE TABLE "certificate" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "domain" text NOT NULL,
  "issuer" text,
  "subject" text,
  "san" text[] NOT NULL DEFAULT '{}',
  "not_before" timestamptz,
  "not_after" timestamptz,
  "fingerprint" text UNIQUE,
  CHECK (first_seen_at <= last_seen_at),
  CHECK (not_after >= not_before)
);
COMMENT ON TABLE "certificate" IS 'Certificate';

-- SRS entity: Route (Traefik)
CREATE TABLE "route" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "host_id" uuid NOT NULL,
  "router_name" text NOT NULL,
  "rule_host" text,
  "rule_path" text,
  "service_target" uuid NOT NULL,
  "middlewares" text[] NOT NULL DEFAULT '{}',
  "tls" boolean NOT NULL DEFAULT false,
  "entrypoint" text,
  "source_config" text,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "route" IS 'Route (Traefik)';

-- SRS entity: Access Policy
CREATE TABLE "access_policy" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "system" text NOT NULL CHECK (system IN ('Pomerium','Traefik','Keycloak')),
  "route_ref" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "allowed_groups" uuid[] NOT NULL DEFAULT '{}',
  "allowed_domains" text[] NOT NULL DEFAULT '{}',
  "mfa_required" boolean NOT NULL DEFAULT false,
  "public_allowed" boolean NOT NULL DEFAULT false,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "access_policy" IS 'Access Policy';

-- SRS entity: Identity Group / Role
CREATE TABLE "identity_group_role" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "idp" text NOT NULL,
  "realm" text NOT NULL,
  "client_id" text,
  "groups" text[] NOT NULL DEFAULT '{}',
  "roles" text[] NOT NULL DEFAULT '{}',
  "user_count" integer NOT NULL DEFAULT 0 CHECK (user_count >= 0),
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "identity_group_role" IS 'Identity Group / Role';

-- SRS entity: Vulnerability (CVE)
CREATE TABLE "vulnerability" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "cve_id" text NOT NULL UNIQUE,
  "aliases" text[] NOT NULL DEFAULT '{}',
  "cvss" numeric CHECK (cvss BETWEEN 0 AND 10),
  "severity" text CHECK (severity IN ('critical','high','medium','low','unknown')),
  "kev_listed" boolean NOT NULL DEFAULT false,
  "epss" numeric CHECK (epss BETWEEN 0 AND 1),
  "published_at" timestamptz,
  "fixed_versions" text[] NOT NULL DEFAULT '{}',
  "references" text[] NOT NULL DEFAULT '{}',
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "vulnerability" IS 'Vulnerability (CVE)';

-- SRS entity: Finding
CREATE TABLE "finding" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "type" text NOT NULL CHECK (type IN ('cve','exposure','drift','eol','misconfig')),
  "entity_ref" uuid NOT NULL,
  "entity_type" text NOT NULL,
  "vulnerability_id" uuid,
  "severity" text NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  "risk_score" integer CHECK (risk_score BETWEEN 0 AND 100),
  "status" text NOT NULL CHECK (status IN ('new','triaged','in_progress','mitigated','resolved','accepted_risk','false_positive')),
  "first_found" timestamptz NOT NULL,
  "last_found" timestamptz NOT NULL,
  "evidence_ref" text NOT NULL,
  "entity_host_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'host' THEN entity_ref END) STORED,
  "entity_workstation_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'workstation' THEN entity_ref END) STORED,
  "entity_site_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'site' THEN entity_ref END) STORED,
  "entity_service_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'service' THEN entity_ref END) STORED,
  "entity_deployment_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'deployment' THEN entity_ref END) STORED,
  "entity_container_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'container' THEN entity_ref END) STORED,
  "entity_image_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'image' THEN entity_ref END) STORED,
  "entity_package_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'package' THEN entity_ref END) STORED,
  "entity_runtime_stack_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'runtime_stack' THEN entity_ref END) STORED,
  "entity_network_interface_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'network_interface' THEN entity_ref END) STORED,
  "entity_listening_port_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'listening_port' THEN entity_ref END) STORED,
  "entity_firewall_rule_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'firewall_rule' THEN entity_ref END) STORED,
  "entity_domain_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'domain' THEN entity_ref END) STORED,
  "entity_dns_record_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'dns_record' THEN entity_ref END) STORED,
  "entity_certificate_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'certificate' THEN entity_ref END) STORED,
  "entity_route_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'route' THEN entity_ref END) STORED,
  "entity_access_policy_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'access_policy' THEN entity_ref END) STORED,
  "entity_identity_group_role_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'identity_group_role' THEN entity_ref END) STORED,
  "entity_vulnerability_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'vulnerability' THEN entity_ref END) STORED,
  "entity_owner_team_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'owner_team' THEN entity_ref END) STORED,
  "entity_collection_run_id" uuid GENERATED ALWAYS AS (CASE WHEN entity_type = 'collection_run' THEN entity_ref END) STORED,
  CHECK (first_seen_at <= last_seen_at),
  CHECK (entity_type IN ('host', 'workstation', 'site', 'service', 'deployment', 'container', 'image', 'package', 'runtime_stack', 'network_interface', 'listening_port', 'firewall_rule', 'domain', 'dns_record', 'certificate', 'route', 'access_policy', 'identity_group_role', 'vulnerability', 'owner_team', 'collection_run')),
  CHECK (type <> 'cve' OR vulnerability_id IS NOT NULL)
);
COMMENT ON TABLE "finding" IS 'Finding';

-- SRS entity: Owner / Team
CREATE TABLE "owner_team" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "team_name" text NOT NULL,
  "members" text[] NOT NULL DEFAULT '{}',
  "contact_channel" text,
  "escalation" text,
  CHECK (first_seen_at <= last_seen_at),
  CHECK (source = 'manual')
);
COMMENT ON TABLE "owner_team" IS 'Owner / Team';

-- SRS entity: Scan / Collection Run
CREATE TABLE "collection_run" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" text NOT NULL,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "confidence" text NOT NULL CHECK (confidence IN ('confirmed','inferred','stale')),
  "raw_ref" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "owner_id" uuid,
  "environment" text NOT NULL,
  "site_id" uuid,
  "record_status" text NOT NULL DEFAULT 'active' CHECK (record_status IN ('active','missing','retired')),
  "collection_run_id" uuid,
  "collector" text NOT NULL,
  "started_at" timestamptz NOT NULL,
  "finished_at" timestamptz,
  "status" text NOT NULL CHECK (status IN ('running','success','partial','failed')),
  "records_seen" integer NOT NULL DEFAULT 0 CHECK (records_seen >= 0),
  "errors" text[] NOT NULL DEFAULT '{}',
  "scope" jsonb,
  CHECK (first_seen_at <= last_seen_at)
);
COMMENT ON TABLE "collection_run" IS 'Scan / Collection Run';

-- Technical junction, not a business entity (TL decision A).
CREATE TABLE "access_policy_identity_group" ("policy_id" uuid NOT NULL, "identity_group_id" uuid NOT NULL, PRIMARY KEY ("policy_id", "identity_group_id"));

-- Technical junction, not a business entity (TL decision A).
CREATE TABLE "package_vulnerability" ("package_id" uuid NOT NULL, "vulnerability_id" uuid NOT NULL, PRIMARY KEY ("package_id", "vulnerability_id"));
ALTER TABLE "host" ADD CONSTRAINT "fk_host_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "host" ("owner_id");
ALTER TABLE "host" ADD CONSTRAINT "fk_host_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "host" ("site_id");
ALTER TABLE "host" ADD CONSTRAINT "fk_host_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "host" ("collection_run_id");
ALTER TABLE "workstation" ADD CONSTRAINT "fk_workstation_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "workstation" ("owner_id");
ALTER TABLE "workstation" ADD CONSTRAINT "fk_workstation_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "workstation" ("site_id");
ALTER TABLE "workstation" ADD CONSTRAINT "fk_workstation_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "workstation" ("collection_run_id");
ALTER TABLE "site" ADD CONSTRAINT "fk_site_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "site" ("owner_id");
ALTER TABLE "site" ADD CONSTRAINT "fk_site_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "site" ("site_id");
ALTER TABLE "site" ADD CONSTRAINT "fk_site_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "site" ("collection_run_id");
ALTER TABLE "service" ADD CONSTRAINT "fk_service_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "service" ("owner_id");
ALTER TABLE "service" ADD CONSTRAINT "fk_service_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "service" ("site_id");
ALTER TABLE "service" ADD CONSTRAINT "fk_service_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "service" ("collection_run_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("owner_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("site_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("collection_run_id");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("owner_id");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("site_id");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("collection_run_id");
ALTER TABLE "image" ADD CONSTRAINT "fk_image_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "image" ("owner_id");
ALTER TABLE "image" ADD CONSTRAINT "fk_image_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "image" ("site_id");
ALTER TABLE "image" ADD CONSTRAINT "fk_image_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "image" ("collection_run_id");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("owner_id");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("site_id");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("collection_run_id");
ALTER TABLE "runtime_stack" ADD CONSTRAINT "fk_runtime_stack_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "runtime_stack" ("owner_id");
ALTER TABLE "runtime_stack" ADD CONSTRAINT "fk_runtime_stack_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "runtime_stack" ("site_id");
ALTER TABLE "runtime_stack" ADD CONSTRAINT "fk_runtime_stack_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "runtime_stack" ("collection_run_id");
ALTER TABLE "network_interface" ADD CONSTRAINT "fk_network_interface_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "network_interface" ("owner_id");
ALTER TABLE "network_interface" ADD CONSTRAINT "fk_network_interface_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "network_interface" ("site_id");
ALTER TABLE "network_interface" ADD CONSTRAINT "fk_network_interface_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "network_interface" ("collection_run_id");
ALTER TABLE "listening_port" ADD CONSTRAINT "fk_listening_port_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "listening_port" ("owner_id");
ALTER TABLE "listening_port" ADD CONSTRAINT "fk_listening_port_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "listening_port" ("site_id");
ALTER TABLE "listening_port" ADD CONSTRAINT "fk_listening_port_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "listening_port" ("collection_run_id");
ALTER TABLE "firewall_rule" ADD CONSTRAINT "fk_firewall_rule_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "firewall_rule" ("owner_id");
ALTER TABLE "firewall_rule" ADD CONSTRAINT "fk_firewall_rule_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "firewall_rule" ("site_id");
ALTER TABLE "firewall_rule" ADD CONSTRAINT "fk_firewall_rule_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "firewall_rule" ("collection_run_id");
ALTER TABLE "domain" ADD CONSTRAINT "fk_domain_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "domain" ("owner_id");
ALTER TABLE "domain" ADD CONSTRAINT "fk_domain_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "domain" ("site_id");
ALTER TABLE "domain" ADD CONSTRAINT "fk_domain_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "domain" ("collection_run_id");
ALTER TABLE "dns_record" ADD CONSTRAINT "fk_dns_record_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "dns_record" ("owner_id");
ALTER TABLE "dns_record" ADD CONSTRAINT "fk_dns_record_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "dns_record" ("site_id");
ALTER TABLE "dns_record" ADD CONSTRAINT "fk_dns_record_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "dns_record" ("collection_run_id");
ALTER TABLE "certificate" ADD CONSTRAINT "fk_certificate_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "certificate" ("owner_id");
ALTER TABLE "certificate" ADD CONSTRAINT "fk_certificate_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "certificate" ("site_id");
ALTER TABLE "certificate" ADD CONSTRAINT "fk_certificate_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "certificate" ("collection_run_id");
ALTER TABLE "route" ADD CONSTRAINT "fk_route_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "route" ("owner_id");
ALTER TABLE "route" ADD CONSTRAINT "fk_route_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "route" ("site_id");
ALTER TABLE "route" ADD CONSTRAINT "fk_route_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "route" ("collection_run_id");
ALTER TABLE "access_policy" ADD CONSTRAINT "fk_access_policy_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy" ("owner_id");
ALTER TABLE "access_policy" ADD CONSTRAINT "fk_access_policy_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy" ("site_id");
ALTER TABLE "access_policy" ADD CONSTRAINT "fk_access_policy_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy" ("collection_run_id");
ALTER TABLE "identity_group_role" ADD CONSTRAINT "fk_identity_group_role_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "identity_group_role" ("owner_id");
ALTER TABLE "identity_group_role" ADD CONSTRAINT "fk_identity_group_role_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "identity_group_role" ("site_id");
ALTER TABLE "identity_group_role" ADD CONSTRAINT "fk_identity_group_role_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "identity_group_role" ("collection_run_id");
ALTER TABLE "vulnerability" ADD CONSTRAINT "fk_vulnerability_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "vulnerability" ("owner_id");
ALTER TABLE "vulnerability" ADD CONSTRAINT "fk_vulnerability_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "vulnerability" ("site_id");
ALTER TABLE "vulnerability" ADD CONSTRAINT "fk_vulnerability_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "vulnerability" ("collection_run_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("owner_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("site_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("collection_run_id");
ALTER TABLE "owner_team" ADD CONSTRAINT "fk_owner_team_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "owner_team" ("owner_id");
ALTER TABLE "owner_team" ADD CONSTRAINT "fk_owner_team_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "owner_team" ("site_id");
ALTER TABLE "owner_team" ADD CONSTRAINT "fk_owner_team_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "owner_team" ("collection_run_id");
ALTER TABLE "collection_run" ADD CONSTRAINT "fk_collection_run_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "collection_run" ("owner_id");
ALTER TABLE "collection_run" ADD CONSTRAINT "fk_collection_run_site_id" FOREIGN KEY ("site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "collection_run" ("site_id");
ALTER TABLE "collection_run" ADD CONSTRAINT "fk_collection_run_collection_run_id" FOREIGN KEY ("collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "collection_run" ("collection_run_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_service_id" FOREIGN KEY ("service_id") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("service_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("host_id");
ALTER TABLE "deployment" ADD CONSTRAINT "fk_deployment_image_digest" FOREIGN KEY ("image_digest") REFERENCES "image" ("digest") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "deployment" ("image_digest");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("host_id");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_deployment_id" FOREIGN KEY ("deployment_id") REFERENCES "deployment" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("deployment_id");
ALTER TABLE "container" ADD CONSTRAINT "fk_container_image_digest" FOREIGN KEY ("image_digest") REFERENCES "image" ("digest") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "container" ("image_digest");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_runtime_id" FOREIGN KEY ("runtime_id") REFERENCES "runtime_stack" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("runtime_id");
ALTER TABLE "runtime_stack" ADD CONSTRAINT "fk_runtime_stack_service_id" FOREIGN KEY ("service_id") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "runtime_stack" ("service_id");
ALTER TABLE "network_interface" ADD CONSTRAINT "fk_network_interface_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "network_interface" ("host_id");
ALTER TABLE "listening_port" ADD CONSTRAINT "fk_listening_port_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "listening_port" ("host_id");
ALTER TABLE "listening_port" ADD CONSTRAINT "fk_listening_port_container_id" FOREIGN KEY ("container_id") REFERENCES "container" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "listening_port" ("container_id");
ALTER TABLE "firewall_rule" ADD CONSTRAINT "fk_firewall_rule_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "firewall_rule" ("host_id");
ALTER TABLE "domain" ADD CONSTRAINT "fk_domain_primary_service_id" FOREIGN KEY ("primary_service_id") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "domain" ("primary_service_id");
ALTER TABLE "dns_record" ADD CONSTRAINT "fk_dns_record_domain" FOREIGN KEY ("domain") REFERENCES "domain" ("fqdn") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "dns_record" ("domain");
ALTER TABLE "dns_record" ADD CONSTRAINT "fk_dns_record_network_interface_id" FOREIGN KEY ("network_interface_id") REFERENCES "network_interface" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "dns_record" ("network_interface_id");
ALTER TABLE "certificate" ADD CONSTRAINT "fk_certificate_domain" FOREIGN KEY ("domain") REFERENCES "domain" ("fqdn") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "certificate" ("domain");
ALTER TABLE "route" ADD CONSTRAINT "fk_route_host_id" FOREIGN KEY ("host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "route" ("host_id");
ALTER TABLE "route" ADD CONSTRAINT "fk_route_service_target" FOREIGN KEY ("service_target") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "route" ("service_target");
ALTER TABLE "access_policy" ADD CONSTRAINT "fk_access_policy_route_ref" FOREIGN KEY ("route_ref") REFERENCES "route" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy" ("route_ref");
ALTER TABLE "access_policy" ADD CONSTRAINT "fk_access_policy_service_id" FOREIGN KEY ("service_id") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy" ("service_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_vulnerability_id" FOREIGN KEY ("vulnerability_id") REFERENCES "vulnerability" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("vulnerability_id");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_source_host_id" FOREIGN KEY ("source_host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("source_host_id");
ALTER TABLE "package" ADD CONSTRAINT "fk_package_source_image_id" FOREIGN KEY ("source_image_id") REFERENCES "image" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package" ("source_image_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_host_id" FOREIGN KEY ("entity_host_id") REFERENCES "host" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_host_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_workstation_id" FOREIGN KEY ("entity_workstation_id") REFERENCES "workstation" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_workstation_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_site_id" FOREIGN KEY ("entity_site_id") REFERENCES "site" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_site_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_service_id" FOREIGN KEY ("entity_service_id") REFERENCES "service" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_service_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_deployment_id" FOREIGN KEY ("entity_deployment_id") REFERENCES "deployment" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_deployment_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_container_id" FOREIGN KEY ("entity_container_id") REFERENCES "container" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_container_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_image_id" FOREIGN KEY ("entity_image_id") REFERENCES "image" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_image_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_package_id" FOREIGN KEY ("entity_package_id") REFERENCES "package" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_package_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_runtime_stack_id" FOREIGN KEY ("entity_runtime_stack_id") REFERENCES "runtime_stack" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_runtime_stack_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_network_interface_id" FOREIGN KEY ("entity_network_interface_id") REFERENCES "network_interface" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_network_interface_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_listening_port_id" FOREIGN KEY ("entity_listening_port_id") REFERENCES "listening_port" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_listening_port_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_firewall_rule_id" FOREIGN KEY ("entity_firewall_rule_id") REFERENCES "firewall_rule" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_firewall_rule_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_domain_id" FOREIGN KEY ("entity_domain_id") REFERENCES "domain" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_domain_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_dns_record_id" FOREIGN KEY ("entity_dns_record_id") REFERENCES "dns_record" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_dns_record_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_certificate_id" FOREIGN KEY ("entity_certificate_id") REFERENCES "certificate" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_certificate_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_route_id" FOREIGN KEY ("entity_route_id") REFERENCES "route" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_route_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_access_policy_id" FOREIGN KEY ("entity_access_policy_id") REFERENCES "access_policy" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_access_policy_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_identity_group_role_id" FOREIGN KEY ("entity_identity_group_role_id") REFERENCES "identity_group_role" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_identity_group_role_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_vulnerability_id" FOREIGN KEY ("entity_vulnerability_id") REFERENCES "vulnerability" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_vulnerability_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_owner_team_id" FOREIGN KEY ("entity_owner_team_id") REFERENCES "owner_team" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_owner_team_id");
ALTER TABLE "finding" ADD CONSTRAINT "fk_finding_entity_collection_run_id" FOREIGN KEY ("entity_collection_run_id") REFERENCES "collection_run" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "finding" ("entity_collection_run_id");
ALTER TABLE "access_policy_identity_group" ADD CONSTRAINT "fk_access_policy_identity_group_policy_id" FOREIGN KEY ("policy_id") REFERENCES "access_policy" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy_identity_group" ("policy_id");
ALTER TABLE "access_policy_identity_group" ADD CONSTRAINT "fk_access_policy_identity_group_identity_group_id" FOREIGN KEY ("identity_group_id") REFERENCES "identity_group_role" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "access_policy_identity_group" ("identity_group_id");
ALTER TABLE "package_vulnerability" ADD CONSTRAINT "fk_package_vulnerability_package_id" FOREIGN KEY ("package_id") REFERENCES "package" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package_vulnerability" ("package_id");
ALTER TABLE "package_vulnerability" ADD CONSTRAINT "fk_package_vulnerability_vulnerability_id" FOREIGN KEY ("vulnerability_id") REFERENCES "vulnerability" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX ON "package_vulnerability" ("vulnerability_id");

-- Authoritative membership is the FK junction. Keep SRS array as a read projection.
CREATE FUNCTION refresh_policy_groups() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
DECLARE policy uuid;
BEGIN
  FOR policy IN SELECT DISTINCT unnest(CASE WHEN TG_OP = 'INSERT' THEN ARRAY[NEW.policy_id] WHEN TG_OP = 'DELETE' THEN ARRAY[OLD.policy_id] ELSE ARRAY[OLD.policy_id, NEW.policy_id] END) LOOP
    PERFORM 1 FROM access_policy WHERE id = policy FOR UPDATE;
    UPDATE access_policy SET allowed_groups = ARRAY(SELECT identity_group_id FROM access_policy_identity_group WHERE policy_id = policy ORDER BY identity_group_id) WHERE id = policy;
  END LOOP;
  RETURN NULL;
END $$;
CREATE TRIGGER refresh_policy_groups AFTER INSERT OR UPDATE OR DELETE ON access_policy_identity_group FOR EACH ROW EXECUTE FUNCTION refresh_policy_groups();
CREATE FUNCTION verify_policy_groups() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
BEGIN
  IF NEW.allowed_groups IS DISTINCT FROM ARRAY(SELECT identity_group_id FROM access_policy_identity_group WHERE policy_id = NEW.id ORDER BY identity_group_id) THEN
    RAISE EXCEPTION 'allowed_groups is a read projection; write membership through the junction' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER verify_policy_groups AFTER INSERT OR UPDATE ON access_policy DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION verify_policy_groups();

CREATE FUNCTION maintain_site_counts() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
DECLARE count_field text;
BEGIN
  count_field := CASE WHEN TG_TABLE_NAME = 'host' THEN 'server_count' ELSE 'workstation_count' END;
  IF TG_OP <> 'INSERT' AND OLD.site_id IS NOT NULL AND OLD.record_status = 'active' THEN
    EXECUTE format('UPDATE asset_inventory.site SET %I = %I - 1 WHERE id = $1', count_field, count_field) USING OLD.site_id;
  END IF;
  IF TG_OP <> 'DELETE' AND NEW.site_id IS NOT NULL AND NEW.record_status = 'active' THEN
    EXECUTE format('UPDATE asset_inventory.site SET %I = %I + 1 WHERE id = $1', count_field, count_field) USING NEW.site_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER maintain_site_counts AFTER INSERT OR UPDATE OR DELETE ON host FOR EACH ROW EXECUTE FUNCTION maintain_site_counts();
CREATE TRIGGER maintain_site_counts AFTER INSERT OR UPDATE OR DELETE ON workstation FOR EACH ROW EXECUTE FUNCTION maintain_site_counts();
COMMIT;
