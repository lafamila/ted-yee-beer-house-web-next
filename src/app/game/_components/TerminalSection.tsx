import { CommandHandler, CommandLine, ReadRequestInterface, TerminalHandler } from "@/lib/types";
import { cn, tokenizeCommandLine } from "@/lib/utils";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

interface TerminalSectionProps {
  title?: string;
  prompt?: string;
  height?: number | string;
  style?: React.CSSProperties;
  welcomeMessages?: string[];
  onCommand?: CommandHandler;
}
function TerminalSection(
  {
    title = "Terminal",
    prompt = "guest@web",
    height = 360,
    style,
    welcomeMessages = [
      "Welcome to the Terminal!",
      "Type 'help' to see available commands.",
    ],
    onCommand,
  }: TerminalSectionProps,
  ref: React.Ref<TerminalHandler>
){
  const [lines, setLines] = useState<CommandLine[]>(() =>
    welcomeMessages.map((t) => ({ type: "system" as const, text: t }))
  );
  const pushLine = useCallback((line: CommandLine) => {
    setLines((ls) => [...ls, line]);
  }, []);

  const pushLines = useCallback((ls2: CommandLine[]) => {
    setLines((ls) => [...ls, ...ls2]);
  }, []);


  const [userInput, setUserInput] = useState<string>("");
  const [histories, setHistories] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readRequest, setReadRequest] = useState<null | ReadRequestInterface>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      read: (opts) =>
        new Promise<string>((resolve, reject) => {
          
          if (opts?.label) pushLine({ type: "system", text: opts.label });

          setReadRequest({
            label: opts?.label,
            isSecret: opts?.isSecret ?? false,
            resolve,
            reject,
          });
          setUserInput("");
          inputRef.current?.focus();
        }),
      print: (msg) => {
        const arr = Array.isArray(msg) ? msg : [msg];
        pushLines(arr.map((t) => ({ type: "system" as const, text: String(t) })));
      },
    }),
    []
  );
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // auto-scroll to bottom on any change
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, userInput]);

  const builtInFunctions = useMemo(() => {
    return {
      help: () => [
        "help                    Show this help",
        "clear                   Clear the screen",
        "echo [text]             Print text",
        "date                    Print current date",
        "whoami                  Print prompt name",
      ],
      clear: () => {
        setLines([]);
        return undefined;
      },
      echo: (...xs: string[]) => xs.join(" ") || "",
      date: () => new Date().toString(),
      whoami: () => prompt,
    } as const;
  }, [prompt]);

  const runCommand = useCallback(async (cmdLine: string) => {
    const trimmedCommand = cmdLine.trim();
    pushLine({ type: "input", text: `${prompt}$ ${trimmedCommand}` });
    if (!trimmedCommand) return;
    const [cmd, ...args] = tokenizeCommandLine(trimmedCommand);

    // custom command handler
    try {
      const res = await onCommand?.(cmd, args);
      if (res !== undefined) {
        if (Array.isArray(res)) {
          pushLines(
            res.map((t) => ({ type: "output" as const, text: String(t) }))
          );
        } else {
          pushLine({ type: "output", text: String(res) });
        }
        return;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      pushLine({ type: "output", text: `Error: ${e?.message || e}` });
      return;
    }

    // built-in commands
    if (cmd in builtInFunctions) {
      const builtInFunction = builtInFunctions[cmd as keyof typeof builtInFunctions];
      const out = builtInFunction(...args);
      if (Array.isArray(out))
        pushLines(
          out.map((t: string) => ({ type: "output" as const, text: t }))
        );
      else if (out != null) pushLine({ type: "output", text: String(out) });
      return;
    }

    // command not found
    pushLine({ type: "output", text: `Command not found: ${cmd}` });
  }, [builtInFunctions, onCommand, pushLine, pushLines, prompt]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readRequest) {
      if (e.key === "Enter") {
        const v = userInput;
        if (readRequest.isSecret) {
          pushLine({
            type: "system",
            text: v.replace(/./g, "*"),
          });
        } else {
          pushLine({ type: "system", text: v });
        }
        setUserInput("");
        const { resolve, reject } = readRequest;
        setReadRequest(null);
        if (v) resolve(v);
        else reject(new Error("Wrong input"));
        e.preventDefault();
        return;
      }
      if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        pushLine({ type: "system", text: "^C" });
        const { reject } = readRequest;
        setReadRequest(null);
        setUserInput("");
        reject(new Error("Canceled"));
        e.preventDefault();
        return;
      }
      return;
    }

    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      // Ctrl/Cmd+C → add caret cancel line
      pushLine({ type: "system", text: `${prompt}$ ${userInput}` });
      setUserInput("");
      setHistoryIndex(-1);
      return;
    }
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines([]);
      return;
    }
    if (e.key === "Enter") {
      const v = userInput;
      setHistories((h) => (v ? [...h, v] : h));
      setHistoryIndex(-1);
      setUserInput("");
      void runCommand(v);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIndex((idx) => {
        const next = idx < 0 ? histories.length - 1 : Math.max(0, idx - 1);
        setUserInput(histories[next] ?? userInput);
        return next;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryIndex((idx) => {
        const next = Math.min(histories.length - 1, idx + 1);
        const val = next >= 0 ? histories[next] : "";
        setUserInput(val);
        return next;
      });
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      // tiny autocomplete for built-ins
      const words = Object.keys(builtInFunctions);
      const matches = words.filter((w) => w.startsWith(userInput));
      if (matches.length === 1) setUserInput(matches[0]);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-950/95 text-neutral-100 shadow-lg",
        "overflow-hidden font-mono"
      )}
      style={style}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/80 border-b border-neutral-800">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-yellow-500/80" />
          <span className="size-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-3 text-xs text-neutral-300 select-none">{title}</div>
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        className="px-3 py-3 overflow-auto"
        style={{ height: typeof height === "number" ? `${height}px` : height }}>
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap leading-6",
              l.type === "system" && "text-neutral-400"
            )}>
            {l.text}
          </div>
        ))}

        {/* input line */}
        <div className="flex items-center gap-2">
          <span className={`text-emerald-400 select-none ${(readRequest && (readRequest?.isSecret ?? false)) ? "hidden" : ""
          }`}>{prompt}$</span>
          
          <input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            type={(readRequest && (readRequest?.isSecret ?? false)) ? "password" : "text"}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 bg-transparent outline-none caret-emerald-400 placeholder-neutral-600"
          />
        </div>
      </div>
    </div>
  );
  
}

const Terminal = forwardRef<TerminalHandler, TerminalSectionProps>(TerminalSection);
export default Terminal;
