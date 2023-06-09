import React, { useContext, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import { fetchRelatedAnnotations, getDomain, getRandomLightColor } from "../../common";
import {
    Annotation,
    AnnotationWithArticle,
    ReplicacheContext,
    RuntimeReplicache,
    UserInfo,
    useSubscribe,
} from "../../store";
import { Highlight } from "../Highlight";
import { SearchBox } from "./components/search";
import { FilterContext, ModalStateContext } from "./context";
import { ResourceStat } from "../Modal/components/numbers";
import { FilterButton } from "./Recent";
import { getActivityColor } from "../Charts";
import clsx from "clsx";

export default function QuotesTab({}: {}) {
    const { userInfo, reportEvent, darkModeEnabled, isMobile } = useContext(ModalStateContext);
    const { currentArticle, domainFilter, setDomainFilter, tagFilter, setTagFilter } =
        useContext(FilterContext);

    const [activeCurrentFilter, setActiveCurrentFilter] = useState<boolean>(
        !!domainFilter && !!tagFilter
    );
    useEffect(() => {
        if (domainFilter || tagFilter) {
            setActiveCurrentFilter(true);
        }
    }, [domainFilter, tagFilter]);

    const rep = useContext(ReplicacheContext);
    const annotations = useSubscribe<AnnotationWithArticle[]>(
        rep,
        rep?.subscribe.listAnnotationsWithArticles()
    );

    const [searchedAnnotations, setSearchedAnnotations] = useState<AnnotationWithArticle[] | null>(
        null
    );
    const [query, setQuery] = useState<string>("");
    useEffect(() => {
        if (!query) {
            setSearchedAnnotations(null);
            return;
        }
        if (activeCurrentFilter) {
            setActiveCurrentFilter(false);
            setDomainFilter(undefined);
            setTagFilter(undefined);
        }
    }, [query]);
    const queryDebounced = useDebounce(query, 200);
    useEffect(() => {
        if (!query || !rep || !userInfo) {
            return;
        }

        // localSparseSearch(query).then(setSearchedAnnotations);
        vectorSearch(rep, query, userInfo).then(setSearchedAnnotations);

        reportEvent("highlightsSearch");
    }, [queryDebounced]);

    const [annotationGroups, setAnnotationGroups] = useState<[string, AnnotationWithArticle[]][]>();
    const [untaggedAnnotations, setUntaggedAnnotations] = useState<AnnotationWithArticle[]>([]);
    useEffect(() => {
        if (!annotations) {
            return;
        }

        let filteredAnnotations: AnnotationWithArticle[];
        if (searchedAnnotations) {
            filteredAnnotations = searchedAnnotations;
        } else {
            filteredAnnotations = annotations
                .filter((a) => !a.ai_created || a.tags?.length)
                .sort((a, b) => b.created_at - a.created_at);
        }

        if (tagFilter) {
            filteredAnnotations = filteredAnnotations.filter((a) => a.tags?.includes(tagFilter));
            filteredAnnotations.forEach((a) => (a.tags = [tagFilter])); // ignore other tags
            setAnnotationGroups([[tagFilter, filteredAnnotations]]);
            return;
        }
        if (domainFilter) {
            filteredAnnotations = filteredAnnotations.filter(
                (a) => getDomain(a.article?.url) === domainFilter
            );
        }

        const tagAnnotations: { [tag: string]: AnnotationWithArticle[] } = {};
        const untaggedAnnotations: AnnotationWithArticle[] = [];
        for (const annotation of filteredAnnotations) {
            if (!annotation.tags?.length) {
                untaggedAnnotations.push(annotation);
                continue;
            }
            for (const tag of annotation.tags.slice(0, 1)) {
                if (tagAnnotations[tag] === undefined) {
                    tagAnnotations[tag] = [];
                }
                tagAnnotations[tag].push(annotation);
            }
        }
        const annotationGroups = Object.entries(tagAnnotations).sort(
            (a, b) => b[1][0].created_at - a[1][0].created_at
        );
        setAnnotationGroups(annotationGroups);
        setUntaggedAnnotations(untaggedAnnotations);
    }, [annotations, tagFilter, domainFilter, searchedAnnotations]);

    return (
        <div className="flex flex-col gap-4">
            <div className="filter-list animate-fadein flex justify-start gap-3 px-4 md:px-0">
                {activeCurrentFilter ? (
                    <FilterButton
                        title={domainFilter || `#${tagFilter}`}
                        icon={
                            <svg className="h-4" viewBox="0 0 512 512">
                                <path
                                    fill="currentColor"
                                    d="M0 73.7C0 50.67 18.67 32 41.7 32H470.3C493.3 32 512 50.67 512 73.7C512 83.3 508.7 92.6 502.6 100L336 304.5V447.7C336 465.5 321.5 480 303.7 480C296.4 480 289.3 477.5 283.6 472.1L191.1 399.6C181.6 392 176 380.5 176 368.3V304.5L9.373 100C3.311 92.6 0 83.3 0 73.7V73.7zM54.96 80L218.6 280.8C222.1 285.1 224 290.5 224 296V364.4L288 415.2V296C288 290.5 289.9 285.1 293.4 280.8L457 80H54.96z"
                                />
                            </svg>
                        }
                        onClick={() => {
                            setActiveCurrentFilter(false);
                            setDomainFilter(undefined);
                            setTagFilter(undefined);
                            reportEvent("changeListFilter", { activeCurrentFilter: null });
                        }}
                    />
                ) : (
                    <FilterButton
                        title={"Recent"}
                        icon={
                            <svg className="h-4" viewBox="0 0 512 512">
                                <path
                                    fill="currentColor"
                                    d="M0 73.7C0 50.67 18.67 32 41.7 32H470.3C493.3 32 512 50.67 512 73.7C512 83.3 508.7 92.6 502.6 100L336 304.5V447.7C336 465.5 321.5 480 303.7 480C296.4 480 289.3 477.5 283.6 472.1L191.1 399.6C181.6 392 176 380.5 176 368.3V304.5L9.373 100C3.311 92.6 0 83.3 0 73.7V73.7zM54.96 80L218.6 280.8C222.1 285.1 224 290.5 224 296V364.4L288 415.2V296C288 290.5 289.9 285.1 293.4 280.8L457 80H54.96z"
                                />
                            </svg>
                        }
                    />
                )}

                {userInfo?.aiEnabled && (
                    <SearchBox
                        query={query}
                        setQuery={setQuery}
                        placeholder={
                            !annotations
                                ? ""
                                : `Search ${!isMobile ? "across " : ""}your ${
                                      annotations.length
                                  } quote${annotations.length !== 1 ? "s" : ""}...`
                        }
                        autoFocus={!isMobile}
                    />
                )}
            </div>

            {annotationGroups?.slice(0, isMobile ? 10 : 20).map(([tag, annotations]) => (
                <TagGroup
                    key={tag}
                    tag={`#${tag}`}
                    annotations={annotations}
                    annotationLimit={tagFilter ? 100 : 4}
                    setTagFilter={setTagFilter}
                />
            ))}
            {((untaggedAnnotations.length && (domainFilter || searchedAnnotations?.length)) ||
                (annotationGroups !== undefined && annotationGroups?.length === 0)) && (
                <TagGroup
                    key="untagged"
                    tag="untagged"
                    annotations={untaggedAnnotations}
                    annotationLimit={100}
                />
            )}
        </div>
    );
}

function TagGroup({
    tag,
    annotations,
    annotationLimit = 4,
    setTagFilter,
}: {
    tag: string;
    annotations: AnnotationWithArticle[];
    annotationLimit: number;
    setTagFilter?: (tag?: string) => void;
}) {
    const { darkModeEnabled, reportEvent } = useContext(ModalStateContext);
    // const color = getRandomLightColor(tag, darkModeEnabled);

    return (
        <div className="tag-group relative">
            {tag !== "untagged" && (
                <div className="ml-4 mb-2 flex justify-between md:ml-0.5">
                    <h2
                        className={clsx(
                            "title flex select-none items-center gap-2 font-medium",
                            setTagFilter && "cursor-pointer transition-all hover:scale-[95%]"
                        )}
                        onClick={() => setTagFilter?.(tag.slice(1))}
                    >
                        {tag}
                    </h2>

                    {/* <div className="relative px-1.5 py-0.5">
                    <ResourceStat type="quotes" value={annotations?.length} large={false} />
                </div> */}
                </div>
            )}

            <div
                className="relative grid gap-4 bg-stone-100 p-4 transition-colors dark:bg-transparent dark:p-2 md:grid-cols-2 md:rounded-md"
                style={
                    {
                        // background: color,
                        // background: getActivityColor(1, darkModeEnabled),
                    }
                }
            >
                {annotations.slice(0, annotationLimit).map((annotation) => (
                    <Highlight
                        key={annotation.id}
                        annotation={annotation}
                        searchExcerpt={annotation.searchExcerpt}
                        article={annotation.article}
                        isCurrentArticle={false}
                        darkModeEnabled={darkModeEnabled}
                        reportEvent={reportEvent}
                    />
                ))}

                {tag === "untagged" && annotations !== null && annotations.length === 0 && (
                    <div className="animate-fadein col-span-3 flex w-full select-none items-center gap-2">
                        Select any article text to create a highlight.
                    </div>
                )}
            </div>
        </div>
    );
}

export async function vectorSearch(
    rep: RuntimeReplicache,
    query: string,
    userInfo: UserInfo
): Promise<AnnotationWithArticle[]> {
    const hits = await fetchRelatedAnnotations(userInfo.id, undefined, [query], false, true);
    if (!hits?.length) {
        return [];
    }

    const annotations = await Promise.all(
        hits[0].map(async (hit) => {
            const annotation = await rep.query.getAnnotation(hit.id);
            const article =
                annotation?.article_id && (await rep.query.getArticle(annotation.article_id));

            return {
                ...hit,
                ...annotation,
                text: hit.text,
                searchExcerpt: hit.excerpt,
                ai_score: hit.score,
                article,
            };
        })
    );

    // @ts-ignore
    return annotations;
}
