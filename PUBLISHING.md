# Publishing Vonosan Packages to npm

> Quick reference for publishing the Vonosan monorepo packages.

---

## Packages Overview

| Package          | npm Name          | Directory                  | Access   |
| ---------------- | ----------------- | -------------------------- | -------- |
| Core framework   | `vonosan`         | `packages/vonosan`         | `public` |
| Project scaffold | `create-vonosan`  | `packages/create-vonosan`  | `public` |
| CLI              | `@vonosan/cli`    | `packages/cli`             | `public` |

---

## Prerequisites

1. **npm account** — You must be logged in:
   ```bash
   npm login
   ```
   Your npm username is `fade_networker`.

2. **NPM_TOKEN** (for CI/CD) — Create an automation token at:
   <https://www.npmjs.com/settings/fade_networker/tokens>
   Then add it as a GitHub repo secret named `NPM_TOKEN`:
   <https://github.com/oyenet1/vonosan/settings/secrets/actions>

---

## Method 1: Manual Publish (from your terminal)

### Step-by-step

```bash
# 1. Make sure you're logged in
npm whoami
# Should print: fade_networker

# 2. Build everything
bun run build

# 3. Bump version (pick one)
cd packages/vonosan
npm version patch   # 0.1.0 → 0.1.1  (bug fixes)
npm version minor   # 0.1.0 → 0.2.0  (new features)
npm version major   # 0.1.0 → 1.0.0  (breaking changes)

# 4. Publish
npm publish --access public

# 5. Repeat for create-vonosan if needed
cd ../create-vonosan
npm version patch
npm publish --access public
```

### Quick one-liner (after building)

```bash
# Publish vonosan core
cd packages/vonosan && npm version patch && npm publish --access public && cd ../..

# Publish create-vonosan scaffolder
cd packages/create-vonosan && npm version patch && npm publish --access public && cd ../..
```

### Verify it worked

```bash
npm view vonosan version
npm view create-vonosan version
```

---

## Method 2: Shell Script (`scripts/publish.sh`)

A convenience script is provided at `scripts/publish.sh`:

```bash
# Publish all packages (bumps patch by default)
./scripts/publish.sh

# Bump minor version
./scripts/publish.sh minor

# Bump major version
./scripts/publish.sh major

# Publish only one package
./scripts/publish.sh patch vonosan
./scripts/publish.sh patch create-vonosan

# Dry run (no actual publish)
./scripts/publish.sh patch all --dry-run
```

---

## Method 3: CI/CD (GitHub Actions — Automated)

The workflow at `.github/workflows/release-packages.yml` handles everything automatically.

### How to trigger a release

**Option A — Push a git tag:**

```bash
# 1. Bump versions in package.json files
# 2. Commit the version bump
git add -A
git commit -m "chore: release v0.2.0"

# 3. Tag and push
git tag v0.2.0
git push origin main --tags
```

**Option B — Manual trigger from GitHub UI:**

1. Go to <https://github.com/oyenet1/vonosan/actions/workflows/release-packages.yml>
2. Click **"Run workflow"**
3. Enter the tag (e.g. `v0.2.0`)
4. Click the green **"Run workflow"** button

### What the CI does

1. Checks out the repo
2. Installs deps with `bun install --frozen-lockfile`
3. Builds all packages with `bun run build`
4. Packs `.tgz` artifacts and uploads them to a GitHub Release
5. Publishes each non-private package to npm (skips already-published versions)

### Required secret

You must add `NPM_TOKEN` to your repo's GitHub Actions secrets:

1. Generate token: <https://www.npmjs.com/settings/fade_networker/tokens>
   - Choose **"Automation"** type (no 2FA prompt needed in CI)
2. Add to repo: <https://github.com/oyenet1/vonosan/settings/secrets/actions>
   - Name: `NPM_TOKEN`
   - Value: *(paste the token)*

---

## Versioning Rules

