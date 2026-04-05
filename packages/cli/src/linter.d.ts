/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */
export type LintRule = 'header-missing' | 'console-log' | 'naming-snake-case-response' | 'versioning-missing-prefix' | 'dry-violation';
export interface LintResult {
    file: string;
    line: number;
    rule: LintRule;
    message: string;
}
/**
 * Scans all `.ts` and `.vue` files under `srcDir` and returns all lint violations.
 *
 * @param srcDir - absolute or relative path to the project's `src/` directory
 */
export declare function lintProject(srcDir: string): Promise<LintResult[]>;
//# sourceMappingURL=linter.d.ts.map