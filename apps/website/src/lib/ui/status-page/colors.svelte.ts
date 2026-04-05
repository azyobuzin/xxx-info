export interface ChartColors {
  green: string;
  greenFill: string;
  red: string;
  redFill: string;
  orange: string;
  orangeFill: string;
  purple: string;
  purpleFill: string;
  blue: string;
  blueFill: string;
  grid: string;
  tick: string;
}

const lightColors: ChartColors = {
  green: "#1D9E75",
  greenFill: "rgba(29,158,117,0.08)",
  red: "#E24B4A",
  redFill: "rgba(226,75,74,0.25)",
  orange: "#C87A2E",
  orangeFill: "rgba(200,122,46,0.08)",
  purple: "#534AB7",
  purpleFill: "rgba(83,74,183,0.08)",
  blue: "#378ADD",
  blueFill: "rgba(55,138,221,0.08)",
  grid: "rgba(0,0,0,0.06)",
  tick: "#999",
};

const darkColors: ChartColors = {
  green: "#5DCAA5",
  greenFill: "rgba(93,202,165,0.08)",
  red: "#F09595",
  redFill: "rgba(240,149,149,0.25)",
  orange: "#E8A86D",
  orangeFill: "rgba(232,168,109,0.1)",
  purple: "#AFA9EC",
  purpleFill: "rgba(175,169,236,0.1)",
  blue: "#85B7EB",
  blueFill: "rgba(133,183,235,0.1)",
  grid: "rgba(255,255,255,0.06)",
  tick: "#888",
};

const darkQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : undefined;

let darkMode = $state(darkQuery?.matches ?? false);

// media query を監視する
$effect.root(() => {
  if (!darkQuery) return;
  const onChange = (e: MediaQueryListEvent) => {
    darkMode = e.matches;
  };
  darkQuery.addEventListener("change", onChange);
  return () => darkQuery.removeEventListener("change", onChange);
});

// 現在のカラースキームに応じた色を返す
export function getChartColors(): Readonly<ChartColors> {
  return darkMode ? darkColors : lightColors;
}
