import clsx from "clsx";
import React, { ReactNode } from "react";
import type { ImportProgress } from "../../common/import";
import { getActivityColor } from "../Charts";

// const imageHost = "http://localhost:3000";
const imageHost = "https://my.unclutter.it";

export function SettingsGroup({
    title,
    icon,
    children,
    buttons,
    className,
    style,
    imageSrc,
    progress,
    animationIndex,
}: {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    buttons?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    imageSrc?: string;
    progress?: ImportProgress;
    animationIndex?: number;
}) {
    const imagePath = `${imageHost}/${imageSrc}`;

    return (
        <div
            className={clsx(
                "relative z-20 max-w-2xl bg-stone-50  shadow-sm dark:bg-neutral-800 md:rounded-md",
                className
                // animationIndex !== undefined ? "animate-slidein" : "animate-fadein"
            )}
            style={{
                ...style,
                // animationDelay:
                //     animationIndex !== undefined
                //         ? `${(animationIndex ? animationIndex * 50 : 0) + 50}ms`
                //         : "",
            }}
        >
            <h2 className="flex items-center gap-2 px-4 pb-2 pt-3 font-medium md:pb-3">
                {icon}
                {title}
            </h2>
            <div
                className={clsx(
                    "flex flex-col gap-2 px-4 pb-3 text-sm md:gap-2 md:text-base",
                    progress && "mb-3"
                )}
            >
                {children}
                {imageSrc && buttons && (
                    <img
                        src={imagePath}
                        className="h-64 w-full rounded-md object-cover object-left-top p-3 pt-1 dark:brightness-90"
                    />
                )}
                {buttons && !progress && <div className="mt-1 flex flex-wrap gap-3">{buttons}</div>}
                {progress && (
                    <p className="text-neutral-400 dark:text-neutral-500">
                        {progress.customMessage ? (
                            <>{progress.customMessage}</>
                        ) : progress?.finished ? (
                            <>
                                Done! Unclutter generated {progress?.currentHighlights} quotes
                                across {progress?.targetArticles} articles!
                            </>
                        ) : (
                            <>
                                Generated {progress?.currentHighlights || 0} quotes across{" "}
                                {progress?.currentArticles || 0} of {progress?.targetArticles || 0}{" "}
                                articles...
                            </>
                        )}
                    </p>
                )}
            </div>

            {imageSrc && !buttons && (
                <img
                    src={imagePath}
                    className="h-64 w-full rounded-md object-cover object-left-top p-3 pt-1 dark:brightness-90"
                />
            )}

            {progress && (
                <>
                    <div
                        className={clsx(
                            "absolute bottom-0 left-0 h-3 rounded-bl-md bg-gradient-to-b  from-yellow-300 to-amber-400 transition-all dark:opacity-70",
                            progress.finished && "rounded-br-md"
                        )}
                        style={{
                            width: `${Math.max(
                                ((progress.currentArticles || 0) / progress.targetArticles) * 100 ||
                                    0,
                                progress.finished ? 100 : 0,
                                5
                            )}%`,
                            backgroundImage: "linear-gradient(130deg, var(--tw-gradient-stops))",
                        }}
                    />
                    {/* <div className="absolute bottom-0 right-0">2 of 3 articles done</div> */}
                </>
            )}
        </div>
    );
}

export function SettingsButton({
    title,
    href,
    onClick,
    primary,
    darkModeEnabled,
    isNew,
    className,
    inNewTab = true,
    reportEvent,
}: {
    title: string;
    href?: string;
    onClick?: () => void;
    primary?: boolean;
    darkModeEnabled: boolean;
    isNew?: boolean;
    inNewTab?: boolean;
    className?: string;
    reportEvent: (event: string, data?: any) => void;
}) {
    return (
        <a
            className={clsx(
                "relative cursor-pointer select-none rounded-md py-1 px-2 font-medium transition-transform hover:scale-[97%]",
                true && "dark:text-stone-800",
                className
            )}
            style={{
                background: !className ? getActivityColor(primary ? 3 : 3, darkModeEnabled) : "",
            }}
            onClick={() => {
                reportEvent("clickSettingsButton", { title });
                onClick?.();
            }}
            href={href}
            target={inNewTab ? "_blank" : undefined}
            rel="noopener noreferrer"
        >
            {title}

            {/* {isNew && (
                <div className="bg-lindy dark:bg-lindyDark absolute -top-2 -right-5 z-20 rounded-md px-1 text-sm leading-tight dark:text-[rgb(232,230,227)]">
                    New
                </div>
            )} */}
        </a>
    );
}
