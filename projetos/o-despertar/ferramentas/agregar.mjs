// Corre agregar_() do Code.gs fora do Apps Script: node agregar.mjs entrada.json [saida.json]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(aqui, '../apps-script/Code.gs'), 'utf8'), ctx);
const entrada = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
ctx.__d = entrada;
const out = vm.runInContext('agregar_(__d)', ctx);
const texto = JSON.stringify(out, null, 2);
if (process.argv[3]) fs.writeFileSync(process.argv[3], texto); else console.log(texto);
