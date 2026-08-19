# Cumulative change consolidation

The platform milestones are cumulative. Merge only the newest branch that contains the complete commit chain; close older overlapping pull requests as superseded instead of merging the same files repeatedly.

## Updating the surviving pull request

1. Fetch the remote and check out the newest cumulative branch.
2. Rebase it onto the repository's default branch, or merge the default branch when team policy forbids rebasing shared branches.
3. Resolve each file according to the intended combined behavior. Do not apply “ours” or “theirs” to the entire repository.
4. Preserve every numbered migration and keep `server/src/migrations/index.ts` in chronological order. Never edit an already-applied migration; add a new migration instead.
5. Run the consolidation verifier and the complete client/server checks before updating the pull request.

```bash
git fetch origin
git rebase origin/<default-branch>
cd server && npm run verify:consolidation && npm run lint && npm test && npm run build
cd ../client && npm run lint && npm test && npm run build
git push --force-with-lease
```

`npm run verify:consolidation` rejects unresolved conflict markers and validates that migration identifiers and checksums are unique, valid, and ordered. CI runs the same check. A successful check does not replace human review of combined routes, dependencies, workflows, or documentation.

After the surviving pull request merges, confirm its commit is reachable from the default branch and close every superseded cumulative pull request.
