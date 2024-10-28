import { assert } from "console";
import { QueryResult } from "node-sqlite3-wasm";

function getCorrectField(field: string, fieldMapping?: Record<any, string>) {
	if (!fieldMapping) return field;
	const mappedField = fieldMapping[field];
	return (mappedField) ? mappedField : field;
}

export function fillField<T>(modelField: keyof T, qr: QueryResult, queryFieldName?: string) {
	const [obj, opts] = getCurrentContext(); 
	queryFieldName = (queryFieldName) ? queryFieldName : modelField as string;

	if (!opts) {
		obj[modelField] = qr[queryFieldName];
	} else {
		obj[modelField] = opts.ignoredFields?.includes(modelField) ? undefined : qr[getCorrectField(queryFieldName, opts?.fieldMapping)];
	}
}

export function transformField<T, K extends keyof T>(field: K, transform: (value: T[K]) => T[K]) {
	const [obj, opts] = getCurrentContext();

	if (opts && opts.ignoredFields?.includes(field))
		return;

	obj[field] = transform(obj[field]);
} 

export function fillFieldRecursive<T, Y>(field: keyof T, modelBuilder: (qr: QueryResult, opts: ModelFromOptions<Y>)=>Y, qr: QueryResult, buildOpts: ModelFromOptions<Y>) {
	const [obj, opts] = getCurrentContext(); 
	
	if (opts && opts.ignoredFields?.includes(field))
		return;	

	obj[field] = modelBuilder(qr, buildOpts);
}

type ModelBuild = any;
let contexts: [ModelBuild, ModelFromOptions<any> | undefined][] = [];

function getCurrentContext(): [ModelBuild, ModelFromOptions<any> | undefined] {
	assert(contexts.length > 0, "contexts cannot be empty !");	
	return contexts[contexts.length-1];
}

export function startBuilding<T>(opts?: ModelFromOptions<T>) {
	contexts.push([{}, opts])
}

export function endBuild(): any {
	return contexts.pop()?.[0]
}

export type ModelFromOptions<T> = {
	fieldMapping?: Record<any, string>,
	ignoredFields?: [keyof T]
}
