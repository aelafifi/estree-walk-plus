# Branch Protection Settings

To ensure the GitHub Actions CI requirements are enforced for PRs, configure the following branch protection rules for the `main` branch in your GitHub repository settings:

## Repository Settings > Branches > Add rule for `main`

1. **Require status checks to pass before merging**: ✅ Enabled
   - Require branches to be up to date before merging: ✅ Enabled
   - Required status checks:
     - `test (18.x)`
     - `test (20.x)`
     - `test (22.x)`
     - `coverage-check`

2. **Require pull request reviews before merging**: ✅ Enabled (optional but recommended)
   - Required number of reviewers: 1

3. **Restrict pushes that create files**: ✅ Enabled
   - Include administrators: ✅ Enabled

## How to Configure

1. Go to your repository on GitHub
2. Click **Settings** > **Branches**
3. Click **Add rule**
4. Branch name pattern: `main`
5. Enable the settings listed above
6. Click **Create**

This ensures that no PR can be merged unless:

- All CI tests pass on Node.js 18.x, 20.x, and 22.x
- Code coverage meets the 90% threshold
- The branch is up to date with main
