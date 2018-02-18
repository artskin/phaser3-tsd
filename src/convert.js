const dom = require('dts-dom');
const traverse = require('traverse');

const convert = (phaserModuleDOM, usefulDocData, memberList) => {
	usefulDocData.forEach((docObj) => {
		if(!docObj.undocumented && docObj.memberof) {
			switch (docObj.kind) {
				case 'class':
					convertClass(phaserModuleDOM, docObj, memberList)
					break;
				case 'namespace':
					convertClass(phaserModuleDOM, docObj, memberList)
					break;
				case 'member':
					convertMember(phaserModuleDOM, docObj, memberList)
					break;
				case 'function':
					convertFunction(phaserModuleDOM, docObj, memberList);
					break;
			}
		}
	});
}

const convertType = (docType) => {
	switch (docType) {
		case "number":
			return dom.type.number;
		case "integer":
			return dom.type.number;
		case "float":
			return dom.type.number;
		case "string":
			return dom.type.string;
		case "boolean":
			return dom.type.boolean;
		case "void":
			return dom.type.void;
		case "object":
			return dom.type.any;
		case "function":
			return dom.type.any;
		case "array":
			return dom.type.array(dom.type.any);
		case undefined:
			return dom.type.any;
		default:
			return docType;
	}
}

const convertScope = (scope) => {
	switch(scope) {
		case "static":
			return dom.DeclarationFlags.Static;
		case "instance":
			return dom.DeclarationFlags.None;
		default:
			return dom.DeclarationFlags.Static;
	}
}

const convertParams = (params) => {
	let paramsDOM = [];
	if (params && params.length > 0 && params.type) {
		paramsDOM = params.map((param) => {
			return dom.create.parameter(param.name, convertType(param.type.names[0]));
		})
	}
	// Returns an array of parameters.
	return paramsDOM;
}

const convertReturns = (returns) => {
	let returnsDOM = dom.type.void;

	if (returns && returns.length > 0 && returns[0].type) {
		returnsDOM = convertType(returns[0].type.names[0]);
	}
	// Returns a single return type.
	return returnsDOM;
}

const convertClass = (phaserModuleDOM, docObj, memberList) => {
	const parentName = /([^.]*)$/.exec(docObj.memberof)[0];
	const parentMember = memberList.get(parentName);

	if(parentMember) {
		const parentNs = parentMember.namespace;
		const domClass = dom.create.class(docObj.name, convertScope(docObj.scope));
		const domNs = dom.create.namespace(docObj.name);

		parentNs.members.push(domClass);
		parentNs.members.push(domNs);

		memberList.set(docObj.name, {namespace: domNs, class: domClass});
	}
}

const convertMember = (phaserModuleDOM, docObj, memberList) => {
	const parentName = /([^.]*)$/.exec(docObj.memberof)[0];
	const parentMember = memberList.get(parentName);
	let memberType = dom.type.any;

	if(docObj.type) {
		memberType = convertType(docObj.type.names[0]);
	} 

	if(parentMember) {
		const parentClass = parentMember.class;
		parentClass.members.push(dom.create.property(
			docObj.name, 
			memberType
		));
	}
	
}

const convertFunction = (phaserModuleDOM, docObj, memberList) => {

	const parentName = /([^.]*)$/.exec(docObj.memberof)[0];
	const parentMember = memberList.get(parentName);

	if(parentMember) {
		const parentClass = parentMember.class;
		parentClass.members.push(dom.create.method(
			docObj.name,
			convertParams(docObj.params),
			convertReturns(docObj.returns),
			convertScope(docObj.scope)
		));
	}
	
};


module.exports = convert;