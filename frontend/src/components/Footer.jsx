import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
  IconTerminal2,
} from "@tabler/icons-react";

export function Footer() {
  const links = [
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/AdarsHH30/ConvoRoom-AI.git",
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/adarsh30/",
    },
    {
      title: "Portfolio",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.adarshhegde.tech/",
    },
    {
      title: "Twitter",
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://x.com/Adarsh13673751",
    },
  ];
  return (
    <div className="flex items-center justify-center h-[15rem] sm:h-[20rem] md:h-[25rem] lg:h-[30rem] xl:h-[35rem] w-full">
      <FloatingDock
        mobileClassName="translate-y-8 sm:translate-y-10 md:translate-y-15 lg:translate-y-20"
        items={links}
      />
    </div>
  );
}
