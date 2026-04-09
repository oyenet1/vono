/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */
/**
 * Generates the Bonifade Technologies file header comment string.
 *
 * @param _filePath - reserved for future per-file metadata (unused today)
 */
export declare function generateHeader(_filePath: string): string;
/**
 * Returns `true` when the file content already contains the Bonifade header.
 */
export declare function hasHeader(content: string): boolean;
/**
 * Injects the Bonifade header at the top of `content` if it is missing.
 * Preserves all existing content unchanged.
 *
 * @param filePath - path used to generate the header (passed to generateHeader)
 * @param content  - current file content
 * @returns the (possibly modified) file content
 */
export declare function injectHeader(filePath: string, content: string): string;
/**
 * Reads a file from disk, injects the header if missing, and writes it back.
 * Returns `true` when the file was modified, `false` when it already had a header.
 */
export declare function fixHeaderInFile(filePath: string): boolean;
//# sourceMappingURL=header-generator.d.ts.map