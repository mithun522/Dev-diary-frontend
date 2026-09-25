import {
  IoLogoJavascript,
  IoLogoPython,
  IoLogoReact,
  IoLogoNodejs,
  IoLogoHtml5,
  IoLogoCss3,
  IoLogoAngular,
  IoLogoVue,
  IoLogoDocker,
  IoLogoAmazon,
  IoLogoFirebase,
  IoLogoGithub,
  IoLogoAndroid,
  IoLogoApple,
} from "react-icons/io5";
import {
  SiTypescript,
  SiSpring,
  SiKubernetes,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiGraphql,
  SiGo,
  SiCplusplus,
  SiC,
  SiRuby,
  SiPhp,
  SiDjango,
  SiFlask,
  SiKotlin,
  SiSwift,
  SiRust,
  SiDotnet,
  SiFlutter,
  SiExpress,
  SiNextdotjs,
  SiTailwindcss,
  SiGit,
  SiLinux,
  SiSqlite,
  SiScala,
  SiElasticsearch,
  SiApachekafka,
  SiJenkins,
  SiTerraform,
  SiGooglecloud,
} from "react-icons/si";
import { Code2, Coffee, Network } from "lucide-react";

export type StackIconComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

interface StackIconMeta {
  icon: StackIconComponent;
  // Each brand's official logo color, so cards read as recognizable logos rather than tinted
  // shapes (e.g. JS stays yellow, TS stays blue) instead of inheriting the theme's primary color.
  color: string;
}

// Maps a catalog stack key (e.g. "javascript", "aws") to a recognizable brand icon + its native
// brand color. Stacks are server-driven — new ones can appear at any time — so an unmapped stack
// falls back to a generic icon in the theme's primary color rather than breaking.
const STACK_ICON_MAP: Record<string, StackIconMeta> = {
  javascript: { icon: IoLogoJavascript, color: "#F7DF1E" },
  js: { icon: IoLogoJavascript, color: "#F7DF1E" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  ts: { icon: SiTypescript, color: "#3178C6" },
  python: { icon: IoLogoPython, color: "#3776AB" },
  java: { icon: Coffee, color: "#EA2D2E" },
  spring: { icon: SiSpring, color: "#6DB33F" },
  springboot: { icon: SiSpring, color: "#6DB33F" },
  react: { icon: IoLogoReact, color: "#61DAFB" },
  reactjs: { icon: IoLogoReact, color: "#61DAFB" },
  nextjs: { icon: SiNextdotjs, color: "#000000" },
  node: { icon: IoLogoNodejs, color: "#5FA04E" },
  nodejs: { icon: IoLogoNodejs, color: "#5FA04E" },
  express: { icon: SiExpress, color: "#000000" },
  expressjs: { icon: SiExpress, color: "#000000" },
  html: { icon: IoLogoHtml5, color: "#E34F26" },
  html5: { icon: IoLogoHtml5, color: "#E34F26" },
  css: { icon: IoLogoCss3, color: "#1572B6" },
  css3: { icon: IoLogoCss3, color: "#1572B6" },
  tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
  tailwindcss: { icon: SiTailwindcss, color: "#06B6D4" },
  angular: { icon: IoLogoAngular, color: "#DD0031" },
  vue: { icon: IoLogoVue, color: "#4FC08D" },
  vuejs: { icon: IoLogoVue, color: "#4FC08D" },
  docker: { icon: IoLogoDocker, color: "#2496ED" },
  kubernetes: { icon: SiKubernetes, color: "#326CE5" },
  k8s: { icon: SiKubernetes, color: "#326CE5" },
  aws: { icon: IoLogoAmazon, color: "#FF9900" },
  amazon: { icon: IoLogoAmazon, color: "#FF9900" },
  gcp: { icon: SiGooglecloud, color: "#4285F4" },
  googlecloud: { icon: SiGooglecloud, color: "#4285F4" },
  firebase: { icon: IoLogoFirebase, color: "#FFCA28" },
  git: { icon: SiGit, color: "#F05032" },
  github: { icon: IoLogoGithub, color: "#181717" },
  linux: { icon: SiLinux, color: "#FCC624" },
  mongodb: { icon: SiMongodb, color: "#47A248" },
  mongo: { icon: SiMongodb, color: "#47A248" },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  postgres: { icon: SiPostgresql, color: "#4169E1" },
  mysql: { icon: SiMysql, color: "#4479A1" },
  sql: { icon: SiMysql, color: "#4479A1" },
  sqlite: { icon: SiSqlite, color: "#003B57" },
  redis: { icon: SiRedis, color: "#FF4438" },
  graphql: { icon: SiGraphql, color: "#E10098" },
  golang: { icon: SiGo, color: "#00ADD8" },
  go: { icon: SiGo, color: "#00ADD8" },
  cplusplus: { icon: SiCplusplus, color: "#00599C" },
  cpp: { icon: SiCplusplus, color: "#00599C" },
  c: { icon: SiC, color: "#A8B9CC" },
  ruby: { icon: SiRuby, color: "#CC342D" },
  php: { icon: SiPhp, color: "#777BB4" },
  django: { icon: SiDjango, color: "#092E20" },
  flask: { icon: SiFlask, color: "#000000" },
  kotlin: { icon: SiKotlin, color: "#7F52FF" },
  swift: { icon: SiSwift, color: "#F05138" },
  rust: { icon: SiRust, color: "#000000" },
  dotnet: { icon: SiDotnet, color: "#512BD4" },
  csharp: { icon: SiDotnet, color: "#512BD4" },
  flutter: { icon: SiFlutter, color: "#02569B" },
  android: { icon: IoLogoAndroid, color: "#3DDC84" },
  ios: { icon: IoLogoApple, color: "#000000" },
  scala: { icon: SiScala, color: "#DC322F" },
  elasticsearch: { icon: SiElasticsearch, color: "#005571" },
  kafka: { icon: SiApachekafka, color: "#231F20" },
  jenkins: { icon: SiJenkins, color: "#D24939" },
  terraform: { icon: SiTerraform, color: "#7B42BC" },
  systemdesign: { icon: Network, color: "#64748B" },
};

const DEFAULT_STACK_ICON: StackIconMeta = { icon: Code2, color: "" };

const normalizeStackKey = (stack: string) =>
  stack.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getStackIconMeta = (stack: string): StackIconMeta =>
  STACK_ICON_MAP[normalizeStackKey(stack)] ?? DEFAULT_STACK_ICON;
