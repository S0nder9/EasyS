/**
 * Compatibility re-exports.
 * Prefer importing from src/project and src/config.
 */
export { findProject, tryFindProject } from "../../project/findProject";
export { Project } from "../../project/Project";
export { EasySConfig, DEFAULT_EASYS_CONFIG } from "../../config/EasySConfig";
export { ConfigParser } from "../../config/ConfigParser";
export { SourceResolver } from "../../project/SourceResolver";

import { findProject } from "../../project/findProject";
import { EasySConfig } from "../../config/EasySConfig";

/** @deprecated use findProject() */
export function findProjectRoot(start = process.cwd()): string {
  return findProject(start).root;
}

/** @deprecated use findProject().config */
export function loadConfig(root?: string): EasySConfig {
  if (root) {
    return findProject(root).config;
  }

  return findProject().config;
}

/** @deprecated use findProject().entry */
export function resolveEntry(root?: string): string {
  if (root) {
    return findProject(root).entry;
  }

  return findProject().entry;
}
