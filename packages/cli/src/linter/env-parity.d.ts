/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */
export interface EnvParityResult {
    /** Keys present in .env but missing from .env.example */
    missingInExample: string[];
    /** Keys present in .env.example but missing from .env */
    missingInEnv: string[];
}
/**
 * Parses an env file and returns the set of defined keys.
 * Ignores blank lines and comment lines (starting with #).
 */
export declare function parseEnvKeys(content: string): Set<string>;
/**
 * Compares `.env` and `.env.example` keys in `projectRoot`.
 *
 * Returns lists of keys missing from each file.
 * If `.env` does not exist, returns empty lists (no error — per Requirement 8.4).
 */
export declare function checkEnvParity(projectRoot: string): EnvParityResult;
//# sourceMappingURL=env-parity.d.ts.map