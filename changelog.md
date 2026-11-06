# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2026-11-01

### Fixed

- Require `lognow ^0.8.7` so `setLogger()` accepts console-like targets without `trace` and rejects invalid targets with `TypeError`.

### Documentation

- Clarify accepted logger methods and stream targets, disabling logging with no argument, and errors for invalid logger values.

### Maintenance

- Raise runtime dependency floors to `smol-toml ^1.9.1` and `zod ^4.6.7`.
- Refresh development tools and pnpm, align Node.js types with Node 20.19, and replace the prepare hook with pnpm-native skill synchronization.
- Update workflow Actions, run dependency updates monthly, and make link checks exclude loopback URLs and tolerate empty inputs.

## [0.4.1] - 2026-10-06

### Documentation

- Document the exact supported Node.js ranges and clarify npm installation instructions.

### Maintenance

- Add scheduled and manually triggered dependency-update automation that opens pull requests.
- Validate release tags against the repository's default branch, use the triggering tag directly, and pin release Actions.
- Refresh shared-config and pnpm, add automatic development-skill synchronization, and simplify contributor tooling configuration.

## [0.4.0] - 2026-10-05

### Changed

- **Breaking:** Restrict supported Node.js versions to `^20.19.0 || ^22.9.0 || ^24.0.0 || >=26.0.0`.

### Documentation

- Update the documented Node.js minimum to 20.19.0.

### Maintenance

- Update the declared `lognow`, `smol-toml`, `type-fest`, and Zod runtime dependencies.
- Migrate to pnpm 12, TypeScript 6, Vitest 5, and shared-config 8; require `^24.16.0 || >=26.3.0` Node.js for development and limit built-in API types to the consumer baseline.
- Add automated repository and website link checks, refresh GitHub Actions, and update release publishing to use npm one-time passwords.

## [0.3.3] - 2026-05-16

### Documentation

- Update contribution guidance, document repository linting and README-generation tools, and refresh project links.

### Maintenance

- Update the declared `lognow`, `type-fest`, and Zod runtime dependencies.
- Migrate development tooling to pnpm 11, refresh build and test dependencies, update build permissions, and make cleanup cross-platform.
- Support release tags with or without a `v` prefix and pass npm authentication directly to the publishing command.

## [0.3.2] - 2026-04-06

### Fixed

- Prefix default logger output with `read-pyproject`.

### Maintenance

- Update the declared `lognow`, `smol-toml`, and `type-fest` runtime dependencies.
- Add Linux, macOS, and Windows CI for builds, linting, and tests, and switch the test script to run once.
- Refresh development dependencies and pnpm, and require Node.js 22.18+ for development.
- Tighten release and metadata workflow permissions, pin checkout actions, and improve shell handling of workflow values.

## [0.3.1] - 2026-03-10

### Maintenance

- Refresh development dependencies and pnpm, adjust Markdown linting, and update editor TypeScript settings.

## [0.3.0] - 2026-03-07

### Added

- Add synchronous `parsePyproject(content, options?)` for TOML strings, supporting validation, normalization, and raw or camelCase output.

### Changed

- **Breaking:** Rename the exported `ReadPyprojectOptions` type to `PyprojectOptions`, shared by the reading and parsing APIs.
- Standardize TOML and validation error messages across both APIs while retaining file context in `PyprojectError.filePath`.

### Documentation

- Add a string-parsing quick start and API reference with raw-output and unknown-key policy examples.

### Maintenance

- Refresh build and lint dependencies and pnpm, and add tests for direct string parsing.

## [0.2.0] - 2026-02-27

### Added

- Add `{ camelCase: false }` output, exported raw data types, and `ReadPyprojectOptions`, with return types inferred from the selected mode.

### Changed

- **Breaking:** Replace the positional unknown-key policy argument with an options object, such as `readPyproject(path, { unknownKeyPolicy: 'error' })`.
- **Breaking:** Apply camelCase conversion recursively to known and unknown keys, replacing expanded aliases such as `packageDirectory`, `excludeDirectories`, and `sourcePackages` with `packageDir`, `excludeDirs`, and `sourcePkgs`.
- **Breaking:** Preserve dependency-group contents as raw records, changing nested group-reference keys from `includeGroup` to `include-group`.
- Lower the declared Node.js minimum from 20.19.0 to 20.17.0.
- Move file-reading log messages from info to debug level.

### Fixed

- Keep absent `buildSystem` and `dependencyGroups` sections optional in returned data and inferred types.

### Documentation

- Document the options-object API, raw-key output, inferred return types, and revised Node.js requirement.

### Maintenance

- Add `type-fest` for camelCase output types and update the `lognow` dependency.
- Expand schema and fixture tests for both output modes and declare Node.js 20.19+ as the development requirement.

## [0.1.0] - 2026-02-27

### Added

- Introduce `readPyproject()` to asynchronously read, validate, and normalize TOML from a file, project directory, or current working directory.
- Provide typed project metadata, build-system settings, and PEP 735 dependency groups, exporting `PyprojectData`, `ProjectData`, and `BuildSystemData`.
- Provide typed schemas for 34 Python tool sections covering packaging, dependency management, testing, linting, formatting, and release workflows.
- Normalize known TOML keys to camelCase and project names according to PEP 503, preserving the original name as `project.rawName`.
- Normalize file-based readmes to path strings and inline readmes to `{ text, contentType? }` objects.
- Normalize SPDX license strings to `{ spdx }`, validate and correct license expressions, and support legacy file and text license tables.
- Offer `passthrough`, `strip`, and `error` policies for unknown fields and tools, with passthrough as the default and an exported `UnknownKeyPolicy` type.
- Expose `PyprojectError` for file, TOML, and validation failures, including file-path context and underlying causes.
- Expose `setLogger()` for injecting a custom logger or log target.
- Distribute an ESM npm package with TypeScript declarations for Node.js 20.19 and newer.

### Documentation

- Add installation instructions, API examples, normalization rules, supported-tool coverage, and links to tool configuration references.

### Maintenance

- Set up declaration builds, package validation, linting, unit and fixture tests, and release automation.

[0.1.0]: https://github.com/kitschpatrol/read-pyproject/releases/tag/v0.1.0
[0.2.0]: https://github.com/kitschpatrol/read-pyproject/compare/v0.1.0...v0.2.0
[0.3.0]: https://github.com/kitschpatrol/read-pyproject/compare/v0.2.0...v0.3.0
[0.3.1]: https://github.com/kitschpatrol/read-pyproject/compare/v0.3.0...v0.3.1
[0.3.2]: https://github.com/kitschpatrol/read-pyproject/compare/v0.3.1...v0.3.2
[0.3.3]: https://github.com/kitschpatrol/read-pyproject/compare/v0.3.2...v0.3.3
[0.4.0]: https://github.com/kitschpatrol/read-pyproject/compare/v0.3.3...v0.4.0
[0.4.1]: https://github.com/kitschpatrol/read-pyproject/compare/v0.4.0...v0.4.1
[0.4.2]: https://github.com/kitschpatrol/read-pyproject/compare/v0.4.1...v0.4.2
