/**
 * Command line tool for generating documentation data.
 */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require('@babel/generator').default;
const glob = require("glob");

const fs = require("fs");
const path = require("path");


const packages = glob.sync("wonder-blocks/packages/*/package.json");

const processFile = (filename, data = {}) => {
    // only proess each file once
    if (filename in data) {
        return;
    }

    const options = {
        sourceType: "module",
        plugins: [
            // enable jsx and flow syntax
            "jsx",
            "flow",
            "classProperties",
            "objectRestSpread",
            "dynamicImport"
        ],
    };

    const dirname = path.dirname(filename);

    const code = fs.readFileSync(filename).toString();
    const ast = parser.parse(code, options);

    const exportedSymbols = {};
    const importedSymbols = {};
    const privateSymbols = {};
    const exportedTypes = {};
    const importedTypes = {};
    const privateTypes = {};

    traverse(ast, {
        enter(p) {
            if (p.isExportNamedDeclaration()) {
                if (p.node.declaration) {
                    const declaration = p.node.declaration;
                    if (declaration.type === "VariableDeclaration") {
                        for (const declarator of declaration.declarations) {
                            const name = declarator.id.name;
                            exportedSymbols[name] = declarator;
                        }
                    } else {
                        const name = declaration.id.name;
                        if (p.node.exportKind === "value") {
                            exportedSymbols[name] = declaration;   
                        } else if (p.node.exportKind === "type") {
                            exportedTypes[name] = declaration;   
                        }
                    }
                }
                for (const specifier of p.node.specifiers) {
                    const exported = specifier.exported.name;
                    const local = specifier.local.name
                    if (local === "default") {
                        // e.g. export {default as Text} from "./components/text.js";
                        const source = p.node.source.value.startsWith(".")
                            ? path.join(dirname, p.node.source.value)
                            : p.node.source.value;
                        exportedSymbols[exported] = exported;
                        importedSymbols[exported] = {
                            source,
                            imported: "default",
                        };
                    } else {
                        exportedSymbols[exported] = local;
                    }
                }
            } else if (p.isExportDefaultDeclaration()) {
                exportedSymbols["default"] = p.node.declaration;
                if (p.node.leadingComments) {
                    exportedSymbols["default"].leadingComments = p.node.leadingComments;
                }
            } else if (p.isImportDeclaration()) {
                for (const specifier of p.node.specifiers) {
                    if (specifier.type === "ImportDefaultSpecifier") {
                        const local = specifier.local.name;
                        const source = p.node.source.value.startsWith(".")
                            ? path.join(dirname, p.node.source.value)
                            : p.node.source.value;
                        if (p.node.importKind === "value") {
                            importedSymbols[local] = {
                                source, 
                                imported: "default",
                            };
                        } else if (p.node.importKind === "type") {
                            importedTypes[local] = {
                                source, 
                                imported: "default",
                            };
                        }
                    } else if (specifier.type === "ImportSpecifier") {
                        const local = specifier.local.name;
                        const source = p.node.source.value.startsWith(".")
                            ? path.join(dirname, p.node.source.value)
                            : p.node.source.value;
                        const imported = specifier.imported.name;
                        if (p.node.importKind === "value") {
                            importedSymbols[local] = {
                                source,
                                imported,
                            };
                        } else if (p.node.importKind === "type") {
                            importedTypes[local] = {
                                source,
                                imported,
                            };
                        }
                    }
                }
            } else if (p.isTypeAlias() && p.parentPath.isProgram()) {
                const typeName = p.node.id.name;
                privateTypes[typeName] = p.node.right;
            } else if (p.isTypeAlias() && p.parentPath.isExportNamedDeclaration()) {
                const typeName = p.node.id.name;
                exportedTypes[typeName] = p.node.right;
            } else if (p.isVariableDeclaration() && p.parentPath.isProgram()) {
                for (const declarator of p.node.declarations) {
                    const local = declarator.id.name;
                    privateSymbols[local] = declarator;
                }
            }
            delete p.node.start;
            delete p.node.end;
            delete p.node.loc;
        }
    });

    data[filename] = {
        exportedSymbols,
        importedSymbols,
        privateSymbols,
        exportedTypes,
        importedTypes,
        privateTypes,
    };

    for (const localName of Object.values(exportedSymbols)) {
        if (localName in importedSymbols) {
            const {source} = importedSymbols[localName];
            processFile(source, data);
        }
    }

    Object.keys(importedTypes).forEach(name => {
        const {source} = importedTypes[name];
        // TODO(kevinb): handle imports of types from other packages we know about
        if (source.startsWith("wonder-blocks/packages")) {
            processFile(source, data);
        }
    });

    return data;
}

const output = {};

const findDeclaration = (name, file, files) => {
    const {importedSymbols, exportedSymbols, privateSymbols} = files[file];
    if (name in exportedSymbols) {
        if (typeof(exportedSymbols[name]) !== "string") {
            return {
                declaration: exportedSymbols[name],
                source: file,
            };
        }
        const local = exportedSymbols[name];
        if (local in importedSymbols) {
            const importObj = importedSymbols[local];
            return findDeclaration(
                importObj.imported, 
                importObj.source, 
                files,
            );
        } else if (local in privateSymbols) {
            return {
                declaration: privateSymbols[local],
                source: file,
            };
        }
    }

    console.error(`${name} symbol not found`);
}

// TODO(kevinb): also exports types from files
const findType = (name, file, files) => {
    const {importedTypes, exportedTypes} = files[file];
    if (name in exportedTypes) {
        if (typeof(exportedTypes[name]) !== "string") {
            return {
                type: exportedTypes[name],
                source: file,
            };
        }
        const local = exportedTypes[name];
        if (local in importedTypes) {
            const importObj = importedTypes[local];
            return findtype(
                importObj.imported, 
                importObj.source, 
                files,
            );
        } else {
            console.error(`${name} symbol not found`);
            // throw new Error("symbol not found");
        }
    }
}

for (const pkg of packages) {
    const dirname = path.dirname(pkg);
    const pkgJson = JSON.parse(fs.readFileSync(pkg).toString());
    const entry = path.join(dirname, "index.js");
    console.log(dirname);

    const files = processFile(entry);

    const declarations = [];
    for (const symbol of Object.keys(files[entry].exportedSymbols)) {
        const declaration = findDeclaration(symbol, entry, files);
        declarations.push({
            ...declaration,
            name: symbol,
        });
    }

    output[pkgJson.name] = {
        files,
        entry,
        declarations, 
    };
}

fs.writeFileSync("data/data.json", JSON.stringify(output, null, 4));
