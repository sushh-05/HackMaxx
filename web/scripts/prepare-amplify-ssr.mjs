import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const nextRoot = join(webRoot, ".next");
const standaloneRoot = join(nextRoot, "standalone");
const bundleRoot = join(webRoot, ".amplify-hosting");
const computeRoot = join(bundleRoot, "compute", "default");
const staticRoot = join(bundleRoot, "static");

await rm(bundleRoot, { recursive: true, force: true });
await mkdir(computeRoot, { recursive: true });
await mkdir(staticRoot, { recursive: true });

// Bun workspaces can make Next place the traced app below a nested workspace
// directory. Flatten that app into Amplify's compute root so server.js is at
// the manifest's declared entrypoint and all relative paths remain valid.
let standaloneAppRoot = standaloneRoot;
try {
  await stat(join(standaloneRoot, "server.js"));
} catch {
  standaloneAppRoot = join(standaloneRoot, "web");
}
await cp(standaloneAppRoot, computeRoot, { recursive: true });
if (standaloneAppRoot !== standaloneRoot) {
  await cp(join(standaloneRoot, "node_modules"), join(computeRoot, "node_modules"), {
    recursive: true,
  });
}

// The standalone server needs its traced runtime files and static assets beside it.
await cp(join(nextRoot, "static"), join(computeRoot, ".next", "static"), {
  recursive: true,
});

// Publish immutable Next assets through Amplify's static primitive as well.
await cp(join(nextRoot, "static"), join(staticRoot, "_next", "static"), {
  recursive: true,
});

// Amplify validates Next's traced runtime metadata at the artifact root.
// Copy every path listed by required-server-files.json while preserving the
// .next/ prefix expected by Amplify's validator.
const requiredServerFilesPath = join(nextRoot, "required-server-files.json");
const requiredServerFiles = JSON.parse(
  await readFile(requiredServerFilesPath, "utf8"),
);
for (const relativeFile of requiredServerFiles.files) {
  const normalizedFile = relativeFile.replaceAll("\\", "/");
  const sourceFile = join(webRoot, ...normalizedFile.split("/"));
  const targetFile = join(bundleRoot, ...normalizedFile.split("/"));
  await mkdir(dirname(targetFile), { recursive: true });
  await cp(sourceFile, targetFile);
}

// Public files are served by the standalone server and by Amplify's static primitive.
try {
  await stat(join(webRoot, "public"));
  await cp(join(webRoot, "public"), join(computeRoot, "public"), {
    recursive: true,
    force: true,
  });
  await cp(join(webRoot, "public"), staticRoot, {
    recursive: true,
    force: true,
  });
} catch {
  // A public directory is optional in Next.js applications.
}

const nextPackage = JSON.parse(
  await readFile(join(webRoot, "node_modules", "next", "package.json"), "utf8"),
);

const manifest = {
  version: 1,
  routes: [
    {
      path: "/_next/*",
      target: {
        kind: "Static",
        cacheControl: "public, max-age=31536000, immutable",
      },
    },
    {
      path: "/*.*",
      target: { kind: "Static" },
      fallback: { kind: "Compute", src: "default" },
    },
    {
      path: "/*",
      target: { kind: "Compute", src: "default" },
    },
  ],
  computeResources: [
    {
      name: "default",
      runtime: "nodejs20.x",
      entrypoint: "server.js",
    },
  ],
  framework: {
    name: "next",
    version: nextPackage.version,
  },
};

await writeFile(
  join(bundleRoot, "deploy-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Prepared Amplify SSR bundle at ${bundleRoot}`);
