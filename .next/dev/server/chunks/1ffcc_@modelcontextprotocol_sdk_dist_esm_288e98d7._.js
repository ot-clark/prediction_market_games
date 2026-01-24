module.exports = [
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// zod-compat.ts
// ----------------------------------------------------
// Unified types + helpers to accept Zod v3 and v4 (Mini)
// ----------------------------------------------------
__turbopack_context__.s([
    "getLiteralValue",
    ()=>getLiteralValue,
    "getObjectShape",
    ()=>getObjectShape,
    "getParseErrorMessage",
    ()=>getParseErrorMessage,
    "getSchemaDescription",
    ()=>getSchemaDescription,
    "isSchemaOptional",
    ()=>isSchemaOptional,
    "isZ4Schema",
    ()=>isZ4Schema,
    "normalizeObjectSchema",
    ()=>normalizeObjectSchema,
    "objectFromShape",
    ()=>objectFromShape,
    "safeParse",
    ()=>safeParse,
    "safeParseAsync",
    ()=>safeParseAsync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v3/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v3/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2d$mini$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4-mini/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/mini/schemas.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/mini/parse.js [app-route] (ecmascript)");
;
;
function isZ4Schema(s) {
    // Present on Zod 4 (Classic & Mini) schemas; absent on Zod 3
    const schema = s;
    return !!schema._zod;
}
function objectFromShape(shape) {
    const values = Object.values(shape);
    if (values.length === 0) return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}); // default to v4 Mini
    const allV4 = values.every(isZ4Schema);
    const allV3 = values.every((s)=>!isZ4Schema(s));
    if (allV4) return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"](shape);
    if (allV3) return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"](shape);
    throw new Error('Mixed Zod versions detected in object shape.');
}
function safeParse(schema, data) {
    if (isZ4Schema(schema)) {
        // Mini exposes top-level safeParse
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"](schema, data);
        return result;
    }
    const v3Schema = schema;
    const result = v3Schema.safeParse(data);
    return result;
}
async function safeParseAsync(schema, data) {
    if (isZ4Schema(schema)) {
        // Mini exposes top-level safeParseAsync
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParseAsync"](schema, data);
        return result;
    }
    const v3Schema = schema;
    const result = await v3Schema.safeParseAsync(data);
    return result;
}
function getObjectShape(schema) {
    var _a, _b;
    if (!schema) return undefined;
    // Zod v3 exposes `.shape`; Zod v4 keeps the shape on `_zod.def.shape`
    let rawShape;
    if (isZ4Schema(schema)) {
        const v4Schema = schema;
        rawShape = (_b = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def) === null || _b === void 0 ? void 0 : _b.shape;
    } else {
        const v3Schema = schema;
        rawShape = v3Schema.shape;
    }
    if (!rawShape) return undefined;
    if (typeof rawShape === 'function') {
        try {
            return rawShape();
        } catch (_c) {
            return undefined;
        }
    }
    return rawShape;
}
function normalizeObjectSchema(schema) {
    var _a;
    if (!schema) return undefined;
    // First check if it's a raw shape (Record<string, AnySchema>)
    // Raw shapes don't have _def or _zod properties and aren't schemas themselves
    if (typeof schema === 'object') {
        // Check if it's actually a ZodRawShapeCompat (not a schema instance)
        // by checking if it lacks schema-like internal properties
        const asV3 = schema;
        const asV4 = schema;
        // If it's not a schema instance (no _def or _zod), it might be a raw shape
        if (!asV3._def && !asV4._zod) {
            // Check if all values are schemas (heuristic to confirm it's a raw shape)
            const values = Object.values(schema);
            if (values.length > 0 && values.every((v)=>typeof v === 'object' && v !== null && (v._def !== undefined || v._zod !== undefined || typeof v.parse === 'function'))) {
                return objectFromShape(schema);
            }
        }
    }
    // If we get here, it should be an AnySchema (not a raw shape)
    // Check if it's already an object schema
    if (isZ4Schema(schema)) {
        // Check if it's a v4 object
        const v4Schema = schema;
        const def = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def;
        if (def && (def.type === 'object' || def.shape !== undefined)) {
            return schema;
        }
    } else {
        // Check if it's a v3 object
        const v3Schema = schema;
        if (v3Schema.shape !== undefined) {
            return schema;
        }
    }
    return undefined;
}
function getParseErrorMessage(error) {
    if (error && typeof error === 'object') {
        // Try common error structures
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
        if ('issues' in error && Array.isArray(error.issues) && error.issues.length > 0) {
            const firstIssue = error.issues[0];
            if (firstIssue && typeof firstIssue === 'object' && 'message' in firstIssue) {
                return String(firstIssue.message);
            }
        }
        // Fallback: try to stringify the error
        try {
            return JSON.stringify(error);
        } catch (_a) {
            return String(error);
        }
    }
    return String(error);
}
function getSchemaDescription(schema) {
    var _a, _b, _c, _d;
    if (isZ4Schema(schema)) {
        const v4Schema = schema;
        return (_b = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def) === null || _b === void 0 ? void 0 : _b.description;
    }
    const v3Schema = schema;
    // v3 may have description on the schema itself or in _def
    return (_c = schema.description) !== null && _c !== void 0 ? _c : (_d = v3Schema._def) === null || _d === void 0 ? void 0 : _d.description;
}
function isSchemaOptional(schema) {
    var _a, _b, _c;
    if (isZ4Schema(schema)) {
        const v4Schema = schema;
        return ((_b = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def) === null || _b === void 0 ? void 0 : _b.type) === 'optional';
    }
    const v3Schema = schema;
    // v3 has isOptional() method
    if (typeof schema.isOptional === 'function') {
        return schema.isOptional();
    }
    return ((_c = v3Schema._def) === null || _c === void 0 ? void 0 : _c.typeName) === 'ZodOptional';
}
function getLiteralValue(schema) {
    var _a;
    if (isZ4Schema(schema)) {
        const v4Schema = schema;
        const def = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def;
        if (def) {
            // Try various ways to get the literal value
            if (def.value !== undefined) return def.value;
            if (Array.isArray(def.values) && def.values.length > 0) {
                return def.values[0];
            }
        }
    }
    const v3Schema = schema;
    const def = v3Schema._def;
    if (def) {
        if (def.value !== undefined) return def.value;
        if (Array.isArray(def.values) && def.values.length > 0) {
            return def.values[0];
        }
    }
    // Fallback: check for direct value property (some Zod versions)
    const directValue = schema.value;
    if (directValue !== undefined) return directValue;
    return undefined;
} //# sourceMappingURL=zod-compat.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnnotationsSchema",
    ()=>AnnotationsSchema,
    "AudioContentSchema",
    ()=>AudioContentSchema,
    "BaseMetadataSchema",
    ()=>BaseMetadataSchema,
    "BlobResourceContentsSchema",
    ()=>BlobResourceContentsSchema,
    "BooleanSchemaSchema",
    ()=>BooleanSchemaSchema,
    "CallToolRequestParamsSchema",
    ()=>CallToolRequestParamsSchema,
    "CallToolRequestSchema",
    ()=>CallToolRequestSchema,
    "CallToolResultSchema",
    ()=>CallToolResultSchema,
    "CancelTaskRequestSchema",
    ()=>CancelTaskRequestSchema,
    "CancelTaskResultSchema",
    ()=>CancelTaskResultSchema,
    "CancelledNotificationParamsSchema",
    ()=>CancelledNotificationParamsSchema,
    "CancelledNotificationSchema",
    ()=>CancelledNotificationSchema,
    "ClientCapabilitiesSchema",
    ()=>ClientCapabilitiesSchema,
    "ClientNotificationSchema",
    ()=>ClientNotificationSchema,
    "ClientRequestSchema",
    ()=>ClientRequestSchema,
    "ClientResultSchema",
    ()=>ClientResultSchema,
    "ClientTasksCapabilitySchema",
    ()=>ClientTasksCapabilitySchema,
    "CompatibilityCallToolResultSchema",
    ()=>CompatibilityCallToolResultSchema,
    "CompleteRequestParamsSchema",
    ()=>CompleteRequestParamsSchema,
    "CompleteRequestSchema",
    ()=>CompleteRequestSchema,
    "CompleteResultSchema",
    ()=>CompleteResultSchema,
    "ContentBlockSchema",
    ()=>ContentBlockSchema,
    "CreateMessageRequestParamsSchema",
    ()=>CreateMessageRequestParamsSchema,
    "CreateMessageRequestSchema",
    ()=>CreateMessageRequestSchema,
    "CreateMessageResultSchema",
    ()=>CreateMessageResultSchema,
    "CreateMessageResultWithToolsSchema",
    ()=>CreateMessageResultWithToolsSchema,
    "CreateTaskResultSchema",
    ()=>CreateTaskResultSchema,
    "CursorSchema",
    ()=>CursorSchema,
    "DEFAULT_NEGOTIATED_PROTOCOL_VERSION",
    ()=>DEFAULT_NEGOTIATED_PROTOCOL_VERSION,
    "ElicitRequestFormParamsSchema",
    ()=>ElicitRequestFormParamsSchema,
    "ElicitRequestParamsSchema",
    ()=>ElicitRequestParamsSchema,
    "ElicitRequestSchema",
    ()=>ElicitRequestSchema,
    "ElicitRequestURLParamsSchema",
    ()=>ElicitRequestURLParamsSchema,
    "ElicitResultSchema",
    ()=>ElicitResultSchema,
    "ElicitationCompleteNotificationParamsSchema",
    ()=>ElicitationCompleteNotificationParamsSchema,
    "ElicitationCompleteNotificationSchema",
    ()=>ElicitationCompleteNotificationSchema,
    "EmbeddedResourceSchema",
    ()=>EmbeddedResourceSchema,
    "EmptyResultSchema",
    ()=>EmptyResultSchema,
    "EnumSchemaSchema",
    ()=>EnumSchemaSchema,
    "ErrorCode",
    ()=>ErrorCode,
    "GetPromptRequestParamsSchema",
    ()=>GetPromptRequestParamsSchema,
    "GetPromptRequestSchema",
    ()=>GetPromptRequestSchema,
    "GetPromptResultSchema",
    ()=>GetPromptResultSchema,
    "GetTaskPayloadRequestSchema",
    ()=>GetTaskPayloadRequestSchema,
    "GetTaskRequestSchema",
    ()=>GetTaskRequestSchema,
    "GetTaskResultSchema",
    ()=>GetTaskResultSchema,
    "IconSchema",
    ()=>IconSchema,
    "IconsSchema",
    ()=>IconsSchema,
    "ImageContentSchema",
    ()=>ImageContentSchema,
    "ImplementationSchema",
    ()=>ImplementationSchema,
    "InitializeRequestParamsSchema",
    ()=>InitializeRequestParamsSchema,
    "InitializeRequestSchema",
    ()=>InitializeRequestSchema,
    "InitializeResultSchema",
    ()=>InitializeResultSchema,
    "InitializedNotificationSchema",
    ()=>InitializedNotificationSchema,
    "JSONRPCErrorSchema",
    ()=>JSONRPCErrorSchema,
    "JSONRPCMessageSchema",
    ()=>JSONRPCMessageSchema,
    "JSONRPCNotificationSchema",
    ()=>JSONRPCNotificationSchema,
    "JSONRPCRequestSchema",
    ()=>JSONRPCRequestSchema,
    "JSONRPCResponseSchema",
    ()=>JSONRPCResponseSchema,
    "JSONRPC_VERSION",
    ()=>JSONRPC_VERSION,
    "LATEST_PROTOCOL_VERSION",
    ()=>LATEST_PROTOCOL_VERSION,
    "LegacyTitledEnumSchemaSchema",
    ()=>LegacyTitledEnumSchemaSchema,
    "ListPromptsRequestSchema",
    ()=>ListPromptsRequestSchema,
    "ListPromptsResultSchema",
    ()=>ListPromptsResultSchema,
    "ListResourceTemplatesRequestSchema",
    ()=>ListResourceTemplatesRequestSchema,
    "ListResourceTemplatesResultSchema",
    ()=>ListResourceTemplatesResultSchema,
    "ListResourcesRequestSchema",
    ()=>ListResourcesRequestSchema,
    "ListResourcesResultSchema",
    ()=>ListResourcesResultSchema,
    "ListRootsRequestSchema",
    ()=>ListRootsRequestSchema,
    "ListRootsResultSchema",
    ()=>ListRootsResultSchema,
    "ListTasksRequestSchema",
    ()=>ListTasksRequestSchema,
    "ListTasksResultSchema",
    ()=>ListTasksResultSchema,
    "ListToolsRequestSchema",
    ()=>ListToolsRequestSchema,
    "ListToolsResultSchema",
    ()=>ListToolsResultSchema,
    "LoggingLevelSchema",
    ()=>LoggingLevelSchema,
    "LoggingMessageNotificationParamsSchema",
    ()=>LoggingMessageNotificationParamsSchema,
    "LoggingMessageNotificationSchema",
    ()=>LoggingMessageNotificationSchema,
    "McpError",
    ()=>McpError,
    "ModelHintSchema",
    ()=>ModelHintSchema,
    "ModelPreferencesSchema",
    ()=>ModelPreferencesSchema,
    "MultiSelectEnumSchemaSchema",
    ()=>MultiSelectEnumSchemaSchema,
    "NotificationSchema",
    ()=>NotificationSchema,
    "NumberSchemaSchema",
    ()=>NumberSchemaSchema,
    "PaginatedRequestParamsSchema",
    ()=>PaginatedRequestParamsSchema,
    "PaginatedRequestSchema",
    ()=>PaginatedRequestSchema,
    "PaginatedResultSchema",
    ()=>PaginatedResultSchema,
    "PingRequestSchema",
    ()=>PingRequestSchema,
    "PrimitiveSchemaDefinitionSchema",
    ()=>PrimitiveSchemaDefinitionSchema,
    "ProgressNotificationParamsSchema",
    ()=>ProgressNotificationParamsSchema,
    "ProgressNotificationSchema",
    ()=>ProgressNotificationSchema,
    "ProgressSchema",
    ()=>ProgressSchema,
    "ProgressTokenSchema",
    ()=>ProgressTokenSchema,
    "PromptArgumentSchema",
    ()=>PromptArgumentSchema,
    "PromptListChangedNotificationSchema",
    ()=>PromptListChangedNotificationSchema,
    "PromptMessageSchema",
    ()=>PromptMessageSchema,
    "PromptReferenceSchema",
    ()=>PromptReferenceSchema,
    "PromptSchema",
    ()=>PromptSchema,
    "RELATED_TASK_META_KEY",
    ()=>RELATED_TASK_META_KEY,
    "ReadResourceRequestParamsSchema",
    ()=>ReadResourceRequestParamsSchema,
    "ReadResourceRequestSchema",
    ()=>ReadResourceRequestSchema,
    "ReadResourceResultSchema",
    ()=>ReadResourceResultSchema,
    "RelatedTaskMetadataSchema",
    ()=>RelatedTaskMetadataSchema,
    "RequestIdSchema",
    ()=>RequestIdSchema,
    "RequestSchema",
    ()=>RequestSchema,
    "ResourceContentsSchema",
    ()=>ResourceContentsSchema,
    "ResourceLinkSchema",
    ()=>ResourceLinkSchema,
    "ResourceListChangedNotificationSchema",
    ()=>ResourceListChangedNotificationSchema,
    "ResourceReferenceSchema",
    ()=>ResourceReferenceSchema,
    "ResourceRequestParamsSchema",
    ()=>ResourceRequestParamsSchema,
    "ResourceSchema",
    ()=>ResourceSchema,
    "ResourceTemplateReferenceSchema",
    ()=>ResourceTemplateReferenceSchema,
    "ResourceTemplateSchema",
    ()=>ResourceTemplateSchema,
    "ResourceUpdatedNotificationParamsSchema",
    ()=>ResourceUpdatedNotificationParamsSchema,
    "ResourceUpdatedNotificationSchema",
    ()=>ResourceUpdatedNotificationSchema,
    "ResultSchema",
    ()=>ResultSchema,
    "RootSchema",
    ()=>RootSchema,
    "RootsListChangedNotificationSchema",
    ()=>RootsListChangedNotificationSchema,
    "SUPPORTED_PROTOCOL_VERSIONS",
    ()=>SUPPORTED_PROTOCOL_VERSIONS,
    "SamplingContentSchema",
    ()=>SamplingContentSchema,
    "SamplingMessageContentBlockSchema",
    ()=>SamplingMessageContentBlockSchema,
    "SamplingMessageSchema",
    ()=>SamplingMessageSchema,
    "ServerCapabilitiesSchema",
    ()=>ServerCapabilitiesSchema,
    "ServerNotificationSchema",
    ()=>ServerNotificationSchema,
    "ServerRequestSchema",
    ()=>ServerRequestSchema,
    "ServerResultSchema",
    ()=>ServerResultSchema,
    "ServerTasksCapabilitySchema",
    ()=>ServerTasksCapabilitySchema,
    "SetLevelRequestParamsSchema",
    ()=>SetLevelRequestParamsSchema,
    "SetLevelRequestSchema",
    ()=>SetLevelRequestSchema,
    "SingleSelectEnumSchemaSchema",
    ()=>SingleSelectEnumSchemaSchema,
    "StringSchemaSchema",
    ()=>StringSchemaSchema,
    "SubscribeRequestParamsSchema",
    ()=>SubscribeRequestParamsSchema,
    "SubscribeRequestSchema",
    ()=>SubscribeRequestSchema,
    "TaskCreationParamsSchema",
    ()=>TaskCreationParamsSchema,
    "TaskSchema",
    ()=>TaskSchema,
    "TaskStatusNotificationParamsSchema",
    ()=>TaskStatusNotificationParamsSchema,
    "TaskStatusNotificationSchema",
    ()=>TaskStatusNotificationSchema,
    "TextContentSchema",
    ()=>TextContentSchema,
    "TextResourceContentsSchema",
    ()=>TextResourceContentsSchema,
    "TitledMultiSelectEnumSchemaSchema",
    ()=>TitledMultiSelectEnumSchemaSchema,
    "TitledSingleSelectEnumSchemaSchema",
    ()=>TitledSingleSelectEnumSchemaSchema,
    "ToolAnnotationsSchema",
    ()=>ToolAnnotationsSchema,
    "ToolChoiceSchema",
    ()=>ToolChoiceSchema,
    "ToolExecutionSchema",
    ()=>ToolExecutionSchema,
    "ToolListChangedNotificationSchema",
    ()=>ToolListChangedNotificationSchema,
    "ToolResultContentSchema",
    ()=>ToolResultContentSchema,
    "ToolSchema",
    ()=>ToolSchema,
    "ToolUseContentSchema",
    ()=>ToolUseContentSchema,
    "UnsubscribeRequestParamsSchema",
    ()=>UnsubscribeRequestParamsSchema,
    "UnsubscribeRequestSchema",
    ()=>UnsubscribeRequestSchema,
    "UntitledMultiSelectEnumSchemaSchema",
    ()=>UntitledMultiSelectEnumSchemaSchema,
    "UntitledSingleSelectEnumSchemaSchema",
    ()=>UntitledSingleSelectEnumSchemaSchema,
    "UrlElicitationRequiredError",
    ()=>UrlElicitationRequiredError,
    "assertCompleteRequestPrompt",
    ()=>assertCompleteRequestPrompt,
    "assertCompleteRequestResourceTemplate",
    ()=>assertCompleteRequestResourceTemplate,
    "isInitializeRequest",
    ()=>isInitializeRequest,
    "isInitializedNotification",
    ()=>isInitializedNotification,
    "isJSONRPCError",
    ()=>isJSONRPCError,
    "isJSONRPCNotification",
    ()=>isJSONRPCNotification,
    "isJSONRPCRequest",
    ()=>isJSONRPCRequest,
    "isJSONRPCResponse",
    ()=>isJSONRPCResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/classic/schemas.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/classic/external.js [app-route] (ecmascript)");
;
const LATEST_PROTOCOL_VERSION = '2025-11-25';
const DEFAULT_NEGOTIATED_PROTOCOL_VERSION = '2025-03-26';
const SUPPORTED_PROTOCOL_VERSIONS = [
    LATEST_PROTOCOL_VERSION,
    '2025-06-18',
    '2025-03-26',
    '2024-11-05',
    '2024-10-07'
];
const RELATED_TASK_META_KEY = 'io.modelcontextprotocol/related-task';
const JSONRPC_VERSION = '2.0';
/**
 * Assert 'object' type schema.
 *
 * @internal
 */ const AssertObjectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["custom"]((v)=>v !== null && (typeof v === 'object' || typeof v === 'function'));
const ProgressTokenSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().int()
]);
const CursorSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]();
const TaskCreationParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    /**
     * Time in milliseconds to keep task results available after completion.
     * If null, the task has unlimited lifetime until manually cleaned up.
     */ ttl: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"](),
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["null"]()
    ]).optional(),
    /**
     * Time in milliseconds to wait between task status requests.
     */ pollInterval: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional()
});
const RelatedTaskMetadataSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    taskId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const RequestMetaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    /**
     * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
     */ progressToken: ProgressTokenSchema.optional(),
    /**
     * If specified, this request is related to the provided task.
     */ [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
});
/**
 * Common params for any request.
 */ const BaseRequestParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    /**
     * If specified, the caller is requesting that the receiver create a task to represent the request.
     * Task creation parameters are now at the top level instead of in _meta.
     */ task: TaskCreationParamsSchema.optional(),
    /**
     * See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.
     */ _meta: RequestMetaSchema.optional()
});
const RequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    params: BaseRequestParamsSchema.optional()
});
const NotificationsParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * If specified, this notification is related to the provided task.
         */ [RELATED_TASK_META_KEY]: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](RelatedTaskMetadataSchema)
    }).passthrough().optional()
});
const NotificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    params: NotificationsParamsSchema.optional()
});
const ResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
        /**
         * If specified, this result is related to the provided task.
         */ [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
    }).optional()
});
const RequestIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().int()
]);
const JSONRPCRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    jsonrpc: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"](JSONRPC_VERSION),
    id: RequestIdSchema,
    ...RequestSchema.shape
}).strict();
const isJSONRPCRequest = (value)=>JSONRPCRequestSchema.safeParse(value).success;
const JSONRPCNotificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    jsonrpc: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"](JSONRPC_VERSION),
    ...NotificationSchema.shape
}).strict();
const isJSONRPCNotification = (value)=>JSONRPCNotificationSchema.safeParse(value).success;
const JSONRPCResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    jsonrpc: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"](JSONRPC_VERSION),
    id: RequestIdSchema,
    result: ResultSchema
}).strict();
const isJSONRPCResponse = (value)=>JSONRPCResponseSchema.safeParse(value).success;
var ErrorCode;
(function(ErrorCode) {
    // SDK error codes
    ErrorCode[ErrorCode["ConnectionClosed"] = -32000] = "ConnectionClosed";
    ErrorCode[ErrorCode["RequestTimeout"] = -32001] = "RequestTimeout";
    // Standard JSON-RPC error codes
    ErrorCode[ErrorCode["ParseError"] = -32700] = "ParseError";
    ErrorCode[ErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    ErrorCode[ErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    ErrorCode[ErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    ErrorCode[ErrorCode["InternalError"] = -32603] = "InternalError";
    // MCP-specific error codes
    ErrorCode[ErrorCode["UrlElicitationRequired"] = -32042] = "UrlElicitationRequired";
})(ErrorCode || (ErrorCode = {}));
const JSONRPCErrorSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    jsonrpc: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"](JSONRPC_VERSION),
    id: RequestIdSchema,
    error: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * The error type that occurred.
         */ code: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().int(),
        /**
         * A short description of the error. The message SHOULD be limited to a concise single sentence.
         */ message: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
        /**
         * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
         */ data: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]())
    })
}).strict();
const isJSONRPCError = (value)=>JSONRPCErrorSchema.safeParse(value).success;
const JSONRPCMessageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    JSONRPCRequestSchema,
    JSONRPCNotificationSchema,
    JSONRPCResponseSchema,
    JSONRPCErrorSchema
]);
const EmptyResultSchema = ResultSchema.strict();
const CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the same direction.
     */ requestId: RequestIdSchema,
    /**
     * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
     */ reason: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const CancelledNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/cancelled'),
    params: CancelledNotificationParamsSchema
});
const IconSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * URL or data URI for the icon.
     */ src: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Optional MIME type for the icon.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * Optional array of strings that specify sizes at which the icon can be used.
     * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
     *
     * If not provided, the client should assume that the icon can be used at any size.
     */ sizes: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
});
const IconsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Optional set of sized icons that the client can display in a user interface.
     *
     * Clients that support rendering icons MUST support at least the following MIME types:
     * - `image/png` - PNG images (safe, universal compatibility)
     * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
     *
     * Clients that support rendering icons SHOULD also support:
     * - `image/svg+xml` - SVG images (scalable but requires security precautions)
     * - `image/webp` - WebP images (modern, efficient format)
     */ icons: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](IconSchema).optional()
});
const BaseMetadataSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
     * even by those unfamiliar with domain-specific terminology.
     *
     * If not provided, the name should be used for display (except for Tool,
     * where `annotations.title` should be given precedence over using `name`,
     * if present).
     */ title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const ImplementationSchema = BaseMetadataSchema.extend({
    ...BaseMetadataSchema.shape,
    ...IconsSchema.shape,
    version: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * An optional URL of the website for this implementation.
     */ websiteUrl: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const FormElicitationCapabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["intersection"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    applyDefaults: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
}), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()));
const ElicitationCapabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preprocess"]((value)=>{
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (Object.keys(value).length === 0) {
            return {
                form: {}
            };
        }
    }
    return value;
}, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["intersection"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    form: FormElicitationCapabilitySchema.optional(),
    url: AssertObjectSchema.optional()
}), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()));
const ClientTasksCapabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Present if the client supports listing tasks.
     */ list: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough()),
    /**
     * Present if the client supports cancelling tasks.
     */ cancel: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough()),
    /**
     * Capabilities for task creation on specific request types.
     */ requests: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Task support for sampling requests.
         */ sampling: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
            createMessage: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
        }).passthrough()),
        /**
         * Task support for elicitation requests.
         */ elicitation: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
            create: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
        }).passthrough())
    }).passthrough())
}).passthrough();
const ServerTasksCapabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Present if the server supports listing tasks.
     */ list: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough()),
    /**
     * Present if the server supports cancelling tasks.
     */ cancel: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough()),
    /**
     * Capabilities for task creation on specific request types.
     */ requests: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Task support for tool requests.
         */ tools: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
            call: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
        }).passthrough())
    }).passthrough())
}).passthrough();
const ClientCapabilitiesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Experimental, non-standard capabilities that the client supports.
     */ experimental: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), AssertObjectSchema).optional(),
    /**
     * Present if the client supports sampling from an LLM.
     */ sampling: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Present if the client supports context inclusion via includeContext parameter.
         * If not declared, servers SHOULD only use `includeContext: "none"` (or omit it).
         */ context: AssertObjectSchema.optional(),
        /**
         * Present if the client supports tool use via tools and toolChoice parameters.
         */ tools: AssertObjectSchema.optional()
    }).optional(),
    /**
     * Present if the client supports eliciting user input.
     */ elicitation: ElicitationCapabilitySchema.optional(),
    /**
     * Present if the client supports listing roots.
     */ roots: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Whether the client supports issuing notifications for changes to the roots list.
         */ listChanged: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
    }).optional(),
    /**
     * Present if the client supports task creation.
     */ tasks: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](ClientTasksCapabilitySchema)
});
const InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
     */ protocolVersion: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    capabilities: ClientCapabilitiesSchema,
    clientInfo: ImplementationSchema
});
const InitializeRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('initialize'),
    params: InitializeRequestParamsSchema
});
const isInitializeRequest = (value)=>InitializeRequestSchema.safeParse(value).success;
const ServerCapabilitiesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Experimental, non-standard capabilities that the server supports.
     */ experimental: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), AssertObjectSchema).optional(),
    /**
     * Present if the server supports sending log messages to the client.
     */ logging: AssertObjectSchema.optional(),
    /**
     * Present if the server supports sending completions to the client.
     */ completions: AssertObjectSchema.optional(),
    /**
     * Present if the server offers any prompt templates.
     */ prompts: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Whether this server supports issuing notifications for changes to the prompt list.
         */ listChanged: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]())
    })),
    /**
     * Present if the server offers any resources to read.
     */ resources: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Whether this server supports clients subscribing to resource updates.
         */ subscribe: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional(),
        /**
         * Whether this server supports issuing notifications for changes to the resource list.
         */ listChanged: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
    }).optional(),
    /**
     * Present if the server offers any tools to call.
     */ tools: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Whether this server supports issuing notifications for changes to the tool list.
         */ listChanged: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
    }).optional(),
    /**
     * Present if the server supports task creation.
     */ tasks: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](ServerTasksCapabilitySchema)
}).passthrough();
const InitializeResultSchema = ResultSchema.extend({
    /**
     * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
     */ protocolVersion: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    capabilities: ServerCapabilitiesSchema,
    serverInfo: ImplementationSchema,
    /**
     * Instructions describing how to use the server and its features.
     *
     * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
     */ instructions: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const InitializedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/initialized')
});
const isInitializedNotification = (value)=>InitializedNotificationSchema.safeParse(value).success;
const PingRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('ping')
});
const ProgressSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * The progress thus far. This should increase every time progress is made, even if the total is unknown.
     */ progress: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"](),
    /**
     * Total number of items to process (or total progress required), if known.
     */ total: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]()),
    /**
     * An optional message describing the current progress.
     */ message: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())
});
const ProgressNotificationParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    ...NotificationsParamsSchema.shape,
    ...ProgressSchema.shape,
    /**
     * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
     */ progressToken: ProgressTokenSchema
});
const ProgressNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/progress'),
    params: ProgressNotificationParamsSchema
});
const PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */ cursor: CursorSchema.optional()
});
const PaginatedRequestSchema = RequestSchema.extend({
    params: PaginatedRequestParamsSchema.optional()
});
const PaginatedResultSchema = ResultSchema.extend({
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */ nextCursor: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](CursorSchema)
});
const TaskSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    taskId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'working',
        'input_required',
        'completed',
        'failed',
        'cancelled'
    ]),
    /**
     * Time in milliseconds to keep task results available after completion.
     * If null, the task has unlimited lifetime until manually cleaned up.
     */ ttl: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"](),
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["null"]()
    ]),
    /**
     * ISO 8601 timestamp when the task was created.
     */ createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * ISO 8601 timestamp when the task was last updated.
     */ lastUpdatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    pollInterval: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]()),
    /**
     * Optional diagnostic message for failed tasks or other status information.
     */ statusMessage: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())
});
const CreateTaskResultSchema = ResultSchema.extend({
    task: TaskSchema
});
const TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
const TaskStatusNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/tasks/status'),
    params: TaskStatusNotificationParamsSchema
});
const GetTaskRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tasks/get'),
    params: BaseRequestParamsSchema.extend({
        taskId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
    })
});
const GetTaskResultSchema = ResultSchema.merge(TaskSchema);
const GetTaskPayloadRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tasks/result'),
    params: BaseRequestParamsSchema.extend({
        taskId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
    })
});
const ListTasksRequestSchema = PaginatedRequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tasks/list')
});
const ListTasksResultSchema = PaginatedResultSchema.extend({
    tasks: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](TaskSchema)
});
const CancelTaskRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tasks/cancel'),
    params: BaseRequestParamsSchema.extend({
        taskId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
    })
});
const CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
const ResourceContentsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * The URI of this resource.
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * The MIME type of this resource, if known.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const TextResourceContentsSchema = ResourceContentsSchema.extend({
    /**
     * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
     */ text: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
/**
 * A Zod schema for validating Base64 strings that is more performant and
 * robust for very large inputs than the default regex-based check. It avoids
 * stack overflows by using the native `atob` function for validation.
 */ const Base64Schema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().refine((val)=>{
    try {
        // atob throws a DOMException if the string contains characters
        // that are not part of the Base64 character set.
        atob(val);
        return true;
    } catch (_a) {
        return false;
    }
}, {
    message: 'Invalid Base64 string'
});
const BlobResourceContentsSchema = ResourceContentsSchema.extend({
    /**
     * A base64-encoded string representing the binary data of the item.
     */ blob: Base64Schema
});
const AnnotationsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Intended audience(s) for the resource.
     */ audience: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'user',
        'assistant'
    ])).optional(),
    /**
     * Importance hint for the resource, from 0 (least) to 1 (most).
     */ priority: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().min(0).max(1).optional(),
    /**
     * ISO 8601 timestamp for the most recent modification.
     */ lastModified: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["iso"].datetime({
        offset: true
    }).optional()
});
const ResourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    ...BaseMetadataSchema.shape,
    ...IconsSchema.shape,
    /**
     * The URI of this resource.
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * The MIME type of this resource, if known.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({}))
});
const ResourceTemplateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    ...BaseMetadataSchema.shape,
    ...IconsSchema.shape,
    /**
     * A URI template (according to RFC 6570) that can be used to construct resource URIs.
     */ uriTemplate: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * A description of what this template is for.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({}))
});
const ListResourcesRequestSchema = PaginatedRequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resources/list')
});
const ListResourcesResultSchema = PaginatedResultSchema.extend({
    resources: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ResourceSchema)
});
const ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resources/templates/list')
});
const ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
    resourceTemplates: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ResourceTemplateSchema)
});
const ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
     *
     * @format uri
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
const ReadResourceRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resources/read'),
    params: ReadResourceRequestParamsSchema
});
const ReadResourceResultSchema = ResultSchema.extend({
    contents: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        TextResourceContentsSchema,
        BlobResourceContentsSchema
    ]))
});
const ResourceListChangedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/resources/list_changed')
});
const SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
const SubscribeRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resources/subscribe'),
    params: SubscribeRequestParamsSchema
});
const UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
const UnsubscribeRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resources/unsubscribe'),
    params: UnsubscribeRequestParamsSchema
});
const ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const ResourceUpdatedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/resources/updated'),
    params: ResourceUpdatedNotificationParamsSchema
});
const PromptArgumentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * The name of the argument.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * A human-readable description of the argument.
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * Whether this argument must be provided.
     */ required: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]())
});
const PromptSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    ...BaseMetadataSchema.shape,
    ...IconsSchema.shape,
    /**
     * An optional description of what this prompt provides
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    /**
     * A list of arguments to use for templating the prompt.
     */ arguments: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](PromptArgumentSchema)),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({}))
});
const ListPromptsRequestSchema = PaginatedRequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('prompts/list')
});
const ListPromptsResultSchema = PaginatedResultSchema.extend({
    prompts: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](PromptSchema)
});
const GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The name of the prompt or prompt template.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Arguments to use for templating the prompt.
     */ arguments: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
});
const GetPromptRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('prompts/get'),
    params: GetPromptRequestParamsSchema
});
const TextContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('text'),
    /**
     * The text content of the message.
     */ text: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const ImageContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('image'),
    /**
     * The base64-encoded image data.
     */ data: Base64Schema,
    /**
     * The MIME type of the image. Different providers may support different image types.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const AudioContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('audio'),
    /**
     * The base64-encoded audio data.
     */ data: Base64Schema,
    /**
     * The MIME type of the audio. Different providers may support different audio types.
     */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const ToolUseContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tool_use'),
    /**
     * The name of the tool to invoke.
     * Must match a tool name from the request's tools array.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Unique identifier for this tool call.
     * Used to correlate with ToolResultContent in subsequent messages.
     */ id: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Arguments to pass to the tool.
     * Must conform to the tool's inputSchema.
     */ input: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
}).passthrough();
const EmbeddedResourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resource'),
    resource: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        TextResourceContentsSchema,
        BlobResourceContentsSchema
    ]),
    /**
     * Optional annotations for the client.
     */ annotations: AnnotationsSchema.optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const ResourceLinkSchema = ResourceSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('resource_link')
});
const ContentBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    TextContentSchema,
    ImageContentSchema,
    AudioContentSchema,
    ResourceLinkSchema,
    EmbeddedResourceSchema
]);
const PromptMessageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    role: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'user',
        'assistant'
    ]),
    content: ContentBlockSchema
});
const GetPromptResultSchema = ResultSchema.extend({
    /**
     * An optional description for the prompt.
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    messages: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](PromptMessageSchema)
});
const PromptListChangedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/prompts/list_changed')
});
const ToolAnnotationsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * A human-readable title for the tool.
     */ title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * If true, the tool does not modify its environment.
     *
     * Default: false
     */ readOnlyHint: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional(),
    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: true
     */ destructiveHint: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional(),
    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: false
     */ idempotentHint: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional(),
    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: true
     */ openWorldHint: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
});
const ToolExecutionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Indicates the tool's preference for task-augmented execution.
     * - "required": Clients MUST invoke the tool as a task
     * - "optional": Clients MAY invoke the tool as a task or normal request
     * - "forbidden": Clients MUST NOT attempt to invoke the tool as a task
     *
     * If not present, defaults to "forbidden".
     */ taskSupport: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'required',
        'optional',
        'forbidden'
    ]).optional()
});
const ToolSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    ...BaseMetadataSchema.shape,
    ...IconsSchema.shape,
    /**
     * A human-readable description of the tool.
     */ description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * A JSON Schema 2020-12 object defining the expected parameters for the tool.
     * Must have type: 'object' at the root level per MCP spec.
     */ inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('object'),
        properties: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), AssertObjectSchema).optional(),
        required: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
    }).catchall(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()),
    /**
     * An optional JSON Schema 2020-12 object defining the structure of the tool's output
     * returned in the structuredContent field of a CallToolResult.
     * Must have type: 'object' at the root level per MCP spec.
     */ outputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('object'),
        properties: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), AssertObjectSchema).optional(),
        required: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
    }).catchall(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional(),
    /**
     * Optional additional tool information.
     */ annotations: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](ToolAnnotationsSchema),
    /**
     * Execution-related properties for this tool.
     */ execution: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](ToolExecutionSchema),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const ListToolsRequestSchema = PaginatedRequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tools/list')
});
const ListToolsResultSchema = PaginatedResultSchema.extend({
    tools: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ToolSchema)
});
const CallToolResultSchema = ResultSchema.extend({
    /**
     * A list of content objects that represent the result of the tool call.
     *
     * If the Tool does not define an outputSchema, this field MUST be present in the result.
     * For backwards compatibility, this field is always present, but it may be empty.
     */ content: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ContentBlockSchema).default([]),
    /**
     * An object containing structured tool output.
     *
     * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
     */ structuredContent: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional(),
    /**
     * Whether the tool call ended in an error.
     *
     * If not set, this is assumed to be false (the call was successful).
     *
     * Any errors that originate from the tool SHOULD be reported inside the result
     * object, with `isError` set to true, _not_ as an MCP protocol-level error
     * response. Otherwise, the LLM would not be able to see that an error occurred
     * and self-correct.
     *
     * However, any errors in _finding_ the tool, an error indicating that the
     * server does not support tool calls, or any other exceptional conditions,
     * should be reported as an MCP error response.
     */ isError: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]())
});
const CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
    toolResult: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()
}));
const CallToolRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The name of the tool to call.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * Arguments to pass to the tool.
     */ arguments: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()))
});
const CallToolRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tools/call'),
    params: CallToolRequestParamsSchema
});
const ToolListChangedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/tools/list_changed')
});
const LoggingLevelSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
    'debug',
    'info',
    'notice',
    'warning',
    'error',
    'critical',
    'alert',
    'emergency'
]);
const SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
     */ level: LoggingLevelSchema
});
const SetLevelRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('logging/setLevel'),
    params: SetLevelRequestParamsSchema
});
const LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
    /**
     * The severity of this log message.
     */ level: LoggingLevelSchema,
    /**
     * An optional name of the logger issuing this message.
     */ logger: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
     */ data: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()
});
const LoggingMessageNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/message'),
    params: LoggingMessageNotificationParamsSchema
});
const ModelHintSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * A hint for a model name.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const ModelPreferencesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Optional hints to use for model selection.
     */ hints: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ModelHintSchema)),
    /**
     * How much to prioritize cost when selecting a model.
     */ costPriority: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().min(0).max(1)),
    /**
     * How much to prioritize sampling speed (latency) when selecting a model.
     */ speedPriority: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().min(0).max(1)),
    /**
     * How much to prioritize intelligence and capabilities when selecting a model.
     */ intelligencePriority: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().min(0).max(1))
});
const ToolChoiceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * Controls when tools are used:
     * - "auto": Model decides whether to use tools (default)
     * - "required": Model MUST use at least one tool before completing
     * - "none": Model MUST NOT use any tools
     */ mode: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'auto',
        'required',
        'none'
    ]))
});
const ToolResultContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('tool_result'),
    toolUseId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().describe('The unique identifier for the corresponding tool call.'),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ContentBlockSchema).default([]),
    structuredContent: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough().optional(),
    isError: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
}).passthrough();
const SamplingContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discriminatedUnion"]('type', [
    TextContentSchema,
    ImageContentSchema,
    AudioContentSchema
]);
const SamplingMessageContentBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discriminatedUnion"]('type', [
    TextContentSchema,
    ImageContentSchema,
    AudioContentSchema,
    ToolUseContentSchema,
    ToolResultContentSchema
]);
const SamplingMessageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    role: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'user',
        'assistant'
    ]),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        SamplingMessageContentBlockSchema,
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](SamplingMessageContentBlockSchema)
    ]),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({}).passthrough())
}).passthrough();
const CreateMessageRequestParamsSchema = BaseRequestParamsSchema.extend({
    messages: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](SamplingMessageSchema),
    /**
     * The server's preferences for which model to select. The client MAY modify or omit this request.
     */ modelPreferences: ModelPreferencesSchema.optional(),
    /**
     * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
     */ systemPrompt: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt.
     * The client MAY ignore this request.
     *
     * Default is "none". Values "thisServer" and "allServers" are soft-deprecated. Servers SHOULD only use these values if the client
     * declares ClientCapabilities.sampling.context. These values may be removed in future spec releases.
     */ includeContext: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'none',
        'thisServer',
        'allServers'
    ]).optional(),
    temperature: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    /**
     * The requested maximum number of tokens to sample (to prevent runaway completions).
     *
     * The client MAY choose to sample fewer tokens than the requested maximum.
     */ maxTokens: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().int(),
    stopSequences: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional(),
    /**
     * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
     */ metadata: AssertObjectSchema.optional(),
    /**
     * Tools that the model may use during generation.
     * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
     */ tools: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](ToolSchema)),
    /**
     * Controls how the model uses tools.
     * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
     * Default is `{ mode: "auto" }`.
     */ toolChoice: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](ToolChoiceSchema)
});
const CreateMessageRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('sampling/createMessage'),
    params: CreateMessageRequestParamsSchema
});
const CreateMessageResultSchema = ResultSchema.extend({
    /**
     * The name of the model that generated the message.
     */ model: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * The reason why sampling stopped, if known.
     *
     * Standard values:
     * - "endTurn": Natural end of the assistant's turn
     * - "stopSequence": A stop sequence was encountered
     * - "maxTokens": Maximum token limit was reached
     *
     * This field is an open string to allow for provider-specific stop reasons.
     */ stopReason: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'endTurn',
        'stopSequence',
        'maxTokens'
    ]).or(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())),
    role: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'user',
        'assistant'
    ]),
    /**
     * Response content. Single content block (text, image, or audio).
     */ content: SamplingContentSchema
});
const CreateMessageResultWithToolsSchema = ResultSchema.extend({
    /**
     * The name of the model that generated the message.
     */ model: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * The reason why sampling stopped, if known.
     *
     * Standard values:
     * - "endTurn": Natural end of the assistant's turn
     * - "stopSequence": A stop sequence was encountered
     * - "maxTokens": Maximum token limit was reached
     * - "toolUse": The model wants to use one or more tools
     *
     * This field is an open string to allow for provider-specific stop reasons.
     */ stopReason: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'endTurn',
        'stopSequence',
        'maxTokens',
        'toolUse'
    ]).or(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())),
    role: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'user',
        'assistant'
    ]),
    /**
     * Response content. May be a single block or array. May include ToolUseContent if stopReason is "toolUse".
     */ content: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        SamplingMessageContentBlockSchema,
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](SamplingMessageContentBlockSchema)
    ])
});
const BooleanSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('boolean'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]().optional()
});
const StringSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('string'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    minLength: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    maxLength: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    format: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'email',
        'uri',
        'date',
        'date-time'
    ]).optional(),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const NumberSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'number',
        'integer'
    ]),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    minimum: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    maximum: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional()
});
const UntitledSingleSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('string'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    enum: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const TitledSingleSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('string'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    oneOf: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        const: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
        title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
    })),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const LegacyTitledEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('string'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    enum: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()),
    enumNames: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional(),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional()
});
const SingleSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    UntitledSingleSelectEnumSchemaSchema,
    TitledSingleSelectEnumSchemaSchema
]);
const UntitledMultiSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('array'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    minItems: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    maxItems: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('string'),
        enum: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())
    }),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
});
const TitledMultiSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('array'),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    minItems: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    maxItems: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().optional(),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        anyOf: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
            const: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
            title: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
        }))
    }),
    default: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
});
const MultiSelectEnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    UntitledMultiSelectEnumSchemaSchema,
    TitledMultiSelectEnumSchemaSchema
]);
const EnumSchemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    LegacyTitledEnumSchemaSchema,
    SingleSelectEnumSchemaSchema,
    MultiSelectEnumSchemaSchema
]);
const PrimitiveSchemaDefinitionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    EnumSchemaSchema,
    BooleanSchemaSchema,
    StringSchemaSchema,
    NumberSchemaSchema
]);
const ElicitRequestFormParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The elicitation mode.
     *
     * Optional for backward compatibility. Clients MUST treat missing mode as "form".
     */ mode: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('form').optional(),
    /**
     * The message to present to the user describing what information is being requested.
     */ message: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * A restricted subset of JSON Schema.
     * Only top-level properties are allowed, without nesting.
     */ requestedSchema: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('object'),
        properties: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), PrimitiveSchemaDefinitionSchema),
        required: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
    })
});
const ElicitRequestURLParamsSchema = BaseRequestParamsSchema.extend({
    /**
     * The elicitation mode.
     */ mode: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('url'),
    /**
     * The message to present to the user explaining why the interaction is needed.
     */ message: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * The ID of the elicitation, which must be unique within the context of the server.
     * The client MUST treat this ID as an opaque value.
     */ elicitationId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
    /**
     * The URL that the user should navigate to.
     */ url: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().url()
});
const ElicitRequestParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    ElicitRequestFormParamsSchema,
    ElicitRequestURLParamsSchema
]);
const ElicitRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('elicitation/create'),
    params: ElicitRequestParamsSchema
});
const ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({
    /**
     * The ID of the elicitation that completed.
     */ elicitationId: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const ElicitationCompleteNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/elicitation/complete'),
    params: ElicitationCompleteNotificationParamsSchema
});
const ElicitResultSchema = ResultSchema.extend({
    /**
     * The user action in response to the elicitation.
     * - "accept": User submitted the form/confirmed the action
     * - "decline": User explicitly decline the action
     * - "cancel": User dismissed without making an explicit choice
     */ action: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enum"]([
        'accept',
        'decline',
        'cancel'
    ]),
    /**
     * The submitted form data, only present when action is "accept".
     * Contains values matching the requested schema.
     * Per MCP spec, content is "typically omitted" for decline/cancel actions.
     * We normalize null to undefined for leniency while maintaining type compatibility.
     */ content: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preprocess"]((val)=>val === null ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"](),
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"](),
        __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]())
    ])).optional())
});
const ResourceTemplateReferenceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('ref/resource'),
    /**
     * The URI or URI template of the resource.
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const ResourceReferenceSchema = ResourceTemplateReferenceSchema;
const PromptReferenceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('ref/prompt'),
    /**
     * The name of the prompt or prompt template
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
});
const CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
    ref: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
        PromptReferenceSchema,
        ResourceTemplateReferenceSchema
    ]),
    /**
     * The argument's information
     */ argument: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * The name of the argument
         */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](),
        /**
         * The value of the argument to use for completion matching.
         */ value: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()
    }),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
        /**
         * Previously-resolved variables in a URI template or prompt.
         */ arguments: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).optional()
    }).optional()
});
const CompleteRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('completion/complete'),
    params: CompleteRequestParamsSchema
});
function assertCompleteRequestPrompt(request) {
    if (request.params.ref.type !== 'ref/prompt') {
        throw new TypeError(`Expected CompleteRequestPrompt, but got ${request.params.ref.type}`);
    }
    void request;
}
function assertCompleteRequestResourceTemplate(request) {
    if (request.params.ref.type !== 'ref/resource') {
        throw new TypeError(`Expected CompleteRequestResourceTemplate, but got ${request.params.ref.type}`);
    }
    void request;
}
const CompleteResultSchema = ResultSchema.extend({
    completion: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looseObject"]({
        /**
         * An array of completion values. Must not exceed 100 items.
         */ values: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]()).max(100),
        /**
         * The total number of completion options available. This can exceed the number of values actually sent in the response.
         */ total: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["number"]().int()),
        /**
         * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
         */ hasMore: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["optional"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"]())
    })
});
const RootSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["object"]({
    /**
     * The URI identifying the root. This *must* start with file:// for now.
     */ uri: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().startsWith('file://'),
    /**
     * An optional name for the root.
     */ name: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"]().optional(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */ _meta: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["record"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["string"](), __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unknown"]()).optional()
});
const ListRootsRequestSchema = RequestSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('roots/list')
});
const ListRootsResultSchema = ResultSchema.extend({
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array"](RootSchema)
});
const RootsListChangedNotificationSchema = NotificationSchema.extend({
    method: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["literal"]('notifications/roots/list_changed')
});
const ClientRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    PingRequestSchema,
    InitializeRequestSchema,
    CompleteRequestSchema,
    SetLevelRequestSchema,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ReadResourceRequestSchema,
    SubscribeRequestSchema,
    UnsubscribeRequestSchema,
    CallToolRequestSchema,
    ListToolsRequestSchema,
    GetTaskRequestSchema,
    GetTaskPayloadRequestSchema,
    ListTasksRequestSchema
]);
const ClientNotificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    CancelledNotificationSchema,
    ProgressNotificationSchema,
    InitializedNotificationSchema,
    RootsListChangedNotificationSchema,
    TaskStatusNotificationSchema
]);
const ClientResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    EmptyResultSchema,
    CreateMessageResultSchema,
    CreateMessageResultWithToolsSchema,
    ElicitResultSchema,
    ListRootsResultSchema,
    GetTaskResultSchema,
    ListTasksResultSchema,
    CreateTaskResultSchema
]);
const ServerRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    PingRequestSchema,
    CreateMessageRequestSchema,
    ElicitRequestSchema,
    ListRootsRequestSchema,
    GetTaskRequestSchema,
    GetTaskPayloadRequestSchema,
    ListTasksRequestSchema
]);
const ServerNotificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    CancelledNotificationSchema,
    ProgressNotificationSchema,
    LoggingMessageNotificationSchema,
    ResourceUpdatedNotificationSchema,
    ResourceListChangedNotificationSchema,
    ToolListChangedNotificationSchema,
    PromptListChangedNotificationSchema,
    TaskStatusNotificationSchema,
    ElicitationCompleteNotificationSchema
]);
const ServerResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["union"]([
    EmptyResultSchema,
    InitializeResultSchema,
    CompleteResultSchema,
    GetPromptResultSchema,
    ListPromptsResultSchema,
    ListResourcesResultSchema,
    ListResourceTemplatesResultSchema,
    ReadResourceResultSchema,
    CallToolResultSchema,
    ListToolsResultSchema,
    GetTaskResultSchema,
    ListTasksResultSchema,
    CreateTaskResultSchema
]);
class McpError extends Error {
    constructor(code, message, data){
        super(`MCP error ${code}: ${message}`);
        this.code = code;
        this.data = data;
        this.name = 'McpError';
    }
    /**
     * Factory method to create the appropriate error type based on the error code and data
     */ static fromError(code, message, data) {
        // Check for specific error types
        if (code === ErrorCode.UrlElicitationRequired && data) {
            const errorData = data;
            if (errorData.elicitations) {
                return new UrlElicitationRequiredError(errorData.elicitations, message);
            }
        }
        // Default to generic McpError
        return new McpError(code, message, data);
    }
}
class UrlElicitationRequiredError extends McpError {
    constructor(elicitations, message = `URL elicitation${elicitations.length > 1 ? 's' : ''} required`){
        super(ErrorCode.UrlElicitationRequired, message, {
            elicitations: elicitations
        });
    }
    get elicitations() {
        var _a, _b;
        return (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.elicitations) !== null && _b !== void 0 ? _b : [];
    }
} //# sourceMappingURL=types.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/interfaces.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Experimental task interfaces for MCP SDK.
 * WARNING: These APIs are experimental and may change without notice.
 */ /**
 * Checks if a task status represents a terminal state.
 * Terminal states are those where the task has finished and will not change.
 *
 * @param status - The task status to check
 * @returns True if the status is terminal (completed, failed, or cancelled)
 * @experimental
 */ __turbopack_context__.s([
    "isTerminal",
    ()=>isTerminal
]);
function isTerminal(status) {
    return status === 'completed' || status === 'failed' || status === 'cancelled';
} //# sourceMappingURL=interfaces.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-json-schema-compat.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// zod-json-schema-compat.ts
// ----------------------------------------------------
// JSON Schema conversion for both Zod v3 and Zod v4 (Mini)
// v3 uses your vendored converter; v4 uses Mini's toJSONSchema
// ----------------------------------------------------
__turbopack_context__.s([
    "getMethodLiteral",
    ()=>getMethodLiteral,
    "parseWithCompat",
    ()=>parseWithCompat,
    "toJsonSchemaCompat",
    ()=>toJsonSchemaCompat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2d$mini$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4-mini/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod/v4/mini/external.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2d$to$2d$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod-to-json-schema/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2d$to$2d$json$2d$schema$2f$dist$2f$esm$2f$zodToJsonSchema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js [app-route] (ecmascript)");
;
;
;
function mapMiniTarget(t) {
    if (!t) return 'draft-7';
    if (t === 'jsonSchema7' || t === 'draft-7') return 'draft-7';
    if (t === 'jsonSchema2019-09' || t === 'draft-2020-12') return 'draft-2020-12';
    return 'draft-7'; // fallback
}
function toJsonSchemaCompat(schema, opts) {
    var _a, _b, _c;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZ4Schema"])(schema)) {
        // v4 branch — use Mini's built-in toJSONSchema
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2f$v4$2f$mini$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toJSONSchema"](schema, {
            target: mapMiniTarget(opts === null || opts === void 0 ? void 0 : opts.target),
            io: (_a = opts === null || opts === void 0 ? void 0 : opts.pipeStrategy) !== null && _a !== void 0 ? _a : 'input'
        });
    }
    // v3 branch — use vendored converter
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$zod$2d$to$2d$json$2d$schema$2f$dist$2f$esm$2f$zodToJsonSchema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodToJsonSchema"])(schema, {
        strictUnions: (_b = opts === null || opts === void 0 ? void 0 : opts.strictUnions) !== null && _b !== void 0 ? _b : true,
        pipeStrategy: (_c = opts === null || opts === void 0 ? void 0 : opts.pipeStrategy) !== null && _c !== void 0 ? _c : 'input'
    });
}
function getMethodLiteral(schema) {
    const shape = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getObjectShape"])(schema);
    const methodSchema = shape === null || shape === void 0 ? void 0 : shape.method;
    if (!methodSchema) {
        throw new Error('Schema is missing a method literal');
    }
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLiteralValue"])(methodSchema);
    if (typeof value !== 'string') {
        throw new Error('Schema method literal must be a string');
    }
    return value;
}
function parseWithCompat(schema, data) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(schema, data);
    if (!result.success) {
        throw result.error;
    }
    return result.data;
} //# sourceMappingURL=zod-json-schema-compat.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_TIMEOUT_MSEC",
    ()=>DEFAULT_REQUEST_TIMEOUT_MSEC,
    "Protocol",
    ()=>Protocol,
    "mergeCapabilities",
    ()=>mergeCapabilities
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/interfaces.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$json$2d$schema$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-json-schema-compat.js [app-route] (ecmascript)");
;
;
;
;
const DEFAULT_REQUEST_TIMEOUT_MSEC = 60000;
class Protocol {
    constructor(_options){
        this._options = _options;
        this._requestMessageId = 0;
        this._requestHandlers = new Map();
        this._requestHandlerAbortControllers = new Map();
        this._notificationHandlers = new Map();
        this._responseHandlers = new Map();
        this._progressHandlers = new Map();
        this._timeoutInfo = new Map();
        this._pendingDebouncedNotifications = new Set();
        // Maps task IDs to progress tokens to keep handlers alive after CreateTaskResult
        this._taskProgressTokens = new Map();
        this._requestResolvers = new Map();
        this.setNotificationHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CancelledNotificationSchema"], (notification)=>{
            this._oncancel(notification);
        });
        this.setNotificationHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProgressNotificationSchema"], (notification)=>{
            this._onprogress(notification);
        });
        this.setRequestHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PingRequestSchema"], // Automatic pong by default.
        (_request)=>({}));
        // Install task handlers if TaskStore is provided
        this._taskStore = _options === null || _options === void 0 ? void 0 : _options.taskStore;
        this._taskMessageQueue = _options === null || _options === void 0 ? void 0 : _options.taskMessageQueue;
        if (this._taskStore) {
            this.setRequestHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetTaskRequestSchema"], async (request, extra)=>{
                const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
                if (!task) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, 'Failed to retrieve task: Task not found');
                }
                // Per spec: tasks/get responses SHALL NOT include related-task metadata
                // as the taskId parameter is the source of truth
                // @ts-expect-error SendResultT cannot contain GetTaskResult, but we include it in our derived types everywhere else
                return {
                    ...task
                };
            });
            this.setRequestHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetTaskPayloadRequestSchema"], async (request, extra)=>{
                const handleTaskResult = async ()=>{
                    var _a;
                    const taskId = request.params.taskId;
                    // Deliver queued messages
                    if (this._taskMessageQueue) {
                        let queuedMessage;
                        while(queuedMessage = await this._taskMessageQueue.dequeue(taskId, extra.sessionId)){
                            // Handle response and error messages by routing them to the appropriate resolver
                            if (queuedMessage.type === 'response' || queuedMessage.type === 'error') {
                                const message = queuedMessage.message;
                                const requestId = message.id;
                                // Lookup resolver in _requestResolvers map
                                const resolver = this._requestResolvers.get(requestId);
                                if (resolver) {
                                    // Remove resolver from map after invocation
                                    this._requestResolvers.delete(requestId);
                                    // Invoke resolver with response or error
                                    if (queuedMessage.type === 'response') {
                                        resolver(message);
                                    } else {
                                        // Convert JSONRPCError to McpError
                                        const errorMessage = message;
                                        const error = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](errorMessage.error.code, errorMessage.error.message, errorMessage.error.data);
                                        resolver(error);
                                    }
                                } else {
                                    // Handle missing resolver gracefully with error logging
                                    const messageType = queuedMessage.type === 'response' ? 'Response' : 'Error';
                                    this._onerror(new Error(`${messageType} handler missing for request ${requestId}`));
                                }
                                continue;
                            }
                            // Send the message on the response stream by passing the relatedRequestId
                            // This tells the transport to write the message to the tasks/result response stream
                            await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.send(queuedMessage.message, {
                                relatedRequestId: extra.requestId
                            }));
                        }
                    }
                    // Now check task status
                    const task = await this._taskStore.getTask(taskId, extra.sessionId);
                    if (!task) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Task not found: ${taskId}`);
                    }
                    // Block if task is not terminal (we've already delivered all queued messages above)
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                        // Wait for status change or new messages
                        await this._waitForTaskUpdate(taskId, extra.signal);
                        // After waking up, recursively call to deliver any new messages or result
                        return await handleTaskResult();
                    }
                    // If task is terminal, return the result
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                        const result = await this._taskStore.getTaskResult(taskId, extra.sessionId);
                        this._clearTaskQueue(taskId);
                        return {
                            ...result,
                            _meta: {
                                ...result._meta,
                                [__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]: {
                                    taskId: taskId
                                }
                            }
                        };
                    }
                    return await handleTaskResult();
                };
                return await handleTaskResult();
            });
            this.setRequestHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListTasksRequestSchema"], async (request, extra)=>{
                var _a;
                try {
                    const { tasks, nextCursor } = await this._taskStore.listTasks((_a = request.params) === null || _a === void 0 ? void 0 : _a.cursor, extra.sessionId);
                    // @ts-expect-error SendResultT cannot contain ListTasksResult, but we include it in our derived types everywhere else
                    return {
                        tasks,
                        nextCursor,
                        _meta: {}
                    };
                } catch (error) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Failed to list tasks: ${error instanceof Error ? error.message : String(error)}`);
                }
            });
            this.setRequestHandler(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CancelTaskRequestSchema"], async (request, extra)=>{
                try {
                    // Get the current task to check if it's in a terminal state, in case the implementation is not atomic
                    const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
                    if (!task) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Task not found: ${request.params.taskId}`);
                    }
                    // Reject cancellation of terminal tasks
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Cannot cancel task in terminal status: ${task.status}`);
                    }
                    await this._taskStore.updateTaskStatus(request.params.taskId, 'cancelled', 'Client cancelled task execution.', extra.sessionId);
                    this._clearTaskQueue(request.params.taskId);
                    const cancelledTask = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
                    if (!cancelledTask) {
                        // Task was deleted during cancellation (e.g., cleanup happened)
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Task not found after cancellation: ${request.params.taskId}`);
                    }
                    return {
                        _meta: {},
                        ...cancelledTask
                    };
                } catch (error) {
                    // Re-throw McpError as-is
                    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"]) {
                        throw error;
                    }
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, `Failed to cancel task: ${error instanceof Error ? error.message : String(error)}`);
                }
            });
        }
    }
    async _oncancel(notification) {
        // Handle request cancellation
        const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
        controller === null || controller === void 0 ? void 0 : controller.abort(notification.params.reason);
    }
    _setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
        this._timeoutInfo.set(messageId, {
            timeoutId: setTimeout(onTimeout, timeout),
            startTime: Date.now(),
            timeout,
            maxTotalTimeout,
            resetTimeoutOnProgress,
            onTimeout
        });
    }
    _resetTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (!info) return false;
        const totalElapsed = Date.now() - info.startTime;
        if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
            this._timeoutInfo.delete(messageId);
            throw __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"].fromError(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].RequestTimeout, 'Maximum total timeout exceeded', {
                maxTotalTimeout: info.maxTotalTimeout,
                totalElapsed
            });
        }
        clearTimeout(info.timeoutId);
        info.timeoutId = setTimeout(info.onTimeout, info.timeout);
        return true;
    }
    _cleanupTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (info) {
            clearTimeout(info.timeoutId);
            this._timeoutInfo.delete(messageId);
        }
    }
    /**
     * Attaches to the given transport, starts it, and starts listening for messages.
     *
     * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
     */ async connect(transport) {
        var _a, _b, _c;
        this._transport = transport;
        const _onclose = (_a = this.transport) === null || _a === void 0 ? void 0 : _a.onclose;
        this._transport.onclose = ()=>{
            _onclose === null || _onclose === void 0 ? void 0 : _onclose();
            this._onclose();
        };
        const _onerror = (_b = this.transport) === null || _b === void 0 ? void 0 : _b.onerror;
        this._transport.onerror = (error)=>{
            _onerror === null || _onerror === void 0 ? void 0 : _onerror(error);
            this._onerror(error);
        };
        const _onmessage = (_c = this._transport) === null || _c === void 0 ? void 0 : _c.onmessage;
        this._transport.onmessage = (message, extra)=>{
            _onmessage === null || _onmessage === void 0 ? void 0 : _onmessage(message, extra);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCResponse"])(message) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCError"])(message)) {
                this._onresponse(message);
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCRequest"])(message)) {
                this._onrequest(message, extra);
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCNotification"])(message)) {
                this._onnotification(message);
            } else {
                this._onerror(new Error(`Unknown message type: ${JSON.stringify(message)}`));
            }
        };
        await this._transport.start();
    }
    _onclose() {
        var _a;
        const responseHandlers = this._responseHandlers;
        this._responseHandlers = new Map();
        this._progressHandlers.clear();
        this._taskProgressTokens.clear();
        this._pendingDebouncedNotifications.clear();
        const error = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"].fromError(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].ConnectionClosed, 'Connection closed');
        this._transport = undefined;
        (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
        for (const handler of responseHandlers.values()){
            handler(error);
        }
    }
    _onerror(error) {
        var _a;
        (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
    }
    _onnotification(notification) {
        var _a;
        const handler = (_a = this._notificationHandlers.get(notification.method)) !== null && _a !== void 0 ? _a : this.fallbackNotificationHandler;
        // Ignore notifications not being subscribed to.
        if (handler === undefined) {
            return;
        }
        // Starting with Promise.resolve() puts any synchronous errors into the monad as well.
        Promise.resolve().then(()=>handler(notification)).catch((error)=>this._onerror(new Error(`Uncaught error in notification handler: ${error}`)));
    }
    _onrequest(request, extra) {
        var _a, _b, _c, _d, _e, _f;
        const handler = (_a = this._requestHandlers.get(request.method)) !== null && _a !== void 0 ? _a : this.fallbackRequestHandler;
        // Capture the current transport at request time to ensure responses go to the correct client
        const capturedTransport = this._transport;
        // Extract taskId from request metadata if present (needed early for method not found case)
        const relatedTaskId = (_d = (_c = (_b = request.params) === null || _b === void 0 ? void 0 : _b._meta) === null || _c === void 0 ? void 0 : _c[__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]) === null || _d === void 0 ? void 0 : _d.taskId;
        if (handler === undefined) {
            const errorResponse = {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].MethodNotFound,
                    message: 'Method not found'
                }
            };
            // Queue or send the error response based on whether this is a task-related request
            if (relatedTaskId && this._taskMessageQueue) {
                this._enqueueTaskMessage(relatedTaskId, {
                    type: 'error',
                    message: errorResponse,
                    timestamp: Date.now()
                }, capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId).catch((error)=>this._onerror(new Error(`Failed to enqueue error response: ${error}`)));
            } else {
                capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send(errorResponse).catch((error)=>this._onerror(new Error(`Failed to send an error response: ${error}`)));
            }
            return;
        }
        const abortController = new AbortController();
        this._requestHandlerAbortControllers.set(request.id, abortController);
        const taskCreationParams = (_e = request.params) === null || _e === void 0 ? void 0 : _e.task;
        const taskStore = this._taskStore ? this.requestTaskStore(request, capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId) : undefined;
        const fullExtra = {
            signal: abortController.signal,
            sessionId: capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId,
            _meta: (_f = request.params) === null || _f === void 0 ? void 0 : _f._meta,
            sendNotification: async (notification)=>{
                // Include related-task metadata if this request is part of a task
                const notificationOptions = {
                    relatedRequestId: request.id
                };
                if (relatedTaskId) {
                    notificationOptions.relatedTask = {
                        taskId: relatedTaskId
                    };
                }
                await this.notification(notification, notificationOptions);
            },
            sendRequest: async (r, resultSchema, options)=>{
                var _a, _b;
                // Include related-task metadata if this request is part of a task
                const requestOptions = {
                    ...options,
                    relatedRequestId: request.id
                };
                if (relatedTaskId && !requestOptions.relatedTask) {
                    requestOptions.relatedTask = {
                        taskId: relatedTaskId
                    };
                }
                // Set task status to input_required when sending a request within a task context
                // Use the taskId from options (explicit) or fall back to relatedTaskId (inherited)
                const effectiveTaskId = (_b = (_a = requestOptions.relatedTask) === null || _a === void 0 ? void 0 : _a.taskId) !== null && _b !== void 0 ? _b : relatedTaskId;
                if (effectiveTaskId && taskStore) {
                    await taskStore.updateTaskStatus(effectiveTaskId, 'input_required');
                }
                return await this.request(r, resultSchema, requestOptions);
            },
            authInfo: extra === null || extra === void 0 ? void 0 : extra.authInfo,
            requestId: request.id,
            requestInfo: extra === null || extra === void 0 ? void 0 : extra.requestInfo,
            taskId: relatedTaskId,
            taskStore: taskStore,
            taskRequestedTtl: taskCreationParams === null || taskCreationParams === void 0 ? void 0 : taskCreationParams.ttl,
            closeSSEStream: extra === null || extra === void 0 ? void 0 : extra.closeSSEStream,
            closeStandaloneSSEStream: extra === null || extra === void 0 ? void 0 : extra.closeStandaloneSSEStream
        };
        // Starting with Promise.resolve() puts any synchronous errors into the monad as well.
        Promise.resolve().then(()=>{
            // If this request asked for task creation, check capability first
            if (taskCreationParams) {
                // Check if the request method supports task creation
                this.assertTaskHandlerCapability(request.method);
            }
        }).then(()=>handler(request, fullExtra)).then(async (result)=>{
            if (abortController.signal.aborted) {
                // Request was cancelled
                return;
            }
            const response = {
                result,
                jsonrpc: '2.0',
                id: request.id
            };
            // Queue or send the response based on whether this is a task-related request
            if (relatedTaskId && this._taskMessageQueue) {
                await this._enqueueTaskMessage(relatedTaskId, {
                    type: 'response',
                    message: response,
                    timestamp: Date.now()
                }, capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId);
            } else {
                await (capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send(response));
            }
        }, async (error)=>{
            var _a;
            if (abortController.signal.aborted) {
                // Request was cancelled
                return;
            }
            const errorResponse = {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: Number.isSafeInteger(error['code']) ? error['code'] : __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError,
                    message: (_a = error.message) !== null && _a !== void 0 ? _a : 'Internal error',
                    ...error['data'] !== undefined && {
                        data: error['data']
                    }
                }
            };
            // Queue or send the error response based on whether this is a task-related request
            if (relatedTaskId && this._taskMessageQueue) {
                await this._enqueueTaskMessage(relatedTaskId, {
                    type: 'error',
                    message: errorResponse,
                    timestamp: Date.now()
                }, capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId);
            } else {
                await (capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send(errorResponse));
            }
        }).catch((error)=>this._onerror(new Error(`Failed to send response: ${error}`))).finally(()=>{
            this._requestHandlerAbortControllers.delete(request.id);
        });
    }
    _onprogress(notification) {
        const { progressToken, ...params } = notification.params;
        const messageId = Number(progressToken);
        const handler = this._progressHandlers.get(messageId);
        if (!handler) {
            this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
            return;
        }
        const responseHandler = this._responseHandlers.get(messageId);
        const timeoutInfo = this._timeoutInfo.get(messageId);
        if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
            try {
                this._resetTimeout(messageId);
            } catch (error) {
                // Clean up if maxTotalTimeout was exceeded
                this._responseHandlers.delete(messageId);
                this._progressHandlers.delete(messageId);
                this._cleanupTimeout(messageId);
                responseHandler(error);
                return;
            }
        }
        handler(params);
    }
    _onresponse(response) {
        const messageId = Number(response.id);
        // Check if this is a response to a queued request
        const resolver = this._requestResolvers.get(messageId);
        if (resolver) {
            this._requestResolvers.delete(messageId);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCResponse"])(response)) {
                resolver(response);
            } else {
                const error = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](response.error.code, response.error.message, response.error.data);
                resolver(error);
            }
            return;
        }
        const handler = this._responseHandlers.get(messageId);
        if (handler === undefined) {
            this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
            return;
        }
        this._responseHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        // Keep progress handler alive for CreateTaskResult responses
        let isTaskResponse = false;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCResponse"])(response) && response.result && typeof response.result === 'object') {
            const result = response.result;
            if (result.task && typeof result.task === 'object') {
                const task = result.task;
                if (typeof task.taskId === 'string') {
                    isTaskResponse = true;
                    this._taskProgressTokens.set(task.taskId, messageId);
                }
            }
        }
        if (!isTaskResponse) {
            this._progressHandlers.delete(messageId);
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCResponse"])(response)) {
            handler(response);
        } else {
            const error = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"].fromError(response.error.code, response.error.message, response.error.data);
            handler(error);
        }
    }
    get transport() {
        return this._transport;
    }
    /**
     * Closes the connection.
     */ async close() {
        var _a;
        await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.close());
    }
    /**
     * Sends a request and returns an AsyncGenerator that yields response messages.
     * The generator is guaranteed to end with either a 'result' or 'error' message.
     *
     * @example
     * ```typescript
     * const stream = protocol.requestStream(request, resultSchema, options);
     * for await (const message of stream) {
     *   switch (message.type) {
     *     case 'taskCreated':
     *       console.log('Task created:', message.task.taskId);
     *       break;
     *     case 'taskStatus':
     *       console.log('Task status:', message.task.status);
     *       break;
     *     case 'result':
     *       console.log('Final result:', message.result);
     *       break;
     *     case 'error':
     *       console.error('Error:', message.error);
     *       break;
     *   }
     * }
     * ```
     *
     * @experimental Use `client.experimental.tasks.requestStream()` to access this method.
     */ async *requestStream(request, resultSchema, options) {
        var _a, _b, _c, _d;
        const { task } = options !== null && options !== void 0 ? options : {};
        // For non-task requests, just yield the result
        if (!task) {
            try {
                const result = await this.request(request, resultSchema, options);
                yield {
                    type: 'result',
                    result
                };
            } catch (error) {
                yield {
                    type: 'error',
                    error: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"] ? error : new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, String(error))
                };
            }
            return;
        }
        // For task-augmented requests, we need to poll for status
        // First, make the request to create the task
        let taskId;
        try {
            // Send the request and get the CreateTaskResult
            const createResult = await this.request(request, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateTaskResultSchema"], options);
            // Extract taskId from the result
            if (createResult.task) {
                taskId = createResult.task.taskId;
                yield {
                    type: 'taskCreated',
                    task: createResult.task
                };
            } else {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, 'Task creation did not return a task');
            }
            // Poll for task completion
            while(true){
                // Get current task status
                const task = await this.getTask({
                    taskId
                }, options);
                yield {
                    type: 'taskStatus',
                    task
                };
                // Check if task is terminal
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                    if (task.status === 'completed') {
                        // Get the final result
                        const result = await this.getTaskResult({
                            taskId
                        }, resultSchema, options);
                        yield {
                            type: 'result',
                            result
                        };
                    } else if (task.status === 'failed') {
                        yield {
                            type: 'error',
                            error: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, `Task ${taskId} failed`)
                        };
                    } else if (task.status === 'cancelled') {
                        yield {
                            type: 'error',
                            error: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, `Task ${taskId} was cancelled`)
                        };
                    }
                    return;
                }
                // When input_required, call tasks/result to deliver queued messages
                // (elicitation, sampling) via SSE and block until terminal
                if (task.status === 'input_required') {
                    const result = await this.getTaskResult({
                        taskId
                    }, resultSchema, options);
                    yield {
                        type: 'result',
                        result
                    };
                    return;
                }
                // Wait before polling again
                const pollInterval = (_c = (_a = task.pollInterval) !== null && _a !== void 0 ? _a : (_b = this._options) === null || _b === void 0 ? void 0 : _b.defaultTaskPollInterval) !== null && _c !== void 0 ? _c : 1000;
                await new Promise((resolve)=>setTimeout(resolve, pollInterval));
                // Check if cancelled
                (_d = options === null || options === void 0 ? void 0 : options.signal) === null || _d === void 0 ? void 0 : _d.throwIfAborted();
            }
        } catch (error) {
            yield {
                type: 'error',
                error: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"] ? error : new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, String(error))
            };
        }
    }
    /**
     * Sends a request and waits for a response.
     *
     * Do not use this method to emit notifications! Use notification() instead.
     */ request(request, resultSchema, options) {
        const { relatedRequestId, resumptionToken, onresumptiontoken, task, relatedTask } = options !== null && options !== void 0 ? options : {};
        // Send the request
        return new Promise((resolve, reject)=>{
            var _a, _b, _c, _d, _e, _f, _g;
            const earlyReject = (error)=>{
                reject(error);
            };
            if (!this._transport) {
                earlyReject(new Error('Not connected'));
                return;
            }
            if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.enforceStrictCapabilities) === true) {
                try {
                    this.assertCapabilityForMethod(request.method);
                    // If task creation is requested, also check task capabilities
                    if (task) {
                        this.assertTaskCapability(request.method);
                    }
                } catch (e) {
                    earlyReject(e);
                    return;
                }
            }
            (_b = options === null || options === void 0 ? void 0 : options.signal) === null || _b === void 0 ? void 0 : _b.throwIfAborted();
            const messageId = this._requestMessageId++;
            const jsonrpcRequest = {
                ...request,
                jsonrpc: '2.0',
                id: messageId
            };
            if (options === null || options === void 0 ? void 0 : options.onprogress) {
                this._progressHandlers.set(messageId, options.onprogress);
                jsonrpcRequest.params = {
                    ...request.params,
                    _meta: {
                        ...((_c = request.params) === null || _c === void 0 ? void 0 : _c._meta) || {},
                        progressToken: messageId
                    }
                };
            }
            // Augment with task creation parameters if provided
            if (task) {
                jsonrpcRequest.params = {
                    ...jsonrpcRequest.params,
                    task: task
                };
            }
            // Augment with related task metadata if relatedTask is provided
            if (relatedTask) {
                jsonrpcRequest.params = {
                    ...jsonrpcRequest.params,
                    _meta: {
                        ...((_d = jsonrpcRequest.params) === null || _d === void 0 ? void 0 : _d._meta) || {},
                        [__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]: relatedTask
                    }
                };
            }
            const cancel = (reason)=>{
                var _a;
                this._responseHandlers.delete(messageId);
                this._progressHandlers.delete(messageId);
                this._cleanupTimeout(messageId);
                (_a = this._transport) === null || _a === void 0 ? void 0 : _a.send({
                    jsonrpc: '2.0',
                    method: 'notifications/cancelled',
                    params: {
                        requestId: messageId,
                        reason: String(reason)
                    }
                }, {
                    relatedRequestId,
                    resumptionToken,
                    onresumptiontoken
                }).catch((error)=>this._onerror(new Error(`Failed to send cancellation: ${error}`)));
                // Wrap the reason in an McpError if it isn't already
                const error = reason instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"] ? reason : new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].RequestTimeout, String(reason));
                reject(error);
            };
            this._responseHandlers.set(messageId, (response)=>{
                var _a;
                if ((_a = options === null || options === void 0 ? void 0 : options.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
                    return;
                }
                if (response instanceof Error) {
                    return reject(response);
                }
                try {
                    const parseResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(resultSchema, response.result);
                    if (!parseResult.success) {
                        // Type guard: if success is false, error is guaranteed to exist
                        reject(parseResult.error);
                    } else {
                        resolve(parseResult.data);
                    }
                } catch (error) {
                    reject(error);
                }
            });
            (_e = options === null || options === void 0 ? void 0 : options.signal) === null || _e === void 0 ? void 0 : _e.addEventListener('abort', ()=>{
                var _a;
                cancel((_a = options === null || options === void 0 ? void 0 : options.signal) === null || _a === void 0 ? void 0 : _a.reason);
            });
            const timeout = (_f = options === null || options === void 0 ? void 0 : options.timeout) !== null && _f !== void 0 ? _f : DEFAULT_REQUEST_TIMEOUT_MSEC;
            const timeoutHandler = ()=>cancel(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"].fromError(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].RequestTimeout, 'Request timed out', {
                    timeout
                }));
            this._setupTimeout(messageId, timeout, options === null || options === void 0 ? void 0 : options.maxTotalTimeout, timeoutHandler, (_g = options === null || options === void 0 ? void 0 : options.resetTimeoutOnProgress) !== null && _g !== void 0 ? _g : false);
            // Queue request if related to a task
            const relatedTaskId = relatedTask === null || relatedTask === void 0 ? void 0 : relatedTask.taskId;
            if (relatedTaskId) {
                // Store the response resolver for this request so responses can be routed back
                const responseResolver = (response)=>{
                    const handler = this._responseHandlers.get(messageId);
                    if (handler) {
                        handler(response);
                    } else {
                        // Log error when resolver is missing, but don't fail
                        this._onerror(new Error(`Response handler missing for side-channeled request ${messageId}`));
                    }
                };
                this._requestResolvers.set(messageId, responseResolver);
                this._enqueueTaskMessage(relatedTaskId, {
                    type: 'request',
                    message: jsonrpcRequest,
                    timestamp: Date.now()
                }).catch((error)=>{
                    this._cleanupTimeout(messageId);
                    reject(error);
                });
            // Don't send through transport - queued messages are delivered via tasks/result only
            // This prevents duplicate delivery for bidirectional transports
            } else {
                // No related task - send through transport normally
                this._transport.send(jsonrpcRequest, {
                    relatedRequestId,
                    resumptionToken,
                    onresumptiontoken
                }).catch((error)=>{
                    this._cleanupTimeout(messageId);
                    reject(error);
                });
            }
        });
    }
    /**
     * Gets the current status of a task.
     *
     * @experimental Use `client.experimental.tasks.getTask()` to access this method.
     */ async getTask(params, options) {
        // @ts-expect-error SendRequestT cannot directly contain GetTaskRequest, but we ensure all type instantiations contain it anyways
        return this.request({
            method: 'tasks/get',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetTaskResultSchema"], options);
    }
    /**
     * Retrieves the result of a completed task.
     *
     * @experimental Use `client.experimental.tasks.getTaskResult()` to access this method.
     */ async getTaskResult(params, resultSchema, options) {
        // @ts-expect-error SendRequestT cannot directly contain GetTaskPayloadRequest, but we ensure all type instantiations contain it anyways
        return this.request({
            method: 'tasks/result',
            params
        }, resultSchema, options);
    }
    /**
     * Lists tasks, optionally starting from a pagination cursor.
     *
     * @experimental Use `client.experimental.tasks.listTasks()` to access this method.
     */ async listTasks(params, options) {
        // @ts-expect-error SendRequestT cannot directly contain ListTasksRequest, but we ensure all type instantiations contain it anyways
        return this.request({
            method: 'tasks/list',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListTasksResultSchema"], options);
    }
    /**
     * Cancels a specific task.
     *
     * @experimental Use `client.experimental.tasks.cancelTask()` to access this method.
     */ async cancelTask(params, options) {
        // @ts-expect-error SendRequestT cannot directly contain CancelTaskRequest, but we ensure all type instantiations contain it anyways
        return this.request({
            method: 'tasks/cancel',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CancelTaskResultSchema"], options);
    }
    /**
     * Emits a notification, which is a one-way message that does not expect a response.
     */ async notification(notification, options) {
        var _a, _b, _c, _d, _e;
        if (!this._transport) {
            throw new Error('Not connected');
        }
        this.assertNotificationCapability(notification.method);
        // Queue notification if related to a task
        const relatedTaskId = (_a = options === null || options === void 0 ? void 0 : options.relatedTask) === null || _a === void 0 ? void 0 : _a.taskId;
        if (relatedTaskId) {
            // Build the JSONRPC notification with metadata
            const jsonrpcNotification = {
                ...notification,
                jsonrpc: '2.0',
                params: {
                    ...notification.params,
                    _meta: {
                        ...((_b = notification.params) === null || _b === void 0 ? void 0 : _b._meta) || {},
                        [__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]: options.relatedTask
                    }
                }
            };
            await this._enqueueTaskMessage(relatedTaskId, {
                type: 'notification',
                message: jsonrpcNotification,
                timestamp: Date.now()
            });
            // Don't send through transport - queued messages are delivered via tasks/result only
            // This prevents duplicate delivery for bidirectional transports
            return;
        }
        const debouncedMethods = (_d = (_c = this._options) === null || _c === void 0 ? void 0 : _c.debouncedNotificationMethods) !== null && _d !== void 0 ? _d : [];
        // A notification can only be debounced if it's in the list AND it's "simple"
        // (i.e., has no parameters and no related request ID or related task that could be lost).
        const canDebounce = debouncedMethods.includes(notification.method) && !notification.params && !(options === null || options === void 0 ? void 0 : options.relatedRequestId) && !(options === null || options === void 0 ? void 0 : options.relatedTask);
        if (canDebounce) {
            // If a notification of this type is already scheduled, do nothing.
            if (this._pendingDebouncedNotifications.has(notification.method)) {
                return;
            }
            // Mark this notification type as pending.
            this._pendingDebouncedNotifications.add(notification.method);
            // Schedule the actual send to happen in the next microtask.
            // This allows all synchronous calls in the current event loop tick to be coalesced.
            Promise.resolve().then(()=>{
                var _a, _b;
                // Un-mark the notification so the next one can be scheduled.
                this._pendingDebouncedNotifications.delete(notification.method);
                // SAFETY CHECK: If the connection was closed while this was pending, abort.
                if (!this._transport) {
                    return;
                }
                let jsonrpcNotification = {
                    ...notification,
                    jsonrpc: '2.0'
                };
                // Augment with related task metadata if relatedTask is provided
                if (options === null || options === void 0 ? void 0 : options.relatedTask) {
                    jsonrpcNotification = {
                        ...jsonrpcNotification,
                        params: {
                            ...jsonrpcNotification.params,
                            _meta: {
                                ...((_a = jsonrpcNotification.params) === null || _a === void 0 ? void 0 : _a._meta) || {},
                                [__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]: options.relatedTask
                            }
                        }
                    };
                }
                // Send the notification, but don't await it here to avoid blocking.
                // Handle potential errors with a .catch().
                (_b = this._transport) === null || _b === void 0 ? void 0 : _b.send(jsonrpcNotification, options).catch((error)=>this._onerror(error));
            });
            // Return immediately.
            return;
        }
        let jsonrpcNotification = {
            ...notification,
            jsonrpc: '2.0'
        };
        // Augment with related task metadata if relatedTask is provided
        if (options === null || options === void 0 ? void 0 : options.relatedTask) {
            jsonrpcNotification = {
                ...jsonrpcNotification,
                params: {
                    ...jsonrpcNotification.params,
                    _meta: {
                        ...((_e = jsonrpcNotification.params) === null || _e === void 0 ? void 0 : _e._meta) || {},
                        [__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELATED_TASK_META_KEY"]]: options.relatedTask
                    }
                }
            };
        }
        await this._transport.send(jsonrpcNotification, options);
    }
    /**
     * Registers a handler to invoke when this protocol object receives a request with the given method.
     *
     * Note that this will replace any previous request handler for the same method.
     */ setRequestHandler(requestSchema, handler) {
        const method = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$json$2d$schema$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMethodLiteral"])(requestSchema);
        this.assertRequestHandlerCapability(method);
        this._requestHandlers.set(method, (request, extra)=>{
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$json$2d$schema$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWithCompat"])(requestSchema, request);
            return Promise.resolve(handler(parsed, extra));
        });
    }
    /**
     * Removes the request handler for the given method.
     */ removeRequestHandler(method) {
        this._requestHandlers.delete(method);
    }
    /**
     * Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
     */ assertCanSetRequestHandler(method) {
        if (this._requestHandlers.has(method)) {
            throw new Error(`A request handler for ${method} already exists, which would be overridden`);
        }
    }
    /**
     * Registers a handler to invoke when this protocol object receives a notification with the given method.
     *
     * Note that this will replace any previous notification handler for the same method.
     */ setNotificationHandler(notificationSchema, handler) {
        const method = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$json$2d$schema$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMethodLiteral"])(notificationSchema);
        this._notificationHandlers.set(method, (notification)=>{
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$json$2d$schema$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWithCompat"])(notificationSchema, notification);
            return Promise.resolve(handler(parsed));
        });
    }
    /**
     * Removes the notification handler for the given method.
     */ removeNotificationHandler(method) {
        this._notificationHandlers.delete(method);
    }
    /**
     * Cleans up the progress handler associated with a task.
     * This should be called when a task reaches a terminal status.
     */ _cleanupTaskProgressHandler(taskId) {
        const progressToken = this._taskProgressTokens.get(taskId);
        if (progressToken !== undefined) {
            this._progressHandlers.delete(progressToken);
            this._taskProgressTokens.delete(taskId);
        }
    }
    /**
     * Enqueues a task-related message for side-channel delivery via tasks/result.
     * @param taskId The task ID to associate the message with
     * @param message The message to enqueue
     * @param sessionId Optional session ID for binding the operation to a specific session
     * @throws Error if taskStore is not configured or if enqueue fails (e.g., queue overflow)
     *
     * Note: If enqueue fails, it's the TaskMessageQueue implementation's responsibility to handle
     * the error appropriately (e.g., by failing the task, logging, etc.). The Protocol layer
     * simply propagates the error.
     */ async _enqueueTaskMessage(taskId, message, sessionId) {
        var _a;
        // Task message queues are only used when taskStore is configured
        if (!this._taskStore || !this._taskMessageQueue) {
            throw new Error('Cannot enqueue task message: taskStore and taskMessageQueue are not configured');
        }
        const maxQueueSize = (_a = this._options) === null || _a === void 0 ? void 0 : _a.maxTaskQueueSize;
        await this._taskMessageQueue.enqueue(taskId, message, sessionId, maxQueueSize);
    }
    /**
     * Clears the message queue for a task and rejects any pending request resolvers.
     * @param taskId The task ID whose queue should be cleared
     * @param sessionId Optional session ID for binding the operation to a specific session
     */ async _clearTaskQueue(taskId, sessionId) {
        if (this._taskMessageQueue) {
            // Reject any pending request resolvers
            const messages = await this._taskMessageQueue.dequeueAll(taskId, sessionId);
            for (const message of messages){
                if (message.type === 'request' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJSONRPCRequest"])(message.message)) {
                    // Extract request ID from the message
                    const requestId = message.message.id;
                    const resolver = this._requestResolvers.get(requestId);
                    if (resolver) {
                        resolver(new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InternalError, 'Task cancelled or completed'));
                        this._requestResolvers.delete(requestId);
                    } else {
                        // Log error when resolver is missing during cleanup for better observability
                        this._onerror(new Error(`Resolver missing for request ${requestId} during task ${taskId} cleanup`));
                    }
                }
            }
        }
    }
    /**
     * Waits for a task update (new messages or status change) with abort signal support.
     * Uses polling to check for updates at the task's configured poll interval.
     * @param taskId The task ID to wait for
     * @param signal Abort signal to cancel the wait
     * @returns Promise that resolves when an update occurs or rejects if aborted
     */ async _waitForTaskUpdate(taskId, signal) {
        var _a, _b, _c;
        // Get the task's poll interval, falling back to default
        let interval = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.defaultTaskPollInterval) !== null && _b !== void 0 ? _b : 1000;
        try {
            const task = await ((_c = this._taskStore) === null || _c === void 0 ? void 0 : _c.getTask(taskId));
            if (task === null || task === void 0 ? void 0 : task.pollInterval) {
                interval = task.pollInterval;
            }
        } catch (_d) {
        // Use default interval if task lookup fails
        }
        return new Promise((resolve, reject)=>{
            if (signal.aborted) {
                reject(new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, 'Request cancelled'));
                return;
            }
            // Wait for the poll interval, then resolve so caller can check for updates
            const timeoutId = setTimeout(resolve, interval);
            // Clean up timeout and reject if aborted
            signal.addEventListener('abort', ()=>{
                clearTimeout(timeoutId);
                reject(new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, 'Request cancelled'));
            }, {
                once: true
            });
        });
    }
    requestTaskStore(request, sessionId) {
        const taskStore = this._taskStore;
        if (!taskStore) {
            throw new Error('No task store configured');
        }
        return {
            createTask: async (taskParams)=>{
                if (!request) {
                    throw new Error('No request provided');
                }
                return await taskStore.createTask(taskParams, request.id, {
                    method: request.method,
                    params: request.params
                }, sessionId);
            },
            getTask: async (taskId)=>{
                const task = await taskStore.getTask(taskId, sessionId);
                if (!task) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, 'Failed to retrieve task: Task not found');
                }
                return task;
            },
            storeTaskResult: async (taskId, status, result)=>{
                await taskStore.storeTaskResult(taskId, status, result, sessionId);
                // Get updated task state and send notification
                const task = await taskStore.getTask(taskId, sessionId);
                if (task) {
                    const notification = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskStatusNotificationSchema"].parse({
                        method: 'notifications/tasks/status',
                        params: task
                    });
                    await this.notification(notification);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                        this._cleanupTaskProgressHandler(taskId);
                    // Don't clear queue here - it will be cleared after delivery via tasks/result
                    }
                }
            },
            getTaskResult: (taskId)=>{
                return taskStore.getTaskResult(taskId, sessionId);
            },
            updateTaskStatus: async (taskId, status, statusMessage)=>{
                // Check if task exists
                const task = await taskStore.getTask(taskId, sessionId);
                if (!task) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Task "${taskId}" not found - it may have been cleaned up`);
                }
                // Don't allow transitions from terminal states
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(task.status)) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Cannot update task "${taskId}" from terminal status "${task.status}" to "${status}". Terminal states (completed, failed, cancelled) cannot transition to other states.`);
                }
                await taskStore.updateTaskStatus(taskId, status, statusMessage, sessionId);
                // Get updated task state and send notification
                const updatedTask = await taskStore.getTask(taskId, sessionId);
                if (updatedTask) {
                    const notification = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskStatusNotificationSchema"].parse({
                        method: 'notifications/tasks/status',
                        params: updatedTask
                    });
                    await this.notification(notification);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$interfaces$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminal"])(updatedTask.status)) {
                        this._cleanupTaskProgressHandler(taskId);
                    // Don't clear queue here - it will be cleared after delivery via tasks/result
                    }
                }
            },
            listTasks: (cursor)=>{
                return taskStore.listTasks(cursor, sessionId);
            }
        };
    }
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function mergeCapabilities(base, additional) {
    const result = {
        ...base
    };
    for(const key in additional){
        const k = key;
        const addValue = additional[k];
        if (addValue === undefined) continue;
        const baseValue = result[k];
        if (isPlainObject(baseValue) && isPlainObject(addValue)) {
            result[k] = {
                ...baseValue,
                ...addValue
            };
        } else {
            result[k] = addValue;
        }
    }
    return result;
} //# sourceMappingURL=protocol.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/validation/ajv-provider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * AJV-based JSON Schema validator provider
 */ __turbopack_context__.s([
    "AjvJsonSchemaValidator",
    ()=>AjvJsonSchemaValidator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$node_modules$2f$ajv$2f$dist$2f$ajv$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/node_modules/ajv/dist/ajv.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ajv$2d$formats$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/ajv-formats/dist/index.js [app-route] (ecmascript)");
;
;
function createDefaultAjvInstance() {
    const ajv = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$node_modules$2f$ajv$2f$dist$2f$ajv$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Ajv"]({
        strict: false,
        validateFormats: true,
        validateSchema: false,
        allErrors: true
    });
    const addFormats = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ajv$2d$formats$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
    addFormats(ajv);
    return ajv;
}
class AjvJsonSchemaValidator {
    /**
     * Create an AJV validator
     *
     * @param ajv - Optional pre-configured AJV instance. If not provided, a default instance will be created.
     *
     * @example
     * ```typescript
     * // Use default configuration (recommended for most cases)
     * import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
     * const validator = new AjvJsonSchemaValidator();
     *
     * // Or provide custom AJV instance for advanced configuration
     * import { Ajv } from 'ajv';
     * import addFormats from 'ajv-formats';
     *
     * const ajv = new Ajv({ validateFormats: true });
     * addFormats(ajv);
     * const validator = new AjvJsonSchemaValidator(ajv);
     * ```
     */ constructor(ajv){
        this._ajv = ajv !== null && ajv !== void 0 ? ajv : createDefaultAjvInstance();
    }
    /**
     * Create a validator for the given JSON Schema
     *
     * The validator is compiled once and can be reused multiple times.
     * If the schema has an $id, it will be cached by AJV automatically.
     *
     * @param schema - Standard JSON Schema object
     * @returns A validator function that validates input data
     */ getValidator(schema) {
        var _a;
        // Check if schema has $id and is already compiled/cached
        const ajvValidator = '$id' in schema && typeof schema.$id === 'string' ? (_a = this._ajv.getSchema(schema.$id)) !== null && _a !== void 0 ? _a : this._ajv.compile(schema) : this._ajv.compile(schema);
        return (input)=>{
            const valid = ajvValidator(input);
            if (valid) {
                return {
                    valid: true,
                    data: input,
                    errorMessage: undefined
                };
            } else {
                return {
                    valid: false,
                    data: undefined,
                    errorMessage: this._ajv.errorsText(ajvValidator.errors)
                };
            }
        };
    }
} //# sourceMappingURL=ajv-provider.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/client.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Experimental client task features for MCP SDK.
 * WARNING: These APIs are experimental and may change without notice.
 *
 * @experimental
 */ __turbopack_context__.s([
    "ExperimentalClientTasks",
    ()=>ExperimentalClientTasks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js [app-route] (ecmascript)");
;
class ExperimentalClientTasks {
    constructor(_client){
        this._client = _client;
    }
    /**
     * Calls a tool and returns an AsyncGenerator that yields response messages.
     * The generator is guaranteed to end with either a 'result' or 'error' message.
     *
     * This method provides streaming access to tool execution, allowing you to
     * observe intermediate task status updates for long-running tool calls.
     * Automatically validates structured output if the tool has an outputSchema.
     *
     * @example
     * ```typescript
     * const stream = client.experimental.tasks.callToolStream({ name: 'myTool', arguments: {} });
     * for await (const message of stream) {
     *   switch (message.type) {
     *     case 'taskCreated':
     *       console.log('Tool execution started:', message.task.taskId);
     *       break;
     *     case 'taskStatus':
     *       console.log('Tool status:', message.task.status);
     *       break;
     *     case 'result':
     *       console.log('Tool result:', message.result);
     *       break;
     *     case 'error':
     *       console.error('Tool error:', message.error);
     *       break;
     *   }
     * }
     * ```
     *
     * @param params - Tool call parameters (name and arguments)
     * @param resultSchema - Zod schema for validating the result (defaults to CallToolResultSchema)
     * @param options - Optional request options (timeout, signal, task creation params, etc.)
     * @returns AsyncGenerator that yields ResponseMessage objects
     *
     * @experimental
     */ async *callToolStream(params, resultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallToolResultSchema"], options) {
        var _a;
        // Access Client's internal methods
        const clientInternal = this._client;
        // Add task creation parameters if server supports it and not explicitly provided
        const optionsWithTask = {
            ...options,
            // We check if the tool is known to be a task during auto-configuration, but assume
            // the caller knows what they're doing if they pass this explicitly
            task: (_a = options === null || options === void 0 ? void 0 : options.task) !== null && _a !== void 0 ? _a : clientInternal.isToolTask(params.name) ? {} : undefined
        };
        const stream = clientInternal.requestStream({
            method: 'tools/call',
            params
        }, resultSchema, optionsWithTask);
        // Get the validator for this tool (if it has an output schema)
        const validator = clientInternal.getToolOutputValidator(params.name);
        // Iterate through the stream and validate the final result if needed
        for await (const message of stream){
            // If this is a result message and the tool has an output schema, validate it
            if (message.type === 'result' && validator) {
                const result = message.result;
                // If tool has outputSchema, it MUST return structuredContent (unless it's an error)
                if (!result.structuredContent && !result.isError) {
                    yield {
                        type: 'error',
                        error: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`)
                    };
                    return;
                }
                // Only validate structured content if present (not when there's an error)
                if (result.structuredContent) {
                    try {
                        // Validate the structured content against the schema
                        const validationResult = validator(result.structuredContent);
                        if (!validationResult.valid) {
                            yield {
                                type: 'error',
                                error: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`)
                            };
                            return;
                        }
                    } catch (error) {
                        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"]) {
                            yield {
                                type: 'error',
                                error
                            };
                            return;
                        }
                        yield {
                            type: 'error',
                            error: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Failed to validate structured content: ${error instanceof Error ? error.message : String(error)}`)
                        };
                        return;
                    }
                }
            }
            // Yield the message (either validated result or any other message type)
            yield message;
        }
    }
    /**
     * Gets the current status of a task.
     *
     * @param taskId - The task identifier
     * @param options - Optional request options
     * @returns The task status
     *
     * @experimental
     */ async getTask(taskId, options) {
        return this._client.getTask({
            taskId
        }, options);
    }
    /**
     * Retrieves the result of a completed task.
     *
     * @param taskId - The task identifier
     * @param resultSchema - Zod schema for validating the result
     * @param options - Optional request options
     * @returns The task result
     *
     * @experimental
     */ async getTaskResult(taskId, resultSchema, options) {
        // Delegate to the client's underlying Protocol method
        return this._client.getTaskResult({
            taskId
        }, resultSchema, options);
    }
    /**
     * Lists tasks with optional pagination.
     *
     * @param cursor - Optional pagination cursor
     * @param options - Optional request options
     * @returns List of tasks with optional next cursor
     *
     * @experimental
     */ async listTasks(cursor, options) {
        // Delegate to the client's underlying Protocol method
        return this._client.listTasks(cursor ? {
            cursor
        } : undefined, options);
    }
    /**
     * Cancels a running task.
     *
     * @param taskId - The task identifier
     * @param options - Optional request options
     *
     * @experimental
     */ async cancelTask(taskId, options) {
        // Delegate to the client's underlying Protocol method
        return this._client.cancelTask({
            taskId
        }, options);
    }
    /**
     * Sends a request and returns an AsyncGenerator that yields response messages.
     * The generator is guaranteed to end with either a 'result' or 'error' message.
     *
     * This method provides streaming access to request processing, allowing you to
     * observe intermediate task status updates for task-augmented requests.
     *
     * @param request - The request to send
     * @param resultSchema - Zod schema for validating the result
     * @param options - Optional request options (timeout, signal, task creation params, etc.)
     * @returns AsyncGenerator that yields ResponseMessage objects
     *
     * @experimental
     */ requestStream(request, resultSchema, options) {
        return this._client.requestStream(request, resultSchema, options);
    }
} //# sourceMappingURL=client.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/helpers.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Experimental task capability assertion helpers.
 * WARNING: These APIs are experimental and may change without notice.
 *
 * @experimental
 */ /**
 * Asserts that task creation is supported for tools/call.
 * Used by Client.assertTaskCapability and Server.assertTaskHandlerCapability.
 *
 * @param requests - The task requests capability object
 * @param method - The method being checked
 * @param entityName - 'Server' or 'Client' for error messages
 * @throws Error if the capability is not supported
 *
 * @experimental
 */ __turbopack_context__.s([
    "assertClientRequestTaskCapability",
    ()=>assertClientRequestTaskCapability,
    "assertToolsCallTaskCapability",
    ()=>assertToolsCallTaskCapability
]);
function assertToolsCallTaskCapability(requests, method, entityName) {
    var _a;
    if (!requests) {
        throw new Error(`${entityName} does not support task creation (required for ${method})`);
    }
    switch(method){
        case 'tools/call':
            if (!((_a = requests.tools) === null || _a === void 0 ? void 0 : _a.call)) {
                throw new Error(`${entityName} does not support task creation for tools/call (required for ${method})`);
            }
            break;
        default:
            break;
    }
}
function assertClientRequestTaskCapability(requests, method, entityName) {
    var _a, _b;
    if (!requests) {
        throw new Error(`${entityName} does not support task creation (required for ${method})`);
    }
    switch(method){
        case 'sampling/createMessage':
            if (!((_a = requests.sampling) === null || _a === void 0 ? void 0 : _a.createMessage)) {
                throw new Error(`${entityName} does not support task creation for sampling/createMessage (required for ${method})`);
            }
            break;
        case 'elicitation/create':
            if (!((_b = requests.elicitation) === null || _b === void 0 ? void 0 : _b.create)) {
                throw new Error(`${entityName} does not support task creation for elicitation/create (required for ${method})`);
            }
            break;
        default:
            break;
    }
} //# sourceMappingURL=helpers.js.map
}),
"[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Client",
    ()=>Client,
    "getSupportedElicitationModes",
    ()=>getSupportedElicitationModes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$shared$2f$protocol$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$validation$2f$ajv$2d$provider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/validation/ajv-provider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/client.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/helpers.js [app-route] (ecmascript)");
