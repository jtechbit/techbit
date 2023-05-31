import ky from "ky";

import type { Annotation, Article } from "../store/_schema";
import { getBrowserType, sendMessage } from "./extension";
import { getNewTabVersion, getUnclutterVersion } from "./messaging";
import type { ReplicacheProxy } from "./replicache";
import type { SearchResult } from "./search";
import { getDomain } from "./util";

const lindyApiUrl = "https://api2.lindylearn.io";
// const lindyApiUrl = "http://localhost:8000";

const vectorsTestUser = undefined;
// const vectorsTestUser = "vectors-test-qa";
// const vectorsTestUser = "vectors-test-base";

export async function getPageHistory(url: string) {
    const response = await fetch(
        `${lindyApiUrl}/annotations/get_page_history?${new URLSearchParams({
            page_url: url,
        })}`
    );
    const json = await response.json();
    return json;
}

export async function reportBrokenPage(url: string) {
    const domain = getDomain(url);
    const browserType = "serverless-screenshots";

    try {
        await fetch(`https://api2.lindylearn.io/report_broken_page`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url,
                domain,
                userAgent: navigator.userAgent,
                browserType,
                unclutterVersion: null,
            }),
        });
    } catch {}
}

export async function quickReport(
    message: string,
    url?: string,
    userId?: string
): Promise<string | null> {
    const browserType = getBrowserType();
    const unclutterVersion = await getUnclutterVersion();
    const newTabVersion = await getNewTabVersion();

    try {
        const response = await fetch(`https://unclutter.lindylearn.io/api/quickReport`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url,
                userId,
                message,
                userAgent: navigator.userAgent,
                browserType,
                unclutterVersion,
                newTabVersion,
            }),
        });
        return await response.text();
    } catch {
        return null;
    }
}

export async function searchArticles(user_id: string, query: string): Promise<SearchResult[]> {
    let data = (await ky
        .get(`${lindyApiUrl}/library/search_articles`, {
            searchParams: {
                user_id,
                query,
            },
        })
        .json()) as SearchResult[];

    return data.filter((d) => d.sentences?.[0]?.length);
}

export async function startTrial(
    user_id: string,
    email: string
): Promise<{ stripe_id: string; trial_end: number; is_active: boolean }> {
    return await ky
        .get(`${lindyApiUrl}/subscriptions/start_trial`, {
            searchParams: {
                user_id,
                email,
            },
        })
        .json();
}

export async function getSubscriptionManagementLink(
    user_id: string,
    email: string
): Promise<string | undefined> {
    try {
        let data: any = await ky
            .get(`${lindyApiUrl}/subscriptions/get_management_link`, {
                searchParams: {
                    user_id,
                    email,
                },
            })
            .json();

        return data.url;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export async function checkHasSubscription(stripe_id: string): Promise<boolean> {
    let data: any = await ky
        .get(`${lindyApiUrl}/subscriptions/check_subscription`, {
            searchParams: {
                stripe_id,
            },
        })
        .json();

    return data?.is_subscribed || false;
}

export async function createScreenshots(urls: string[], direct = false): Promise<void> {
    try {
        if (direct) {
            // check if screenshot already exists
            // urls = await Promise.all(
            //     urls.map(async (url) => {
            //         const response = await fetch(
            //             `https://storage.googleapis.com/unclutter-screenshots-serverless/articles/current/${encodeURIComponent(
            //                 url
            //             ).replaceAll("%", "%25")}.webp`
            //         );
            //         if (response.status === 200) {
            //             return undefined;
            //         } else {
            //             return url;
            //         }
            //     })
            // );

            await fetch(
                `https://puppeteer-serverless-jumq7esahq-uw.a.run.app/screenshot?prefix=articles`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(urls),
                }
            );
        } else {
            await fetch(`${lindyApiUrl}/library/create_screenshots`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ urls }),
            });
        }
    } catch {}
}

export interface BookmarkedPage {
    url: string;
    time_added: number;
    favorite: boolean;
}
export async function clusterLibraryArticles(
    articles: BookmarkedPage[],
    user_id: string
): Promise<void> {
    // normalize fields to reduce message size
    const importData = {
        urls: articles.map(({ url }) => url),
        time_added: articles.map(({ time_added }) => time_added),
        favorite: articles.map(({ favorite }) => favorite),
    };

    await fetch(
        `${lindyApiUrl}/library/cluster_articles?${new URLSearchParams({
            user_id,
        })}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(importData),
        }
    );
}

export interface RelatedHighlight {
    id: string;
    article_id: string;
    text: string;
    score: number;

    score2?: number;
    anchor?: string;
    excerpt: string;

    // added locally
    article?: Article;
}

export async function fetchRelatedAnnotations(
    user_id: string,
    article_id: string | undefined,
    highlights: string[],
    save_highlights: boolean = false,
    is_search: boolean = false
): Promise<RelatedHighlight[][]> {
    const response = await fetch(`${lindyApiUrl}/related/fetch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: vectorsTestUser || user_id,
            for_article_id: article_id,
            highlights,
            save_highlights,
            is_search,
        }),
    });
    if (!response.ok) {
        return [];
    }

    const json = await response.json();
    return json?.related;
}

export async function populateRelatedArticles(
    rep: ReplicacheProxy,
    relatedGroups: RelatedHighlight[][]
) {
    await Promise.all(
        relatedGroups.map(async (related) => {
            await Promise.all(
                related.map(async (related) => {
                    related.article = await rep.query.getArticle(related.article_id);
                })
            );
        })
    );
}

// should only be used for batch article imports
// new annotations are indexed through the fetchRelatedAnnotations() call
export async function indexAnnotationVectors(
    user_id: string,
    article_id: string,
    highlights: string[],
    highlight_ids: string[] | undefined = undefined,
    delete_previous: boolean = false
) {
    await fetch(
        `https://related4-jumq7esahq-ue.a.run.app?action=insert`,
        // `${lindyApiUrl}/related/insert`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: vectorsTestUser || user_id,
                article_id,
                highlights,
                highlight_ids,
                delete_previous,
            }),
        }
    );
}

export async function deleteAnnotationVectors(
    user_id: string,
    article_id: string | undefined = undefined,
    highlight_id: string | undefined = undefined
) {
    await fetch(`${lindyApiUrl}/related/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: vectorsTestUser || user_id,
            article_id,
            highlight_id,
        }),
    });
}

export async function getHeatmapRemote(
    paragraphs: string[],
    score_threshold: number = 0.6
): Promise<object[][] | undefined> {
    const response = await fetch("https://serverless-import-jumq7esahq-ue.a.run.app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            paragraphs,
            score_threshold,
        }),
    });
    if (!response.ok) {
        return;
    }

    const data = await response.json();
    return data?.sentences;
}

export async function generateAnnotationsRemote(
    url: string,
    article_id: string,
    score_threshold: number = 0.6
): Promise<{ annotations: Annotation[]; title?: string; word_count?: number }> {
    const response = await fetch("https://serverless-import-jumq7esahq-ue.a.run.app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url,
            article_id,
            score_threshold,
        }),
    });
    if (!response.ok) {
        return {
            annotations: [],
        };
    }

    const data = await response.json();
    return data || { annotations: [] };
}

async function fetchRetry(url: string, options: RequestInit, n: number = 1): Promise<Response> {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (n === 0) {
            throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
        return fetchRetry(url, options, n - 1);
    }
}
