import { DraggableArticleList, StaticArticleList } from "../../components";
import React, { ReactNode, useMemo } from "react";
import clsx from "clsx";
import { getRandomLightColor } from "../../common";
import { Article, readingProgressFullClamp } from "../../store";
import { ReadingProgress } from "../Modal/components/numbers";
import { getActivityColor } from "../Charts";

export function ArticleGroup({
    groupKey,
    title,
    icon,
    color,
    articles,
    articleLines = 1,
    isTopic,
    darkModeEnabled,
    showTopic,
    reportEvent = () => {},
    enableDragging = true,
    showProgress = true,
    className,
    style,
    emptyMessage,
    rowArticleCount = 5,
}: {
    groupKey: string;
    title?: string;
    icon?: ReactNode;
    color?: string;
    articles: Article[];
    articleLines?: number;
    isTopic?: boolean;
    darkModeEnabled: boolean;
    showTopic?: (topicId: string) => void;
    reportEvent?: (event: string, data?: any) => void;
    enableDragging?: boolean;
    showProgress?: boolean;
    className?: string;
    style?: React.CSSProperties;
    emptyMessage?: string;
    rowArticleCount?: number;
}) {
    color =
        color ||
        (groupKey === "queue"
            ? getActivityColor(3, darkModeEnabled)
            : getRandomLightColor(groupKey, darkModeEnabled));

    // const readCount = articles?.filter(
    //     (a) => a.reading_progress >= readingProgressFullClamp
    // )?.length;

    // article height + padding to prevent size change
    const articleHeightRem = (10 + 2 * 0.75) * articleLines - 0.75 * (articleLines - 1);
    const articleHeightMobileRem = (8 + 2 * 0.75) * articleLines - 0.75 * (articleLines - 1);

    return (
        <div className={clsx("topic relative", className)} style={style}>
            <div className="topic-header mb-2 ml-3 flex justify-between md:ml-0.5">
                <h2
                    className={clsx(
                        "title flex select-none items-center gap-2 font-medium",
                        isTopic && "cursor-pointer transition-transform hover:scale-[96%]"
                    )}
                    onClick={() => {
                        if (isTopic && showTopic) {
                            showTopic(groupKey);
                        }
                    }}
                >
                    {icon}
                    {title}
                </h2>

                {/* {showProgress && (
                    <ReadingProgress
                        className="relative px-1.5 py-0.5"
                        articleCount={articles?.length}
                        color={color}
                    />
                )} */}
            </div>

            {/* {!isTopic && groupKey !== "search" && (
                <ReadingProgress
                    className="absolute -top-[3rem] right-0 px-2 py-1"
                    articleCount={articles?.length}
                    readCount={readCount}
                    color={color}
                />
            )} */}

            <div
                className={`topic-articles relative h-[var(--min-height-mobile)] p-3 transition-colors md:h-[var(--min-height)] md:rounded-md`}
                style={{
                    // @ts-ignore
                    "--min-height": `${articleHeightRem}rem`,
                    "--min-height-mobile": `${articleHeightMobileRem}rem`,
                    background: color,
                }}
            >
                {emptyMessage && articles?.length === 0 && (
                    <div className="animate-fadein absolute top-0 left-0 flex h-full w-full select-none items-center justify-center">
                        {emptyMessage}
                    </div>
                )}
                {!emptyMessage && articles?.length === 0 && emptyListMessage[groupKey] && (
                    <div className="animate-fadein absolute top-0 left-0 flex h-full w-full select-none items-center justify-center">
                        {emptyListMessage[groupKey]}
                    </div>
                )}

                {enableDragging ? (
                    <DraggableArticleList
                        listId={groupKey}
                        articlesToShow={articleLines * rowArticleCount}
                        reportEvent={reportEvent}
                    />
                ) : (
                    <StaticArticleList
                        articles={articles.slice(0, articleLines * rowArticleCount)}
                    />
                )}
            </div>
        </div>
    );
}

const emptyListMessage = {
    queue: "Drag articles here to read them later.",
    new: "Follow website feeds to see new articles here.",
    past: "No past feed articles found.",
    list: "Open articles with Unclutter to automatically save them.",
    uncompleted: "Your unread articles will appear here.",
    completed: "Every article you finsh reading will appear here.",
};

export function useScreenArticleRowCount(isWeb?: boolean) {
    // only calculated on initial width for now, otherwise need to re-group tab infos
    const articleRowCount = useMemo(() => {
        // hard code for modal
        if (!isWeb) {
            return 5;
        }

        // this is not always accurate for web
        const availableSpace =
            window.innerWidth >= 1024
                ? Math.min(window.innerWidth - 187 - 2 * 16 - 2 * 32, 960)
                : window.innerWidth - 2 * 12;
        const articleWidth = window.innerWidth >= 768 ? 144 : 112;
        const gap = 12;

        return Math.floor((availableSpace + gap) / (articleWidth + gap));
    }, []);
    return articleRowCount;
}
