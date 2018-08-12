/* eslint-disable no-console */
/**
 * Generate ES6 modules that can be loaded in the browser from existing npm modules.
 */
const fs = require("fs");
const path = require("path");
const process = require("process");
const {build} = require("./cjs2es.js");
const mkdirp = require("mkdirp");

const outputPath = path.join(process.cwd(), "build", "node_modules");
mkdirp(outputPath);
mkdirp(path.join(outputPath, "@khanacademy"));  // TODO(kevinb): handle scoped packages automatically

const inputPath = path.join(process.cwd(), "wonder-blocks", "node_modules");

async function work(modules) {
    for (const moduleName of modules) {
        try {
            let code = await build(moduleName, inputPath);
            if (moduleName === "aphrodite") {
                code = code.replace(/data-aphrodite/g, "data-aphrodite-2")
            }
            fs.writeFileSync(path.join(outputPath, moduleName) + ".js", code, "utf-8");
            console.log(`wrote ${moduleName}`);
        } catch(e) {
            console.error(`failed to write ${moduleName}`);
            console.error(e);
        }
    }
}

// TODO(kevinb): get a list of these from the package.json files for each package
const deps = [
    "react", "react-dom", "aphrodite", "react-router-dom", "prop-types",
];

work(deps).then(() => console.log("done"));

const wbPkgsPath = path.join(process.cwd(), "wonder-blocks", "packages")
const mods = fs.readdirSync(wbPkgsPath);
for (const mod of mods) {
    const pkg = JSON.parse(fs.readFileSync(path.join(wbPkgsPath, mod, "package.json")));

    const srcPath = path.join(wbPkgsPath, mod, pkg.module);
    const destPath = path.join(outputPath, "@khanacademy", mod) + ".js";

    const code = fs.readFileSync(srcPath).toString();
    fs.writeFileSync(
        destPath, 
        code.replace(/\s+from\s+['"]([^'"]+)['"]/g, 
            (match, path) => ` from "/node_modules/${path}.js"`),
        "utf-8",
    );
    console.log(`copied: ${mod}`);
}
