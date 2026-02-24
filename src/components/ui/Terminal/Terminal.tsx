'use client';

import { CommandLine, ReadRequestInterface, TerminalHandler, TerminalProps } from "@/lib/types";
import { cn, tokenizeCommandLine } from "@/lib/utils";
import { ChevronRight, Terminal as TerminalIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

function TerminalComponent(
  {
    prompt = "terminal",
    welcomeMessages = [
      "Welcome to the Terminal!",
      "Type 'help' to see available commands.",
    ],
    onCommand,
    onExit,
    headerControls,
    height = "100%",
    className,
  }: TerminalProps,
  ref: React.Ref<TerminalHandler>
) {
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
  const historyIndexRef = useRef<number>(-1);
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
    [pushLine, pushLines]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, userInput]);

  const builtInFunctions = useMemo(() => {
    const fns: Record<string, (...args: string[]) => unknown> = {
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
      whoami: () => prompt ?? "terminal",
    };
    if (onExit) {
      fns.exit = () => {
        onExit();
        return undefined;
      };
    }
    return fns;
  }, [prompt, onExit]);

  const runCommand = useCallback(async (cmdLine: string) => {
    const trimmedCommand = cmdLine.trim();
    pushLine({ type: "input", text: `${prompt}$ ${trimmedCommand}` });
    if (!trimmedCommand) return;
    const [cmd, ...args] = tokenizeCommandLine(trimmedCommand);

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

    if (cmd in builtInFunctions) {
      const builtInFunction = builtInFunctions[cmd as keyof typeof builtInFunctions];
      const out = builtInFunction(...args);
      if (Array.isArray(out)) {
        pushLines(
          out.map((t: string) => ({ type: "output" as const, text: t }))
        );
      } else if (out != null) {
        pushLine({ type: "output", text: String(out) });
      }
      return;
    }

    pushLine({ type: "output", text: `Command not found: ${cmd}` });
  }, [builtInFunctions, onCommand, prompt, pushLine, pushLines]);

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
      pushLine({ type: "system", text: `${prompt}$ ${userInput}` });
      setUserInput("");
      historyIndexRef.current = -1;
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
      historyIndexRef.current = -1;
      setUserInput("");
      void runCommand(v);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = historyIndexRef.current < 0 ? histories.length - 1 : Math.max(0, historyIndexRef.current - 1);
       setUserInput(histories[next] ?? userInput);
       historyIndexRef.current = next;
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(histories.length - 1, historyIndexRef.current + 1);
        const val = next >= 0 ? histories[next] : "";
        setUserInput(val);
        historyIndexRef.current = next;
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const words = Object.keys(builtInFunctions);
      const matches = words.filter((w) => w.startsWith(userInput));
      if (matches.length === 1) setUserInput(matches[0]);
    }
  };

  return (
    <div
      className={cn(
        "bg-black/95 border-t border-white/20 backdrop-blur-xl font-mono flex flex-col",
        className
      )}
    >
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#3994ef]" />
          <span className="text-sm text-gray-400">{prompt ?? "terminal"}</span>
        </div>
        <div>{headerControls}</div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 text-sm"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap leading-6",
              l.type === "input" ? "text-gray-400" : "text-green-400"
            )}
          >
            {l.text}
          </div>
        ))}

        <div className="flex items-center gap-2 text-white">
          <ChevronRight
            className={cn(
              "w-4 h-4 text-[#3994ef] select-none flex-shrink-0",
              readRequest?.isSecret ? "invisible" : ""
            )}
          />
          <input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            type={readRequest?.isSecret ? "password" : "text"}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-600 caret-[#3994ef]"
          />
        </div>
      </div>
    </div>
  );
}

const Terminal = forwardRef<TerminalHandler, TerminalProps>(TerminalComponent);

export default Terminal;
