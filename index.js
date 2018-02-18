const path = require('path');
const fs = require('fs');

const jsdocParse = require('jsdoc-parse');
const dom = require('dts-dom');

const parser = require('./src/parser');
const convert = require('./src/convert')

// Create standard wrapper declarations.
const phaserPkgModuleDOM = dom.create.module('phaser');
const phaserClassDOM = dom.create.class('Phaser');
const phaserModuleDOM = dom.create.namespace('Phaser');

// Phaser source namespaces.
const phaserSrcNs = [
	'Actions', 
	'Animations', 
	'Cache', 
	'Cameras', 
	'Class', 
	'Create', 
	'Curves', 
	'Data', 
	'Display', 
	'DOM', 
	'EventEmitter', 
	'Game',
	'GameObjects', 
	'Geom', 
	'Input', 
	'Loader', 
	'Math', 
	'Physics', 
	'Scene', 
	'Scenes', 
	'Sound', 
	'Structs', 
	'Textures', 
	'Tilemaps', 
	'Time', 
	'Tweens', 
	'Utils'
];

const readPhaserSrc = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(readPhaserSrc(path.join(dir, file))) :
        files.concat(path.join(dir, file)),
			[]);

const transpile = (memberList) => {
	let srcFilePath = "phaser-src/";

	parser(srcFilePath, () => {
		fs.readFileSync('jsdoc-out/jsdoc.json', 'utf8', function(err, contents) {
			if(err) {
				return console.log(err);
			}

			console.log("Converting to Typescript Definitions...");

			const usefulDocData = JSON.parse(contents);
			convert(phaserModuleDOM, usefulDocData, memberList);
			const domOutput = dom.emit(phaserPkgModuleDOM) + dom.emit(phaserClassDOM) + dom.emit(phaserModuleDOM);
			const outPath = 'out/phaser.d.ts';

			fs.writeFile(outPath, domOutput, (err) => {
					if(err) {
							return console.log(err);
					}
					console.log(`File was written to ${outPath}`);
			});
		});
	});
}

const transpiler = (() => {
	const memberList = new Map();
	phaserPkgModuleDOM.members.push(dom.create.exportName('Phaser'));
	// Create namespace for each src namespace.
	phaserSrcNs.forEach((cls) => {
		const domClass = dom.create.class(cls, 0);
		const domNs = dom.create.namespace(cls);

		phaserModuleDOM.members.push(domClass);
		phaserModuleDOM.members.push(domNs);
		
		memberList.set(cls, {namespace: domNs, class: domClass});
	});
	transpile(memberList);
})();