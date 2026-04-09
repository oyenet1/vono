/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */
export interface ModuleGeneratorOptions {
    /** Generate API files (routes, controller, service, dto, schema) */
    api: boolean;
    /** Generate frontend files (page, composable) */
    frontend: boolean;
    /** SaaS mode — adds deleted_at to schema */
    saas: boolean;
}
export interface GeneratedFile {
    path: string;
    content: string;
}
/**
 * Generates all module files for `name` according to `options`.
 * Returns the list of files that would be written (does NOT write to disk).
 * Use `writeModule()` to persist them.
 */
export declare function generateModule(name: string, options: ModuleGeneratorOptions): GeneratedFile[];
/**
 * Writes all generated files to disk.
 * Throws if the module directory already exists (prevents overwriting).
 */
export declare function writeModule(name: string, files: GeneratedFile[], projectRoot?: string): void;
//# sourceMappingURL=module-generator.d.ts.map