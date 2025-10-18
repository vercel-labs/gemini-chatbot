import type {
    ToolInvocation,
    Message as V4Message,
    UIMessage as LegacyUIMessage,
  } from 'ai-legacy';
  import type { JSONValue, ToolUIPart, UIMessage, UITools } from 'ai';

  export type MyUIMessage = UIMessage<never, { custom: JSONValue }, UITools>;

  type V4Part = NonNullable<V4Message['parts']>[number];
  type V5Part = MyUIMessage['parts'][number];

  // Type definitions for V4 parts
  type V4ToolInvocationPart = Extract<V4Part, { type: 'tool-invocation' }>;

  type V4ReasoningPart = Extract<V4Part, { type: 'reasoning' }>;

  type V4SourcePart = Extract<V4Part, { type: 'source' }>;

  type V4FilePart = Extract<V4Part, { type: 'file' }>;

  // Type guards
  function isV4Message(msg: V4Message | MyUIMessage): msg is V4Message {
    return (
      'toolInvocations' in msg ||
      (msg?.parts?.some(p => p.type === 'tool-invocation') ?? false) ||
      msg?.role === 'data' ||
      ('reasoning' in msg && typeof msg.reasoning === 'string') ||
      (msg?.parts?.some(p => 'args' in p || 'result' in p) ?? false) ||
      (msg?.parts?.some(p => 'reasoning' in p && 'details' in p) ?? false) ||
      (msg?.parts?.some(
        p => p.type === 'file' && 'mimeType' in p && 'data' in p,
      ) ??
        false)
    );
  }

  function isV4ToolInvocationPart(part: unknown): part is V4ToolInvocationPart {
    return (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'tool-invocation' &&
      'toolInvocation' in part
    );
  }

  function isV4ReasoningPart(part: unknown): part is V4ReasoningPart {
    return (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'reasoning' &&
      'reasoning' in part
    );
  }

  function isV4SourcePart(part: unknown): part is V4SourcePart {
    return (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'source' &&
      'source' in part
    );
  }

  function isV4FilePart(part: unknown): part is V4FilePart {
    return (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'file' &&
      'mimeType' in part &&
      'data' in part
    );
  }

  // State mapping
  const V4_TO_V5_STATE_MAP = {
    'partial-call': 'input-streaming',
    call: 'input-available',
    result: 'output-available',
  } as const;

  function convertToolInvocationState(
    v4State: ToolInvocation['state'],
  ): 'input-streaming' | 'input-available' | 'output-available' {
    return V4_TO_V5_STATE_MAP[v4State] ?? 'output-available';
  }

  // Tool conversion
  function convertV4ToolInvocationToV5ToolUIPart(
    toolInvocation: ToolInvocation,
  ): ToolUIPart {
    return {
      type: `tool-${toolInvocation.toolName}`,
      toolCallId: toolInvocation.toolCallId,
      input: toolInvocation.args,
      output:
        toolInvocation.state === 'result' ? toolInvocation.result : undefined,
      state: convertToolInvocationState(toolInvocation.state),
    };
  }

  // Part converters
  function convertV4ToolInvocationPart(part: V4ToolInvocationPart): V5Part {
    return convertV4ToolInvocationToV5ToolUIPart(part.toolInvocation);
  }

  function convertV4ReasoningPart(part: V4ReasoningPart): V5Part {
    return { type: 'reasoning', text: part.reasoning };
  }

  function convertV4SourcePart(part: V4SourcePart): V5Part {
    return {
      type: 'source-url',
      url: part.source.url,
      sourceId: part.source.id,
      title: part.source.title,
    };
  }

  function convertV4FilePart(part: V4FilePart): V5Part {
    return {
      type: 'file',
      mediaType: part.mimeType,
      url: part.data,
    };
  }

  function convertPart(part: V4Part | V5Part): V5Part {
    if (isV4ToolInvocationPart(part)) {
      return convertV4ToolInvocationPart(part);
    }
    if (isV4ReasoningPart(part)) {
      return convertV4ReasoningPart(part);
    }
    if (isV4SourcePart(part)) {
      return convertV4SourcePart(part);
    }
    if (isV4FilePart(part)) {
      return convertV4FilePart(part);
    }
    // Already V5 format
    return part;
  }

  // Message conversion
  function createBaseMessage(
    msg: V4Message | MyUIMessage,
    index: number,
  ): Pick<MyUIMessage, 'id' | 'role'> {
    return {
      id: msg.id || `msg-${index}`,
      role: msg.role === 'data' ? 'assistant' : msg.role,
    };
  }

  function convertDataMessage(msg: V4Message, index: number): MyUIMessage {
    return {
      ...createBaseMessage(msg, index),
      parts: [
        {
          type: 'data-custom',
          data: msg.data || msg.content,
        },
      ],
    };
  }

  function buildPartsFromTopLevelFields(msg: V4Message): MyUIMessage['parts'] {
    const parts: MyUIMessage['parts'] = [];

    if (msg.reasoning) {
      parts.push({ type: 'reasoning', text: msg.reasoning });
    }

    if (msg.toolInvocations) {
      parts.push(
        ...msg.toolInvocations.map(convertV4ToolInvocationToV5ToolUIPart),
      );
    }

    if (msg.content && typeof msg.content === 'string') {
      parts.push({ type: 'text', text: msg.content });
    }

    return parts;
  }

  function convertPartsArray(parts: V4Part[]): MyUIMessage['parts'] {
    return parts.map(convertPart);
  }

  export function convertV4MessageToV5(
    msg: V4Message | MyUIMessage,
    index: number,
  ): MyUIMessage {
    if (!isV4Message(msg)) {
      return msg as MyUIMessage;
    }

    if (msg.role === 'data') {
      return convertDataMessage(msg, index);
    }

    const base = createBaseMessage(msg, index);
    const parts = msg.parts
      ? convertPartsArray(msg.parts)
      : buildPartsFromTopLevelFields(msg);

    return { ...base, parts };
  }

  // V5 to V4 conversion
  function convertV5ToolUIPartToV4ToolInvocation(
    part: ToolUIPart,
  ): ToolInvocation {
    const state =
      part.state === 'input-streaming'
        ? 'partial-call'
        : part.state === 'input-available'
          ? 'call'
          : 'result';

    const toolName = part.type.startsWith('tool-')
      ? part.type.slice(5)
      : part.type;

    const base = {
      toolCallId: part.toolCallId,
      toolName,
      args: part.input,
      state,
    };

    if (state === 'result' && part.output !== undefined) {
      return { ...base, state: 'result' as const, result: part.output };
    }

    return base as ToolInvocation;
  }

  export function convertV5MessageToV4(msg: MyUIMessage): LegacyUIMessage {
    const parts: V4Part[] = [];

    const base: LegacyUIMessage = {
      id: msg.id,
      role: msg.role,
      content: '',
      parts,
    };

    let textContent = '';
    let reasoning: string | undefined;
    const toolInvocations: ToolInvocation[] = [];

    for (const part of msg.parts) {
      if (part.type === 'text') {
        textContent = part.text;
        parts.push({ type: 'text', text: part.text });
      } else if (part.type === 'reasoning') {
        reasoning = part.text;
        parts.push({
          type: 'reasoning',
          reasoning: part.text,
          details: [{ type: 'text', text: part.text }],
        });
      } else if (part.type.startsWith('tool-')) {
        const toolInvocation = convertV5ToolUIPartToV4ToolInvocation(
          part as ToolUIPart,
        );
        parts.push({ type: 'tool-invocation', toolInvocation: toolInvocation });
        toolInvocations.push(toolInvocation);
      } else if (part.type === 'source-url') {
        parts.push({
          type: 'source',
          source: {
            id: part.sourceId,
            url: part.url,
            title: part.title,
            sourceType: 'url',
          },
        });
      } else if (part.type === 'file') {
        parts.push({
          type: 'file',
          mimeType: part.mediaType,
          data: part.url,
        });
      } else if (part.type === 'data-custom') {
        base.data = part.data;
      }
    }

    if (textContent) {
      base.content = textContent;
    }

    if (reasoning) {
      base.reasoning = reasoning;
    }

    if (toolInvocations.length > 0) {
      base.toolInvocations = toolInvocations;
    }

    if (parts.length > 0) {
      base.parts = parts;
    }
    return base;
  }
