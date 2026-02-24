"use client";
import { GameAPIInterface, TerminalHandler } from "@/lib/types";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@/components/ui/Terminal";
import { GAME_TILE } from "@/lib/constants";

const GamePlaySection = dynamic(() => import("./_components/GamePlaySection"), { ssr: false });
export default function GamePage() {
  const terminalRef = useRef<TerminalHandler>(null);
  const gameRef = useRef<GameAPIInterface | null>(null);
  const wrongPasswordCountRef = useRef(0);
  const [permission, setPermission] = useState("guest");
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setWindowWidth(window.innerWidth);
    }, 0);

    const onResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (permission === "admin") {
      void terminalRef.current?.print(["Welcome, Admin! ... but who are you, really?", "Try 'help' ... if you’re recognized."]);
    }
    else if (permission === "idiot") {
      void terminalRef.current?.print(["Welcome, Idiot! Such impressive confidence.", "Try 'help'. You’ll need it more than most."]);
    }
  }, [permission]);

  if (!mounted) return null;

  const resolution = {
    width: Math.floor(windowWidth / GAME_TILE) * GAME_TILE,
    height: GAME_TILE * 8
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none">
        <GamePlaySection
          // style={{ width: 32 * 10, height: 32 * 8, margin: "0 auto" }}
          style={{ width: "90vw", height: GAME_TILE * 8, margin: "0 auto" }}
          resolution={resolution}
          onReady={(api) => (gameRef.current = api)}
        />
      </div>
      <div
        className="flex-1 min-h-0"
        onClick={() => terminalRef.current?.focus()}>
        <Terminal
          ref={terminalRef}
          prompt={`${permission}@lafamila-web`}
          height="100%"
          className="h-full"
          welcomeMessages={[
            "Welcome to the Terminal!",
            "Type 'help' to see available commands.",
          ]}
          onCommand={async (cmd, args) => {
            if(permission === "admin" || permission === "idiot"){
              return await gameRef.current?.exec(cmd, args);
            }
            else{
              switch (cmd){
                case "help" : 
                  return [
                    "help                    Show this help",
                    "ping                    pong",
                    "sum [num1] [num2] ...   Sum numbers",
                    "date                    Print current date",
                    "sudo                    Gain admin permission",
                  ];
                case "ping" : return "pong"
                case "sum" : return String(args.map(Number).reduce((a, b) => a + b, 0));
                case "date" : return new Date().toLocaleString();
                case "sudo" : 
                  if (permission === "guest") {
                    try {
                      const pwd = await terminalRef.current?.read({
                        label: wrongPasswordCountRef.current < 3 ? `Enter password: ` : `Enter 'password', you idiot: `,
                        isSecret: true,
                      });
                      if (pwd === "password") {
                        setPermission(wrongPasswordCountRef.current < 3 ? "admin" : "idiot");
                        wrongPasswordCountRef.current = 0;
                        return "";
                      }
                      wrongPasswordCountRef.current += 1;
                      return "Incorrect password.";
                    } catch {
                      return "Canceled.";
                    }
                  }
                  return "";
                default:
                  return "Permission denied";
              }
            }

          }}
        />
      </div>
    </div>
  );
}
