import path from "node:path";
import { Generator, getConfig } from "@tanstack/router-generator";

/**
 * Regenerates `src/routeTree.gen.ts` with the same options as the TanStack Router
 * Vite plugin, without starting Vite. `bun run gen` calls it after writing routes
 * so the tree (and the `ModulePath` union derived from it) is never stale.
 *
 * The plugin still owns the file in `dev`/`build`; both paths produce the same tree.
 */
export async function generateRouteTree(root: string): Promise<void> {
  const config = getConfig(
    {
      target: "react",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      // Tests live next to the routes they exercise; keep them out of the tree.
      routeFileIgnorePattern: "\\.test\\.(ts|tsx)$",
      // The generator stages its output here before renaming it into place; without
      // an explicit path it resolves against `process.cwd()`, which breaks when the
      // tree of another checkout is generated.
      tmpDir: path.join(root, ".tanstack", "tmp"),
    },
    root,
  );

  await new Generator({ config, root }).run();
}

if (import.meta.main) {
  await generateRouteTree(process.cwd());
}