;
;
;
;
;
;
/**
 * Elicitation default application helper. Applies defaults to the data based on the schema.
 *
 * @param schema - The schema to apply defaults to.
 * @param data - The data to apply defaults to.
 */ function applyElicitationDefaults(schema, data) {
    if (!schema || data === null || typeof data !== 'object') return;
    // Handle object properties
    if (schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
        const obj = data;
        const props = schema.properties;
        for (const key of Object.keys(props)){
            const propSchema = props[key];
            // If missing or explicitly undefined, apply default if present
            if (obj[key] === undefined && Object.prototype.hasOwnProperty.call(propSchema, 'default')) {
                obj[key] = propSchema.default;
            }
            // Recurse into existing nested objects/arrays
            if (obj[key] !== undefined) {
                applyElicitationDefaults(propSchema, obj[key]);
            }
        }
    }
    if (Array.isArray(schema.anyOf)) {
        for (const sub of schema.anyOf){
            applyElicitationDefaults(sub, data);
        }
    }
    // Combine schemas
    if (Array.isArray(schema.oneOf)) {
        for (const sub of schema.oneOf){
            applyElicitationDefaults(sub, data);
        }
    }
}
function getSupportedElicitationModes(capabilities) {
    if (!capabilities) {
        return {
            supportsFormMode: false,
            supportsUrlMode: false
        };
    }
    const hasFormCapability = capabilities.form !== undefined;
    const hasUrlCapability = capabilities.url !== undefined;
    // If neither form nor url are explicitly declared, form mode is supported (backwards compatibility)
    const supportsFormMode = hasFormCapability || !hasFormCapability && !hasUrlCapability;
    const supportsUrlMode = hasUrlCapability;
    return {
        supportsFormMode,
        supportsUrlMode
    };
}
class Client extends __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$shared$2f$protocol$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Protocol"] {
    /**
     * Initializes this client with the given name and version information.
     */ constructor(_clientInfo, options){
        var _a, _b;
        super(options);
        this._clientInfo = _clientInfo;
        this._cachedToolOutputValidators = new Map();
        this._cachedKnownTaskTools = new Set();
        this._cachedRequiredTaskTools = new Set();
        this._capabilities = (_a = options === null || options === void 0 ? void 0 : options.capabilities) !== null && _a !== void 0 ? _a : {};
        this._jsonSchemaValidator = (_b = options === null || options === void 0 ? void 0 : options.jsonSchemaValidator) !== null && _b !== void 0 ? _b : new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$validation$2f$ajv$2d$provider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AjvJsonSchemaValidator"]();
    }
    /**
     * Access experimental features.
     *
     * WARNING: These APIs are experimental and may change without notice.
     *
     * @experimental
     */ get experimental() {
        if (!this._experimental) {
            this._experimental = {
                tasks: new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ExperimentalClientTasks"](this)
            };
        }
        return this._experimental;
    }
    /**
     * Registers new capabilities. This can only be called before connecting to a transport.
     *
     * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
     */ registerCapabilities(capabilities) {
        if (this.transport) {
            throw new Error('Cannot register capabilities after connecting to transport');
        }
        this._capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$shared$2f$protocol$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeCapabilities"])(this._capabilities, capabilities);
    }
    /**
     * Override request handler registration to enforce client-side validation for elicitation.
     */ setRequestHandler(requestSchema, handler) {
        var _a, _b, _c;
        const shape = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getObjectShape"])(requestSchema);
        const methodSchema = shape === null || shape === void 0 ? void 0 : shape.method;
        if (!methodSchema) {
            throw new Error('Schema is missing a method literal');
        }
        // Extract literal value using type-safe property access
        let methodValue;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZ4Schema"])(methodSchema)) {
            const v4Schema = methodSchema;
            const v4Def = (_a = v4Schema._zod) === null || _a === void 0 ? void 0 : _a.def;
            methodValue = (_b = v4Def === null || v4Def === void 0 ? void 0 : v4Def.value) !== null && _b !== void 0 ? _b : v4Schema.value;
        } else {
            const v3Schema = methodSchema;
            const legacyDef = v3Schema._def;
            methodValue = (_c = legacyDef === null || legacyDef === void 0 ? void 0 : legacyDef.value) !== null && _c !== void 0 ? _c : v3Schema.value;
        }
        if (typeof methodValue !== 'string') {
            throw new Error('Schema method literal must be a string');
        }
        const method = methodValue;
        if (method === 'elicitation/create') {
            const wrappedHandler = async (request, extra)=>{
                var _a, _b, _c;
                const validatedRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ElicitRequestSchema"], request);
                if (!validatedRequest.success) {
                    // Type guard: if success is false, error is guaranteed to exist
                    const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid elicitation request: ${errorMessage}`);
                }
                const { params } = validatedRequest.data;
                const mode = (_a = params.mode) !== null && _a !== void 0 ? _a : 'form';
                const { supportsFormMode, supportsUrlMode } = getSupportedElicitationModes(this._capabilities.elicitation);
                if (mode === 'form' && !supportsFormMode) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, 'Client does not support form-mode elicitation requests');
                }
                if (mode === 'url' && !supportsUrlMode) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, 'Client does not support URL-mode elicitation requests');
                }
                const result = await Promise.resolve(handler(request, extra));
                // When task creation is requested, validate and return CreateTaskResult
                if (params.task) {
                    const taskValidationResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateTaskResultSchema"], result);
                    if (!taskValidationResult.success) {
                        const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid task creation result: ${errorMessage}`);
                    }
                    return taskValidationResult.data;
                }
                // For non-task requests, validate against ElicitResultSchema
                const validationResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ElicitResultSchema"], result);
                if (!validationResult.success) {
                    // Type guard: if success is false, error is guaranteed to exist
                    const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid elicitation result: ${errorMessage}`);
                }
                const validatedResult = validationResult.data;
                const requestedSchema = mode === 'form' ? params.requestedSchema : undefined;
                if (mode === 'form' && validatedResult.action === 'accept' && validatedResult.content && requestedSchema) {
                    if ((_c = (_b = this._capabilities.elicitation) === null || _b === void 0 ? void 0 : _b.form) === null || _c === void 0 ? void 0 : _c.applyDefaults) {
                        try {
                            applyElicitationDefaults(requestedSchema, validatedResult.content);
                        } catch (_d) {
                        // gracefully ignore errors in default application
                        }
                    }
                }
                return validatedResult;
            };
            // Install the wrapped handler
            return super.setRequestHandler(requestSchema, wrappedHandler);
        }
        if (method === 'sampling/createMessage') {
            const wrappedHandler = async (request, extra)=>{
                const validatedRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateMessageRequestSchema"], request);
                if (!validatedRequest.success) {
                    const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid sampling request: ${errorMessage}`);
                }
                const { params } = validatedRequest.data;
                const result = await Promise.resolve(handler(request, extra));
                // When task creation is requested, validate and return CreateTaskResult
                if (params.task) {
                    const taskValidationResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateTaskResultSchema"], result);
                    if (!taskValidationResult.success) {
                        const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid task creation result: ${errorMessage}`);
                    }
                    return taskValidationResult.data;
                }
                // For non-task requests, validate against CreateMessageResultSchema
                const validationResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$zod$2d$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParse"])(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateMessageResultSchema"], result);
                if (!validationResult.success) {
                    const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Invalid sampling result: ${errorMessage}`);
                }
                return validationResult.data;
            };
            // Install the wrapped handler
            return super.setRequestHandler(requestSchema, wrappedHandler);
        }
        // Other handlers use default behavior
        return super.setRequestHandler(requestSchema, handler);
    }
    assertCapability(capability, method) {
        var _a;
        if (!((_a = this._serverCapabilities) === null || _a === void 0 ? void 0 : _a[capability])) {
            throw new Error(`Server does not support ${capability} (required for ${method})`);
        }
    }
    async connect(transport, options) {
        await super.connect(transport);
        // When transport sessionId is already set this means we are trying to reconnect.
        // In this case we don't need to initialize again.
        if (transport.sessionId !== undefined) {
            return;
        }
        try {
            const result = await this.request({
                method: 'initialize',
                params: {
                    protocolVersion: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LATEST_PROTOCOL_VERSION"],
                    capabilities: this._capabilities,
                    clientInfo: this._clientInfo
                }
            }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InitializeResultSchema"], options);
            if (result === undefined) {
                throw new Error(`Server sent invalid initialize result: ${result}`);
            }
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPPORTED_PROTOCOL_VERSIONS"].includes(result.protocolVersion)) {
                throw new Error(`Server's protocol version is not supported: ${result.protocolVersion}`);
            }
            this._serverCapabilities = result.capabilities;
            this._serverVersion = result.serverInfo;
            // HTTP transports must set the protocol version in each header after initialization.
            if (transport.setProtocolVersion) {
                transport.setProtocolVersion(result.protocolVersion);
            }
            this._instructions = result.instructions;
            await this.notification({
                method: 'notifications/initialized'
            });
        } catch (error) {
            // Disconnect if initialization fails.
            void this.close();
            throw error;
        }
    }
    /**
     * After initialization has completed, this will be populated with the server's reported capabilities.
     */ getServerCapabilities() {
        return this._serverCapabilities;
    }
    /**
     * After initialization has completed, this will be populated with information about the server's name and version.
     */ getServerVersion() {
        return this._serverVersion;
    }
    /**
     * After initialization has completed, this may be populated with information about the server's instructions.
     */ getInstructions() {
        return this._instructions;
    }
    assertCapabilityForMethod(method) {
        var _a, _b, _c, _d, _e;
        switch(method){
            case 'logging/setLevel':
                if (!((_a = this._serverCapabilities) === null || _a === void 0 ? void 0 : _a.logging)) {
                    throw new Error(`Server does not support logging (required for ${method})`);
                }
                break;
            case 'prompts/get':
            case 'prompts/list':
                if (!((_b = this._serverCapabilities) === null || _b === void 0 ? void 0 : _b.prompts)) {
                    throw new Error(`Server does not support prompts (required for ${method})`);
                }
                break;
            case 'resources/list':
            case 'resources/templates/list':
            case 'resources/read':
            case 'resources/subscribe':
            case 'resources/unsubscribe':
                if (!((_c = this._serverCapabilities) === null || _c === void 0 ? void 0 : _c.resources)) {
                    throw new Error(`Server does not support resources (required for ${method})`);
                }
                if (method === 'resources/subscribe' && !this._serverCapabilities.resources.subscribe) {
                    throw new Error(`Server does not support resource subscriptions (required for ${method})`);
                }
                break;
            case 'tools/call':
            case 'tools/list':
                if (!((_d = this._serverCapabilities) === null || _d === void 0 ? void 0 : _d.tools)) {
                    throw new Error(`Server does not support tools (required for ${method})`);
                }
                break;
            case 'completion/complete':
                if (!((_e = this._serverCapabilities) === null || _e === void 0 ? void 0 : _e.completions)) {
                    throw new Error(`Server does not support completions (required for ${method})`);
                }
                break;
            case 'initialize':
                break;
            case 'ping':
                break;
        }
    }
    assertNotificationCapability(method) {
        var _a;
        switch(method){
            case 'notifications/roots/list_changed':
                if (!((_a = this._capabilities.roots) === null || _a === void 0 ? void 0 : _a.listChanged)) {
                    throw new Error(`Client does not support roots list changed notifications (required for ${method})`);
                }
                break;
            case 'notifications/initialized':
                break;
            case 'notifications/cancelled':
                break;
            case 'notifications/progress':
                break;
        }
    }
    assertRequestHandlerCapability(method) {
        // Task handlers are registered in Protocol constructor before _capabilities is initialized
        // Skip capability check for task methods during initialization
        if (!this._capabilities) {
            return;
        }
        switch(method){
            case 'sampling/createMessage':
                if (!this._capabilities.sampling) {
                    throw new Error(`Client does not support sampling capability (required for ${method})`);
                }
                break;
            case 'elicitation/create':
                if (!this._capabilities.elicitation) {
                    throw new Error(`Client does not support elicitation capability (required for ${method})`);
                }
                break;
            case 'roots/list':
                if (!this._capabilities.roots) {
                    throw new Error(`Client does not support roots capability (required for ${method})`);
                }
                break;
            case 'tasks/get':
            case 'tasks/list':
            case 'tasks/result':
            case 'tasks/cancel':
                if (!this._capabilities.tasks) {
                    throw new Error(`Client does not support tasks capability (required for ${method})`);
                }
                break;
            case 'ping':
                break;
        }
    }
    assertTaskCapability(method) {
        var _a, _b;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertToolsCallTaskCapability"])((_b = (_a = this._serverCapabilities) === null || _a === void 0 ? void 0 : _a.tasks) === null || _b === void 0 ? void 0 : _b.requests, method, 'Server');
    }
    assertTaskHandlerCapability(method) {
        var _a;
        // Task handlers are registered in Protocol constructor before _capabilities is initialized
        // Skip capability check for task methods during initialization
        if (!this._capabilities) {
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$experimental$2f$tasks$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertClientRequestTaskCapability"])((_a = this._capabilities.tasks) === null || _a === void 0 ? void 0 : _a.requests, method, 'Client');
    }
    async ping(options) {
        return this.request({
            method: 'ping'
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmptyResultSchema"], options);
    }
    async complete(params, options) {
        return this.request({
            method: 'completion/complete',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CompleteResultSchema"], options);
    }
    async setLoggingLevel(level, options) {
        return this.request({
            method: 'logging/setLevel',
            params: {
                level
            }
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmptyResultSchema"], options);
    }
    async getPrompt(params, options) {
        return this.request({
            method: 'prompts/get',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetPromptResultSchema"], options);
    }
    async listPrompts(params, options) {
        return this.request({
            method: 'prompts/list',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListPromptsResultSchema"], options);
    }
    async listResources(params, options) {
        return this.request({
            method: 'resources/list',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListResourcesResultSchema"], options);
    }
    async listResourceTemplates(params, options) {
        return this.request({
            method: 'resources/templates/list',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListResourceTemplatesResultSchema"], options);
    }
    async readResource(params, options) {
        return this.request({
            method: 'resources/read',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadResourceResultSchema"], options);
    }
    async subscribeResource(params, options) {
        return this.request({
            method: 'resources/subscribe',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmptyResultSchema"], options);
    }
    async unsubscribeResource(params, options) {
        return this.request({
            method: 'resources/unsubscribe',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmptyResultSchema"], options);
    }
    /**
     * Calls a tool and waits for the result. Automatically validates structured output if the tool has an outputSchema.
     *
     * For task-based execution with streaming behavior, use client.experimental.tasks.callToolStream() instead.
     */ async callTool(params, resultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallToolResultSchema"], options) {
        // Guard: required-task tools need experimental API
        if (this.isToolTaskRequired(params.name)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, `Tool "${params.name}" requires task-based execution. Use client.experimental.tasks.callToolStream() instead.`);
        }
        const result = await this.request({
            method: 'tools/call',
            params
        }, resultSchema, options);
        // Check if the tool has an outputSchema
        const validator = this.getToolOutputValidator(params.name);
        if (validator) {
            // If tool has outputSchema, it MUST return structuredContent (unless it's an error)
            if (!result.structuredContent && !result.isError) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`);
            }
            // Only validate structured content if present (not when there's an error)
            if (result.structuredContent) {
                try {
                    // Validate the structured content against the schema
                    const validationResult = validator(result.structuredContent);
                    if (!validationResult.valid) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`);
                    }
                } catch (error) {
                    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"]) {
                        throw error;
                    }
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpError"](__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ErrorCode"].InvalidParams, `Failed to validate structured content: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
        return result;
    }
    isToolTask(toolName) {
        var _a, _b, _c, _d;
        if (!((_d = (_c = (_b = (_a = this._serverCapabilities) === null || _a === void 0 ? void 0 : _a.tasks) === null || _b === void 0 ? void 0 : _b.requests) === null || _c === void 0 ? void 0 : _c.tools) === null || _d === void 0 ? void 0 : _d.call)) {
            return false;
        }
        return this._cachedKnownTaskTools.has(toolName);
    }
    /**
     * Check if a tool requires task-based execution.
     * Unlike isToolTask which includes 'optional' tools, this only checks for 'required'.
     */ isToolTaskRequired(toolName) {
        return this._cachedRequiredTaskTools.has(toolName);
    }
    /**
     * Cache validators for tool output schemas.
     * Called after listTools() to pre-compile validators for better performance.
     */ cacheToolMetadata(tools) {
        var _a;
        this._cachedToolOutputValidators.clear();
        this._cachedKnownTaskTools.clear();
        this._cachedRequiredTaskTools.clear();
        for (const tool of tools){
            // If the tool has an outputSchema, create and cache the validator
            if (tool.outputSchema) {
                const toolValidator = this._jsonSchemaValidator.getValidator(tool.outputSchema);
                this._cachedToolOutputValidators.set(tool.name, toolValidator);
            }
            // If the tool supports task-based execution, cache that information
            const taskSupport = (_a = tool.execution) === null || _a === void 0 ? void 0 : _a.taskSupport;
            if (taskSupport === 'required' || taskSupport === 'optional') {
                this._cachedKnownTaskTools.add(tool.name);
            }
            if (taskSupport === 'required') {
                this._cachedRequiredTaskTools.add(tool.name);
            }
        }
    }
    /**
     * Get cached validator for a tool
     */ getToolOutputValidator(toolName) {
        return this._cachedToolOutputValidators.get(toolName);
    }
    async listTools(params, options) {
        const result = await this.request({
            method: 'tools/list',
            params
        }, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ListToolsResultSchema"], options);
        // Cache the tools and their output schemas for future validation
        this.cacheToolMetadata(result.tools);
        return result;
    }
    async sendRootsListChanged() {
        return this.notification({
            method: 'notifications/roots/list_changed'
        });
    }
} //# sourceMappingURL=index.js.map
}),
];

//# sourceMappingURL=1ffcc_%40modelcontextprotocol_sdk_dist_esm_288e98d7._.js.map