We follow [Semantic Versioning](https://semver.org/):

| Change Type                     | Bump    | Example        |
| ------------------------------- | ------- | -------------- |
| Bug fix, typo, docs             | `patch` | 0.1.0 → 0.1.1 |
| New feature, backward-compat   | `minor` | 0.1.0 → 0.2.0 |
| Breaking change                 | `major` | 0.1.0 → 1.0.0 |

**Keep both packages in sync** — when you bump `vonosan`, bump `create-vonosan` too.

---

## Common Errors & Fixes

| Error | Cause | Fix |
| ----- | ----- | --- |
| `E403 — cannot publish over previously published versions` | Version already exists on npm | Bump the version: `npm version patch` |
| `E403 — You do not have permission to publish` | Wrong npm account or name taken | Run `npm whoami` to check. Use `--access public` for scoped packages |
| `E404 — scope not found` | The `@scope` org doesn't exist on npm | Create the org at npmjs.com or use an unscoped name |
| `ERR_MODULE_NOT_FOUND` after install | Dist is missing files | Rebuild: `bun run build`, check `files` in package.json, re-publish |
| `ENEEDAUTH` | Not logged in | Run `npm login` |

---

## Checklist Before Every Publish

- [ ] All changes committed (`git status` is clean)
- [ ] `bun run build` succeeds
- [ ] Version bumped in `package.json`
- [ ] `npm pack --dry-run` shows correct files (no junk, no missing files)
- [ ] Tested locally: `bun create vonosan@latest test-app` works
- [ ] README is up to date

---

## Appendix: `scripts/publish.sh`

Create this file and run `chmod +x scripts/publish.sh`:

```bash
#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
#  Vonosan — Publish packages to npm
#
#  Usage:
#    ./scripts/publish.sh                 # patch bump, all packages
#    ./scripts/publish.sh minor           # minor bump, all packages
#    ./scripts/publish.sh major           # major bump, all packages
#    ./scripts/publish.sh patch vonosan   # patch bump, only vonosan
#    ./scripts/publish.sh patch all --dry-run  # dry run
# ──────────────────────────────────────────────────────────
set -euo pipefail

BUMP="${1:-patch}"
TARGET="${2:-all}"
DRY_RUN="${3:-}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}ℹ ${NC} $*"; }
success() { echo -e "${GREEN}✔ ${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠ ${NC} $*"; }
fail()    { echo -e "${RED}✖ ${NC} $*"; exit 1; }

# ── Preflight ────────────────────────────────────────────
info "Checking prerequisites..."
command -v npm  >/dev/null 2>&1 || fail "npm not installed"
command -v bun  >/dev/null 2>&1 || fail "bun not installed"

NPM_USER=$(npm whoami 2>/dev/null) || fail "Not logged in. Run: npm login"
success "Logged in as: $NPM_USER"

if [ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]; then
  warn "Working directory not clean."
  git -C "$ROOT_DIR" status --short
  read -rp "Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

# ── Build ────────────────────────────────────────────────
info "Building all packages..."
cd "$ROOT_DIR" && bun run build
success "Build complete"

# ── Select packages ──────────────────────────────────────
PACKAGES=()
case "$TARGET" in
  all)             PACKAGES=("packages/vonosan" "packages/create-vonosan") ;;
  vonosan)         PACKAGES=("packages/vonosan") ;;
  create-vonosan)  PACKAGES=("packages/create-vonosan") ;;
  *)               fail "Unknown target: $TARGET" ;;
esac

# ── Publish loop ─────────────────────────────────────────
for pkg_dir in "${PACKAGES[@]}"; do
  full_path="$ROOT_DIR/$pkg_dir"
  [ -f "$full_path/package.json" ] || continue

  pkg_name=$(node -p "require('$full_path/package.json').name")
  old_ver=$(node -p "require('$full_path/package.json').version")

  echo ""
  info "Package: $pkg_name ($old_ver → $BUMP)"

  cd "$full_path"
  new_ver=$(npm version "$BUMP" --no-git-tag-version | tr -d 'v')
  success "Version: $old_ver → $new_ver"

  if npm view "$pkg_name@$new_ver" version >/dev/null 2>&1; then
    warn "$pkg_name@$new_ver already exists — skipping"
    continue
  fi

  if [ "$DRY_RUN" = "--dry-run" ]; then
    info "DRY RUN — would publish $pkg_name@$new_ver"
    npm pack --dry-run 2>&1 | head -20
    continue
  fi

  npm publish --access public
  success "Published $pkg_name@$new_ver ✨"
done

cd "$ROOT_DIR"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
  warn "Dry run complete. Nothing published."
else
  success "Done! Don't forget:"
  echo '    git add -A && git commit -m "chore: release" && git tag v'"$new_ver"' && git push origin main --tags'
fi
```

---

## Appendix: GitHub Actions Workflow

The existing workflow at `.github/workflows/release-packages.yml` handles CI/CD publishing.

### Setup (one-time)

1. **Create an npm automation token:**
   - Go to <https://www.npmjs.com/settings/fade_networker/tokens>
   - Click **"Generate New Token"** → **"Automation"**
   - Copy the token

2. **Add it to GitHub:**
   - Go to <https://github.com/oyenet1/vonosan/settings/secrets/actions>
   - Click **"New repository secret"**
   - Name: `NPM_TOKEN`
   - Value: *(paste the token)*

### Trigger a release

```bash
# Option A: Git tag (triggers automatically)
git add -A
git commit -m "chore: release v0.2.0"
git tag v0.2.0
git push origin main --tags

# Option B: Manual trigger from GitHub UI
# Go to Actions → Release Packages → Run workflow → Enter tag
```

### What happens

```
push tag v0.2.0
  └─▶ GitHub Actions: release-packages.yml
       ├─ Job 1: package-and-release
       │   ├─ bun install
       │   ├─ bun run build
       │   ├─ npm pack (each package)
       │   └─ Create GitHub Release with .tgz artifacts
       └─ Job 2: publish-npm
           ├─ bun install
           ├─ bun run build
           └─ npm publish (each non-private, non-duplicate package)
```
